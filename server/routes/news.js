const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const { keywords = 'aviation India' } = req.query;

  try {
    const response = await axios.get(
      'http://api.mediastack.com/v1/news',
      {
        params: {
          access_key: process.env.MEDIASTACK_KEY,
          keywords,
          languages: 'en',
          limit: 10,
        },
      }
    );

    const articles = response.data.data.map(a => ({
      title:       a.title,
      description: a.description,
      url:         a.url,
      source:      a.source,
      publishedAt: a.published_at,
    }));

    res.json({ success: true, count: articles.length, data: articles });

  } catch (err) {
    console.error('Mediastack error:', err.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = router;