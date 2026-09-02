const express = require('express');
const axios   = require('axios');
const router  = express.Router();

router.get('/', async (req, res) => {
  const { flight_iata, dep_iata, arr_iata } = req.query;

  const params = {
    access_key: process.env.AVIATIONSTACK_KEY,
    limit: 10,
  };

  if (flight_iata) params.flight_iata = flight_iata;
  if (dep_iata)    params.dep_iata    = dep_iata;
  if (arr_iata)    params.arr_iata    = arr_iata;

  console.log('→ KEY being used:', process.env.AVIATIONSTACK_KEY ? 'present' : 'MISSING');
  console.log('→ Params:', params);

  try {
    const response = await axios.get(
      'http://api.aviationstack.com/v1/flights',
      { params }
    );

    console.log('→ Raw count:', response.data?.data?.length);

    const flights = (response.data.data || []).map(f => ({
      id:       f.flight?.iata    || f.flight?.number || 'N/A',
      callsign: f.flight?.icao   || 'N/A',
      airline:  f.airline?.name  || 'Unknown',
      aircraft: f.aircraft?.iata || f.aircraft?.icao || 'N/A',
      status:   f.flight_status  || 'unknown',
      from:     f.departure?.iata    || '',
      fromCity: f.departure?.airport || '',
      fromTz:   f.departure?.timezone || '',
      to:       f.arrival?.iata    || '',
      toCity:   f.arrival?.airport || '',
      toTz:     f.arrival?.timezone || '',
      scheduled: [
        f.departure?.scheduled || null,
        f.arrival?.scheduled   || null,
      ],
      actual: [
        f.departure?.actual || f.departure?.estimated || null,
        f.arrival?.actual   || f.arrival?.estimated   || null,
      ],
      lat:     f.live?.latitude         || null,
      lng:     f.live?.longitude        || null,
      speed:   f.live?.speed_horizontal || 0,
      alt:     f.live?.altitude         || 0,
      bearing: f.live?.direction        || 0,
      dist:    0,
      flown:   0,
    }));

    res.json({ success: true, count: flights.length, data: flights });

  } catch (err) {
    console.error('→ Error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch flight data',
      detail: err.response?.data || err.message,
    });
  }
});

module.exports = router;