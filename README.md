# CommuteIQ – Hyperlocal Commute & Safety Assistant (Backend, Solo‑MVP)

Backend that scores daily routes using live ETA, weather, and air quality, lets users report nearby incidents, and pushes low‑score alerts over WebSocket.

## ✨ Features (MVP)
- JWT auth (email/password)
- Save routes: `from(lat,lng) → to(lat,lng)`
- Route scoring: **ETA (Mapbox)** + **Weather (OpenWeather)** + **AQI (WAQI)** → 0–100
- Crowd‑sourced incidents: report + fetch nearby
- Real‑time alerts via **WebSocket** when score < threshold
- Swagger docs at `/docs`
- Dockerized, CI‑ready

---

## 🧱 Stack
- **Node.js + Fastify (TypeScript)**
- **PostgreSQL** (users, routes, incidents)
- **Zod** for validation, **bcryptjs**, **jsonwebtoken**
- **Undici** for HTTP calls, **Pino** logs
- **Swagger** via `@fastify/swagger` + UI
- **Jest** sample tests (optional to expand)
- **Docker Compose** (Postgres + API)
- **GitHub Actions** (lint/build)

---

## 🗂️ API (MVP)
```
POST   /auth/register
POST   /auth/login
POST   /routes                  (auth) save route
GET    /routes                  (auth) list your routes
GET    /routes/:id/score        (auth) live score {eta, penalties, score}
POST   /incidents/report        (auth) create
GET    /incidents/nearby?lat=&lng=&radius=   (auth)
GET    /healthz
WS     /ws                      (server broadcasts {routeId, score, reason})
```

**Score**: `100 - 0.8*eta_min - weather_penalty - aqi_penalty` (clamped 0..100)  
- Weather penalty: rain ⇒ +12; feels_like ≥35 ⇒ +10; 30..34.9 ⇒ +5  
- AQI penalty: ≤100:0, ≤150:10, ≤200:20, ≤300:35, else 45

---

## 🔑 Environment
Copy `.env.example` to `.env` and fill keys:
```
PORT=8080
DATABASE_URL=postgres://postgres:postgres@localhost:5432/commuteiq
JWT_SECRET=change-me
MAPS_API_KEY=your-mapbox-key
OWM_API_KEY=your-openweather-key
WAQI_TOKEN=your-waqi-token
```

> You can stub external calls at first run if keys aren’t ready (the code defaults to safe fallbacks).

---

## 🚀 Local Dev
```bash
# 1) Start Postgres
docker compose up -d db

# 2) Install deps
npm ci

# 3) Run DB migrations
npm run migrate

# 4) Start dev server
npm run dev
# -> http://localhost:8080/docs
```

### Quick Test (curl)
```bash
# Register
curl -s -X POST http://localhost:8080/auth/register   -H "content-type: application/json"   -d '{"email":"me@example.com","password":"secret123"}'

# Login -> copy access_token
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login   -H "content-type: application/json"   -d '{"email":"me@example.com","password":"secret123"}' | jq -r .access_token)

# Save route
curl -s -X POST http://localhost:8080/routes   -H "authorization: bearer $TOKEN" -H "content-type: application/json"   -d '{"name":"Home→Campus","from":{"lat":19.076,"lng":72.8777},"to":{"lat":19.073,"lng":72.899}}'

# Score route (replace :id)
curl -s -X GET http://localhost:8080/routes/1/score -H "authorization: bearer $TOKEN"
```

---

## 🌐 Deploy (free‑friendly)

### Option A: **Render**
1. Fork this repo.  
2. Create a **Render PostgreSQL** instance (free). Copy its connection string to **DATABASE_URL**.  
3. Create a **Web Service**:  
   - Runtime: Node 20  
   - Build Command: `npm ci && npm run build`  
   - Start Command: `node dist/server.js`  
4. Add env vars: `JWT_SECRET`, `MAPS_API_KEY`, `OWM_API_KEY`, `WAQI_TOKEN`, `DATABASE_URL`.  
5. Run migration once from Render shell:  
   ```bash
   npm run migrate
   ```
6. Open `https://<your-service>.onrender.com/docs`

*(Alternatively use the provided `Render.yaml` blueprint: **Blueprints → New from Blueprint**.)*

### Option B: **Railway**
1. Fork repo → **New Project** → **Deploy from GitHub**.  
2. Add **PostgreSQL** plugin; set `DATABASE_URL` to provided variable.  
3. Variables: `JWT_SECRET`, `MAPS_API_KEY`, `OWM_API_KEY`, `WAQI_TOKEN`.  
4. Build: `npm ci && npm run build`  
5. Start: `node dist/server.js`  
6. Open domain → `/docs`

---

## 🧪 Postman
Import `CommuteIQ.postman_collection.json` and use the **Pre‑request Script** tab to inject the token once you log in. Collection includes auth/register, auth/login, routes save/list/score, incidents report/nearby, health.

---

## 🧭 Project Layout (what you will add)
```
src/
  server.ts               # Fastify app, swagger, ws
  config.ts               # env loader
  db.ts                   # pg pool
  scoring.ts              # penalties + final score
  services/               # maps.ts, weather.ts, aqi.ts
  auth/                   # routes.ts, service.ts
  routes/                 # routes.routes.ts, routes.service.ts
  incidents/              # incidents.routes.ts
  ws.ts                   # /ws & broadcast helper
```

> Full TypeScript sources are in the chat; copy them into `src/` to complete the scaffold.

---

## 🛡️ Production Notes (future)
- Add rate‑limiting (e.g., `@fastify/rate-limit`)
- Persist WS alerts to DB + email/Push later
- Add Redis TTL caching for API calls
- Replace Haversine JS with PostGIS (optional)
- More tests and CI gates
