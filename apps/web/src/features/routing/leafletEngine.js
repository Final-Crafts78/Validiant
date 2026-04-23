/**
 * Leaflet Map Routing Engine
 */
import { showToast } from '../../utils/ui';
import { pincodeData } from '../../store/pincodes';

let routingMapInstance = null;
let markerLayer = null;
let routeLayer = null;

export async function showMapRouting(allEmployeeTasks, openTaskDetailsModal) {
  const content = document.getElementById('mainContainer');
  
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

  // 1. Dynamically load Leaflet.js
  if (!window.L && !window._isMapLoading) {
    window._isMapLoading = true;
    await new Promise(resolve => {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => { window._isMapLoading = false; resolve(); };
      document.head.appendChild(script);
    });
  }

  if (!navigator.geolocation) {
    document.getElementById('mapLoading').innerHTML = '<h3 style="color:#ef4444;"><i class="fas fa-exclamation-triangle"></i> Geolocation not supported.</h3>';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const mapEl = document.getElementById('routingMap');
      if (!mapEl) return;
      
      document.getElementById('mapLoading').style.display = 'none';
      mapEl.style.display = 'block';
      mapEl.style.opacity = '1';

      const { latitude: userLat, longitude: userLng } = pos.coords;

      // 3. Map Initialization OR Recycling
      if (!routingMapInstance) {
        routingMapInstance = L.map('routingMap').setView([userLat, userLng], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap', maxZoom: 19
        }).addTo(routingMapInstance);
        
        markerLayer = L.layerGroup().addTo(routingMapInstance);
        routeLayer = L.layerGroup().addTo(routingMapInstance);
      } else {
        routingMapInstance.setView([userLat, userLng], 13);
        markerLayer.clearLayers();
        routeLayer.clearLayers();
      }
      
      // 🚨 Ensure map instance hasn't been destroyed in a race condition
      if (!routingMapInstance) return;

      setTimeout(() => { 
        if (routingMapInstance) {
          routingMapInstance.invalidateSize(); 
        }
      }, 400); // Increased for mobile stability

      L.marker([userLat, userLng])
        .addTo(markerLayer)
        .bindPopup('<b style="color:#2563eb; font-size:14px;">📍 You Are Here</b>')
        .openPopup();

      const waypoints = [[userLat, userLng]];
      const activeTasks = allEmployeeTasks.filter(t => {
        const s = (t.status || '').toLowerCase();
        return s !== 'verified' && s !== 'completed';
      });

      const { resolveTaskCoordinates } = await import('../employee/sorting');
      const mapMarkers = [];
      activeTasks.forEach((t, index) => {
        const { lat, lng } = resolveTaskCoordinates(t);
        const isApproxLocation = !t.map_url && !t.mapUrl && !t.mapurl && t.pincode && pincodeData[t.pincode];

        if (lat && lng) {
          waypoints.push([lat, lng]);
          const pinColor = isApproxLocation ? '#f59e0b' : '#ef4444';
          
          const taskIcon = L.divIcon({
            className: 'custom-task-icon gpu-boost',
            html: `<div style="background-color: ${pinColor}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">${index + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([lat, lng], { icon: taskIcon, riseOnHover: true }).on('click', () => {
            openTaskDetailsModal(t.id);
          });
          mapMarkers.push(marker);
        }
      });

      L.layerGroup(mapMarkers).addTo(markerLayer);

      if (waypoints.length > 1) {
        const routeLine = L.polyline(waypoints, {
          color: '#6366f1', weight: 4, opacity: 0.8, dashArray: '10, 10', lineJoin: 'round'
        }).addTo(routeLayer);
        
        const orsCoords = waypoints.map(wp => `${wp[1]},${wp[0]}`).join(',');
        const orsUrl = `https://maps.openrouteservice.org/directions?a=${orsCoords}&b=1a&c=0&k1=en-US&k2=km`;
        
        const mapHeader = document.getElementById('mapHeaderActions');
        if (mapHeader && !document.getElementById('orsNavBtn')) {
           mapHeader.innerHTML += `
             <a id="orsNavBtn" href="${orsUrl}" target="_blank" class="btn btn-primary btn-sm" style="margin-left: 10px;">
               <i class="fas fa-external-link-alt"></i> Navigate with ORS
             </a>
           `;
        }
        routingMapInstance.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
      }
    },
    (err) => {
      document.getElementById('mapLoading').innerHTML = `<h3 style="color:#ef4444; text-align:center;">Location Access Denied</h3>`;
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
  );
}

export function cleanupMapInstance() {
  if (routingMapInstance) {
    try {
      routingMapInstance.off();
      routingMapInstance.remove();
    } catch (error) {
      console.error(`❌ Global Controller Error: cleanup`, error);
      showToast('An unexpected UI error occurred.', 'error');
    }
    routingMapInstance = null;
    markerLayer = null;
    routeLayer = null;
  }
}
