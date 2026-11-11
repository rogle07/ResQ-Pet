# ResQPet – Unified Project Context & Technical Architecture

> **Purpose:** This document establishes a shared, permanent architectural and implementation context between development agents (Antigravity, ChatGPT, Claude) and developers. It serves as the single source of truth for repository structure, hardware connections, API schemas, security policies, and pending tasks.
>
> ⚠️ **Security Notice:** Never insert plaintext passwords, production API keys, device secret tokens, or database credentials into this document. Use environment variable placeholders only.

---

## 1. Executive Summary & Vision

**ResQPet** (also referred to as **PetGuardian** in legacy modules) is an end-to-end, AI & IoT-powered pet rescue, real-time tracking, care management, and ecosystem platform. It bridges:
1. **Wearable IoT Hardware:** Custom ESP32-C3 SuperMini collar with multi-sensor telemetry (6-axis IMU, temperature/humidity, GPS).
2. **Cloud Backend:** Node.js/Express REST API + Socket.IO real-time WebSocket server + MongoDB Atlas database.
3. **Multi-Role Web Application:** React (TypeScript) + Vite + Tailwind CSS dashboard serving 9 distinct user personas.
4. **ResQTag Emergency System:** QR-coded public identity tags allowing finders to scan and report stray or lost animals without an account.

---

## 2. System Architecture & Deployment

```
 +-------------------------------------------------------------------------------+
 |                            IoT COLLAR FIRMWARE                                |
 |  ESP32-C3 SuperMini + MPU6050/6500 (I2C) + DHT11 (GPIO4) + NEO-6M GPS (UART)   |
 +-------------------------------------------------------------------------------+
                                      |
                       HTTPS POST /api/iot/device-data
                       Header: x-device-token: <DEVICE_TOKEN>
                                      v
 +-------------------------------------------------------------------------------+
 |                        PRODUCTION BACKEND (Render)                            |
 |  Base URL: https://resq-pet-1.onrender.com                                    |
 |  - Express.js HTTP Server                                                     |
 |  - Socket.IO Real-Time Gateway                                                |
 |  - Device Token SHA-256 Verification                                          |
 |  - Geofence & Emergency Rule Engine                                           |
 |  - Optional MQTT Bridge (petguardian/+/reading)                               |
 +-------------------------------------------------------------------------------+
                 |                                               ^
                 | Mongoose Driver                               | REST / Socket.io
                 v                                               | (Proxy rewrites)
 +-------------------------------+               +-------------------------------+
 |     DATABASE (MongoDB Atlas)  |               |    FRONTEND (Vercel SPA)      |
 |  - Users (9 roles)            |               |  https://res-q-pet-51cc.      |
 |  - Pets & ResQTags            |               |  vercel.app                   |
 |  - IoT Devices (token hashes) |               |  - React 18 + TypeScript      |
 |  - Sensor Readings            |               |  - Leaflet / OpenStreetMap    |
 |  - Rescue Requests            |               |  - Recharts Telemetry Charts  |
 +-------------------------------+               +-------------------------------+
```

### Hosting & Infrastructure

| Component | Provider / Platform | Production URL / Host | Config File |
|---|---|---|---|
| **Frontend** | Vercel | `https://res-q-pet-51cc.vercel.app` | `frontend/vercel.json` |
| **Backend** | Render (Web Service) | `https://resq-pet-1.onrender.com` | `render.yaml` |
| **Database** | MongoDB Atlas | Managed Replica Set (`Cluster0`) | `backend/.env` (`MONGO_URI`) |
| **Broker (Local)** | Mosquitto MQTT | `mqtt://localhost:1883` | `mosquitto/config/` |
| **Media Storage** | Cloudinary | Cloud-hosted CDN | `backend/src/config/cloudinary.js` |

---

## 3. User Roles & Access Control

ResQPet implements strict role-based access control (RBAC). There are **9 distinct roles**:

