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

  // DEBUG: Also attempt !3d/!4d extraction for comparison
  const match3d = url.match(/!3d(-?\d+\.\d+)/);
  const match4d = url.match(/!4d(-?\d+\.\d+)/);
  if (match3d && match4d) {
    console.log('📍 [COORD-EXTRACT] !3d/!4d ACTUAL PLACE coords found:', { lat: match3d[1], lng: match4d[1] });
  }

  const match1 = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match1) {
    const result = { latitude: parseFloat(match1[1]), longitude: parseFloat(match1[2]) };
    console.log('📍 [COORD-EXTRACT] @ viewport match:', result);
    if (match3d && match4d) {
      const actualLat = parseFloat(match3d[1]);
      const actualLng = parseFloat(match4d[1]);
      const latDiff = Math.abs(result.latitude - actualLat);
      const lngDiff = Math.abs(result.longitude - actualLng);
      const distMeters = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111320;
      console.log(`📍 [COORD-EXTRACT] ⚠️ DISCREPANCY: @ vs !3d/!4d → lat diff: ${latDiff.toFixed(6)}°, lng diff: ${lngDiff.toFixed(6)}°, ~${distMeters.toFixed(0)}m apart`);
    }
    return result;
  }
  const match2 = url.match(/\?q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match2) {
    const result = { latitude: parseFloat(match2[1]), longitude: parseFloat(match2[2]) };
    console.log('📍 [COORD-EXTRACT] ?q= match:', result);
    return result;
  }
  console.log('📍 [COORD-EXTRACT] ❌ No coordinates found in URL');
  return null;
}

module.exports = { extractCoordinates };
