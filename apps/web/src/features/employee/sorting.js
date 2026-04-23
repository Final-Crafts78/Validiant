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
          let lat = parseFloat(t.latitude) || null;
          let lng = parseFloat(t.longitude) || null;
          let coordSource = (lat && lng) ? 'db' : 'none';
          
          if (!lat || !lng) {
            const link = t.map_url || t.mapUrl || t.mapurl;
            if (link) {
              const m3d = link.match(/!3d(-?[0-9.]+)/);
              const m4d = link.match(/!4d(-?[0-9.]+)/);
              const matchAt = link.match(/@(-?[0-9.]+),(-?[0-9.]+)/);
              const matchQ = link.match(/\\?q=(-?[0-9.]+),(-?[0-9.]+)/);

              if (m3d && m4d) {
                lat = parseFloat(m3d[1]);
                lng = parseFloat(m4d[1]);
                coordSource = '!3d/4d-precision';
              } else if (matchAt) { 
                lat = parseFloat(matchAt[1]); 
                lng = parseFloat(matchAt[2]); 
                coordSource = '@-viewport';
              } else if (matchQ) {
                lat = parseFloat(matchQ[1]);
                lng = parseFloat(matchQ[2]);
                coordSource = '?q=-query';
              }
            }
          }
          if ((!lat || !lng) && t.pincode && pincodeData[t.pincode]) {
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

export function reapplyDistanceSorting(tasks, userLat, userLng) {
  let pool = tasks.map(t => {
    let lat = parseFloat(t.latitude), lng = parseFloat(t.longitude);
    if (isNaN(lat) || isNaN(lng) || lat === 0) {
      const link = t.map_url || t.mapUrl || t.mapurl;
      if (link) {
        const m3d = link.match(/!3d(-?[0-9.]+)/);
        const m4d = link.match(/!4d(-?[0-9.]+)/);
        if (m3d && m4d) {
          lat = parseFloat(m3d[1]);
          lng = parseFloat(m4d[1]);
        } else {
          const match = link.match(/@(-?[0-9.]+),(-?[0-9.]+)/) || link.match(/\\?q=(-?[0-9.]+),(-?[0-9.]+)/);
          if (match) { lat = parseFloat(match[1]); lng = parseFloat(match[2]); }
        }
      }
    }
    if ((isNaN(lat) || isNaN(lng) || lat === 0) && t.pincode && pincodeData[t.pincode]) {
      lat = pincodeData[t.pincode].lat;
      lng = pincodeData[t.pincode].lng;
    }
    
    t.distanceKm = (lat && lng) ? calculateDistance(userLat, userLng, lat, lng).toFixed(1) : Number.MAX_VALUE;
    return t;
  });
  
  pool.sort((a, b) => {
    if (a.distanceKm === Number.MAX_VALUE) return 1;
    if (b.distanceKm === Number.MAX_VALUE) return -1;
    return parseFloat(a.distanceKm) - parseFloat(b.distanceKm);
  });
  
  state.allEmployeeTasks = pool;
}