### 8 Publicly Registerable Roles
These are selectable in `/register` and `/login`:
1. **`owner`** (Pet Owner): Registers pets, tracks GPS live, configures safe zones, registers/assigns smart collars, views sensor telemetry.
2. **`lost_pet`** (Lost Pet Reporter): Dedicated interface to report missing pets, broadcast alerts, and receive community match notifications.
3. **`finder`** (Finder): Reports found animals, uploads images, matches against reported lost pets, scans ResQTags.
4. **`rescue_team`** (Rescuer / Rescue Team): Dispatches to emergency incidents, views incident map, updates rescue mission timelines.
5. **`ngo`** (NGO / Shelter): Manages shelter occupancy, coordinates rescue intakes, oversees local adoption pipelines.
6. **`adopter`** (Adopter): Browses adoptable animals, submits adoption questionnaires, tracks application status.
7. **`foster_home`** (Foster Care Provider): Manages temporary home placements, logs pet health and behavior observations.
8. **`donor`** (Donor / Patron): Contributes financial aid via Stripe / Razorpay, receives 80G tax receipts, views impact reports.

### 1 Administrative Role (Hidden from Public Selection)
9. **`admin`** (Administrator):
   - **Never selectable** on public registration or login pages.
   - Guarded against self-promotion: any request to `POST /api/auth/register` with `role: "admin"` is sanitized to `"owner"`.
   - Provisioned **only** through backend CLI (`backend/scripts/createAdmin.js`) or direct database setup.
   - Has full access to `/admin`, `/admin/users`, `/admin/pets`, `/admin/analytics`, `/admin/settings`, and `/admin/iot`.

---

## 4. IoT Hardware & ESP32-C3 Firmware

### Hardware Specifications
* **Microcontroller:** ESP32-C3 SuperMini (V1601, RISC-V 32-bit single-core, 160 MHz, 4MB Flash).
* **Motion Sensor:** MPU6050 / MPU6500 (6-Axis Accelerometer + Gyroscope via I2C).
* **Environmental Sensor:** DHT11 (Single-bus digital temperature and relative humidity).
* **GPS Receiver:** NEO-6M (High-sensitivity GNSS receiver via Hardware UART, 9600 baud, NMEA 0183).

### Hardware Pin Connections (ESP32-C3 SuperMini)

| Module | Module Pin | ESP32-C3 Pin | Bus / Interface | Notes |
|---|---|---|---|---|
| **MPU6050 / MPU6500** | `SDA` | **GPIO8** | I2C Data | 100 kHz bus clock; address `0x68` (or `0x70` for MPU6500) |
| **MPU6050 / MPU6500** | `SCL` | **GPIO9** | I2C Clock | Pullups typically included on breakout |
| **MPU6050 / MPU6500** | `VCC` | **3.3V** | Power | Operating voltage 3.3V |
| **MPU6050 / MPU6500** | `GND` | **GND** | Ground | Common system ground |
| **DHT11** | `DATA` | **GPIO4** | Digital Single-Bus | Sampled every 10 seconds |
| **DHT11** | `VCC` | **3.3V** | Power | |
| **DHT11** | `GND` | **GND** | Ground | |
| **NEO-6M GPS** | `TX` | **GPIO20** | UART1 RX | Receives NMEA sentences into TinyGPSPlus |
| **NEO-6M GPS** | `RX` | **GPIO21** | UART1 TX | Transmits commands to GPS (optional) |
| **NEO-6M GPS** | `VCC` | **3.3V / 5V** | Power | Connect to VBUS / 5V for optimal satellite acquisition |
| **NEO-6M GPS** | `GND` | **GND** | Ground | |

### Firmware Source Directories
* `firmware/src/main.cpp`: PlatformIO C++ firmware implementation.
* `firmware/arduino/ResQPet_ESP32C3_IoT/ResQPet_ESP32C3_IoT.ino`: Arduino IDE-ready sketch.
* `firmware/include/config.h.example`: Configuration template for Wi-Fi and device credentials.

### Firmware Operational Cycle
1. Initializes Serial, I2C (`Wire.begin(8, 9)`), DHT (`GPIO4`), and HardwareSerial 1 (`gpsSerial.begin(9600, SERIAL_8N1, 20, 21)`).
2. Connects to configured Wi-Fi SSID.
3. Samples MPU accelerometer and gyroscope at 5 Hz (every 200 ms) to compute total acceleration vector and activity status (`RESTING` vs `ACTIVE`).
4. Decodes incoming NMEA GPS frames via `TinyGPSPlus`.
5. Transmits HTTPS JSON payload every 10 seconds to `https://resq-pet-1.onrender.com/api/iot/device-data`.
6. Passes auth token via `x-device-token: <DEVICE_TOKEN>` HTTP header.

---

## 5. IoT Device Provisioning, Token Security & Assignment

