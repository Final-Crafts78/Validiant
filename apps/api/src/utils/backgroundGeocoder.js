const supabase = require("../config/supabase");
const { geocodeFromAddress } = require("./geocode");
const { extractCoordinates } = require("./geo");

let isProcessing = false;

async function processPendingGeocoding() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    console.log("🌍 [BACKGROUND-GEO] Starting background geocoding loop...");

    while (true) {
      // Fetch a single task that has no coords, but has a map_url or address/pincode, and has not failed geocoding (attempt count < 3)
      const { data: tasks, error } = await supabase
        .from("tasks")
        .select("*")
        .is("latitude", null)
        .is("longitude", null)
        .is("geocode_confidence", null) // indicates never attempted
        .limit(1);

      if (error) {
        console.error("🌍 [BACKGROUND-GEO] Error fetching pending tasks:", error.message);
        break;
      }

      if (!tasks || tasks.length === 0) {
        console.log("🌍 [BACKGROUND-GEO] No more pending tasks to geocode.");
        break;
      }

      const task = tasks[0];
      console.log(`🌍 [BACKGROUND-GEO] Processing task ID: ${task.id} - "${task.title}"`);

      let finalLat = null;
      let finalLng = null;
      let finalMapUrl = task.map_url;
      let geocodeConfidence = null;
      let geocodeMatchLevel = null;
      let locationWarning = null;

      try {
        // 1. Try to extract from Map URL if present
        if (finalMapUrl) {
          const coords = await extractCoordinates(finalMapUrl);
          if (coords) {
            finalLat = coords.latitude;
            finalLng = coords.longitude;
            geocodeConfidence = 95; // High confidence from direct link
            geocodeMatchLevel = "rooftop";
          }
        }

        // 2. Try address geocoding if still no coords
        if (!finalLat || !finalLng) {
          const settingsService = require("../services/settings.service");
          const addressRoutingSetting = await settingsService.getSetting("address_routing");
          const isAddressRoutingEnabled = addressRoutingSetting?.enabled !== false;

          if (isAddressRoutingEnabled && (task.address || task.pincode)) {
            const geo = await geocodeFromAddress(task.address, task.pincode);
            if (geo) {
              geocodeConfidence = geo.confidence;
              geocodeMatchLevel = geo.matchLevel;
              locationWarning = geo.warning;

              if (geo.confidence >= 95) {
                finalLat = geo.latitude;
                finalLng = geo.longitude;
                if (!finalMapUrl) {
                  finalMapUrl = `https://www.google.com/maps/search/?api=1&query=${finalLat},${finalLng}`;
                }
              }
            }
          }
        }
      } catch (procErr) {
        console.error(`🌍 [BACKGROUND-GEO] Error geocoding task ${task.id}:`, procErr.message);
      }

      // If geocoding failed to resolve coordinates, we set geocode_confidence to 0 to mark as attempted
      const updatePayload = {
        geocode_confidence: geocodeConfidence || 0,
        geocode_match_level: geocodeMatchLevel || "none",
        location_warning: !!locationWarning,
        updated_at: new Date()
      };

      if (finalLat && finalLng) {
        updatePayload.latitude = finalLat;
        updatePayload.longitude = finalLng;
        updatePayload.map_url = finalMapUrl;
      }

      const { error: updateErr } = await supabase
        .from("tasks")
        .update(updatePayload)
        .eq("id", task.id);

      if (updateErr) {
        console.error(`🌍 [BACKGROUND-GEO] Error updating task ${task.id}:`, updateErr.message);
      } else {
        console.log(`🌍 [BACKGROUND-GEO] Task ${task.id} geocoding complete. Coords: ${finalLat}, ${finalLng}`);
      }

      // Sleep for 1.2s to comply with Nominatim rate limits (1 req/sec)
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
  } catch (err) {
    console.error("🌍 [BACKGROUND-GEO] Critical background loop error:", err.message);
  } finally {
    isProcessing = false;
  }
}

module.exports = {
  triggerBackgroundGeocoding: () => {
    setImmediate(processPendingGeocoding);
  }
};
