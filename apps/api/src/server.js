require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const http = require("http");
const app = require("./app");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';

// Global error handling for unhandled rejections/exceptions
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', new Error(reason));
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

// Create HTTP Server
const server = http.createServer(app);

// Keep-alive ping logic
const keepAlive = () => {
  http.get(`http://localhost:${PORT}/health`, () => {});
};

server.listen(PORT, HOST, () => {
  logger.info(`SERVER RUNNING ON PORT ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "production"}`);
  
  // Start 3-minute keep-alive pings
  setInterval(keepAlive, 180000);
});
