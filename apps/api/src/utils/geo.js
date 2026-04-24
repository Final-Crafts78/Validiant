const https = require('https');
const http = require('http');

/**
 * Follows HTTP redirects to expand short URLs (goo.gl, maps.app.goo.gl, etc.)
 */
async function expandUrl(shortUrl) {
  if (!shortUrl || !shortUrl.includes('//')) return shortUrl;
  
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(shortUrl);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request(shortUrl, { method: 'HEAD', timeout: 5000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // Recursively expand if needed, but limit to 3 levels to avoid infinite loops
          resolve(res.headers.location);
        } else {
          resolve(shortUrl);
        }
      });
      
      req.on('error', () => resolve(shortUrl));
      req.on('timeout', () => { req.destroy(); resolve(shortUrl); });
      req.end();
    } catch (e) {
      resolve(shortUrl);
    }
  });
}

/**
 * Extracts latitude and longitude from a Google Maps URL (Async)
 * @param {string} url 
 * @returns {Promise<object|null>} { latitude, longitude }
 */
async function extractCoordinates(url) {
  if (!url) return null;
  
  // 1. Expand short URLs if necessary
  let targetUrl = url;
  if (url.includes('goo.gl') || url.includes('maps.app.goo.gl') || url.includes('bit.ly') || url.length < 50) {
    console.log('📍 [COORD-EXTRACT] Expanding short URL:', url);
    targetUrl = await expandUrl(url);
    // Google often does double redirects for mobile shares
    if (targetUrl.includes('goo.gl') || targetUrl.includes('maps.app.goo.gl')) {
      targetUrl = await expandUrl(targetUrl);
    }
  }

  console.log('📍 [COORD-EXTRACT] Processing URL:', targetUrl.substring(0, 250));

  // 2. PRECISION CASCADE:
  
  // A. Prioritize !3d/!4d (Actual Pin Location - High Precision)
  // Supports both float and integer coordinates
  const m3d = targetUrl.match(/!3d(-?\d+(?:\.\d+)?)/);
  const m4d = targetUrl.match(/!4d(-?\d+(?:\.\d+)?)/);
  
  if (m3d && m4d) {
    const result = { latitude: parseFloat(m3d[1]), longitude: parseFloat(m4d[1]) };
    console.log('📍 [COORD-EXTRACT] ✅ !3d/!4d match (Precision):', result);
    return result;
  }

  // B. Match path-based coordinates like /place/lat,lng or /search/lat,lng
  const matchPath = targetUrl.match(/\/(?:place|search)\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (matchPath) {
    const result = { latitude: parseFloat(matchPath[1]), longitude: parseFloat(matchPath[2]) };
    console.log('📍 [COORD-EXTRACT] ✅ Path match (Precision):', result);
    return result;
  }

  // C. Fallback to @ viewport coordinates (usually center of screen, less precise for specific pins)
  const matchAt = targetUrl.match(/@(-?[0-9.]+),(-?[0-9.]+)/);
  if (matchAt) {
    const result = { latitude: parseFloat(matchAt[1]), longitude: parseFloat(matchAt[2]) };
    console.log('📍 [COORD-EXTRACT] ℹ️ @ viewport match (Lower Precision):', result);
    return result;
  }

  // D. Fallback to query parameters
  const matchQ = targetUrl.match(/\?q=(-?[0-9.]+),(-?[0-9.]+)/);
  if (matchQ) {
    const result = { latitude: parseFloat(matchQ[1]), longitude: parseFloat(matchQ[2]) };
    console.log('📍 [COORD-EXTRACT] ℹ️ ?q= match:', result);
    return result;
  }

  // E. LAST RESORT: Fetch the Google Maps page and extract coordinates from HTML
  //    Handles Place ID-only URLs that contain zero coordinates in the URL text.
  //    Google embeds the resolved location as "center=LAT%2CLNG" in the page response.
  if (targetUrl.includes('google.com/maps')) {
    console.log('📍 [COORD-EXTRACT] ⏳ No coords in URL text. Fetching page to resolve Place ID...');
    try {
      const pageCoords = await fetchPageCoordinates(targetUrl);
      if (pageCoords) {
        console.log('📍 [COORD-EXTRACT] ✅ Page-fetch resolved:', pageCoords);
        return pageCoords;
      }
    } catch (err) {
      console.error('📍 [COORD-EXTRACT] Page-fetch error:', err.message);
    }
  }

  console.log('📍 [COORD-EXTRACT] ❌ No coordinates found after all methods');
  return null;
}

/**
 * Fetches a Google Maps page and extracts coordinates from the HTML body.
 * Google embeds "center=LAT%2CLNG" in the page for Place ID URLs.
 */
function fetchPageCoordinates(url) {
  return new Promise((resolve) => {
    try {
      const req = https.get(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 8000 
      }, (res) => {
        // Follow one redirect if needed
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume(); // drain the response
          const redirectReq = https.get(res.headers.location, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 8000
          }, (redirectRes) => {
            collectAndParse(redirectRes, resolve);
          });
          redirectReq.on('error', () => resolve(null));
          redirectReq.on('timeout', () => { redirectReq.destroy(); resolve(null); });
          return;
        }
        collectAndParse(res, resolve);
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
    } catch (e) {
      resolve(null);
    }
  });
}

function collectAndParse(res, resolve) {
  let body = '';
  res.on('data', chunk => { body += chunk; });
  res.on('end', () => {
    // Pattern 1: center=LAT%2CLNG (URL-encoded comma in meta/link tags)
    const centerMatch = body.match(/center=(-?\d{1,3}\.\d{4,})%2C(-?\d{1,3}\.\d{4,})/);
    if (centerMatch) {
      return resolve({ latitude: parseFloat(centerMatch[1]), longitude: parseFloat(centerMatch[2]) });
    }

    // Pattern 2: !3d/!4d that appeared in the body (sometimes in embedded data)
    const m3d = body.match(/!3d(-?\d+(?:\.\d+)?)/);
    const m4d = body.match(/!4d(-?\d+(?:\.\d+)?)/);
    if (m3d && m4d) {
      return resolve({ latitude: parseFloat(m3d[1]), longitude: parseFloat(m4d[1]) });
    }

    // Pattern 3: @LAT,LNG in the body
    const atMatch = body.match(/@(-?\d{1,3}\.\d{4,}),(-?\d{1,3}\.\d{4,})/);
    if (atMatch) {
      return resolve({ latitude: parseFloat(atMatch[1]), longitude: parseFloat(atMatch[2]) });
    }

    resolve(null);
  });
  res.on('error', () => resolve(null));
}

module.exports = { extractCoordinates };