### Security Rules
1. **Zero Plaintext Tokens in Database:** Raw device tokens (`rqp_sec_<hex>`) are **never** stored in MongoDB. Only their SHA-256 hash (`crypto.createHash('sha256').update(token).digest('hex')`) is saved in `IoTDevice.tokenHash`.
2. **One-Time Token Exposure:** Raw tokens are returned **only once** in the response body during provisioning (`POST /api/admin/iot/provision`) or rotation (`POST /api/admin/iot/devices/:deviceId/rotate-token`).
3. **Request Verification:** On every request to `POST /api/iot/device-data`, the backend extracts the token from headers (`x-device-token`, `x-device-key`, or `Authorization: Bearer`), hashes it, and queries MongoDB for matching `deviceId` and `tokenHash`.

### Provisioning Workflows

#### Method 1: Administrator Backend CLI Provisioning
```bash
cd backend
npm run provision-device
# Or with options:
node scripts/provisionDevice.js --deviceId RQP-ESP32-0001 --name "SuperMini Collar 1"
```
* Generates a unique Device ID (`RQP-ESP32-XXXX`).
* Generates a 256-bit cryptographically random token (`rqp_sec_...`).
* Sets `status = 'registered'`, `assignmentStatus = 'unassigned'`, `owner = null`.
* Displays the secret token in stdout for flashing to `config.h`.

#### Method 2: Admin Dashboard Provisioning
* Path: `/admin/iot` (`AdminIoT.tsx`).
* Administrator enters device name and optional owner email.
* Calls `POST /api/admin/iot/provision`.

#### Method 3: Pet Owner Registration / Claim
* Path: `/owner/iot` (`OwnerIoT.tsx`).
* Owner registers a new device or claims an admin-provisioned device by entering the Device ID.
* Calls `POST /api/iot/devices/register`.
* Assigns device to one of their registered pets via `POST /api/iot/devices/assign`.
* Unauthorized assignment is rejected with `403 Forbidden` if the pet or device belongs to a different user.

---

## 6. Database Models (MongoDB Mongoose)

All models reside in `backend/src/models/`:

| Model File | Collection | Description | Key Fields |
|---|---|---|---|
| `User.js` | `users` | Multi-role platform accounts | `name`, `email`, `password` (bcrypt 12 rounds), `role` (9 roles), `googleId`, `facebookId`, `isActive`, `address.coordinates` |
| `Pet.js` | `pets` | Registered animal profiles | `petId`, `owner`, `name`, `species`, `breed`, `collar.deviceId`, `collar.isActive`, `safeZone`, `resqTag`, `lastKnownLocation` |
| `IoTDevice.js` | `iotdevices` | Smart collar hardware registry | `deviceId` (unique), `deviceName`, `tokenHash` (SHA-256), `owner`, `pet`, `status`, `assignmentStatus`, `lastReading`, `lastValidGps` |
| `SensorReading.js` | `sensorreadings` | Telemetry logs from wearable | `deviceId`, `device`, `pet`, `owner`, `temperature`, `humidity`, `motion` (accel X/Y/Z, gyro X/Y/Z, activityStatus), `gps` (lat, lng, fixValid, satellites), `recordedAt` |
| `GpsLog.js` | `gpslogs` | Coordinate breadcrumbs | `pet`, `deviceId`, `lat`, `lng`, `speedKmh`, `insideSafeZone`, `recordedAt` |
| `RescueRequest.js` | `rescuerequests`| Emergency & injury dispatches | `pet`, `requestedBy`, `type`, `priority`, `status`, `assignedTo`, `location`, `timeline` |
| `FoundReport.js` | `foundreports` | Community found animal reports | `finder`, `species`, `location`, `images`, `status`, `matchedLostReport` |
| `LostPetReport.js` | `lostpetreports` | Owner missing pet broadcasts | `owner`, `petName`, `species`, `lastSeenLocation`, `reward`, `status` |
| `Adoption.js` | `adoptions` | Pet adoption applications | `pet`, `applicant`, `status`, `applicationDetails` |
| `FosterRequest.js` | `fosterrequests`| Temporary foster placements | `pet`, `fosterHome`, `startDate`, `endDate`, `status` |
| `Donation.js` | `donations` | Monetary donor contributions | `donor`, `amount`, `currency`, `provider` (stripe/razorpay), `status`, `receiptUrl` |
| `Conversation.js` | `conversations` | Real-time chat threads | `participants`, `lastMessage`, `unreadCount` |
| `Message.js` | `messages` | Chat message entries | `conversationId`, `sender`, `content`, `readBy` |
| `Notification.js` | `notifications` | User alerts | `recipient`, `type`, `title`, `message`, `channel`, `read` |
| `VetAppointment.js`| `vetappointments`| Clinical appointments | `pet`, `owner`, `veterinarian`, `dateTime`, `reason`, `status` |
| `VetMedicalRecord.js`| `vetmedicalrecords`| Clinical medical history | `pet`, `veterinarian`, `diagnosis`, `symptoms`, `vitals` |
| `VetPrescription.js` | `vetprescriptions`| Digital prescriptions | `pet`, `veterinarian`, `medications`, `instructions` |
| `VetTreatment.js` | `vettreatments` | Ongoing medical treatments | `pet`, `veterinarian`, `treatmentType`, `sessions` |
| `SystemSetting.js`| `systemsettings`| Platform runtime configuration | `key`, `value`, `updatedBy` |

