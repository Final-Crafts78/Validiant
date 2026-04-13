const logger = require("./logger");

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
  logger.info('Coordinate extraction started', { urlSnippet: url.substring(0, 100) });

  // DEBUG: Also attempt !3d/!4d extraction for comparison
  const match3d = url.match(/!3d(-?\d+\.\d+)/);
  const match4d = url.match(/!4d(-?\d+\.\d+)/);
  if (match3d && match4d) {
    logger.info('ACTUAL PLACE coords found (!3d/!4d)', { lat: match3d[1], lng: match4d[1] });
  }

  const match1 = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match1) {
    const result = { latitude: parseFloat(match1[1]), longitude: parseFloat(match1[2]) };
    logger.info('@ viewport match found', result);
    if (match3d && match4d) {
      const actualLat = parseFloat(match3d[1]);
      const actualLng = parseFloat(match4d[1]);
      const latDiff = Math.abs(result.latitude - actualLat);
      const lngDiff = Math.abs(result.longitude - actualLng);
      const distMeters = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111320;
      logger.warn('COORDINATE DISCREPANCY', { 
        latDiff: latDiff.toFixed(6), 
        lngDiff: lngDiff.toFixed(6), 
        approxMeters: distMeters.toFixed(0) 
      });
    }
    return result;
  }
  const match2 = url.match(/\?q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match2) {
    const result = { latitude: parseFloat(match2[1]), longitude: parseFloat(match2[2]) };
    logger.info('?q= match found', result);
    return result;
  }
  logger.info('No coordinates found in URL');
  return null;
}

module.exports = { extractCoordinates };
