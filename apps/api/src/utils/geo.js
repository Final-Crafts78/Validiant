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

  console.log('📍 [COORD-EXTRACT] ❌ No coordinates found in URL after expansion');
  return null;
}

module.exports = { extractCoordinates };

