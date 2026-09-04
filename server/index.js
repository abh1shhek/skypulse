const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const limiter      = require('./middleware/rateLimiter');
const flightRoutes = require('./routes/flights');
const newsRoutes   = require('./routes/news');

const app  = express();
const PORT = process.env.PORT || 8000;

const extraOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    const allowed =
      extraOrigins.includes(origin) ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
      origin.endsWith('.vercel.app');
    return cb(null, allowed);
  },
}));
app.use(express.json());
app.use(limiter);

app.use('/api/flights', flightRoutes);
app.use('/api/news',    newsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SkyPulse server running on port ${PORT}`);
});
