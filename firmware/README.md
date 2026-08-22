# PetGuardian Smart Collar Firmware

ESP32-based firmware for the PetGuardian smart collar. Reads GPS location,
motion/fall data, temperature, and battery level, then publishes a combined
JSON reading over MQTT every 15 seconds.

```
ESP32 collar → MQTT broker → backend MQTT bridge → REST ingestion pipeline
                                                     → emergency detection
                                                     → MongoDB + Socket.io
```

The backend doesn't listen to MQTT directly — `backend/src/services/
mqttBridge.js` subscribes on the server's behalf and forwards each reading
into the same `/api/iot/reading` logic used by any HTTP client. That keeps
validation and emergency-detection code in exactly one place.

## Bill of materials

| Component | Notes |
|---|---|
| ESP32 DevKit (WROOM-32 or similar) | Any variant with enough GPIO |
| NEO-6M GPS module | UART, 9600 baud |
| MPU6050 accelerometer/gyro | I2C |
| DS18B20 waterproof temp probe | OneWire, needs a 4.7kΩ pull-up on data line |
| LiPo battery (3.7V) + charge circuit (e.g. TP4056) | |
| 2x 100kΩ resistors (voltage divider) | for battery sensing |
| Piezo buzzer | active or passive both work |
| Status LED + resistor | optional if not using the onboard LED |

## Wiring

| ESP32 pin | Connects to |
|---|---|
| GPIO16 (RX2) | GPS TX |
| GPIO17 (TX2) | GPS RX |
| GPIO21 (SDA) | MPU6050 SDA |
| GPIO22 (SCL) | MPU6050 SCL |
| GPIO4 | DS18B20 data (+ 4.7kΩ pull-up to 3.3V) |
| GPIO34 (ADC1_CH6) | Midpoint of battery voltage divider |
| GPIO25 | Buzzer +  |
| GPIO2 | Status LED (or use the DevKit's onboard LED) |
| 3.3V / GND | Shared across all modules |

**Battery voltage divider**: the ESP32's ADC only reads 0–3.3V, but a LiPo
sits around 3.3–4.2V. Two equal-value resistors (e.g. 100kΩ + 100kΩ) from
battery+ to GND, with the ESP32 ADC pin tapping the midpoint, halves the
voltage into a safe range. `BATTERY_DIVIDER_RATIO` in `config.h` must match
whatever ratio your resistors actually produce.

## Setup

1. Install [PlatformIO](https://platformio.org/) (VS Code extension or CLI).
2. Copy the config template and fill in your credentials:
   ```
   cp include/config.h.example include/config.h
   ```
   Edit `include/config.h`:
   - `DEVICE_ID` — must match the device ID you link to a pet from the
     owner dashboard (Owner → Pets → pet profile → "Link collar device").
   - `WIFI_SSID` / `WIFI_PASSWORD`
   - `MQTT_BROKER_HOST` / `MQTT_BROKER_PORT` — must match `MQTT_BROKER_URL`
     in the backend's `.env`
   - `MQTT_USERNAME` / `MQTT_PASSWORD` — must match the backend's
     `MQTT_USERNAME` / `MQTT_PASSWORD`
3. Build and upload:
   ```
   pio run --target upload
   pio device monitor
   ```
4. Confirm in the serial monitor that WiFi connects, MQTT connects, and
   readings publish once a GPS fix is acquired (first fix outdoors can take
   30–60 seconds on a cold start).
5. On the backend, make sure a broker is actually running and reachable —
   e.g. [Mosquitto](https://mosquitto.org/) locally:
   ```
   mosquitto -v
   ```
   and that `IOT_DEVICE_KEY` in the backend `.env` is set (it authenticates
   the MQTT bridge's forwarded requests the same way it would authenticate
   any direct HTTP device).

## Message format

Published to `petguardian/<DEVICE_ID>/reading`:

```json
{
  "lat": 28.6139,
  "lng": 77.2090,
  "speedKmh": 2.4,
  "temperatureC": 38.1,
  "batteryPercent": 74,
  "movementDetected": true,
  "accelerometer": { "x": 0.02, "y": -0.01, "z": 0.99 }
}
```

The device ID isn't included in the payload — it's parsed from the topic by
the backend's MQTT bridge and attached before forwarding.

## Design notes / honest limitations

- **No GPS fix = no publish.** Rather than sending `(0, 0)`, the firmware
  skips the cycle entirely until it has a fix. This avoids false geo-fence
  triggers, at the cost of a gap in reporting during a cold GPS start.
- **Local emergency buzzer is a convenience, not the source of truth.** The
  backend independently re-evaluates every reading it receives (see
  `backend/src/services/emergencyService.js`) and is what actually creates
  rescue requests and notifications. The collar's local buzzer/LED just
  gives an instant physical signal even if the network hiccups.
- **This firmware has not been compiled or run on physical hardware** as
  part of this build — I don't have a compiler or an ESP32 in this
  environment to verify it against. The code follows standard, well-tested
  library APIs (PubSubClient, TinyGPSPlus, Adafruit MPU6050, ArduinoJson v7)
  and I've reviewed it carefully for correctness, but please treat first
  upload as a bring-up step: watch the serial monitor, confirm each sensor
  initializes, and verify a few published payloads land correctly in the
  backend logs before relying on it unattended.
