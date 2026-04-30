
const https = require('https');

function checkOgUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const match = body.match(/property="og:url" content="([^"]+)"/);
        resolve(match ? match[1] : null);
      });
    }).on('error', () => resolve(null));
  });
}

checkOgUrl('https://www.google.com/maps/place/place_id:0x3bae105e7e22d583:0xbd8793b7cb039af3').then(url => {
  console.log('OG:URL:', url);
});
