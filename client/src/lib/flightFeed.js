import { MOCK_FLIGHTS } from './mockFlights.js'

const CACHE_KEY = 'skypulse.flights.v1'

function usable(list) {
  if (!Array.isArray(list) || !list.length) return []
  return list.filter((f) => f && (f.id || f.callsign) && f.from && f.to)
}

export function readFlightCache() {
  if (typeof localStorage === 'undefined') return null
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
    const data = usable(parsed?.data)
    if (!data.length || typeof parsed.at !== 'number') return null
    return { at: parsed.at, data }
  } catch {
    return null
  }
}

export function writeFlightCache(data) {
  if (typeof localStorage === 'undefined') return
  const cleaned = usable(data)
  if (!cleaned.length) return
  localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: cleaned }))
}

export function fallbackFlights() {
  const cached = readFlightCache()
  if (cached) return { data: cached.data, source: 'cache' }
  return { data: MOCK_FLIGHTS, source: 'mock' }
}

export function takeLiveFlights(raw) {
  const data = usable(raw)
  if (!data.length) return null
  writeFlightCache(data)
  return { data, source: 'live' }
}
