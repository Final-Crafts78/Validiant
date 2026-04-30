require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: './apps/api/.env' });
const taskService = require('./apps/api/src/services/task.service.js');

async function test() {
  const url = 'https://www.google.com/maps/place/Neeraja+Sarovar,+NEERAJ+SAROVAR+APARTMENT,+114,+Kempegowda+Main+Rd,+GNR+Layout,+Margondanahalli,+Kithiganur,+Karnataka+560036/data=!4m2!3m1!1s0x3bae105e7e22d583:0xbd8793b7cb039af3!18m1!1e1?utm_source=mstt_1&entry=gps';
  
  console.log('--- Testing resolveLocation with Bangalore Link ---');
  try {
    const result = await taskService.resolveLocation({ map_url: url });
    console.log('Result:', JSON.stringify(result, null, 2));
    
    const chennaiLat = 13.04752545;
    const chennaiLng = 80.2086732;
    
    if (result.latitude === chennaiLat && result.longitude === chennaiLng) {
      console.error('❌ FAIL: Still returning Chennai default location!');
    } else if (result.latitude === null) {
      console.log('✅ SUCCESS: Correctly returned null coordinates instead of wrong ones (expected without API key).');
    } else {
      console.log('✅ SUCCESS: Resolved coordinates (might have used Nominatim if lucky):', result.latitude, result.longitude);
    }
  } catch (err) {
    console.error('❌ ERROR during test:', err);
  }
}

test();
