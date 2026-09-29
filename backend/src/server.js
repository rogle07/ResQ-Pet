require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
//const startMqttBridge = require('./services/mqttBridge');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.io for real-time GPS / emergency broadcasts to dashboards
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  },
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('join:owner', (userId) => {
    socket.join(`owner:${userId}`);
  });

  socket.on('join:rescueTeam', () => {
    socket.join('rescueTeamRoom');
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

app.set('io', io); // accessible in controllers via req.app.get('io')

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    logger.info(`PetGuardian API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
  // Non-fatal: collar data ingestion works via MQTT bridge if a broker is configured,
  // but the web platform itself doesn't depend on it being reachable.
  // startMqttBridge();
};

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

start();

module.exports = { app, server, io };
