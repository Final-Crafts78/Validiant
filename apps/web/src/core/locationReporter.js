/**
 * Background Location Reporter
 * Periodically sends high-accuracy GPS coordinates to the server for executive tracking.
 */

let reportInterval = null;
const REPORT_INTERVAL_MS = 60 * 1000; // 1 Minute pulse

/**
 * Starts the periodic location reporting process.
 * @param {string|number} userId - The ID of the user whose location is being tracked.
 */
export function startLocationReporting(userId) {
  if (reportInterval) return;
  if (!userId) return;

  // 💎 Premium Observability: Use structured logs for system events
  console.log(`📡 [LOC-REP] Initializing reporting sequence for user: ${userId}`);

  // Immediate first report
  reportLocation(userId);

  // Periodic persistence
  reportInterval = setInterval(() => {
    reportLocation(userId);
  }, REPORT_INTERVAL_MS);
}

/**
 * Halts the reporting process and clears the interval.
 */
export function stopLocationReporting() {
  if (reportInterval) {
    clearInterval(reportInterval);
    reportInterval = null;
    console.log('📡 [LOC-REP] Sequence terminated safely');
  }
}

/**
 * Orchestrates the acquisition of hardware GPS coordinates and their transmission to the API.
 * @param {string|number} userId - Target user ID.
 * @private
 */
async function reportLocation(userId) {
  if (!navigator.geolocation) {
    console.warn('📡 [LOC-REP] Hardware mismatch: Geolocation unavailable');
    return;
  }

  // 💎 Performance: High Accuracy enabled for premium precision
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const { latitude, longitude } = pos.coords;
      
      const response = await fetch(`/api/users/${userId}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude })
      });

      if (!response.ok) {
        throw new Error(`API rejected update: ${response.status}`);
      }
      
      // Silent success maintains a clean UX
    } catch (err) {
      console.warn('📡 [LOC-REP] Network transmission failure:', err.message);
    }
  }, (err) => {
    // 💎 Precision: Handle different GPS error states (Permission vs Timeout)
    console.warn(`📡 [LOC-REP] Signal acquisition failed: ${err.message}`);
  }, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000
  });
}
