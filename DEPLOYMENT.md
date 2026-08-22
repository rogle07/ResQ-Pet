# Deployment Guide

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Notes |
|---|---|---|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | Yes | Defaults to 5000 |
| `CLIENT_URL` | Yes | Used for CORS and links in emails; your frontend's origin |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Yes | Random, unique, ≥32 chars. **Never reuse example values.** |
| `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | No | Defaults: 7d / 30d |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Only for Google login | From Google Cloud Console OAuth credentials |
| `CLOUDINARY_*` | Only for image uploads | Pet photos, rescue/found-report photos won't upload without this |
| `SMTP_*` / `EMAIL_FROM` | Only for email | Verification and password-reset emails |
| `FIREBASE_*` | Only for push notifications | Not wired into a push-sending call yet — FCM tokens are collected (`POST /api/notifications/fcm-token`) but no send path exists; add one before relying on push |
| `GOOGLE_MAPS_API_KEY` | Not used | Maps are rendered with Leaflet + OpenStreetMap, which needs no key. This variable is unused and can be removed unless you add server-side geocoding later. |
| `MQTT_BROKER_URL` / `MQTT_USERNAME` / `MQTT_PASSWORD` | Only for IoT | Needed if collars will publish over MQTT |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Only for donations | From your Stripe dashboard; webhook secret comes from the endpoint you register |
| `IOT_DEVICE_KEY` | Yes if using IoT | Shared secret collars/bridge use to authenticate `/api/iot/reading` |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | No | Defaults: 15 min / 200 requests |

### Frontend (`frontend/.env`)

No environment variables are required for maps — PetGuardian uses Leaflet
with free OpenStreetMap tiles, which needs no API key, account, or billing
setup. `frontend/.env.example` is kept as a placeholder for any
frontend-only service you add later.

## Production checklist

- [ ] Generate strong, unique `JWT_SECRET` / `JWT_REFRESH_SECRET` — don't ship the example values
- [ ] Set `NODE_ENV=production` (disables stack traces in error responses, enables tighter Mongoose index behavior)
- [ ] Use a managed MongoDB (Atlas or similar) with authentication enabled, or lock down a self-hosted instance's network access
- [ ] Put the backend behind HTTPS (terminate TLS at a load balancer or reverse proxy — the app itself serves plain HTTP)
- [ ] Lock down Mosquitto: switch `mosquitto/config/mosquitto.conf` from `allow_anonymous true` to password-file auth (instructions are in that file's comments) before exposing port 1883 beyond your own network
- [ ] Register your real Stripe webhook endpoint and use its actual signing secret, not a placeholder
- [ ] Set real `CLIENT_URL` so CORS, email verification links, and password-reset links point at your actual frontend domain
- [ ] Review rate limits (`RATE_LIMIT_MAX`, and the stricter auth-route limiter in `authRoutes.js`) for your expected traffic
- [ ] Set up log rotation for `backend/logs/*.log` (winston writes there; nothing rotates them automatically)
- [ ] Decide on a real push-notification send path if you need FCM — token collection exists, but no send integration has been wired in yet

## Securing MQTT

The default `mosquitto.conf` allows anonymous connections so `docker-compose
up` works immediately for local development and demos. Before exposing the
broker beyond a trusted local network:

1. Generate a password file:
   ```bash
   docker exec -it petguardian-mosquitto mosquitto_passwd -c /mosquitto/config/passwd petguardian
   ```
2. In `mosquitto/config/mosquitto.conf`, comment out `allow_anonymous true`
   and uncomment the `allow_anonymous false` / `password_file` lines.
3. Restart the mosquitto container.
4. Make sure `MQTT_USERNAME` / `MQTT_PASSWORD` in `backend/.env` and
   `firmware/include/config.h` match what you set in step 1.

For internet-facing deployments, prefer MQTTS (TLS on port 8883) with
per-device credentials over the shared example broker user — this compose
setup uses a single shared username for simplicity, which is fine for a
diploma project demo but not for a real fleet of collars.

## Cloud deployment options

This is a fairly standard containerized Node + static-frontend + MongoDB +
MQTT stack, so any of the usual approaches work:

- **Single VPS** (DigitalOcean, Linode, a cheap EC2 instance): install
  Docker + docker-compose, clone the repo, follow the Quick Start in the
  main README, put nginx or Caddy in front for TLS.
- **Split hosting**: MongoDB Atlas (managed DB) + Railway/Render/Fly.io for
  the backend container + Vercel/Netlify/Cloudflare Pages for the static
  frontend build (`frontend/dist` after `npm run build`) + a small VPS or
  managed MQTT service (HiveMQ Cloud, EMQX Cloud) for the broker.
- **Kubernetes**: the Dockerfiles are standard multi-stage builds and would
  translate directly into Deployments/Services; this repo doesn't include
  k8s manifests since that's a meaningful step up in scope from a diploma
  project's needs, but the container images themselves are k8s-ready.

Whichever you choose, the one hard requirement is that the backend must be
reachable by both the frontend (for `/api` and `/socket.io`) and the MQTT
bridge process needs network access to the broker — they don't have to be
on the same host, just mutually reachable with the right URLs in `.env`.
