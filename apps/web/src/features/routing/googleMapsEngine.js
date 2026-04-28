import { showToast, showLoading } from '../../utils/ui';

function hideLoading() {
  // Only remove generic loading spinners that are NOT our map-specific mapLoading div
  const spinners = document.querySelectorAll('.loading-spinner:not(#mapLoading)');
  spinners.forEach(s => s.remove());
}

let mapInstance = null;
let routePolyline = null;
let markers = [];
let mapsApiPromise = null;

// Helper to load Google Maps JS API script
function loadGoogleMapsApi(apiKey) {
  if (window.google?.maps) return Promise.resolve();
  if (mapsApiPromise) return mapsApiPromise;

  mapsApiPromise = new Promise((resolve, reject) => {
    // Use a named callback so Google Maps knows we handle initialization ourselves.
    // This suppresses the "loaded directly without loading=async" console warning.
    const callbackName = '__gmapsLoaded_' + Date.now();
    window[callbackName] = () => {
      delete window[callbackName];
      resolve();
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&v=weekly&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    document.head.appendChild(script);
  });

  return mapsApiPromise;
}

export async function showMapRouting(allEmployeeTasks, openTaskDetailsModal, isPreOptimized = false) {
  const content = document.getElementById('mainContainer');
  if (!content) return;

  if (!document.getElementById('routingMap')) {
    content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <h2><i class="fas fa-map-marked-alt"></i> Live Route Map</h2>
      <div id="mapHeaderActions" style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" data-action="routing:custom" style="background:#6366f1; border:none;"><i class="fas fa-route"></i> Custom Routing</button>
        <button class="btn btn-warning btn-sm" data-action="sorting:nearest"><i class="fas fa-location-arrow"></i> Optimize Route (ORS)</button>
        <button class="btn btn-info btn-sm" data-action="routing:refresh"><i class="fas fa-sync"></i> Refresh Map</button>
      </div>
    </div>
    
    <div id="mapLoading" class="loading-spinner show" style="justify-content:center; padding:50px; text-align:center;">
      <i class="fas fa-spinner fa-spin" style="font-size:2rem; color:#6366f1; margin-bottom:15px; display:block;"></i>
      <p>Acquiring GPS and loading map engine...</p>
    </div>
    
    <div id="routingMap" style="width: 100%; height: 65vh; border-radius: 12px; border: 2px solid #374151; display: none; box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 1;"></div>
  `;
  } else {
    document.getElementById('mapLoading').style.display = 'flex';
    document.getElementById('routingMap').style.opacity = '0.5';
  }

  const mapContainer = document.getElementById('routingMap');

  try {
    // DO NOT call showLoading() here! It replaces mainContainer.innerHTML and destroys the map DOM we just built above.
    
    // Fetch API Key from our backend
    const configRes = await fetch('/api/config/maps-key');
    if (!configRes.ok) {
        throw new Error('Could not fetch Maps API key config');
    }
    const configData = await configRes.json();
    if (!configData.success || !configData.key) {
        throw new Error('Maps API key not configured on server');
    }
    
    window._googleMapsApiKey = configData.key;
    
    // Load Google Maps JS API
    await loadGoogleMapsApi(window._googleMapsApiKey);

    // Helper function to initialize the map once location is acquired
    const initMapWithLocation = async (pos) => {
        try {
          const loadingEl = document.getElementById('mapLoading');
          if (loadingEl) loadingEl.style.display = 'none';
          
          if (!mapContainer) {
              console.error("Map container not found after getting location. DOM might have been altered.");
              return;
          }
          
          if (mapContainer) {
            mapContainer.style.display = 'block';
            mapContainer.style.opacity = '1';
          }

          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;

          // Initialize Google Map (Light Theme)
          if (!mapInstance) {
            mapInstance = new google.maps.Map(mapContainer, {
              center: { lat: userLat, lng: userLng },
              zoom: 13,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
              clickableIcons: false
            });
          } else {
            mapInstance.setCenter({ lat: userLat, lng: userLng });
          }

          // ─── CRITICAL: Wipe previous render artifacts ───
          // Without this, every re-render (Optimize Route, Refresh, etc.)
          // stacks new markers on top of old ones → overlapping numbers.
          markers.forEach(m => m.setMap(null));
          markers = [];
          if (routePolyline) {
            routePolyline.setMap(null);
            routePolyline = null;
          }
          // Also remove stale stats badge and nav buttons from previous render
          const staleStats = document.getElementById('routeStatsBadge');
          if (staleStats) staleStats.remove();
          const staleOrs = document.getElementById('orsNavBtn');
          if (staleOrs) staleOrs.remove();
          const staleGmaps = document.getElementById('gmapsNavBtn');
          if (staleGmaps) staleGmaps.remove();
          // ─── End cleanup ───

          // "You Are Here" Marker (Blue dot)
          const youAreHereMarker = new google.maps.Marker({
            position: { lat: userLat, lng: userLng },
            map: mapInstance,
            title: 'You Are Here',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#3b82f6', // blue-500
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2,
            },
            zIndex: 1000
          });
          markers.push(youAreHereMarker);

          // Get active tasks (not verified/completed)
          const activeTasks = allEmployeeTasks.filter(t => {
            const s = (t.status || '').toLowerCase();
            return s !== 'verified' && s !== 'completed';
          });

          if (activeTasks.length === 0) {
            hideLoading();
            showToast('No active tasks to route', 'info');
            return;
          }

          // Resolve Coordinates (collect only — markers created AFTER sort)
          const { resolveTaskCoordinates } = await import('../employee/sorting');
          let taskCoordsList = [];
          let skippedPincodeTasks = 0;

          activeTasks.forEach((t) => {
            const { lat, lng, source } = resolveTaskCoordinates(t);

            // Skip tasks that only have pincode-based approximate coordinates.
            if (source === 'pincode-fallback' || source === 'address-pincode') {
              skippedPincodeTasks++;
              return;
            }

            // Skip geocoded-from-address tasks with <95% confidence.
            // These need a map URL set for precise routing.
            // Map URL sources (!3d/4d-url, path-url, @-viewport, ?q-query) are always trusted.
            if (source === 'db-precision' || source === '_enriched') {
              const confidence = parseFloat(t.geocode_confidence) || 0;
              const hasMapUrl = !!(t.map_url || t.mapUrl || t.mapurl);
              if (!hasMapUrl && confidence < 0.95) {
                skippedPincodeTasks++;
                return;
              }
            }

            if (lat != null && lng != null) {
              taskCoordsList.push({ lat, lng, t, source, isApproxLocation: false });
            }
          });

          if (skippedPincodeTasks > 0) {
            showToast(`${skippedPincodeTasks} task(s) hidden — no map URL or low geocode accuracy (<95%)`, 'info');
          }

          // Route Computation and Rendering
          if (taskCoordsList.length > 0) {
             // ─── Haversine utility (shared by all sort methods) ───
             const haversineDistance = (lat1, lng1, lat2, lng2) => {
               const R = 6371; // km
               const dLat = (lat2 - lat1) * Math.PI / 180;
               const dLng = (lng2 - lng1) * Math.PI / 180;
               const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                         Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                         Math.sin(dLng/2) * Math.sin(dLng/2);
               return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
             };

             // ─── Calculate total route distance for any task order ───
             const totalRouteDistance = (route, startLat, startLng) => {
               let dist = haversineDistance(startLat, startLng, route[0].lat, route[0].lng);
               for (let i = 0; i < route.length - 1; i++) {
                 dist += haversineDistance(route[i].lat, route[i].lng, route[i+1].lat, route[i+1].lng);
               }
               return dist;
             };

             // ─── 2-opt local search: eliminates crossing/backtracking routes ───
             // Iteratively reverses sub-segments when a swap reduces total distance.
             // This catches patterns like 16→17(north)→18(east)→19(back to center)
             // and fixes them to 16→19(center)→...→17→18(outliers at end).
             const twoOptImprove = (route, startLat, startLng) => {
               const n = route.length;
               if (n < 4) return route; // Need at least 4 points for meaningful swaps

               let improved = [...route];
               let bestDist = totalRouteDistance(improved, startLat, startLng);
               let madeImprovement = true;

               while (madeImprovement) {
                 madeImprovement = false;
                 for (let i = 0; i < n - 1; i++) {
                   for (let j = i + 2; j < n; j++) {
                     // Try reversing the segment between i+1 and j
                     const newRoute = [
                       ...improved.slice(0, i + 1),
                       ...improved.slice(i + 1, j + 1).reverse(),
                       ...improved.slice(j + 1)
                     ];
                     const newDist = totalRouteDistance(newRoute, startLat, startLng);
                     if (newDist < bestDist - 0.01) { // 10m threshold to avoid floating-point noise
                       improved = newRoute;
                       bestDist = newDist;
                       madeImprovement = true;
                     }
                   }
                 }
               }
               return improved;
             };

             // ─── Auto-sort: only when NOT pre-optimized ───
             if (!isPreOptimized) {
               // Step 1: Greedy nearest-neighbor (fast initial order)
               const sorted = [];
               const pool = [...taskCoordsList];
               let curLat = userLat, curLng = userLng;

               while (pool.length > 0) {
                 let nearestIdx = 0;
                 let nearestDist = Infinity;
                 for (let i = 0; i < pool.length; i++) {
                   const d = haversineDistance(curLat, curLng, pool[i].lat, pool[i].lng);
                   if (d < nearestDist) {
                     nearestDist = d;
                     nearestIdx = i;
                   }
                 }
                 const nearest = pool.splice(nearestIdx, 1)[0];
                 curLat = nearest.lat;
                 curLng = nearest.lng;
                 sorted.push(nearest);
               }

               const nnDist = totalRouteDistance(sorted, userLat, userLng);

               // Step 2: 2-opt improvement (eliminates backtracking/crossings)
               taskCoordsList = twoOptImprove(sorted, userLat, userLng);
               const improvedDist = totalRouteDistance(taskCoordsList, userLat, userLng);

               console.log(`📍 Route order: nearest-neighbor + 2-opt (${nnDist.toFixed(1)}km → ${improvedDist.toFixed(1)}km, saved ${(nnDist - improvedDist).toFixed(1)}km)`);
             } else {
               // ─── VROOM quality guard ───
               // If VROOM/ORS produced a route, verify it's actually better than
               // nearest-neighbor + 2-opt. If not, override with the better route.
               const vroomDist = totalRouteDistance(taskCoordsList, userLat, userLng);

               // Build nearest-neighbor for comparison
               const nnPool = [...taskCoordsList];
               const nnSorted = [];
               let nnLat = userLat, nnLng = userLng;
               while (nnPool.length > 0) {
                 let idx = 0, best = Infinity;
                 for (let i = 0; i < nnPool.length; i++) {
                   const d = haversineDistance(nnLat, nnLng, nnPool[i].lat, nnPool[i].lng);
                   if (d < best) { best = d; idx = i; }
                 }
                 const pick = nnPool.splice(idx, 1)[0];
                 nnLat = pick.lat; nnLng = pick.lng;
                 nnSorted.push(pick);
               }
               const nnImproved = twoOptImprove(nnSorted, userLat, userLng);
               const nnDist = totalRouteDistance(nnImproved, userLat, userLng);

               if (nnDist < vroomDist * 0.95) {
                 // NN+2opt is significantly better (>5% shorter) — use it instead
                 taskCoordsList = nnImproved;
                 console.log(`📍 Route order: VROOM overridden by NN+2opt (VROOM: ${vroomDist.toFixed(1)}km vs NN+2opt: ${nnDist.toFixed(1)}km — saved ${(vroomDist - nnDist).toFixed(1)}km)`);
               } else {
                 console.log(`📍 Route order: pre-optimized (VROOM: ${vroomDist.toFixed(1)}km, NN+2opt: ${nnDist.toFixed(1)}km — keeping VROOM)`);
               }
             }
             // ─── End auto-sort ───

             // ─── Create numbered markers in ROUTE ORDER ───
             // Marker #1 = first task to visit, #2 = second, etc.
             taskCoordsList.forEach((item, idx) => {
               const pinColor = item.source === '@-viewport' ? '#f59e0b' : '#ef4444';
               
               const markerLabel = {
                 text: (idx + 1).toString(),
                 color: 'white',
                 fontSize: '14px',
                 fontWeight: 'bold'
               };
               
               const svgIcon = {
                 path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
                 fillColor: pinColor,
                 fillOpacity: 1,
                 strokeColor: 'white',
                 strokeWeight: 2,
                 scale: 1.8,
                 labelOrigin: new google.maps.Point(0, -29)
               };

               const taskMarker = new google.maps.Marker({
                 position: { lat: item.lat, lng: item.lng },
                 map: mapInstance,
                 icon: svgIcon,
                 label: markerLabel,
                 title: item.t.case_id || item.t.caseId || `Task ${idx + 1}`,
                 zIndex: 100
               });

               taskMarker.addListener('click', () => {
                 openTaskDetailsModal(item.t.id);
               });
               
               markers.push(taskMarker);
             });
             // ─── End markers ───

             const lastTask = taskCoordsList[taskCoordsList.length - 1];
             const middleTasks = taskCoordsList.slice(0, -1);
             
             // Construct ORS fallback URL in case Google fails
             const allCoords = [[userLat, userLng], ...taskCoordsList.map(item => [item.lat, item.lng])];
             const orsCoordsString = allCoords.map(wp => `${wp[1]},${wp[0]}`).join(',');
             const orsUrl = `https://maps.openrouteservice.org/directions?a=${orsCoordsString}&b=1a&c=0&k1=en-US&k2=km`;

             // ═══════════════════════════════════════════════════════════
              // TIER 1: ORS Directions via Backend (Primary) — ALL waypoints, no limit
              // ═══════════════════════════════════════════════════════════
              let routeRendered = false;

              try {
                // ORS expects [lng, lat] order (GeoJSON convention)
                const orsCoordinates = [
                  [userLng, userLat],
                  ...taskCoordsList.map(t => [t.lng, t.lat])
                ];

                console.log(`📍 ORS: Requesting route for ${orsCoordinates.length} coordinates (all waypoints)`);

                const orsResponse = await fetch('/api/routes/directions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ coordinates: orsCoordinates })
                });

                if (!orsResponse.ok) {
                  const errData = await orsResponse.json().catch(() => ({}));
                  console.error('ORS Directions error:', errData);
                  throw new Error(errData.message || `ORS returned ${orsResponse.status}`);
                }

                const orsData = await orsResponse.json();

                if (orsData.success && orsData.coordinates && orsData.coordinates.length > 0) {
                  // ORS returns [lng, lat] — Google Maps needs {lat, lng}
                  const routePath = orsData.coordinates.map(coord => ({
                    lat: coord[1],
                    lng: coord[0]
                  }));

                  routePolyline = new google.maps.Polyline({
                    path: routePath,
                    geodesic: true,
                    strokeColor: '#6366f1',
                    strokeOpacity: 0.85,
                    strokeWeight: 5,
                    map: mapInstance
                  });

                  // Route stats badge
                  const totalDistKm = (orsData.distance / 1000).toFixed(1);
                  const totalMins = Math.round(orsData.duration / 60);
                  const hours = Math.floor(totalMins / 60);
                  const mins = totalMins % 60;
                  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

                  console.log(`📍 ORS route loaded: ${totalDistKm} km (~${durationStr})`);

                  const mapHeader = document.getElementById('mapHeaderActions');
                  if (mapHeader && !document.getElementById('routeStatsBadge')) {
                    const statsHtml = `<span id="routeStatsBadge" class="status-badge status-in-progress" style="margin-right: 10px;">
                                        <i class="fas fa-car"></i> ${totalDistKm} km (~${durationStr})
                                      </span>`;
                    mapHeader.insertAdjacentHTML('afterbegin', statsHtml);
                  }
                  routeRendered = true;
                } else {
                  throw new Error('No route geometry returned from ORS');
                }

              } catch (orsErr) {
                console.warn('⚠️ ORS routing failed, trying Google DirectionsService fallback:', orsErr.message);

                // ═══════════════════════════════════════════════════════════
                // TIER 2: Google DirectionsService Fallback — max 23 intermediates (sampled)
                // ═══════════════════════════════════════════════════════════
                try {
                  const directionsService = new google.maps.DirectionsService();
                  const MAX_DIR_WAYPOINTS = 23;
                  let waypointsForRoute = middleTasks.map(task => ({
                    location: new google.maps.LatLng(task.lat, task.lng),
                    stopover: true
                  }));

                  if (waypointsForRoute.length > MAX_DIR_WAYPOINTS) {
                    const sampled = [];
                    const step = waypointsForRoute.length / MAX_DIR_WAYPOINTS;
                    for (let i = 0; i < MAX_DIR_WAYPOINTS; i++) {
                      sampled.push(waypointsForRoute[Math.floor(i * step)]);
                    }
                    waypointsForRoute = sampled;
                    console.log(`📍 Sampled ${MAX_DIR_WAYPOINTS} of ${middleTasks.length} waypoints for DirectionsService`);
                  }

                  const directionsResult = await new Promise((resolve, reject) => {
                    directionsService.route({
                      origin: new google.maps.LatLng(userLat, userLng),
                      destination: new google.maps.LatLng(lastTask.lat, lastTask.lng),
                      waypoints: waypointsForRoute,
                      travelMode: google.maps.TravelMode.DRIVING,
                      optimizeWaypoints: false
                    }, (result, status) => {
                      if (status === 'OK') resolve(result);
                      else reject(new Error(`DirectionsService: ${status}`));
                    });
                  });

                  const routePath = directionsResult.routes[0].overview_path;
                  routePolyline = new google.maps.Polyline({
                    path: routePath,
                    geodesic: true,
                    strokeColor: '#6366f1',
                    strokeOpacity: 0.85,
                    strokeWeight: 5,
                    map: mapInstance
                  });

                  // Stats badge from DirectionsService
                  const legs = directionsResult.routes[0].legs;
                  const totalDistM = legs.reduce((sum, leg) => sum + leg.distance.value, 0);
                  const totalDurS = legs.reduce((sum, leg) => sum + leg.duration.value, 0);
                  const totalDistKm = (totalDistM / 1000).toFixed(1);
                  const totalMins = Math.round(totalDurS / 60);
                  const hours = Math.floor(totalMins / 60);
                  const mins = totalMins % 60;
                  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

                  const mapHeader = document.getElementById('mapHeaderActions');
                  if (mapHeader && !document.getElementById('routeStatsBadge')) {
                    const statsHtml = `<span id="routeStatsBadge" class="status-badge status-in-progress" style="margin-right: 10px;">
                                        <i class="fas fa-car"></i> ${totalDistKm} km (~${durationStr})
                                      </span>`;
                    mapHeader.insertAdjacentHTML('afterbegin', statsHtml);
                  }
                  routeRendered = true;

                } catch (dirErr) {
                  console.warn('⚠️ DirectionsService also failed:', dirErr.message);
                }
              }

              // ═══════════════════════════════════════════════════════════
              // TIER 3: Straight Polylines (Last Resort)
              // ═══════════════════════════════════════════════════════════
              if (!routeRendered) {
                const pathCoords = [
                  { lat: userLat, lng: userLng },
                  ...taskCoordsList.map(t => ({ lat: t.lat, lng: t.lng }))
                ];
                routePolyline = new google.maps.Polyline({
                  path: pathCoords,
                  geodesic: true,
                  strokeColor: '#6366f1',
                  strokeOpacity: 0.6,
                  strokeWeight: 4,
                  icons: [{
                    icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
                    offset: '0',
                    repeat: '20px'
                  }],
                  map: mapInstance
                });
                routePolyline.setOptions({ strokeOpacity: 0 });
                showToast('Could not load driving route. Showing direct path.', 'warning');
              }

             // Render Navigation Buttons
             const mapHeader = document.getElementById('mapHeaderActions');
             if (mapHeader) {
                 // Google Maps URL
                 if (!document.getElementById('gmapsNavBtn')) {
                     // Create a waypoints string for Google Maps URL
                     const gmapsWpString = taskCoordsList.slice(0, -1).map(t => `${t.lat},${t.lng}`).join('|');
                     const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${lastTask.lat},${lastTask.lng}&waypoints=${gmapsWpString}&travelmode=driving`;
                     
                     mapHeader.innerHTML += `
                       <a id="gmapsNavBtn" href="${gmapsUrl}" target="_blank" class="btn btn-success btn-sm" style="margin-left: 10px;">
                         <i class="fab fa-google"></i> Google Maps
                       </a>
                     `;
                 }
                 
                 // ORS Fallback URL
                 if (!document.getElementById('orsNavBtn')) {
                    mapHeader.innerHTML += `
                      <a id="orsNavBtn" href="${orsUrl}" target="_blank" class="btn btn-primary btn-sm" style="margin-left: 10px;">
                        <i class="fas fa-external-link-alt"></i> ORS Nav
                      </a>
                    `;
                 }
             }

             // Fit bounds to show all markers
             const bounds = new google.maps.LatLngBounds();
             bounds.extend(new google.maps.LatLng(userLat, userLng));
             taskCoordsList.forEach(t => bounds.extend(new google.maps.LatLng(t.lat, t.lng)));
             mapInstance.fitBounds(bounds, { padding: 50 });
          }

          hideLoading();

        } catch (err) {
          console.error("Coordinate extraction error:", err);
          hideLoading();
          showToast('Error mapping tasks', 'error');
          fallbackToLeaflet(allEmployeeTasks, openTaskDetailsModal);
        }
    }; // end initMapWithLocation

    // Error handler for geolocation
    const handleGeoError = (err) => {
        console.error("GPS Error:", err);
        const loadingEl = document.getElementById('mapLoading');
        
        let errorMsg = 'Could not determine location.';
        let toastType = 'error';
        
        if (err.code === 1) { // PERMISSION_DENIED
            errorMsg = 'Location Access Denied. Please enable location permissions.';
            toastType = 'warning';
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
            errorMsg = 'Location unavailable. Check your device settings.';
        } else if (err.code === 3) { // TIMEOUT
            errorMsg = 'GPS request timed out. Please try again.';
        }

        if (loadingEl) {
          loadingEl.innerHTML = `<div style="padding: 20px;">
              <i class="fas fa-exclamation-triangle" style="font-size:3rem; color:#ef4444; margin-bottom:15px;"></i>
              <h3 style="color:#ef4444; margin-bottom:10px;">Location Error</h3>
              <p style="color:#4b5563;">${errorMsg}</p>
          </div>`;
        }
        hideLoading();
        showToast(errorMsg, toastType);
    };

    // Attempt high accuracy first
    navigator.geolocation.getCurrentPosition(
      initMapWithLocation,
      (err) => {
          console.warn("High-accuracy GPS failed. Trying low-accuracy fallback...", err);
          // If timeout or unavailable, try again with low accuracy
          if (err.code === 2 || err.code === 3) {
             const loadingEl = document.getElementById('mapLoading');
             if (loadingEl) {
                 const p = loadingEl.querySelector('p');
                 if(p) p.innerText = 'Retrying with approximate location...';
             }
             
             navigator.geolocation.getCurrentPosition(
                 initMapWithLocation,
                 handleGeoError,
                 { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
             );
          } else {
             // If permission denied, don't bother retrying
             handleGeoError(err);
          }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 15000 }
    );

  } catch (initErr) {
      console.error("Google Maps initialization failed:", initErr);
      hideLoading();
      showToast('Using fallback map engine', 'warning');
      fallbackToLeaflet(allEmployeeTasks, openTaskDetailsModal);
  }
}

// Fallback logic if Google Maps fails to load or error occurs early on
async function fallbackToLeaflet(allEmployeeTasks, openTaskDetailsModal) {
    try {
        // Reset the DOM to a clean state before handing off to Leaflet.
        // The Google Maps engine may have partially modified the DOM (hidden mapLoading,
        // altered routingMap, etc.), so Leaflet's showMapRouting needs a fresh start.
        const content = document.getElementById('mainContainer');
        if (content) {
            // Remove the existing routingMap so Leaflet's showMapRouting
            // takes the 'create from scratch' branch instead of the
            // 'reuse existing elements' branch (which crashes on null refs).
            const existingMap = document.getElementById('routingMap');
            if (existingMap) existingMap.remove();
            const existingLoading = document.getElementById('mapLoading');
            if (existingLoading) existingLoading.remove();
        }
        
        // Reset the Google Maps instance since we're abandoning it
        mapInstance = null;
        
        const { showMapRouting: leafletShowMapRouting } = await import('./leafletEngine');
        return leafletShowMapRouting(allEmployeeTasks, openTaskDetailsModal);
    } catch (err) {
        console.error("Fallback to Leaflet also failed:", err);
        showToast("Map routing is currently unavailable.", "error");
    }
}

export function cleanupMapInstance() {
  if (routePolyline) {
      routePolyline.setMap(null);
      routePolyline = null;
  }
  
  if (markers && markers.length > 0) {
      markers.forEach(m => m.setMap(null));
      markers = [];
  }
  
  // In an SPA where the DOM container is frequently destroyed and re-created,
  // we must nullify the mapInstance so it properly binds to the new container.
  mapInstance = null;
  
  // Remove generated buttons/badges
  const orsBtn = document.getElementById('orsNavBtn');
  if (orsBtn) orsBtn.remove();
  
  const gmapsBtn = document.getElementById('gmapsNavBtn');
  if (gmapsBtn) gmapsBtn.remove();
  
  const statsBadge = document.getElementById('routeStatsBadge');
  if (statsBadge) statsBadge.remove();
}
