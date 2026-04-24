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
          let lat = null;
          let lng = null;
          let coordSource = 'none';
          
          // PRECISION CASCADE (DB-first):
          // 1. DB coords (already precision-extracted by backend at creation)
          // 2. URL !3d/!4d (actual pin drop)
          // 3. URL @ (viewport center — 200-500m imprecise)
          // 4. URL ?q= (query param)
          // 5. Pincode centroid (last resort)
          
          // 1. HIGHEST PRIORITY: DB-stored coordinates
          const dbLat = parseFloat(t.latitude);
          const dbLng = parseFloat(t.longitude);
          if (isFinite(dbLat) && isFinite(dbLng)) {
            lat = dbLat;
            lng = dbLng;
            coordSource = 'db-precision';
          }
          
          // 2. If no DB coords, extract from map_url
          if (lat == null || lng == null) {
            const link = t.map_url || t.mapUrl || t.mapurl;
            if (link) {
              const m3d = link.match(/!3d(-?\d+\.\d+)/);
              const m4d = link.match(/!4d(-?\d+\.\d+)/);
              if (m3d && m4d) {
                lat = parseFloat(m3d[1]);
                lng = parseFloat(m4d[1]);
                coordSource = '!3d/4d-url';
              } else {
                const matchAt = link.match(/@(-?[0-9.]+),(-?[0-9.]+)/);
                const matchQ = link.match(/\?q=(-?[0-9.]+),(-?[0-9.]+)/);
                if (matchAt) { 
                  lat = parseFloat(matchAt[1]); 
                  lng = parseFloat(matchAt[2]); 
                  coordSource = '@-viewport';
                } else if (matchQ) {
                  lat = parseFloat(matchQ[1]);
                  lng = parseFloat(matchQ[2]);
                  coordSource = '?q-query';
                }
              }
            }
          }
          
          // 3. Pincode centroid fallback
          if ((lat == null || lng == null) && t.pincode && pincodeData[t.pincode]) {
            lat = pincodeData[t.pincode].lat;
            lng = pincodeData[t.pincode].lng;
            coordSource = 'pincode-fallback';
          }
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
              import('../routing/leafletEngine'),
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
      showToast('Location error: Please allow access', 'error');
      if (sortBtn) {
        sortBtn.innerHTML = originalBtnContent;
        sortBtn.disabled = false;
      }
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
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
  
  // 1. HIGHEST PRIORITY: DB-stored coordinates
  //    The backend already runs the full precision cascade (!3d/!4d > @ > ?q)
  //    at task creation and stores the best result. Trust these first.
  const dbLat = parseFloat(t.latitude);
  const dbLng = parseFloat(t.longitude);
  if (isFinite(dbLat) && isFinite(dbLng)) {
    lat = dbLat;
    lng = dbLng;
    source = 'db-precision';
  }

  // 2. If no DB coords, extract from map_url using precision cascade
  if (lat == null || lng == null) {
    const link = t.map_url || t.mapUrl || t.mapurl;
    if (link) {
      const m3d = link.match(/!3d(-?\d+\.\d+)/);
      const m4d = link.match(/!4d(-?\d+\.\d+)/);
      if (m3d && m4d) {
        lat = parseFloat(m3d[1]);
        lng = parseFloat(m4d[1]);
        source = '!3d/4d-url';
      } else {
        const matchAt = link.match(/@(-?[0-9.]+),(-?[0-9.]+)/);
        const matchQ = link.match(/\?q=(-?[0-9.]+),(-?[0-9.]+)/);
        if (matchAt) { 
          lat = parseFloat(matchAt[1]); 
          lng = parseFloat(matchAt[2]); 
          source = '@-viewport';
        } else if (matchQ) {
          lat = parseFloat(matchQ[1]);
          lng = parseFloat(matchQ[2]);
          source = '?q-query';
        }
      }
    }
  }

  // 3. Check _lat/_lng (enriched fields from ORS pipeline)
  if (lat == null || lng == null) {
    const enrichLat = parseFloat(t._lat);
    const enrichLng = parseFloat(t._lng);
    if (isFinite(enrichLat) && isFinite(enrichLng)) {
      lat = enrichLat;
      lng = enrichLng;
      source = '_enriched';
    }
  }

  // 4. LOWEST PRIORITY: Pincode centroid fallback
  if ((lat == null || lng == null) && t.pincode && pincodeData[t.pincode]) {
    lat = pincodeData[t.pincode].lat;
    lng = pincodeData[t.pincode].lng;
    source = 'pincode-fallback';
  }

  return { lat, lng, source };
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
        const { showMapRouting } = await import('../routing/leafletEngine');
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
    showToast('Location access denied', 'error');
    if (btn) {
      btn.innerHTML = originalHtml;
      btn.disabled = false;
    }
  });
}
