/**
 * PetGuardian Smart Collar Firmware
 * ---------------------------------
 * Reads GPS location, accelerometer motion, body-adjacent temperature, and
 * battery level, then publishes a combined JSON reading over MQTT every
 * PUBLISH_INTERVAL_MS. The backend's MQTT bridge (backend/src/services/
 * mqttBridge.js) subscribes to these readings and forwards them into the
 * same ingestion + emergency-detection pipeline used by direct HTTP clients.
 *
 * Hardware:
 *   - ESP32 DevKit
 *   - NEO-6M GPS module (UART)
 *   - MPU6050 accelerometer/gyro (I2C)
 *   - DS18B20 waterproof temperature probe (OneWire)
 *   - LiPo battery + voltage divider into an ADC pin
 *   - Piezo buzzer + status LED for local emergency indication
 *
 * Before building: copy include/config.h.example to include/config.h and
 * fill in your WiFi/MQTT credentials and device ID.
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <TinyGPSPlus.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>
#include "config.h"

// ---- Peripherals ----
HardwareSerial gpsSerial(2);
TinyGPSPlus gps;

WiFiClient espClient;
PubSubClient mqttClient(espClient);

Adafruit_MPU6050 mpu;
OneWire oneWire(ONE_WIRE_PIN);
DallasTemperature tempSensor(&oneWire);

// ---- State ----
unsigned long lastPublishAt = 0;
unsigned long lastAccelSampleAt = 0;
bool movementDetectedThisWindow = false;
bool fallDetectedThisWindow = false;
char mqttTopic[64];

// ---------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(WIFI_RETRY_DELAY_MS);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("WiFi connected, IP: ");
  Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Connecting to MQTT broker...");
    String clientId = String(DEVICE_ID) + "-" + String(random(0xffff), HEX);

    if (mqttClient.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("connected.");
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" retrying...");
      delay(MQTT_RETRY_DELAY_MS);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);

  snprintf(mqttTopic, sizeof(mqttTopic), "%s%s%s", MQTT_TOPIC_PREFIX, DEVICE_ID, MQTT_TOPIC_SUFFIX);

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(STATUS_LED_PIN, LOW);

  // GPS on UART2
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  // I2C for MPU6050
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
  if (!mpu.begin()) {
    Serial.println("MPU6050 not found. Check wiring. Continuing without motion sensing.");
  } else {
    mpu.setAccelerometerRange(MPU6050_RANGE_4_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    Serial.println("MPU6050 initialized.");
  }

  // DS18B20 temperature probe
  tempSensor.begin();

  connectWiFi();
  mqttClient.setServer(MQTT_BROKER_HOST, MQTT_BROKER_PORT);
}

// ---------------------------------------------------------------------
// Sensor reads
// ---------------------------------------------------------------------

/** Feeds any waiting GPS bytes into the parser. Call frequently, not just once per loop. */
void pumpGps() {
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }
}

/** Samples the accelerometer and updates the movement/fall flags for this publish window. */
void sampleMotion() {
  if (millis() - lastAccelSampleAt < 500) return; // sample twice a second
  lastAccelSampleAt = millis();

  sensors_event_t accelEvent, gyroEvent, tempEvent;
  if (!mpu.getEvent(&accelEvent, &gyroEvent, &tempEvent)) return;

  // MPU6050 reports in m/s^2; convert to g for easier thresholding (1g ~= 9.80665 m/s^2)
  float ax = accelEvent.acceleration.x / 9.80665f;
  float ay = accelEvent.acceleration.y / 9.80665f;
  float az = accelEvent.acceleration.z / 9.80665f;
  float magnitude = sqrtf(ax * ax + ay * ay + az * az);

  // Resting magnitude is ~1g; a deviation beyond noise indicates movement,
  // and a sharp spike indicates a possible fall/impact.
  const float MOVEMENT_NOISE_THRESHOLD_G = 0.15f;
  if (fabsf(magnitude - 1.0f) > MOVEMENT_NOISE_THRESHOLD_G) {
    movementDetectedThisWindow = true;
  }
  if (magnitude >= 1.0f + LOCAL_FALL_ACCEL_DELTA_G) {
    fallDetectedThisWindow = true;
  }
}

