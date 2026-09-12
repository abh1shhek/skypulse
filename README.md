# SkyPulse

Real-time flight tracking dashboard with live map visualization and a full client/server architecture. Built to demonstrate live-data handling, geospatial computation, and API design.

[Live Demo](https://skypulse-dash.vercel.app)

## Overview

SkyPulse ingests live flight data from a third-party aviation API, normalizes it on the server, and enriches it on the client with derived telemetry — great-circle distance, bearing, ETA, and flight progress — computed from raw position and schedule data. Between polling intervals, aircraft positions are interpolated client-side so the map reflects continuous motion rather than discrete API snapshots.

The system is split into two independently deployable services: an Express API that proxies and caches third-party data (keeping provider keys server-side), and a React SPA that owns all presentation logic and derived state.

## System Design

```
client/                 React SPA (Vite)
├─ components/           Map rendering, flight list, detail panel, search
├─ store/                 Zustand store — flights, selection, polling, search state
├─ lib/                   Flight math (haversine, bearing, interpolation), enrichment pipeline
└─ services/              Axios client for the internal API

server/                 Express API
├─ routes/flights.js      Aviationstack proxy → normalized flight schema
├─ routes/news.js         Mediastack proxy with in-memory TTL cache
└─ middleware/             Rate limiting, CORS allowlist, security headers
```

**Key design decisions:**

- **Server-side normalization, client-side enrichment.** The API returns a stable, minimal flight schema regardless of upstream provider shape. All derived fields (distance, bearing, progress, ETA) are computed client-side from static airport coordinates, keeping the server stateless and cheap to run.
- **Interpolated motion between polls.** Aircraft positions are advanced on a client-side tick rather than re-fetched every frame, avoiding unnecessary API load while keeping the map visually live.
- **TTL-cached news proxy.** The news endpoint caches upstream responses in memory for 30 minutes and falls back to the last good cache on upstream failure or rate-limiting (HTTP 429), so a degraded third-party dependency doesn't break the UI.
- **Origin allowlisting instead of a wildcard.** CORS is scoped to configured origins plus localhost and `*.vercel.app` preview deployments, rather than `Access-Control-Allow-Origin: *`.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Zustand, Leaflet, Tailwind CSS v4 |
| Backend | Node.js, Express 5, Axios |
| Hardening | Helmet, CORS allowlisting, `express-rate-limit` |
| Data sources | Aviationstack (flights), Mediastack (news) |
| Deployment | Vercel (frontend), Render (backend) |

## Getting Started

```bash
# API
cd server
cp .env.example .env      # add Aviationstack + Mediastack keys
npm install
npm run dev                # http://localhost:8000

# Client
cd client
npm install
npm run dev                # http://localhost:5173, proxies /api -> :8000
```

### Environment Variables

**`server/.env`**

| Variable | Description |
|---|---|
| `AVIATIONSTACK_KEY` | API key for flight data |
| `MEDIASTACK_KEY` | API key for news feed |
| `CLIENT_ORIGIN` | Comma-separated allowed origins for CORS |
| `PORT` | Server port (default `8000`) |

**`client/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the deployed API (inlined at build time) |

## Deployment

**Backend (Render)** — root directory `server`; build `npm install`; start `npm start`; set `AVIATIONSTACK_KEY`, `MEDIASTACK_KEY`, `CLIENT_ORIGIN`.

**Frontend (Vercel)** — root directory `client`; set `VITE_API_URL` to the deployed Render URL; redeploy after changing env vars, since Vite inlines them at build time.

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Service status check |
| `/api/flights` | GET | Flights by `dep_iata`, `arr_iata`, or `flight_iata` |
| `/api/news` | GET | Aviation news by `keywords`, cached 30 min server-side |

## Roadmap

- Replace client-side polling/interpolation with WebSocket push updates
- Persist historical flight paths for playback
- Test coverage for the flight-math and enrichment modules
- User accounts with saved/favorited routes
 
## Future Improvements
 
- WebSocket-based live updates instead of client-side interpolation between polls
- Persist and replay historical flight paths
- Unit tests around the flight-math and enrichment utilities
- Auth + saved/favorited flights per user

