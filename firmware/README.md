# ResQPet — ESP32-C3 SuperMini IoT Wearable Collar Firmware

Complete IoT hardware-to-cloud telemetry firmware for the ResQPet smart pet collar ecosystem.

---

## 📌 Hardware Architecture

- **Microcontroller**: ESP32-C3 SuperMini (V1601) with built-in 2.4 GHz Wi-Fi & Bluetooth LE
- **Motion Sensor**: MPU6050 / MPU6500 6-Axis Motion Sensor (I2C)
- **Environmental Sensor**: DHT11 Temperature & Relative Humidity Sensor (Digital single-bus)
- **GPS Module**: NEO-6M High-Precision GPS Receiver (UART NMEA 0183)

---

## 🔌 Hardware Wiring & Pin Configuration

| Sensor / Module | Sensor Pin | ESP32-C3 SuperMini Pin | Description |
|---|---|---|---|
| **MPU6050 / MPU6500** | `SDA` | **GPIO8** | I2C Serial Data |
| **MPU6050 / MPU6500** | `SCL` | **GPIO9** | I2C Serial Clock |
| **MPU6050 / MPU6500** | `VCC` | **3.3V** | Power (3.3V) |
| **MPU6050 / MPU6500** | `GND` | **GND** | Ground |
| **DHT11** | `DATA` | **GPIO4** | Digital Data Line (use 10k pullup if breakout lacks one) |
| **DHT11** | `VCC` | **3.3V** | Power (3.3V) |
| **DHT11** | `GND` | **GND** | Ground |
| **NEO-6M GPS** | `TX` | **GPIO20** | GPS Transmit → ESP32 RX (HardwareSerial 1) |
| **NEO-6M GPS** | `RX` | **GPIO21** | GPS Receive ← ESP32 TX (Optional, for commands) |
| **NEO-6M GPS** | `VCC` | **3.3V / 5V** | Power (3.3V or 5V VBUS) |
| **NEO-6M GPS** | `GND` | **GND** | Ground |

---

## 🛠️ Arduino IDE Setup Guide

### 1. Board Installation
1. Open **Arduino IDE**.
2. Go to **File > Preferences** and add the following URL into **Additional Boards Manager URLs**:
   ```
   https://espressif.github.io/arduino-esp32/package_esp32_index.json
   ```
3. Open **Tools > Board > Boards Manager**, search for `esp32` (by Espressif Systems), and install it.
4. Select the target board:
   - **Board**: `ESP32C3 Dev Module`
   - **USB CDC On Boot**: `Enabled` *(Crucial for Serial Monitor debugging on ESP32-C3 SuperMini)*
   - **Flash Size**: `4MB`
   - **Upload Speed**: `921600` (or `115200`)

### 2. Required Libraries
Install the following libraries via **Tools > Manage Libraries**:
1. `TinyGPSPlus` by Mikal Hart (v1.0.3+)
2. `DHT sensor library` by Adafruit (v1.4.6+)
3. `Adafruit Unified Sensor` (dependency for DHT)
4. `ArduinoJson` by Benoit Blanchon (v7.x or v6.x)

---

## ⚙️ Configuration (`config.h`)

1. Open `firmware/arduino/ResQPet_ESP32C3_IoT/` in Arduino IDE.
2. Duplicate `config.h.example` and rename it to `config.h`.
3. In the **ResQPet Pet Owner Dashboard** (`/owner/iot`):
   - Click **Add Device**
   - Enter your preferred Device ID (e.g., `RQP-ESP32-0001`) or leave blank to auto-generate
   - Click **Register Device**
   - Copy the generated secret **Device Token**
4. Paste the credentials into `config.h`:
   ```c
   #define DEVICE_ID "RQP-ESP32-0001"
   #define DEVICE_TOKEN "rqp_sec_xxxxxxxxxxxxxxxxxxxxxxxx"
   #define WIFI_SSID "Your_WiFi_Network"
   #define WIFI_PASSWORD "Your_WiFi_Password"
   #define BACKEND_URL "https://resq-pet.onrender.com/api/iot/device-data"
   ```

---

## 🚀 Uploading & Testing

1. Connect the ESP32-C3 SuperMini to your computer using a USB-C data cable.
2. Select your COM port under **Tools > Port**.
3. Click **Upload**.
4. Open **Tools > Serial Monitor** and set baud rate to `115200`.
5. You should see:
   ```text
   ========================================================
     ResQPet ESP32-C3 SuperMini IoT Collar Starting Up... 
   ========================================================
   [GPS] Initializing NEO-6M UART on RX=GPIO20, TX=GPIO21 at 9600 baud...
   [DHT11] Initializing digital sensor on GPIO4...
   [MPU] Initializing I2C bus on SDA=GPIO8, SCL=GPIO9...
   [MPU] WHO_AM_I register response: 0x68
   [MPU] MPU6050/MPU6500 successfully configured on I2C (SDA=8, SCL=9).
   [WiFi] Connecting to SSID: MyHomeWiFi......
   [WiFi] Connected! IP Address: 192.168.1.142

   [HTTPS] Transmitting sensor payload to Render backend...
   {"deviceId":"RQP-ESP32-0001","temperature":22.4,"humidity":65.0,"motion":{"accelerationX":0.02,"accelerationY":-0.08,"accelerationZ":0.97,"totalAcceleration":0.98,"gyroscopeX":-0.4,"gyroscopeY":0.2,"gyroscopeZ":0.1,"movementEstimate":0.03,"activityStatus":"RESTING"},"gps":{"fixValid":false,"latitude":null,"longitude":null,"satellites":0,"altitude":null,"speed":null}}
   [HTTPS] Response HTTP Code: 201
   [HTTPS] Server Response: {"success":true,"message":"Sensor data recorded successfully","readingId":"...","fixValid":false,"petId":"..."}
   ```
6. Open your **Pet Owner Dashboard** at `/owner/iot` to watch live temperature, humidity, and movement metrics update in real-time!
7. When you step outdoors, the NEO-6M GPS receiver will acquire a satellite lock, transmit `fixValid: true` with your latitude and longitude, and the interactive Leaflet map will pin your pet's live location.