float readTemperatureC() {
  tempSensor.requestTemperatures();
  float tempC = tempSensor.getTempCByIndex(0);
  if (tempC == DEVICE_DISCONNECTED_C || tempC < -50 || tempC > 100) {
    return NAN; // sensor not connected or gave a bad reading
  }
  return tempC;
}

int readBatteryPercent() {
  int raw = analogRead(BATTERY_ADC_PIN);
  float pinVoltage = (raw / 4095.0f) * 3.3f;
  float batteryVoltage = pinVoltage * BATTERY_DIVIDER_RATIO;

  float percent = (batteryVoltage - BATTERY_MIN_VOLTAGE) / (BATTERY_MAX_VOLTAGE - BATTERY_MIN_VOLTAGE) * 100.0f;
  if (percent < 0) percent = 0;
  if (percent > 100) percent = 100;
  return (int)roundf(percent);
}

/** Buzzes and flashes the LED for a physical, no-network-required alert. */
void triggerLocalAlert() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    digitalWrite(STATUS_LED_PIN, HIGH);
    delay(150);
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(STATUS_LED_PIN, LOW);
    delay(150);
  }
}

// ---------------------------------------------------------------------
// Publishing
// ---------------------------------------------------------------------

void publishReading() {
  JsonDocument doc;

  bool hasFix = gps.location.isValid() && gps.location.age() < 5000;
  if (hasFix) {
    doc["lat"] = gps.location.lat();
    doc["lng"] = gps.location.lng();
  } else {
    // Without a fix we skip publishing entirely — a reading with no
    // location isn't useful to the backend's geo-fence evaluation and
    // would otherwise be misread as (0,0).
    Serial.println("No GPS fix yet, skipping this publish cycle.");
    return;
  }

  if (gps.speed.isValid()) {
    doc["speedKmh"] = gps.speed.kmph();
  }

  float tempC = readTemperatureC();
  if (!isnan(tempC)) {
    doc["temperatureC"] = tempC;
  }

  doc["batteryPercent"] = readBatteryPercent();
  doc["movementDetected"] = movementDetectedThisWindow;

  sensors_event_t accelEvent, gyroEvent, tempEvent;
  if (mpu.getEvent(&accelEvent, &gyroEvent, &tempEvent)) {
    JsonObject accel = doc["accelerometer"].to<JsonObject>();
    accel["x"] = accelEvent.acceleration.x / 9.80665f;
    accel["y"] = accelEvent.acceleration.y / 9.80665f;
    accel["z"] = accelEvent.acceleration.z / 9.80665f;
  }

  char payload[384];
  size_t len = serializeJson(doc, payload);

  bool published = mqttClient.publish(mqttTopic, payload, len);
  Serial.print("Publish to ");
  Serial.print(mqttTopic);
  Serial.print(": ");
  Serial.println(published ? "ok" : "FAILED");
  Serial.println(payload);

  // Local physical alert for conditions serious enough not to wait on the
  // network round-trip (the backend independently re-evaluates and may also
  // trigger a rescue request + notifications once this reading arrives).
  bool lowBattery = doc["batteryPercent"] < LOCAL_LOW_BATTERY_PERCENT;
  bool highTemp = !isnan(tempC) && tempC >= LOCAL_HIGH_TEMP_C;
  if (fallDetectedThisWindow || highTemp || lowBattery) {
    triggerLocalAlert();
  }

  // Reset the window
  movementDetectedThisWindow = false;
  fallDetectedThisWindow = false;
}

// ---------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  pumpGps();
  sampleMotion();

  if (millis() - lastPublishAt >= PUBLISH_INTERVAL_MS) {
    lastPublishAt = millis();
    publishReading();
  }
}
