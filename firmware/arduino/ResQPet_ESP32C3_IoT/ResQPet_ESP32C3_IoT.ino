/**
 * ============================================================================
 * ResQPet Smart Pet Collar Firmware (Arduino IDE Version)
 * Target Hardware: ESP32-C3 SuperMini V1601
 * ----------------------------------------------------------------------------
 * Required Arduino Libraries (Install via Arduino Library Manager):
 *   1. TinyGPSPlus (by Mikal Hart)
 *   2. DHT sensor library (by Adafruit)
 *   3. ArduinoJson (by Benoit Blanchon - version 7 or 6)
 *
 * Board Configuration in Arduino IDE:
 *   - Tools > Board > esp32 > ESP32C3 Dev Module
 *   - Tools > USB CDC On Boot > Enabled (for Serial output over USB)
 *   - Tools > Flash Size > 4MB
 *
 * Hardware Wiring:
 *   - MPU6050 / MPU6500: SDA -> GPIO8, SCL -> GPIO9, VCC -> 3.3V, GND -> GND
 *   - DHT11: DATA -> GPIO4, VCC -> 3.3V, GND -> GND
 *   - NEO-6M GPS: GPS TX -> GPIO20 (ESP32 RX), GPS RX -> GPIO21 (ESP32 TX)
 * ============================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <TinyGPSPlus.h>
#include <DHT.h>
#include <ArduinoJson.h>

#if __has_include("config.h")
  #include "config.h"
#else
  #include "config.h.example"
#endif

// Hardware UART for NEO-6M GPS on ESP32-C3
HardwareSerial gpsSerial(1);
TinyGPSPlus gps;

// DHT11 Sensor
DHT dht(DHT_PIN, DHT_TYPE);

// MPU6050 / MPU6500 Register Map
#define MPU_REG_SMPLRT_DIV   0x19
#define MPU_REG_CONFIG       0x1A
#define MPU_REG_GYRO_CONFIG  0x1B
#define MPU_REG_ACCEL_CONFIG 0x1C
#define MPU_REG_ACCEL_XOUT_H 0x3B
#define MPU_REG_TEMP_OUT_H   0x41
#define MPU_REG_GYRO_XOUT_H  0x43
#define MPU_REG_PWR_MGMT_1   0x6B
#define MPU_REG_WHO_AM_I     0x75

// State tracking
bool mpuInitialized = false;
unsigned long lastPublishTime = 0;
unsigned long lastSampleTime = 0;
unsigned long lastWiFiCheckTime = 0;

// Filtered / smoothed sensor values
float ax = 0.0f, ay = 0.0f, az = 0.98f;
float gx = 0.0f, gy = 0.0f, gz = 0.0f;
float totalAccel = 0.98f;
float movementEstimate = 0.0f;
const char* activityStatus = "RESTING";

float currentTemp = NAN;
float currentHumidity = NAN;

// ============================================================================
// I2C LOW-LEVEL HELPER FUNCTIONS FOR MPU6050 / MPU6500
// ============================================================================

void mpuWriteByte(uint8_t reg, uint8_t data) {
  Wire.beginTransmission(MPU_I2C_ADDR);
  Wire.write(reg);
  Wire.write(data);
  Wire.endTransmission();
}

uint8_t mpuReadByte(uint8_t reg) {
  Wire.beginTransmission(MPU_I2C_ADDR);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom((uint8_t)MPU_I2C_ADDR, (uint8_t)1);
  if (Wire.available()) {
    return Wire.read();
  }
  return 0x00;
}

bool initMPU() {
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
  Wire.setClock(100000); // 100 kHz standard mode

  delay(50);

  // Check WHO_AM_I register (0x68 for MPU6050, 0x70 for MPU6500)
  uint8_t whoami = mpuReadByte(MPU_REG_WHO_AM_I);
  Serial.print("[MPU] WHO_AM_I register response: 0x");
  Serial.println(whoami, HEX);

  // Wake up sensor from sleep mode (write 0 to PWR_MGMT_1)
  mpuWriteByte(MPU_REG_PWR_MGMT_1, 0x00);
  delay(10);

  // Sample rate divider: 125 Hz
  mpuWriteByte(MPU_REG_SMPLRT_DIV, 0x07);

  // DLPF: Bandwidth 44Hz
  mpuWriteByte(MPU_REG_CONFIG, 0x03);

  // Accelerometer range: ±2g
  mpuWriteByte(MPU_REG_ACCEL_CONFIG, 0x00);

  // Gyroscope range: ±250 deg/s
  mpuWriteByte(MPU_REG_GYRO_CONFIG, 0x00);

  Serial.println("[MPU] MPU6050/MPU6500 successfully configured on I2C (SDA=8, SCL=9).");
  return true;
}

void readMPUSensors() {
  if (!mpuInitialized) return;

  Wire.beginTransmission(MPU_I2C_ADDR);
  Wire.write(MPU_REG_ACCEL_XOUT_H);
  Wire.endTransmission(false);

  Wire.requestFrom((uint8_t)MPU_I2C_ADDR, (uint8_t)14);

  if (Wire.available() >= 14) {
    int16_t rawAx = (Wire.read() << 8) | Wire.read();
    int16_t rawAy = (Wire.read() << 8) | Wire.read();
    int16_t rawAz = (Wire.read() << 8) | Wire.read();
    Wire.read(); Wire.read(); // Skip internal MPU temp
    int16_t rawGx = (Wire.read() << 8) | Wire.read();
    int16_t rawGy = (Wire.read() << 8) | Wire.read();
    int16_t rawGz = (Wire.read() << 8) | Wire.read();

    // Convert raw accelerometer LSBs to g-force (±2g -> 16384 LSB/g)
    ax = (float)rawAx / 16384.0f;
    ay = (float)rawAy / 16384.0f;
    az = (float)rawAz / 16384.0f;

    // Convert raw gyroscope LSBs to degrees/sec (±250 dps -> 131 LSB/(dps))
    gx = (float)rawGx / 131.0f;
    gy = (float)rawGy / 131.0f;
    gz = (float)rawGz / 131.0f;

    // Calculate total vector acceleration magnitude
    totalAccel = sqrtf(ax * ax + ay * ay + az * az);

    // Movement calculation
    float accelDelta = fabsf(totalAccel - 1.0f);
    float gyroMagnitude = (fabsf(gx) + fabsf(gy) + fabsf(gz)) / 100.0f;
    movementEstimate = (accelDelta * 0.7f) + (gyroMagnitude * 0.3f);

    // Categorize activity level
    if (movementEstimate < 0.08f) {
      activityStatus = "RESTING";
    } else if (movementEstimate < 0.25f) {
      activityStatus = "LOW MOVEMENT";
    } else if (movementEstimate < 0.60f) {
      activityStatus = "ACTIVE";
    } else {
      activityStatus = "RUNNING / HIGH";
    }
  }
}

// ============================================================================
// DHT11 TEMPERATURE & HUMIDITY READING
// ============================================================================

void readDHT11() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("[DHT11] Warning: Failed to read from DHT11 on GPIO4.");
    currentTemp = NAN;
    currentHumidity = NAN;
  } else {
    currentTemp = t;
    currentHumidity = h;
  }
}

// ============================================================================
// GPS NON-BLOCKING STREAM PROCESSOR
// ============================================================================

void pumpGpsData() {
  while (gpsSerial.available() > 0) {
    char c = gpsSerial.read();
    gps.encode(c);
  }
}

// ============================================================================
// WI-FI CONNECTION MANAGEMENT
// ============================================================================

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.println();
  Serial.print("[WiFi] Connecting to SSID: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 8000) {
    delay(250);
    Serial.print(".");
    pumpGpsData();
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("[WiFi] Connected! IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("[WiFi] Connection timeout. Retrying in background.");
  }
}

// ============================================================================
// HTTPS POST SENSOR TRANSMISSION TO CLOUD BACKEND
// ============================================================================

void transmitSensorData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTPS] Skipping transmission: Wi-Fi not connected.");
    return;
  }

  // 1. Build structured JSON payload
  JsonDocument doc;

  doc["deviceId"] = DEVICE_ID;

  if (!isnan(currentTemp)) {
    doc["temperature"] = serialized(String(currentTemp, 1));
  } else {
    doc["temperature"] = nullptr;
  }

  if (!isnan(currentHumidity)) {
    doc["humidity"] = serialized(String(currentHumidity, 1));
  } else {
    doc["humidity"] = nullptr;
  }

  // Motion object
  JsonObject motionObj = doc["motion"].to<JsonObject>();
  motionObj["accelerationX"] = serialized(String(ax, 2));
  motionObj["accelerationY"] = serialized(String(ay, 2));
  motionObj["accelerationZ"] = serialized(String(az, 2));
  motionObj["totalAcceleration"] = serialized(String(totalAccel, 2));
  motionObj["gyroscopeX"] = serialized(String(gx, 1));
  motionObj["gyroscopeY"] = serialized(String(gy, 1));
  motionObj["gyroscopeZ"] = serialized(String(gz, 1));
  motionObj["movementEstimate"] = serialized(String(movementEstimate, 2));
  motionObj["activityStatus"] = activityStatus;

  // GPS object - STRICT RULE:
  // If GPS does not have a valid location fix, transmit fixValid=false and null coordinates.
  // Never transmit 0,0 as if it were a real location.
  JsonObject gpsObj = doc["gps"].to<JsonObject>();

  bool isFixValid = gps.location.isValid() &&
                    gps.location.age() < 5000 &&
                    (gps.location.lat() != 0.0 || gps.location.lng() != 0.0);

  if (isFixValid) {
    gpsObj["fixValid"] = true;
    gpsObj["latitude"] = serialized(String(gps.location.lat(), 6));
    gpsObj["longitude"] = serialized(String(gps.location.lng(), 6));
    gpsObj["satellites"] = gps.satellites.isValid() ? gps.satellites.value() : 0;
    gpsObj["altitude"] = gps.altitude.isValid() ? serialized(String(gps.altitude.meters(), 1)) : nullptr;
    gpsObj["speed"] = gps.speed.isValid() ? serialized(String(gps.speed.kmph(), 1)) : nullptr;
  } else {
    gpsObj["fixValid"] = false;
    gpsObj["latitude"] = nullptr;
    gpsObj["longitude"] = nullptr;
    gpsObj["satellites"] = gps.satellites.isValid() ? gps.satellites.value() : 0;
    gpsObj["altitude"] = nullptr;
    gpsObj["speed"] = nullptr;
  }

  String requestBody;
  serializeJson(doc, requestBody);

  Serial.println("\n[HTTPS] Transmitting sensor payload to Render backend...");
  Serial.println(requestBody);

  // 2. Perform secure HTTPS POST
  WiFiClientSecure client;
  client.setInsecure(); // Let's Encrypt TLS certificate verification

  HTTPClient https;
  https.setTimeout(8000);

  if (https.begin(client, BACKEND_URL)) {
    https.addHeader("Content-Type", "application/json");
    https.addHeader("x-device-token", DEVICE_TOKEN);
    https.addHeader("x-device-id", DEVICE_ID);

    int httpCode = https.POST(requestBody);

    if (httpCode > 0) {
      Serial.print("[HTTPS] Response HTTP Code: ");
      Serial.println(httpCode);

      String responsePayload = https.getString();
      Serial.print("[HTTPS] Server Response: ");
      Serial.println(responsePayload);
    } else {
      Serial.print("[HTTPS] POST request failed. Error: ");
      Serial.println(https.errorToString(httpCode).c_str());
    }

    https.end();
  } else {
    Serial.println("[HTTPS] Unable to connect to host.");
  }
}

// ============================================================================
// MAIN SETUP & LOOP
// ============================================================================

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n========================================================");
  Serial.println("  ResQPet ESP32-C3 SuperMini IoT Collar Starting Up... ");
  Serial.println("========================================================");

  // 1. Initialize GPS Hardware UART on GPIO20 (RX) and GPIO21 (TX)
  Serial.println("[GPS] Initializing NEO-6M UART on RX=GPIO20, TX=GPIO21 at 9600 baud...");
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  // 2. Initialize DHT11
  Serial.println("[DHT11] Initializing digital sensor on GPIO4...");
  dht.begin();

  // 3. Initialize MPU6050 / MPU6500 on I2C
  Serial.println("[MPU] Initializing I2C bus on SDA=GPIO8, SCL=GPIO9...");
  mpuInitialized = initMPU();

  // 4. Connect to Wi-Fi
  connectWiFi();

  Serial.println("\n[SYSTEM] Initialization complete. Entering real-time telemetry loop.\n");
}

void loop() {
  pumpGpsData();

  unsigned long currentMillis = millis();

  // 1. Sample Motion Sensor at 5 Hz (every 200ms)
  if (currentMillis - lastSampleTime >= SENSOR_SAMPLE_INTERVAL_MS) {
    lastSampleTime = currentMillis;
    readMPUSensors();
  }

  // 2. Wi-Fi Reconnect check every 5 seconds if connection dropped
  if (currentMillis - lastWiFiCheckTime >= WIFI_RECONNECT_INTERVAL_MS) {
    lastWiFiCheckTime = currentMillis;
    if (WiFi.status() != WL_CONNECTED) {
      connectWiFi();
    }
  }

  // 3. Periodic Publish to Cloud Backend
  if (currentMillis - lastPublishTime >= PUBLISH_INTERVAL_MS) {
    lastPublishTime = currentMillis;

    readDHT11();
    transmitSensorData();
  }
}

