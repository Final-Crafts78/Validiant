const fetch = require('node-fetch');

/**
 * Normalizes an Indian address to maximize Nominatim hit rate.
 * @param {string} raw - Raw address string
 * @returns {string} Normalized address
 */
function normalizeAddress(raw) {
  if (!raw) return '';
  let addr = String(raw).trim();
  
  const replacements = {
    'st.': 'Street', 'ave.': 'Avenue', 'rd.': 'Road', 'blvd.': 'Boulevard',
    'dr.': 'Drive', 'ln.': 'Lane', 'ct.': 'Court', 'apt.': 'Apartment',
    'nr.': 'Near', 'opp.': 'Opposite', 'govt.': 'Government',
    'mkt.': 'Market', 'rly.': 'Railway', 'stn.': 'Station',
    'extn.': 'Extension', 'grnd.': 'Ground', 'flr.': 'Floor'
  };
  
  Object.entries(replacements).forEach(([abbr, full]) => {
    addr = addr.replace(new RegExp(abbr.replace('.', '\\.'), 'gi'), full);
  });
  
  return addr.replace(/\s+/g, ' ').trim();
}

let lastNominatimCall = 0;

/**
 * Makes a rate-limited request to Nominatim API.
 * @param {object} params - Query parameters
 * @returns {Promise<object|null>} Best match result
 */
async function nominatimSearch(params) {
  // Enforce 1 req/sec rate limit (1100ms for safety)
  const now = Date.now();
  const elapsed = now - lastNominatimCall;
  if (elapsed < 1100) {
    await new Promise(r => setTimeout(r, 1100 - elapsed));
  }
  lastNominatimCall = Date.now();

  const qs = new URLSearchParams({ ...params, format: 'jsonv2' }).toString();
  const url = `https://nominatim.openstreetmap.org/search?${qs}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Validiant-Platform/1.0 (field-task-routing)',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn(`⚠️ [GEOCODE] Nominatim API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const results = await response.json();
    if (!results || results.length === 0) return null;
    
    const best = results[0];
    return {
      latitude: parseFloat(best.lat),
      longitude: parseFloat(best.lon),
      addresstype: best.addresstype || best.type || 'unknown',
      displayName: best.display_name
    };
  } catch (error) {
    console.error('❌ [GEOCODE] Network error:', error.message);
    return null;
  }
}

/**
 * Queries Google Maps Geocoding API for highest precision coordinates.
 */
