/**
 * Background Location Reporter for Executives
 */

let watchId = null;
let lastReportTime = 0;
const THROTTLE_MS = 30 * 1000; // 30 seconds

/**
 * Start reporting location to the server using the robust watchPosition API
 * @param {string} userId 
 */
export function startLocationReporting(userId) {
  if (watchId) return;
  if (!userId) return;
  if (!navigator.geolocation) {
    console.warn('📡 Geolocation is not supported by this browser.');
    return;
  }

  console.log(`📡 Starting live location tracking for executive: ${userId}`);

  watchId = navigator.geolocation.watchPosition(async (pos) => {
    const now = Date.now();
    
    // Throttle API requests to save battery and network bandwidth
    if (now - lastReportTime < THROTTLE_MS) return;
    
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
      
      lastReportTime = Date.now();
    } catch (err) {
      console.warn('📡 Location Update Failed:', err.message);
    }
  }, (err) => {
    console.warn('📡 GPS Tracker Error:', err.message);
  }, {
    enableHighAccuracy: true,
    timeout: 30000,  // Increased from 10s to 30s to allow cold GPS starts
    maximumAge: 10000 // Accept 10-second old cached locations to speed up response
  });
}

/**
 * Stop reporting location
 */
export function stopLocationReporting() {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    console.log('📡 Stopped location reporting');
  }
}
