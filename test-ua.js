const url = 'https://www.google.com/maps/place/Neeraja+Sarovar,+NEERAJ+SAROVAR+APARTMENT,+114,+Kempegowda+Main+Rd,+GNR+Layout,+Margondanahalli,+Kithiganur,+Karnataka+560036/data=!4m2!3m1!1s0x3bae105e7e22d583:0xbd8793b7cb039af3!18m1!1e1?utm_source=mstt_1&entry=gps';

async function test() {
  const uas = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
  ];

  for (const ua of uas) {
    console.log(`--- Testing with UA: ${ua.substring(0, 30)}... ---`);
    const res = await fetch(url, { headers: { 'User-Agent': ua }, redirect: 'follow' });
    console.log('Final URL:', res.url);
    const text = await res.text();
    // Search for the target coordinates 13.038
    if (text.includes('13.038')) {
      console.log('✅ Found 13.038 in HTML!');
    } else {
      console.log('❌ 13.038 NOT found in HTML.');
    }
  }
}

test();
