# 🩺 ResQPet — Veterinarian Clinical & IoT Module Integration Guide

This guide documents the complete **Full-Stack (Frontend + Backend + IoT)** implementation of the **Veterinarian Portal**, built exactly around the **ESP32-C3 SuperMini Smart Pet Collar Circuit Design**.

---

## 📦 Package Artifacts

1. **Standalone Zip**: `veterinarian-package.zip` (in root directory)
2. **Extracted Folder**: `veterinarian-package/`
3. **1-Click Import Script**: `scripts/import_veterinarian_module.ps1`
4. **1-Click Export Script**: `scripts/export_veterinarian_module.ps1`

---

## 🖥️ Frontend Structure

```text
frontend/src/
├── types/
│   └── veterinarian.ts             <-- Full TypeScript interfaces + IoT models
├── data/
│   └── veterinarianMockData.ts     <-- Clinical dataset & ESP32-C3 circuit specs
├── components/veterinarian/
│   ├── IoTCollarLiveTelemetry.tsx  <-- Real-time sensor stream & collar remote controls
│   ├── IoTCircuitSchematicModal.tsx<-- Circuit blueprint & pinout inspector
│   ├── NewAppointmentModal.tsx     <-- Booking modal
│   ├── AddMedicalRecordModal.tsx   <-- Clinical diagnosis & Rx modal
│   ├── AddTreatmentModal.tsx       <-- Treatment tracking modal
│   ├── PrescriptionModal.tsx       <-- Digital Rx print pad
│   └── EmergencyIntakeModal.tsx    <-- Critical triage admission modal
└── pages/veterinarian/
    ├── VeterinarianOverview.tsx    <-- Dashboard with IoT Fleet & Vitals Ticker
    ├── VeterinarianTelemetry.tsx   <-- Multi-patient IoT Telemetry Matrix
    ├── VeterinarianCollarDiagnostics.tsx <-- Hardware lab & Pinout Table
    ├── VeterinarianAppointments.tsx<-- Appointments schedule & filters
    ├── VeterinarianPatients.tsx    <-- Patient profile with IoT Telemetry tab
    ├── VeterinarianRecords.tsx     <-- Medical records archive
    ├── VeterinarianRecordDetail.tsx<-- Record details with IoT snapshot
    ├── VeterinarianTreatments.tsx  <-- Treatments course table
    ├── VeterinarianVaccinations.tsx<-- Immunization log
    ├── VeterinarianPrescriptions.tsx<-- Digital Rx history
    ├── VeterinarianLabReports.tsx  <-- Pathology & lab tests
    ├── VeterinarianEmergency.tsx   <-- Trauma & ICU board
    ├── VeterinarianNotifications.tsx<-- Clinical alerts
    ├── VeterinarianProfile.tsx     <-- Doctor credentials & hours
    └── VeterinarianSettings.tsx    <-- Practice config & dark mode
```

---

## ⚙️ Backend Structure (Node.js / Express / MongoDB)

```text
backend/src/
├── models/
│   ├── VetAppointment.js           <-- Appointments schema
│   ├── VetMedicalRecord.js         <-- Medical records + IoT snapshots schema
│   ├── VetTreatment.js             <-- Treatment protocols schema
│   └── VetPrescription.js          <-- Digital Rx schema
├── controllers/
│   └── veterinarianController.js   <-- Full CRUD + IoT Actuator triggers (Buzzer & RGB LED)
└── routes/
    └── veterinarianRoutes.js       <-- Express router mounted at /api/veterinarian
```

### 📡 Backend API Endpoints:

- `GET /api/veterinarian/overview`: Dashboard summary statistics
- `GET /api/veterinarian/appointments`: List appointments with filters
- `POST /api/veterinarian/appointments`: Create appointment
- `PATCH /api/veterinarian/appointments/:id`: Update status / reschedule
- `GET /api/veterinarian/records`: List medical records
- `GET /api/veterinarian/records/:id`: Get medical record by ID
- `POST /api/veterinarian/records`: Create medical record
- `GET /api/veterinarian/treatments`: List treatments
- `POST /api/veterinarian/treatments`: Add treatment course
- `PATCH /api/veterinarian/treatments/:id`: Update treatment status
- `GET /api/veterinarian/prescriptions`: List digital prescriptions
- `POST /api/veterinarian/actuators/buzzer`: Remote buzzer trigger (GPIO10)
- `POST /api/veterinarian/actuators/led`: Set collar RGB LED mode (GPIO1/2/3)

---

## ⚡ IoT Hardware Architecture (ESP32-C3 SuperMini)

```
[Sensors]
  ├─ DS18B20 Temp Probe (GPIO20 with 4.7kΩ pull-up to 3.3V) ─► Live Body Temperature (°C)
  ├─ MPU6050 6-Axis Motion (GPIO6 SCL, GPIO7 SDA via I2C)   ─► Accel X/Y/Z, Gyroscope, Tremors & Gait
  └─ ATGM336H GPS Module (GPIO4 RX, GPIO5 TX via UART)      ─► Live Coordinates, Speed, Altitude, Geofence
[Actuators]
  ├─ 2N2222 Audio Buzzer (GPIO10 via 100Ω to 5V rail)       ─► Doctor Remote Audible Recall / Locator Tone
  └─ RGB LED (GPIO1-Blue, GPIO2-Green, GPIO3-Red via 220Ω)   ─► Real-time Health Status Beacon
[Power]
  └─ TP4056 USB 5V Charger ─► 3.7V Li-Po (300-500mAh) ─► AMS1117-3.3V Voltage Regulator
```

---

## 🚀 How to Import into Target ResQPet Project

1. Copy `veterinarian-package.zip` (or `veterinarian-package/` folder) into the target project root.
2. Run in PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/import_veterinarian_module.ps1
```
3. Ensure the routes are registered:
   - **Frontend**: In `App.tsx` and `DashboardLayout.tsx`
   - **Backend**: In `backend/src/app.js`:
     ```javascript
     const veterinarianRoutes = require('./routes/veterinarianRoutes');
     app.use('/api/veterinarian', veterinarianRoutes);
     ```
