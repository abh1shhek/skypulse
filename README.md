# SkyPulse

Live flight tracking dashboard. Frontend on Vercel, API on Render.

## Local

```bash
# API
cd server
cp .env.example .env   # add Aviationstack + Mediastack keys
npm install
npm run dev

# UI
cd client
npm install
npm run dev
```

Open http://localhost:5173 — Vite proxies `/api` to port 8000.

## Deploy

### Render (backend)

1. New Web Service, root directory `server`
2. Build: `npm install` · Start: `npm start`
3. Env vars: `AVIATIONSTACK_KEY`, `MEDIASTACK_KEY`, `CLIENT_ORIGIN` (your Vercel URL, e.g. `https://skypulse.vercel.app`)

### Vercel (frontend)

1. Root directory: `client`
2. Env: `VITE_API_URL` = `https://<your-render-service>.onrender.com/api`
3. Redeploy after setting the env var (Vite inlines it at build time)

## API

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Status |
| `GET /api/flights?dep_iata=DEL` | Flights by departure |
| `GET /api/news?keywords=aviation` | News |
