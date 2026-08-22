const mqtt = require('mqtt');
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Bridges the MQTT broker (where ESP32 collars publish) to the existing HTTP
 * ingestion endpoint (/api/iot/reading), so all validation, emergency
 * detection, and Socket.io broadcasting logic in iotController stays in one
 * place instead of being duplicated for the MQTT path.
 *
 * Topic convention: petguardian/<deviceId>/reading
 * Payload: JSON matching the body shape expected by POST /api/iot/reading,
 * minus deviceId (which is parsed from the topic itself).
 *
 * This is intentionally non-fatal: if the broker is unreachable, the app
 * keeps serving HTTP/API traffic normally and just logs a warning. IoT is an
 * optional integration, not a hard dependency of the web platform.
 */
const startMqttBridge = () => {
  if (!process.env.MQTT_BROKER_URL) {
    logger.warn('MQTT_BROKER_URL not set — skipping MQTT bridge startup.');
    return null;
  }

  const client = mqtt.connect(process.env.MQTT_BROKER_URL, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
  });

  const readingTopicPattern = 'petguardian/+/reading';
  const port = process.env.PORT || 5000;
  const ingestionUrl = `http://127.0.0.1:${port}/api/iot/reading`;

  client.on('connect', () => {
    logger.info(`MQTT bridge connected to ${process.env.MQTT_BROKER_URL}`);
    client.subscribe(readingTopicPattern, (err) => {
      if (err) logger.error(`MQTT subscribe failed: ${err.message}`);
      else logger.info(`MQTT bridge subscribed to ${readingTopicPattern}`);
    });
  });

  client.on('message', async (topic, payloadBuffer) => {
    try {
      const parts = topic.split('/'); // ['petguardian', '<deviceId>', 'reading']
      const deviceId = parts[1];
      if (!deviceId) return;

      const payload = JSON.parse(payloadBuffer.toString());

      await axios.post(
        ingestionUrl,
        { deviceId, ...payload },
        { headers: { 'x-device-key': process.env.IOT_DEVICE_KEY }, timeout: 5000 }
      );
    } catch (error) {
      const detail = error.response?.data?.message || error.message;
      logger.error(`MQTT bridge failed to forward reading from topic "${topic}": ${detail}`);
    }
  });

  client.on('error', (err) => {
    logger.error(`MQTT client error: ${err.message}`);
  });

  client.on('reconnect', () => {
    logger.warn('MQTT bridge attempting to reconnect…');
  });

  return client;
};

module.exports = startMqttBridge;
