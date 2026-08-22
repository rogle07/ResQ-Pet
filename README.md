# PetGuardian

**AI & IoT Based Smart Pet Rescue, Tracking & Care Management System**

PetGuardian connects pet owners, rescue teams, NGOs/shelters, foster homes,
veterinarians, and finders around one live picture of a pet's location and
wellbeing — fed by a smart collar (ESP32 + GPS + accelerometer +
temperature) over MQTT, with automatic emergency detection and rescue
coordination.

```
ESP32 collar → MQTT broker → backend bridge → REST API → MongoDB
                                                    ↓
                                              Socket.io (live)
                                                    ↓
                                          React dashboards (7 roles)
```

## Project structure

```
petguardian/
├── backend/       Node.js/Express REST API, MongoDB models, Socket.io, MQTT bridge
├── frontend/      React 18 + TypeScript + Tailwind, role-based dashboards
├── firmware/      ESP32 smart collar firmware (PlatformIO)
├── mosquitto/      MQTT broker config for docker-compose
└── docker-compose.yml
```

## Features

- **Auth**: email/password + Google OAuth, JWT access + refresh tokens, email verification
- **Pets**: full profiles, vaccinations, QR tag generation, safe-zone geo-fencing
- **IoT/GPS**: live collar ingestion, 4-rule emergency detection (geo-fence exit, high temperature, no movement, sudden fall)
- **Rescue Requests**: creation, acceptance, live status timeline, real-time dashboard broadcast
- **Found Reports**: finder submission with automatic proximity-based matching against lost pets
- **Foster Care**: request → accept/reject → in-thread chat → completion
- **Adoption**: listing, browsing/filtering, application, approval workflow
- **Donations**: Stripe payment intents, webhook confirmation, analytics
- **NGO tools**: animal management, medical records, adoption review
- **Admin**: user/org verification, platform-wide analytics, system settings
- **Notifications**: in-app + real-time via Socket.io, FCM-ready

## Quick start (Docker)

The fastest way to run the whole stack locally.

1. **Backend config**
   ```bash
   cp backend/.env.example backend/.env
   ```
   At minimum, set `JWT_SECRET` and `JWT_REFRESH_SECRET` to random strings.
   Other integrations (Stripe, Cloudinary, Google OAuth, SMTP) are optional
   for a basic run — features using them will simply error until configured.

2. **Frontend config**
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   Maps use Leaflet + OpenStreetMap, which is free and needs no key or
   account setup — nothing to configure here for the live tracking map.

3. **Run everything**
   ```bash
   docker-compose up --build
   ```

4. **Open the app**
   - Frontend: http://localhost:8080
   - Backend health check: http://localhost:5000/api/health
   - MongoDB: localhost:27017
   - MQTT broker: localhost:1883

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for production hardening, environment
variable reference, and cloud deployment notes.

## Local development (without Docker)

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI at minimum (e.g. a local mongod)
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
The Vite dev server proxies `/api` to `http://localhost:5000` automatically
(see `frontend/vite.config.ts`), so you don't need nginx for local dev.

**MQTT (optional, only needed to test the IoT pipeline)**
```bash
# macOS: brew install mosquitto && mosquitto -v
# Linux: apt install mosquitto && mosquitto -c mosquitto/config/mosquitto.conf
```

## Firmware

See [`firmware/README.md`](./firmware/README.md) for the ESP32 collar's bill
of materials, wiring diagram, and PlatformIO build instructions.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Redux Toolkit, React Router v6, React Hook Form, Leaflet + OpenStreetMap, Recharts, Socket.io client |
| Backend | Node.js, Express, MongoDB/Mongoose, Socket.io, MQTT, JWT, Stripe, Cloudinary |
| IoT | ESP32, NEO-6M GPS, MPU6050, DS18B20, MQTT (Mosquitto) |
| Infra | Docker, docker-compose, nginx |

## Documentation

- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — environment variables, production checklist, cloud deployment
- [`backend/.env.example`](./backend/.env.example) — every backend environment variable, documented
- [`frontend/.env.example`](./frontend/.env.example) — frontend environment variables
- [`firmware/README.md`](./firmware/README.md) — collar hardware and build guide

## Status

All 12 core modules (Auth, Pets, IoT/GPS, Rescue, Found Reports, Foster,
Adoption, Donations, NGO, Notifications, Admin, plus real-time layer) are
implemented across backend, frontend, and firmware. Backend and frontend
code has been syntax/type-checked at every stage of development; firmware
has been reviewed carefully but not compiled or run on physical hardware
(see the honesty note in `firmware/README.md`).

# ResQ-Pet
