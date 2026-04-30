require('dotenv').config({ path: './apps/api/.env' });
const { geocodeFromAddress } = require('./apps/api/src/utils/geocode.js');

const addressString = "Neeraja Sarovar, NEERAJ SAROVAR APARTMENT, 114, Kempegowda Main Rd, GNR Layout, Margondanahalli, Kithiganur, Karnataka 560036";
geocodeFromAddress(addressString, null).then(geo => {
  console.log('Geocoded:', geo);
}).catch(console.error);