---

## 7. Key API Specifications

### Ingestion: `POST /api/iot/device-data`
* **Access:** Device authentication via header (`x-device-token: rqp_sec_...`)
* **Request Body:**
```json
{
  "deviceId": "RQP-ESP32-0001",
  "temperature": 38.4,
  "humidity": 58.0,
  "motion": {
    "accelerationX": 0.05,
    "accelerationY": -0.02,
    "accelerationZ": 0.98,
    "totalAcceleration": 0.98,
    "gyroscopeX": -0.1,
    "gyroscopeY": 0.3,
    "gyroscopeZ": 0.0,
    "movementEstimate": 0.04,
    "activityStatus": "RESTING"
  },
  "gps": {
    "latitude": 19.0760,
    "longitude": 72.8777,
    "fixValid": true,
    "satellites": 7,
    "altitude": 15.2,
    "speed": 0.5
  },
  "timestamp": "2026-11-11T12:00:00.000Z"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Sensor data recorded successfully",
  "readingId": "6aec7c004ea4d98e5f902fbe",
  "fixValid": true,
  "petId": "6aec7bfe4ea4d98e5f902f8f",
  "timestamp": "2026-11-11T12:00:00.000Z"
}
```
* **Unassigned Device Response (200 OK):**
```json
{
  "success": true,
  "message": "Device connected but not yet assigned to a pet. Please assign it in your Pet Owner dashboard.",
  "assigned": false
}
```
* **Authentication Failure (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid device credentials or unregistered device ID"
}
```

---

### Admin Device Provisioning: `POST /api/admin/iot/provision`
* **Access:** Private (Admin JWT required)
* **Request Body:**
```json
{
  "deviceId": "RQP-ESP32-0002",
  "deviceName": "Alpha Smart Collar",
  "ownerEmail": "owner@example.com"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Device provisioned successfully. Copy the deviceToken now — it will not be shown again.",
  "device": {
    "_id": "6732...3a",
    "deviceId": "RQP-ESP32-0002",
    "deviceName": "Alpha Smart Collar",
    "registrationStatus": "registered",
    "assignmentStatus": "unassigned",
    "createdAt": "2026-11-11T12:00:00.000Z"
  },
  "deviceToken": "rqp_sec_f9823b189a0b1274f8391823"
}
```

---

### Authentication: `POST /api/auth/login`
* **Access:** Public
* **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "role": "owner"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "6731...1a",
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin"
  }
}
```
*(Sets HTTP-only `refreshToken` cookie for token rotation).*

---

## 8. Real-Time Emergency & Safety Engine

