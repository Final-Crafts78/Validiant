
const https = require('https');

/**
 * Strategy:
 * 1. Extract Hex CID from Google Maps URL
 * 2. Convert Hex CID to Decimal
 * 3. Fetch maps.google.com/local?cid=...
 * 4. Search HTML for embedded coordinates
 */



async function fetchWithCookies(url, cookies = '') {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': cookies
      }
    }, (res) => {
      let data = '';
      const newCookies = res.headers['set-cookie'] ? res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ') : '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ data, cookies: newCookies, status: res.statusCode }));
    }).on('error', reject);
  });
}



async function testCidStrategy(url) {
  console.log(`\n--- Testing CID Strategy ---`);
  console.log(`Original URL: ${url.substring(0, 80)}...`);

  // 1. Extract Hex CID
  const match = url.match(/!1s0x[0-9a-f]+:(0x[0-9a-f]+)/);
  if (!match) {
    console.log("❌ Could not find CID in URL");
    return;
  }

  const cidHex = match[1];
  console.log(`Step 1: Extracted Hex CID: ${cidHex}`);

  // 2. Convert to Decimal
  // Using BigInt because CID can be larger than Number.MAX_SAFE_INTEGER
  const cidDec = BigInt(cidHex).toString();
  console.log(`Step 2: Converted to Decimal CID: ${cidDec}`);



  // 3. Get Cookies from original URL
  console.log(`Step 3: Getting cookies from original URL...`);
  const { cookies } = await fetchWithCookies(url);
  console.log(`Cookies obtained: ${cookies ? 'Yes' : 'No'}`);

  // 4. Call Preview Endpoint with Cookies
  // Format found in browser: /maps/preview/place?pb=!1m15!1sPLACE_ID!18m1!1e1
  const pb = `!1m15!1s0x3bae105e7e22d583:0xbd8793b7cb039af3!18m1!1e1`;
  const previewUrl = `https://www.google.com/maps/preview/place?authuser=0&hl=en&gl=in&pb=${encodeURIComponent(pb)}`;
  
  console.log(`Step 4: Calling Preview Endpoint...`);
  const { data, status } = await fetchWithCookies(previewUrl, cookies);
  console.log(`Status: ${status}`);

  // 5. Search for Coordinates in the JSON response
  // Google's JSON response for preview/place is actually a string that looks like ")]}'\n[...]"
  const jsonText = data.replace(/^\)\]\}'\n/, '');
  
  // Look for the Bangalore coordinates (13.038, 77.705)
  const expectedLat = "13.038";
  const expectedLng = "77.705";
  console.log(`Checking for expected Bangalore coords in JSON...`);
  console.log(`Lat found: ${jsonText.includes(expectedLat)}`);
  console.log(`Lng found: ${jsonText.includes(expectedLng)}`);

  // Try to find ANY coordinates in the JSON
  const coordRegex = /(-?\d{2}\.\d{5,})/g;
  const matches = jsonText.match(coordRegex);
  if (matches) {
    console.log(`Found possible coordinates in JSON:`, matches.slice(0, 10));
  } else {
    console.log("❌ No coordinates found in JSON response.");
  }


}

const link1 = "https://www.google.com/maps/place/Neeraja+Sarovar,+NEERAJ+SAROVAR+APARTMENT,+114,+Kempegowda+Main+Rd,+GNR+Layout,+Margondanahalli,+Kithiganur,+Karnataka+560036/data=!4m2!3m1!1s0x3bae105e7e22d583:0xbd8793b7cb039af3!18m1!1e1?utm_source=mstt_1&entry=gps&coh=192189&g_ep=CAESBzI2LjE1LjEYACCenQoqlAEsOTQyNjc3MjcsOTQyOTIxOTUsOTQyOTk1MzIsMTAwNzk2NDk4LDEwMDc5Nzc2MSwxMDA3OTY1MzUsMTAwODEwNDI2LDk0Mjg0NDU3LDk0MjgwdzY1NzYLDk0Miw3Mzk0LDk0Miw3NTA2LDk0MjA4NTA2LDk0MjE4NjUzLDk0MjI5ODM5LDk0Mjc1MTY4LDk0Mjc5NjE5QgJJTg%3D%3D&skid=ead49289-5bc8-4306-963b-d0837fa100e1&g_st=aw";

testCidStrategy(link1).catch(console.error);
