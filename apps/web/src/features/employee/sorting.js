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
  if (!navigator.geolocation) {
    showToast('Geolocation not supported by your browser', 'error');
    return;
  }
  
  showToast('Calculating elite route...', 'info');
  const sortBtn = event ? (event.target.closest ? event.target.closest('button') : event.target) : null;
  const originalBtnContent = sortBtn ? sortBtn.innerHTML : '';
  
  if (sortBtn) {
    sortBtn.disabled = true;
    sortBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing...';
  }
  
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
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
          
          // View-Aware Logic: Update List OR Map depending on what's active
          const list = document.getElementById('todayTasksList');
          const map = document.getElementById('routingMap');
          
          if (map && map.offsetParent !== null) {
            // We are on Map View - Lazy import routing engine to refresh map
            Promise.all([
              import('../routing/googleMapsEngine'),
              import('../employee/taskPanel')
            ]).then(([mod, panelMod]) => {
              mod.showMapRouting(state.allEmployeeTasks, panelMod.openTaskPanel, true);
            }).catch(err => console.error('Failed to refresh map after sort:', err));
          }
          
          if (list) {
            displayEmployeeTasks(state.allEmployeeTasks);
          }
          
          showToast('Route optimized!', 'success');
        } else {
          fallbackSort(userLat, userLng);
        }
      } catch (err) {
        console.error('ORS Error', err);
        fallbackSort(pos.coords.latitude, pos.coords.longitude);
      } finally {
        if (sortBtn) {
          sortBtn.innerHTML = originalBtnContent;
          sortBtn.disabled = false;
        }
      }
    },
    (err) => {
      // If timeout or unavailable, retry with low accuracy
      if (err.code === 2 || err.code === 3) {
        console.warn('High-accuracy GPS failed for ORS sort, retrying with low accuracy...', err);
        if (sortBtn) {
          sortBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Retrying GPS...';
        }
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const userLat = pos.coords.latitude;
              const userLng = pos.coords.longitude;
              state.savedEmployeeLocation = { latitude: userLat, longitude: userLng };
              state.isNearestSortActive = true;
              
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
                
                const list = document.getElementById('todayTasksList');
                const map = document.getElementById('routingMap');
                
                if (map && map.offsetParent !== null) {
                  Promise.all([
                    import('../routing/googleMapsEngine'),
                    import('../employee/taskPanel')
                  ]).then(([mod, panelMod]) => {
                    mod.showMapRouting(state.allEmployeeTasks, panelMod.openTaskPanel);
                  }).catch(err => console.error('Failed to refresh map after sort:', err));
                }
                
                if (list) {
                  displayEmployeeTasks(state.allEmployeeTasks);
                }
                
                showToast('Route optimized!', 'success');
              } else {
                fallbackSort(userLat, userLng);
              }
            } catch (retryErr) {
              console.error('ORS Error on retry', retryErr);
              fallbackSort(pos.coords.latitude, pos.coords.longitude);
            } finally {
              if (sortBtn) {
                sortBtn.innerHTML = originalBtnContent;
                sortBtn.disabled = false;
              }
            }
          },
          (retryErr) => {
            const msg = retryErr.code === 1 ? 'Location permission denied. Please allow access.' : 'Could not determine your location. Please try again.';
            showToast(msg, 'error');
            if (sortBtn) {
              sortBtn.innerHTML = originalBtnContent;
              sortBtn.disabled = false;
            }
          },
          { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
        );
      } else {
        // Permission denied — don't retry
        showToast('Location permission denied. Please allow access in browser settings.', 'error');
        if (sortBtn) {
          sortBtn.innerHTML = originalBtnContent;
          sortBtn.disabled = false;
        }
      }
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 15000 }
  );
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
  if (!navigator.geolocation) {
    showToast('Geolocation not supported', 'error');
    return;
  }

  showToast('Calculating custom greedy route...', 'info');
  const btn = event?.target.closest('button');
  const originalHtml = btn?.innerHTML;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Routing...';
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const userLat = pos.coords.latitude;
      const userLng = pos.coords.longitude;
      
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
          // No more tasks with coordinates, just append the rest
          optimizedOrder.push(...pool);
          break;
        }

        const nextTask = pool.splice(nearestIdx, 1)[0];
        const { lat, lng } = resolveTaskCoordinates(nextTask);
        currentLat = lat;
        currentLng = lng;
        optimizedOrder.push(nextTask);
      }

      // Preserve completed/verified tasks at the end if any were filtered out
      const otherTasks = state.allEmployeeTasks.filter(t => {
        const s = (t.status || '').toLowerCase();
        return s === 'verified' || s === 'completed';
      });

      state.allEmployeeTasks = [...optimizedOrder, ...otherTasks];
      
      // Update UI
      const map = document.getElementById('routingMap');
      if (map && map.offsetParent !== null) {
        const { showMapRouting } = await import('../routing/googleMapsEngine');
        const { openTaskPanel } = await import('../employee/taskPanel');
        showMapRouting(state.allEmployeeTasks, openTaskPanel);
      }

      const list = document.getElementById('todayTasksList');
      if (list) displayEmployeeTasks(state.allEmployeeTasks);

      showToast('Custom greedy route applied!', 'success');
    } catch (err) {
      console.error('Greedy Route Error:', err);
      showToast('Routing failed', 'error');
    } finally {
      if (btn) {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }
    }
  }, (err) => {
    // If timeout or unavailable, retry with low accuracy
    if (err.code === 2 || err.code === 3) {
      console.warn('High-accuracy GPS failed for greedy route, retrying...', err);
      if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Retrying GPS...';
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const activeTasks = state.allEmployeeTasks.filter(t => {
            const s = (t.status || '').toLowerCase();
            return s !== 'verified' && s !== 'completed';
          });
          if (activeTasks.length === 0) { showToast('No active tasks to route', 'warning'); return; }
          const optimizedOrder = [];
          let currentLat = userLat, currentLng = userLng;
          let pool = [...activeTasks];
          while (pool.length > 0) {
            let nearestIdx = -1, minDistance = Infinity;
            for (let i = 0; i < pool.length; i++) {
              const { lat, lng } = resolveTaskCoordinates(pool[i]);
              if (!lat || !lng) continue;
              const dist = calculateDistance(currentLat, currentLng, lat, lng);
              if (dist < minDistance) { minDistance = dist; nearestIdx = i; }
            }
            if (nearestIdx === -1) { optimizedOrder.push(...pool); break; }
            const nextTask = pool.splice(nearestIdx, 1)[0];
            const { lat, lng } = resolveTaskCoordinates(nextTask);
            currentLat = lat; currentLng = lng;
            optimizedOrder.push(nextTask);
          }
          const otherTasks = state.allEmployeeTasks.filter(t => {
            const s = (t.status || '').toLowerCase();
            return s === 'verified' || s === 'completed';
          });
          state.allEmployeeTasks = [...optimizedOrder, ...otherTasks];
          const map = document.getElementById('routingMap');
          if (map && map.offsetParent !== null) {
            const { showMapRouting } = await import('../routing/googleMapsEngine');
            const { openTaskPanel } = await import('../employee/taskPanel');
            showMapRouting(state.allEmployeeTasks, openTaskPanel);
          }
          const list = document.getElementById('todayTasksList');
          if (list) displayEmployeeTasks(state.allEmployeeTasks);
          showToast('Custom greedy route applied!', 'success');
        } catch (retryErr) {
          console.error('Greedy Route Retry Error:', retryErr);
          showToast('Routing failed', 'error');
        } finally {
          if (btn) { btn.innerHTML = originalHtml; btn.disabled = false; }
        }
      }, (retryErr) => {
        const msg = retryErr.code === 1 ? 'Location permission denied.' : 'Could not determine location.';
        showToast(msg, 'error');
        if (btn) { btn.innerHTML = originalHtml; btn.disabled = false; }
      }, { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 });
    } else {
      showToast('Location permission denied. Please allow access.', 'error');
      if (btn) { btn.innerHTML = originalHtml; btn.disabled = false; }
    }
  }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 15000 });
}
