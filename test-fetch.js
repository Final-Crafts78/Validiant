const https = require('https');
const fs = require('fs');

const url = 'https://www.google.com/maps/place/Neeraja+Sarovar,+NEERAJ+SAROVAR+APARTMENT,+114,+Kempegowda+Main+Rd,+GNR+Layout,+Margondanahalli,+Kithiganur,+Karnataka+560036/data=!4m2!3m1!1s0x3bae105e7e22d583:0xbd8793b7cb039af3!18m1!1e1?utm_source=mstt_1&entry=gps&coh=192189&g_ep=CAESBzI2LjE1LjEYACCenQoqlAEsOTQyNjc3MjcsOTQyOTIxOTUsOTQyOTk1MzIsMTAwNzk2NDk4LDEwMDc5Nzc2MSwxMDA3OTY1MzUsMTAwODEwNDI2LDk0Mjg0NDU3LDk0MjgwNTc2LDk0MjA3Mzk0LDk0MjA3NTA2LDk0MjA4NTA2LDk0MjE4NjUzLDk0MjI5ODM5LDk0Mjc1MTY4LDk0Mjc5NjE5QgJJTg%3D%3D&skid=ead49289-5bc8-4306-963b-d0837fa100e1&g_st=aw';

function fetch(url) {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirecting to:', res.headers.location);
      fetch(res.headers.location);
      return;
    }
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      fs.writeFileSync('test_fetch2.html', body);
      console.log('Saved to test_fetch2.html');
      
      const centerMatch = body.match(/center=(-?\d{1,3}\.\d{4,})%2C(-?\d{1,3}\.\d{4,})/);
      console.log('Center match:', centerMatch);

      const m3d = body.match(/!3d(-?\d+(?:\.\d+)?)/);
      const m4d = body.match(/!4d(-?\d+(?:\.\d+)?)/);
      console.log('3d:', m3d, '4d:', m4d);

      const atMatch = body.match(/@(-?\d{1,3}\.\d{4,}),(-?\d{1,3}\.\d{4,})/);
      console.log('@ match:', atMatch);
    });
  });
}
fetch(url);