Located at [`backend/src/services/emergencyService.js`](file:///c:/Users/ykuma/Downloads/here/ResQ-Pet/backend/src/services/emergencyService.js). Every sensor update triggers rule evaluation:

| Trigger Condition | Threshold / Rule | Action |
|---|---|---|
| **Geofence Exit** | Distance from safe zone center > `pet.safeZone.radiusMeters` | Emergency alert sent to owner; rescue request created |
| **Abnormal Temperature** | Temperature $\ge 39.5^\circ\text{C}$ ($103.1^\circ\text{F}$) | Flagged as hyperthermia/heatstroke danger |
| **Prolonged Inactivity** | Zero movement detected for $\ge 30\text{ minutes}$ | Flagged as possible injury or collar detachment |
| **Sudden Fall / Impact** | Total acceleration vector magnitude $\ge 1 + 2.5\text{g} = 3.5\text{g}$ | Flagged as vehicle collision or fall from height |
| **Low Battery** | Battery level $\le 15\%$ | Informational notification sent to owner |

When a critical emergency triggers:
1. An automated `RescueRequest` document is created with priority `critical`.
2. A Socket.IO event `emergency:new` is broadcast to the `rescueTeamRoom`.
3. In-app, push, and email alerts are dispatched to the pet owner via [`notificationService.js`](file:///c:/Users/ykuma/Downloads/here/ResQ-Pet/backend/src/services/notificationService.js).

---

## 9. Environment Variables Reference

### Backend (`backend/.env` & Render Dashboard)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `production` or `development` |
| `PORT` | Yes | Port to listen on (Render sets dynamically) |
| `CLIENT_URL` | Yes | Frontend origin (`https://res-q-pet-51cc.vercel.app`) |
| `MONGO_URI` | Yes | MongoDB Atlas SRV connection URI |
| `JWT_SECRET` | Yes | 64+ char random hex string for Access Tokens |
| `JWT_REFRESH_SECRET` | Yes | 64+ char random hex string for Refresh Tokens |
| `JWT_EXPIRES_IN` | No | Default: `7d` |
| `JWT_REFRESH_EXPIRES_IN` | No | Default: `30d` |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary Cloud Name for pet photos |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API Secret |
| `SMTP_HOST` | Yes | SMTP server host (`smtp.gmail.com`) |
| `SMTP_PORT` | Yes | `587` |
| `SMTP_USER` | Yes | Email username |
| `SMTP_PASS` | Yes | Email App Password |
| `EMAIL_FROM` | Yes | e.g. `ResQPet <no-reply@resqpet.app>` |
| `STRIPE_SECRET_KEY` | Optional | Stripe API secret key for donations |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook signing secret |
| `RATE_LIMIT_WINDOW_MS` | No | Default: `900000` (15 minutes) |
| `RATE_LIMIT_MAX` | No | Default: `200` requests per window |
| `MONGO_TIMEOUT_MS` | No | Default: `10000` (10 seconds) |

---

## 10. CLI Management Scripts

The repository includes administrative backend scripts under `backend/scripts/`:

### 1. IoT Device Provisioning Script
* **File:** `backend/scripts/provisionDevice.js`
* **NPM Command:** `npm run provision-device`
* **Syntax:**
  ```bash
  node backend/scripts/provisionDevice.js [--deviceId <ID>] [--name "<Name>"] [--owner <email>]
  ```
* **Behavior:** Generates unique ID, calculates SHA-256 hash, stores in MongoDB, displays one-time secret token.

### 2. Administrator Account Creation Script
* **File:** `backend/scripts/createAdmin.js`
* **NPM Command:** `npm run create-admin`
* **Syntax:**
  ```bash
  node backend/scripts/createAdmin.js [--email <email>] [--password "<pass>"] [--name "<name>"]
  ```
* **Behavior:** Promotes or creates account with role `admin`, hashes password via bcrypt (12 rounds). Supports interactive terminal prompts.

---

## 11. Known Technical Debt, Issues & Pending Roadmap

1. **Firebase Cloud Messaging (FCM):**
   * *Status:* Client FCM registration (`POST /api/notifications/fcm-token`) is functional, but automated background push triggering via Firebase Admin SDK needs direct wiring into `notificationService.js`.
2. **Winston Log Rotation:**
   * *Status:* Winston logs to `backend/logs/*.log`. Production requires `winston-daily-rotate-file` to prevent unbounded disk growth.
3. **Local Mosquitto MQTT Security:**
   * *Status:* `mosquitto/config/mosquitto.conf` has `allow_anonymous true` for seamless zero-setup local dev. Production deployment must switch to password file or TLS certificates on port 8883.
4. **Offline Auth Fallback:**
   * *Status:* The frontend contains a demo fallback for offline evaluation. Production deployment should strictly restrict this fallback to verifiable network disconnects.
5. **Firmware Deep-Sleep Power Optimization:**
   * *Status:* Firmware currently runs continuously on a 10-second delay. For battery-powered operation on a compact LiPo (e.g. 500 mAh), ESP32-C3 light-sleep / timer deep-sleep should be integrated between telemetry bursts.
