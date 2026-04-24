/**
 * Geo-spatial utilities
 */

/**
 * Extracts latitude and longitude from a Google Maps URL
 * @param {string} url 
 * @returns {object|null} { latitude, longitude }
 */
function extractCoordinates(url) {
  if (!url) return null;
  console.log('📍 [COORD-EXTRACT] Input URL:', url.substring(0, 200));

  // 1. Prioritize !3d/!4d (Actual Pin Location - High Precision)
  const m3d = url.match(/!3d(-?\d+\.\d+)/);
  const m4d = url.match(/!4d(-?\d+\.\d+)/);
  
  if (m3d && m4d) {
    const result = { latitude: parseFloat(m3d[1]), longitude: parseFloat(m4d[1]) };
    console.log('📍 [COORD-EXTRACT] ✅ !3d/!4d match (Precision):', result);
    return result;
  }

  // 2. Fallback to @ viewport coordinates
  const matchAt = url.match(/@(-?[0-9.]+),(-?[0-9.]+)/);
  if (matchAt) {
    const result = { latitude: parseFloat(matchAt[1]), longitude: parseFloat(matchAt[2]) };
    console.log('📍 [COORD-EXTRACT] ℹ️ @ viewport match (Lower Precision):', result);
    return result;
  }

  // 3. Fallback to query parameters
  const matchQ = url.match(/\?q=(-?[0-9.]+),(-?[0-9.]+)/);
  if (matchQ) {
    const result = { latitude: parseFloat(matchQ[1]), longitude: parseFloat(matchQ[2]) };
    console.log('📍 [COORD-EXTRACT] ℹ️ ?q= match:', result);
    return result;
  }

  console.log('📍 [COORD-EXTRACT] ❌ No coordinates found in URL');
  return null;
}

module.exports = { extractCoordinates };
