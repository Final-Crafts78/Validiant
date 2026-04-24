/**
 * One-time data cleansing script: Re-extract coordinates from map_url for all tasks.
 * Run from project root: node apps/api/scripts/fix_historical_coords.js
 * 
 * Requires .env with SUPABASE_URL and SUPABASE_SERVICE_KEY set.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const supabase = require('../src/config/supabase');
const { extractCoordinates } = require('../src/utils/geo');

async function fixHistoricalData() {
  console.log('🚀 Starting Data Cleansing for Historical Task Coordinates...\n');

  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, title, map_url, latitude, longitude');

    if (error) throw error;

    let updatedCount = 0;
    let noChangeCount = 0;
    let failedCount = 0;
    let noUrlCount = 0;

    console.log(`Found ${tasks.length} tasks in DB. Analyzing each...\n`);

    for (const task of tasks) {
      if (!task.map_url) {
        noUrlCount++;
        continue;
      }

      const coords = await extractCoordinates(task.map_url);

      if (coords) {
        const dbLat = parseFloat(task.latitude);
        const dbLng = parseFloat(task.longitude);

        const needsUpdate = 
          isNaN(dbLat) || isNaN(dbLng) ||
          Math.abs(dbLat - coords.latitude) > 0.0001 || 
          Math.abs(dbLng - coords.longitude) > 0.0001;

        if (needsUpdate) {
          console.log(`[FIX] Task #${task.id} "${(task.title || '').substring(0, 40)}": DB(${dbLat}, ${dbLng}) -> Link(${coords.latitude}, ${coords.longitude})`);
          
          const { error: updateError } = await supabase
            .from('tasks')
            .update({ 
              latitude: coords.latitude, 
              longitude: coords.longitude,
              updated_at: new Date()
            })
            .eq('id', task.id);

          if (updateError) {
            console.error(`  ❌ Update failed for Task #${task.id}`, updateError.message);
            failedCount++;
          } else {
            updatedCount++;
          }
        } else {
          noChangeCount++;
        }
      } else {
        console.log(`[SKIP] Task #${task.id} "${(task.title || '').substring(0, 40)}": Could not extract coords from URL`);
        noChangeCount++;
      }
    }

    console.log('\n════════════════════════════════════════');
    console.log('✅ Data Cleansing Complete!');
    console.log('════════════════════════════════════════');
    console.log(`📊 Summary:`);
    console.log(`   🔧 Tasks Fixed (coordinates corrected): ${updatedCount}`);
    console.log(`   ✓  Tasks Already Correct:               ${noChangeCount}`);
    console.log(`   📭 Tasks Without Map URL:                ${noUrlCount}`);
    console.log(`   ❌ Tasks Failed to Update:               ${failedCount}`);

  } catch (err) {
    console.error('💥 Critical Error during migration:', err);
  }
}

fixHistoricalData();
