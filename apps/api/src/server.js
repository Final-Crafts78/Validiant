require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const http = require("http");
const app = require("./app");

const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';

// Global error handling for unhandled rejections/exceptions
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

// Create HTTP Server
const server = http.createServer(app);

// Keep-alive ping logic
const keepAlive = () => {
  http.get(`http://localhost:${PORT}/health`, () => {});
};

server.listen(PORT, HOST, () => {
  console.log(`✅ SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "production"}`);
  
  // Start 3-minute keep-alive pings
  setInterval(keepAlive, 180000);
});
