/**
 * Background Location Reporter for Executives
 */

let reportInterval = null;
const REPORT_INTERVAL_MS = 60 * 1000; // 60 seconds

/**
 * Start reporting location to the server
 * @param {string} userId 
 */
export function startLocationReporting(userId) {
  if (reportInterval) return;
  if (!userId) return;

  console.log(`📡 Starting location reporting for executive: ${userId}`);

  // Initial report
  reportLocation(userId);

  // Periodic report
  reportInterval = setInterval(() => {
    reportLocation(userId);
  }, REPORT_INTERVAL_MS);
}

/**
 * Stop reporting location
 */
export function stopLocationReporting() {
  if (reportInterval) {
    clearInterval(reportInterval);
    reportInterval = null;
    console.log('📡 Stopped location reporting');
  }
}

/**
 * Fetch GPS and send to API
 */
async function reportLocation(userId) {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const { latitude, longitude } = pos.coords;
      
      const response = await fetch(`/api/users/${userId}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude })
      });

      if (!response.ok) {
        throw new Error('Failed to update location');
      }
      
      // Silent success - don't spam the console or UI
    } catch (err) {
      console.warn('📡 Location Update Failed:', err.message);
    }
  }, (err) => {
    // Silent failure on GPS access
    console.warn('📡 GPS Access Denied for reporting:', err.message);
  }, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000
  });
}
