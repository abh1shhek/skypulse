const express = require('express');
const axios = require('axios');
const router = express.Router();

const TTL_MS = 30 * 60 * 1000
const cache = new Map()

router.get('/', async (req, res) => {
  const keywords = String(req.query.keywords || 'aviation India')
  const hit = cache.get(keywords)
  if (hit && Date.now() - hit.at < TTL_MS) {
    return res.json({ success: true, count: hit.data.length, data: hit.data, cached: true })
  }

  if (!process.env.MEDIASTACK_KEY) {
    return res.json({ success: true, count: 0, data: [] })
  }

  try {
    const response = await axios.get('http://api.mediastack.com/v1/news', {
      params: {
        access_key: process.env.MEDIASTACK_KEY,
        keywords,
        languages: 'en',
        limit: 6,
      },
    })

    const articles = (response.data.data || []).map((a) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      source: a.source,
      publishedAt: a.published_at,
    }))

    cache.set(keywords, { at: Date.now(), data: articles })
    res.json({ success: true, count: articles.length, data: articles })
  } catch (err) {
    const status = err.response?.status
    if (hit?.data) {
      return res.json({ success: true, count: hit.data.length, data: hit.data, cached: true })
    }
    if (status === 429) {
      return res.json({ success: true, count: 0, data: [], degraded: 'rate_limited' })
    }
    console.error('Mediastack error:', err.response?.status || err.message)
    res.json({ success: true, count: 0, data: [] })
  }
})

module.exports = router
