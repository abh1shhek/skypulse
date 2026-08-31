const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const limiter      = require('./middleware/rateLimiter');
const flightRoutes = require('./routes/flights');
const newsRoutes   = require('./routes/news');

const app  = express();
const PORT = process.env.PORT || 8000;

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
}));
app.use(express.json());
app.use(limiter);

app.use('/api/flights', flightRoutes);
app.use('/api/news',    newsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`SkyPulse server running on port ${PORT}`);
});