const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const { flight_iata, dep_iata, arr_iata } = req.query;

  try {
    const params = {
      access_key: process.env.AVIATIONSTACK_KEY,
      limit: 10,
    };

    if (flight_iata) params.flight_iata = flight_iata;
    if (dep_iata)    params.dep_iata    = dep_iata;
    if (arr_iata)    params.arr_iata    = arr_iata;

    const response = await axios.get(
      'http://api.aviationstack.com/v1/flights',
      { params }
    );

    const flights = response.data.data.map(f => ({
      id:       f.flight.iata,
      callsign: f.flight.icao,
      airline:  f.airline.name,
      aircraft: f.aircraft?.iata || 'N/A',
      status:   f.flight_status,
      from:     f.departure.iata,
      fromCity: f.departure.airport,
      fromTz:   f.departure.timezone,
      to:       f.arrival.iata,
      toCity:   f.arrival.airport,
      toTz:     f.arrival.timezone,
      scheduled: [
        f.departure.scheduled,
        f.arrival.scheduled
      ],
      actual: [
        f.departure.actual || f.departure.estimated,
        f.arrival.actual   || f.arrival.estimated,
      ],
      lat:   f.live?.latitude         || null,
      lng:   f.live?.longitude        || null,
      speed: f.live?.speed_horizontal || 0,
      alt:   f.live?.altitude         || 0,
    }));

    res.json({ success: true, count: flights.length, data: flights });

  } catch (err) {
    console.error('Aviationstack error:', err.message);
    res.status(500).json({ error: 'Failed to fetch flight data' });
  }
});

module.exports = router;