/**
 * Employee: Geo-sorting and distance calculation utilities
 */
import { state } from '../../store/globalState';
import { pincodeData } from '../../store/pincodes';
import { showToast } from '../../utils/ui';
import { displayEmployeeTasks } from './taskBoard';

// Standard Haversine distance formula
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

/**
 * 🛰️ Unified Geolocation Wrapper
 * Handles: High-accuracy attempt, Low-accuracy retry, Permission checks, and Button state.
 */
async function withUserLocation(event, actionName, callback) {
  if (!navigator.geolocation) {
    showToast('Geolocation not supported by your browser', 'error');
    return;
  }

  const btn = event?.target?.closest ? event.target.closest('button') : (event?.target || null);
  const originalHtml = btn?.innerHTML;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${actionName}...`;
  }

  const handleSuccess = async (pos) => {
    try {
      await callback(pos.coords.latitude, pos.coords.longitude);
    } catch (err) {
      console.error(`📍 ${actionName} Logic Error:`, err);
      showToast(`${actionName} failed`, 'error');
    } finally {
      if (btn) {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }
    }
  };

  const handleError = (err) => {
    // Retry once with low accuracy if it's a timeout or unavailable
    if ((err.code === 2 || err.code === 3) && !withUserLocation._isRetrying) {
      console.warn(`🛰️ GPS: High accuracy failed (${err.message}), retrying with low accuracy...`);
      withUserLocation._isRetrying = true;
      if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Retrying GPS...';
      navigator.geolocation.getCurrentPosition(handleSuccess, (retryErr) => {
        showToast(retryErr.code === 1 ? 'Location permission denied.' : 'Could not determine your location.', 'error');
        if (btn) { btn.innerHTML = originalHtml; btn.disabled = false; }
        withUserLocation._isRetrying = false;
      }, { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 });
    } else {
      const msg = err.code === 1 ? 'Location permission denied. Please allow access.' : 'Could not determine your location.';
      showToast(msg, 'error');
      if (btn) { btn.innerHTML = originalHtml; btn.disabled = false; }
      withUserLocation._isRetrying = false;
    }
  };

  withUserLocation._isRetrying = false;
  navigator.geolocation.getCurrentPosition(handleSuccess, handleError, { enableHighAccuracy: true, timeout: 15000, maximumAge: 15000 });
}

export function sortByPincode() {
  state.isNearestSortActive = false;
  state.savedEmployeeLocation = null;
  state.allEmployeeTasks.sort((a, b) => 
    String(a.pincode || '999999').localeCompare(String(b.pincode || '999999'))
  );
  
  displayEmployeeTasks(state.allEmployeeTasks);
  showToast('Grouped by Pincode', 'success');
}

export async function sortByNearest(event) {
  withUserLocation(event, 'Optimizing', async (userLat, userLng) => {
    showToast('Calculating elite route...', 'info');
    state.savedEmployeeLocation = { latitude: userLat, longitude: userLng };
    state.isNearestSortActive = true;
    
    console.log(`📍 [ORS-ENRICH] Enriching ${state.allEmployeeTasks.length} tasks for ORS optimization...`);
    
    const enrichedTasks = state.allEmployeeTasks.map(t => {
      const { lat, lng } = resolveTaskCoordinates(t);
      return { ...t, _lat: lat, _lng: lng };
    });
    
    const requestPayload = {
      employeeLocation: { lat: userLat, lng: userLng },
      tasks: enrichedTasks.map(t => ({
        id: t.id, _lat: t._lat, _lng: t._lng, title: t.title, pincode: t.pincode
      }))
    };
    
    const response = await fetch('/api/tasks/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });
    
    const result = await response.json();
    
    if (result.success && result.optimizedTasks) {
      const optimizedOrder = result.optimizedTasks.map(opt => {
        const task = state.allEmployeeTasks.find(t => String(t.id) === String(opt.id));
        if (task) task.distanceKm = opt.distance ? opt.distance.toFixed(1) : null;
        return task;
      }).filter(t => t);
      
      state.allEmployeeTasks = optimizedOrder;
      refreshSortingUI();
      showToast('Route optimized!', 'success');
    } else {
      fallbackSort(userLat, userLng);
    }
  });
}

function refreshSortingUI() {
  const list = document.getElementById('todayTasksList');
  const map = document.getElementById('routingMap');
  
  if (map && map.offsetParent !== null) {
    Promise.all([
      import('../routing/googleMapsEngine'),
      import('../employee/taskPanel')
    ]).then(([mod, panelMod]) => {
      mod.showMapRouting(state.allEmployeeTasks, panelMod.openTaskPanel, true);
    }).catch(err => console.error('Failed to refresh map after sort:', err));
  }
  
  if (list) displayEmployeeTasks(state.allEmployeeTasks);
}

function fallbackSort(userLat, userLng) {
  showToast('Using basic proximity sorting fallback', 'info');
  reapplyDistanceSorting(state.allEmployeeTasks, userLat, userLng);
  displayEmployeeTasks(state.allEmployeeTasks);
}

/**
 * Helper to resolve coordinates using the precision cascade (DB-first):
 * DB coords (precision-extracted at creation) > !3d/4d > @-viewport > ?q-query > _enriched > Pincode Fallback
 * 
 * Returns { lat, lng, source } where source indicates the resolution method.
 */
export function resolveTaskCoordinates(t) {
  let lat = null;
  let lng = null;
  let source = 'none';

  const link = t.map_url || t.mapUrl || t.mapurl;
  let urlLat = null;
  let urlLng = null;
  let urlSource = null;

  // 1. EXTRACT FROM URL FIRST
  if (link) {
    // A. !3d/!4d (Precision) - Supports integer/float
    const m3d = link.match(/!3d(-?\d+(?:\.\d+)?)/);
    const m4d = link.match(/!4d(-?\d+(?:\.\d+)?)/);
    
    // B. Path-based (Precision)
    const matchPath = link.match(/\/(?:place|search)\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);

    if (m3d && m4d) {
      urlLat = parseFloat(m3d[1]);
      urlLng = parseFloat(m4d[1]);
      urlSource = '!3d/4d-url';
    } else if (matchPath) {
      urlLat = parseFloat(matchPath[1]);
      urlLng = parseFloat(matchPath[2]);
      urlSource = 'path-url';
    } else {
      const matchAt = link.match(/@(-?[0-9.]+),(-?[0-9.]+)/);
      const matchQ = link.match(/\?q=(-?[0-9.]+),(-?[0-9.]+)/);
      if (matchAt) { 
        urlLat = parseFloat(matchAt[1]); 
        urlLng = parseFloat(matchAt[2]); 
        urlSource = '@-viewport';
      } else if (matchQ) {
        urlLat = parseFloat(matchQ[1]);
        urlLng = parseFloat(matchQ[2]);
        urlSource = '?q-query';
      }
    }
  }

  // 2. PRIORITY 1: HIGH-PRECISION URL
  // The map link is the absolute Source of Truth. If it explicitly defines a pin, we use it, 
  // overriding the DB (which might be historically inaccurate or stale).
  if (urlSource === '!3d/4d-url' || urlSource === 'path-url') {
    return { lat: urlLat, lng: urlLng, source: urlSource };
  }

  // 3. PRIORITY 2: DB-STORED COORDINATES
  // If the URL is low-precision (@-viewport) or missing, we trust the DB, 
  // which may have been enriched via geocoding or backend async resolution.
  const dbLat = parseFloat(t.latitude);
  const dbLng = parseFloat(t.longitude);
  if (isFinite(dbLat) && isFinite(dbLng)) {
    return { lat: dbLat, lng: dbLng, source: 'db-precision' };
  }

  // 4. PRIORITY 3: LOW-PRECISION URL FALLBACK
  if (urlSource === '@-viewport' || urlSource === '?q-query') {
    return { lat: urlLat, lng: urlLng, source: urlSource };
  }

  // 5. PRIORITY 4: ENRICHED ORS PIPELINE FIELDS
  const enrichLat = parseFloat(t._lat);
  const enrichLng = parseFloat(t._lng);
  if (isFinite(enrichLat) && isFinite(enrichLng)) {
    return { lat: enrichLat, lng: enrichLng, source: '_enriched' };
  }

  // 6. PRIORITY 5: ADDRESS PINCODE EXTRACTION
  if (t.address) {
    const addrPinMatch = String(t.address).match(/\b[1-9][0-9]{5}\b/);
    if (addrPinMatch && pincodeData[addrPinMatch[0]]) {
      return { 
        lat: pincodeData[addrPinMatch[0]].lat, 
        lng: pincodeData[addrPinMatch[0]].lng, 
        source: 'address-pincode' 
      };
    }
  }

  // 7. PRIORITY 6: PINCODE CENTROID FALLBACK
  if (t.pincode && pincodeData[t.pincode]) {
    return { lat: pincodeData[t.pincode].lat, lng: pincodeData[t.pincode].lng, source: 'pincode-fallback' };
  }

  return { lat: null, lng: null, source: 'none' };
}

export function reapplyDistanceSorting(tasks, userLat, userLng) {
  let pool = tasks.map(t => {
    const { lat, lng } = resolveTaskCoordinates(t);
    t.distanceKm = (lat != null && lng != null) ? calculateDistance(userLat, userLng, lat, lng).toFixed(1) : Number.MAX_VALUE;
    return t;
  });
  
  pool.sort((a, b) => {
    if (a.distanceKm === Number.MAX_VALUE) return 1;
    if (b.distanceKm === Number.MAX_VALUE) return -1;
    return parseFloat(a.distanceKm) - parseFloat(b.distanceKm);
  });
  
  state.allEmployeeTasks = pool;
}

/**
 * Greedy Nearest-Neighbor Routing Logic:
 * User -> Nearest Task -> Next Nearest (from Task 1) -> Next Nearest (from Task 2)...
 */
export async function calculateGreedyRoute(event) {
  withUserLocation(event, 'Routing', async (userLat, userLng) => {
    showToast('Calculating custom greedy route...', 'info');
    
    const activeTasks = state.allEmployeeTasks.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s !== 'verified' && s !== 'completed';
    });

    if (activeTasks.length === 0) {
      showToast('No active tasks to route', 'warning');
      return;
    }

    const optimizedOrder = [];
    let currentLat = userLat;
    let currentLng = userLng;
    let pool = [...activeTasks];

    while (pool.length > 0) {
      let nearestIdx = -1;
      let minDistance = Infinity;

      for (let i = 0; i < pool.length; i++) {
        const { lat, lng } = resolveTaskCoordinates(pool[i]);
        if (!lat || !lng) continue;

        const dist = calculateDistance(currentLat, currentLng, lat, lng);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = i;
        }
      }

      if (nearestIdx === -1) {
        optimizedOrder.push(...pool);
        break;
      }

      const nextTask = pool.splice(nearestIdx, 1)[0];
      const { lat, lng } = resolveTaskCoordinates(nextTask);
      currentLat = lat;
      currentLng = lng;
      optimizedOrder.push(nextTask);
    }

    const otherTasks = state.allEmployeeTasks.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s === 'verified' || s === 'completed';
    });

    state.allEmployeeTasks = [...optimizedOrder, ...otherTasks];
    refreshSortingUI();
    showToast('Custom greedy route applied!', 'success');
  });
}
