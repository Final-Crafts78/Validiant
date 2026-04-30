

const { extractCoordinates } = require('../apps/api/src/utils/geo');
const https = require('https');







async function expandUrlManual(url) {
  try {
    const match = url.match(/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/);
    if (match) {
      const ftid = match[1];
      // Use the directions API format which often resolves to coordinates for the destination
      const resolveUrl = `https://www.google.com/maps/dir/?api=1&destination=Place&destination_place_id=${ftid}`;
      console.log('📍 [COORD-EXTRACT] Trying resolution URL:', resolveUrl);
      
      const response = await fetch(resolveUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      return response.url;
    }
    return url;
  } catch (e) {
    return url;
  }
}





async function test() {
  const links = [
    "https://www.google.com/maps/place/Neeraja+Sarovar,+NEERAJ+SAROVAR+APARTMENT,+114,+Kempegowda+Main+Rd,+GNR+Layout,+Margondanahalli,+Kithiganur,+Karnataka+560036/data=!4m2!3m1!1s0x3bae105e7e22d583:0xbd8793b7cb039af3!18m1!1e1?utm_source=mstt_1&entry=gps&coh=192189&g_ep=CAESBzI2LjE1LjEYACCenQoqlAEsOTQyNjc3MjcsOTQyOTIxOTUsOTQyOTk1MzIsMTAwNzk2NDk4LDEwMDc5Nzc2MSwxMDA3OTY1MzUsMTAwODEwNDI2LDk0Mjg0NDU3LDk0MjgwdzY1NzYLDk0Miw3Mzk0LDk0Miw3NTA2LDk0MjA4NTA2LDk0MjE4NjUzLDk0MjI5ODM5LDk0Mjc1MTY4LDk0Mjc5NjE5QgJJTg%3D%3D&skid=ead49289-5bc8-4306-963b-d0837fa100e1&g_st=aw",
    "https://maps.app.goo.gl/YXKgZceasPYRxQjj6"
  ];


  for (const link of links) {
    console.log(`\nTesting Link: ${link.substring(0, 100)}...`);
    
    console.log('Expanding URL...');
    const expanded = await expandUrlManual(link);
    console.log('Expanded to:', expanded.substring(0, 150));
    
    const coords = await extractCoordinates(expanded);
    console.log(`Result:`, coords);
  }

}


test();

