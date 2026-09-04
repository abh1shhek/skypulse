const R = 6371

const rad = (d) => (d * Math.PI) / 180
const deg = (r) => (r * 180) / Math.PI

export function haversine(a, b) {
  if (!a || !b) return 0
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)))
}

export function lerpCoord(a, b, t) {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  }
}

export function bearingBetween(a, b) {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat))
  const x =
    Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) -
    Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng))
  return (deg(Math.atan2(y, x)) + 360) % 360
}

export function seedFrom(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export function formatClock(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`
}

export function statusMeta(status) {
  const s = (status || '').toLowerCase()
  if (s.includes('land')) return { label: 'Landed', tone: 'idle' }
  if (s.includes('cancel')) return { label: 'Cancelled', tone: 'alert' }
  if (s.includes('delay')) return { label: 'Delayed', tone: 'warn' }
  if (s.includes('board')) return { label: 'Boarding', tone: 'warn' }
  if (s.includes('sched')) return { label: 'Scheduled', tone: 'idle' }
  if (s.includes('en') || s.includes('active') || s.includes('air')) {
    return { label: 'En route', tone: 'live' }
  }
  return { label: status || 'Live', tone: 'live' }
}
