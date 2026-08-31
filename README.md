# SkyPulse ✈️

Real-time flight tracking and aviation news dashboard.

## Tech Stack
- **Backend:** Node.js, Express, Axios
- **Frontend:** React, Vite, Tailwind CSS, Leaflet.js *(coming soon)*
- **APIs:** Aviationstack, Mediastack
- **Deploy:** Render (server) · Vercel (client)

## Features
- Live flight tracking on an interactive dark map
- Search by flight number or route (DEL → BOM)
- Real-time aviation news by airline or city
- Secure API proxy — keys never exposed to client
- Rate limiting to protect free API quota

## Local Setup

### Backend
```bash
cd server
npm install
cp .env.example .env
# Add your API keys to .env
npm run dev
```

### API Endpoints
| Endpoint | Description |
|----------|-------------|
| `GET /health` | Server status |
| `GET /api/flights?dep_iata=DEL` | Flights by departure |
| `GET /api/flights?flight_iata=AI302` | Flight by number |
| `GET /api/news?keywords=Air+India` | Aviation news |
