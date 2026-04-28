import { showToast, showLoading } from '../../utils/ui';

function hideLoading() {
  const spinner = document.querySelector('.loading-spinner');
  if (spinner) spinner.remove();
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
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    document.head.appendChild(script);
  });

  return mapsApiPromise;
}

export async function showMapRouting(allEmployeeTasks, openTaskDetailsModal) {
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
    showLoading();
    
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

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loadingEl = document.getElementById('mapLoading');
          if (loadingEl) loadingEl.style.display = 'none';
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

          // Resolve Coordinates
          const { resolveTaskCoordinates } = await import('../employee/sorting');
          const waypoints = [];
          const taskCoordsList = [];

          activeTasks.forEach((t, index) => {
            const { lat, lng, source } = resolveTaskCoordinates(t);
            const isApproxLocation = source === 'pincode-fallback' || source === '@-viewport' || source === 'address-pincode';

            if (lat != null && lng != null) {
              waypoints.push({ lat, lng });
              taskCoordsList.push({ lat, lng, t, index, isApproxLocation });

              // Create Custom Numbered Marker
              const pinColor = isApproxLocation ? '#f59e0b' : '#ef4444'; // Amber or Red
              
              // We'll use a simpler standard marker approach instead of advanced marker for broad compatibility
              const markerLabel = {
                  text: (index + 1).toString(),
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
              };
              
              // Custom SVG icon to mimic the previous HTML marker
              const svgIcon = {
                  path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
                  fillColor: pinColor,
                  fillOpacity: 1,
                  strokeColor: 'white',
                  strokeWeight: 2,
                  scale: 1,
                  labelOrigin: new google.maps.Point(0, -28)
              };

              const taskMarker = new google.maps.Marker({
                position: { lat, lng },
                map: mapInstance,
                icon: svgIcon,
                label: markerLabel,
                title: t.case_id || t.caseId || 'Task',
                zIndex: 100 // ensure task pins are above route line
              });

              taskMarker.addListener('click', () => {
                openTaskDetailsModal(t.id);
              });
              
              markers.push(taskMarker);
            }
          });

          // Route Computation and Rendering
          if (taskCoordsList.length > 0) {
             const lastTask = taskCoordsList[taskCoordsList.length - 1];
             const middleTasks = taskCoordsList.slice(0, -1);
             
             // Construct ORS fallback URL in case Google fails
             const allCoords = [[userLat, userLng], ...taskCoordsList.map(item => [item.lat, item.lng])];
             const orsCoordsString = allCoords.map(wp => `${wp[1]},${wp[0]}`).join(',');
             const orsUrl = `https://maps.openrouteservice.org/directions?a=${orsCoordsString}&b=1a&c=0&k1=en-US&k2=km`;

             try {
                // 1. Attempt to fetch real road route via Google Routes API
                const intermediates = middleTasks.map(task => ({
                  location: { latLng: { latitude: task.lat, longitude: task.lng } }
                }));

                // Limit is 98 intermediates. 
                // We'll take max 98 to avoid API error if they have more
                const limitedIntermediates = intermediates.slice(0, 98);

                const routeResponse = await fetch(
                  'https://routes.googleapis.com/directions/v2:computeRoutes',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-Goog-Api-Key': window._googleMapsApiKey,
                      // Field Masking for performance and cost: Only request what we need
                      'X-Goog-FieldMask': 'routes.polyline.encodedPolyline,routes.legs.distanceMeters,routes.legs.duration,routes.distanceMeters,routes.duration'
                    },
                    body: JSON.stringify({
                      origin: {
                        location: { latLng: { latitude: userLat, longitude: userLng } }
                      },
                      destination: {
                        location: { latLng: { latitude: lastTask.lat, longitude: lastTask.lng } }
                      },
                      intermediates: limitedIntermediates,
                      travelMode: 'DRIVE',
                      routingPreference: 'TRAFFIC_AWARE',
                      polylineQuality: 'HIGH_QUALITY'
                    })
                  }
                );

                if (!routeResponse.ok) {
                    throw new Error(`Routes API returned ${routeResponse.status}`);
                }

                const routeData = await routeResponse.json();
                
                if (routeData.routes && routeData.routes.length > 0) {
                    const route = routeData.routes[0];
                    
                    // Decode and render the polyline
                    if (route.polyline && route.polyline.encodedPolyline) {
                        const decodedPath = google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline);
                        
                        routePolyline = new google.maps.Polyline({
                            path: decodedPath,
                            geodesic: true,
                            strokeColor: '#6366f1', // Indigo to match existing theme
                            strokeOpacity: 0.85,
                            strokeWeight: 5,
                            map: mapInstance
                        });
                    }
                    
                    // Add summary badge
                    const totalDistKm = (route.distanceMeters / 1000).toFixed(1);
                    const totalMins = Math.round(parseInt(route.duration.replace('s', '')) / 60);
                    const hours = Math.floor(totalMins / 60);
                    const mins = totalMins % 60;
                    const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                    
                    const mapHeader = document.getElementById('mapHeaderActions');
                    if (mapHeader && !document.getElementById('routeStatsBadge')) {
                       // Prepend stats badge
                       const statsHtml = `<span id="routeStatsBadge" class="status-badge status-in-progress" style="margin-right: 10px;">
                                            <i class="fas fa-car"></i> ${totalDistKm} km (~${durationStr})
                                          </span>`;
                       mapHeader.insertAdjacentHTML('afterbegin', statsHtml);
                    }
                } else {
                    throw new Error('No routes returned from API');
                }

             } catch (routeErr) {
                 console.warn('Google Routes API failed, falling back to straight polyline:', routeErr);
                 // Fallback: draw straight lines (like Leaflet did)
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
                    // Cannot easily dash Google Polyline like Leaflet, but we'll use a symbol pattern
                    icons: [{
                        icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
                        offset: '0',
                        repeat: '20px'
                    }],
                    map: mapInstance
                 });
                 // Make base line transparent so only dashes show
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
      },
      (err) => {
        console.error("GPS Error:", err);
        hideLoading();
        const loadingEl = document.getElementById('mapLoading');
        if (loadingEl) {
          loadingEl.innerHTML = '<h3 style="color:#ef4444; text-align:center;">Location Access Denied</h3>';
        }
        showToast('Please enable location access to see routing', 'warning');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
  
  // Note: We don't fully destroy the google.maps.Map instance,
  // we just clear it. Re-using it is better for performance.
  // If we really need to destroy the container's contents:
  // mapInstance = null;
  
  // Remove generated buttons/badges
  const orsBtn = document.getElementById('orsNavBtn');
  if (orsBtn) orsBtn.remove();
  
  const gmapsBtn = document.getElementById('gmapsNavBtn');
  if (gmapsBtn) gmapsBtn.remove();
  
  const statsBadge = document.getElementById('routeStatsBadge');
  if (statsBadge) statsBadge.remove();
}