async function googleSearch(address, pincode) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const query = pincode ? `${address}, ${pincode}, India` : `${address}, India`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&region=in&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`⚠️ [GEOCODE] Google API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.log(`ℹ️ [GEOCODE] Google API returned ${data.status} for query: ${query}`);
      return null;
    }

    const best = data.results[0];
    return {
      latitude: best.geometry.location.lat,
      longitude: best.geometry.location.lng,
      addresstype: best.geometry.location_type || 'unknown',
      displayName: best.formatted_address,
      source: 'google'
    };
  } catch (error) {
    console.error('❌ [GEOCODE] Google API Network error:', error.message);
    return null;
  }
}

const geocodeCache = new Map();

/**
 * Implements a 3-tier geocoding cascade for optimal precision.
 */
async function geocodeAddress(rawAddress, pincode) {
  if (!rawAddress && !pincode) return null;
  
  const address = normalizeAddress(rawAddress);
  const pin = pincode ? String(pincode).trim() : null;
  
  const cacheKey = `${address}|${pin}`;
  if (geocodeCache.has(cacheKey)) {
    console.log(`🌍 [GEOCODE] Cache hit for: ${cacheKey}`);
    return geocodeCache.get(cacheKey);
  }

  // TIER 0: Google Maps API (Commercial Maximum Precision)
  const googleResult = await googleSearch(address, pin);
  if (googleResult) {
    geocodeCache.set(cacheKey, { ...googleResult, tier: 0 });
    return geocodeCache.get(cacheKey);
  }
  
  // TIER 1: Structured query (rooftop/building)
  if (address && pin) {
    const tier1 = await nominatimSearch({
      street: address,
      postalcode: pin,
      countrycodes: 'in',
      limit: 1,
      addressdetails: 1
    });
    if (tier1) {
      geocodeCache.set(cacheKey, { ...tier1, tier: 1 });
      return geocodeCache.get(cacheKey);
    }
  }
  
  // TIER 2: Free-text query (street-level)
  if (address) {
    const queryText = pin ? `${address}, ${pin}, India` : `${address}, India`;
    const tier2 = await nominatimSearch({
      q: queryText,
      countrycodes: 'in',
      limit: 1,
      addressdetails: 1
    });
    if (tier2) {
      geocodeCache.set(cacheKey, { ...tier2, tier: 2 });
      return geocodeCache.get(cacheKey);
    }
  }
  
  // TIER 3: Pincode centroid only (postal)
  if (pin) {
    const tier3 = await nominatimSearch({
      postalcode: pin,
      countrycodes: 'in',
      limit: 1,
      addressdetails: 1
    });
    if (tier3) {
      geocodeCache.set(cacheKey, { ...tier3, tier: 3 });
      return geocodeCache.get(cacheKey);
    }
  }
  
  geocodeCache.set(cacheKey, null);
  return null;
}

/**
 * Calculates confidence score based on Google's location_type or Nominatim's addresstype.
 */
function calculateConfidence(addresstype) {
  // 1. Google Maps location types
  if (addresstype === 'ROOFTOP') return { score: 95, level: 'rooftop' };
  if (addresstype === 'RANGE_INTERPOLATED') return { score: 85, level: 'street' };
  if (addresstype === 'GEOMETRIC_CENTER') return { score: 75, level: 'street' };
  if (addresstype === 'APPROXIMATE') return { score: 60, level: 'city' };

  // 2. Nominatim OpenStreetMap types
  const HIGH = ['building', 'house', 'place', 'amenity', 'shop', 'office'];
  const MEDIUM = ['highway', 'residential', 'street', 'road', 'neighbourhood', 'quarter'];
  const LOW_MEDIUM = ['postcode', 'postal_code'];
  const LOW = ['city', 'town', 'village', 'suburb', 'state', 'county', 'country'];

  const type = (addresstype || '').toLowerCase();
  
  if (HIGH.includes(type))       return { score: 95, level: 'rooftop' };
  if (MEDIUM.includes(type))     return { score: 75, level: 'street' };
  if (LOW_MEDIUM.includes(type)) return { score: 65, level: 'postal' };
  if (LOW.includes(type))        return { score: 40, level: 'city' };
  
  // Unknown but coordinates returned
  return { score: 60, level: 'street' };
}

/**
 * Determines operational policy based on confidence score.
 */
function applyGeoPolicy(confidence) {
  if (confidence.score >= 85) {
    return { action: 'auto', warning: null };
  }
  if (confidence.score >= 60) {
    return { 
      action: 'auto-warn', 
      warning: `Address is approximate (${confidence.level} match). Verify on site.` 
    };
  }
  return { 
    action: 'low-confidence', 
    warning: `Low accuracy geocode (${confidence.level}). Manual pin verification recommended.` 
  };
}

/**
 * Main exported function to resolve an address to coordinates with metadata.
 * @param {string} rawAddress - Street address text
 * @param {string} [pincode] - Optional pincode
 * @returns {Promise<{latitude: number, longitude: number, confidence: number, matchLevel: string, warning: string|null, tier: number}|null>}
 */
async function geocodeFromAddress(rawAddress, pincode) {
  const result = await geocodeAddress(rawAddress, pincode);
  if (!result) return null;
  
  const confidence = calculateConfidence(result.addresstype);
  const policy = applyGeoPolicy(confidence);
  
  const engine = result.source === 'google' ? 'GOOGLE' : 'NOMINATIM';
  
  console.log(`🌍 [GEOCODE] [${engine}] ${rawAddress || pincode} → ${result.latitude},${result.longitude} | ` +
              `Tier ${result.tier} | ${confidence.level} (${confidence.score}%) | ${policy.action}`);
  
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    confidence: confidence.score,
    matchLevel: confidence.level,
    warning: policy.warning,
    tier: result.tier
  };
}

module.exports = { geocodeFromAddress };
