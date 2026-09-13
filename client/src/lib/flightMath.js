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

function toCartesian(p) {
  const φ = rad(p.lat)
  const λ = rad(p.lng)
  return [Math.cos(φ) * Math.cos(λ), Math.cos(φ) * Math.sin(λ), Math.sin(φ)]
}

function fromCartesian(x, y, z) {
  return { lat: deg(Math.asin(Math.min(1, Math.max(-1, z)))), lng: deg(Math.atan2(y, x)) }
}

export function slerpCoord(a, b, t) {
  if (!a || !b) return a || b || { lat: 0, lng: 0 }
  if (t <= 0) return { lat: a.lat, lng: a.lng }
  if (t >= 1) return { lat: b.lat, lng: b.lng }
  const A = toCartesian(a)
  const B = toCartesian(b)
  const d = Math.min(1, Math.max(-1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]))
  const omega = Math.acos(d)
  if (omega < 1e-6) return lerpCoord(a, b, t)
  const sinO = Math.sin(omega)
  const s1 = Math.sin((1 - t) * omega) / sinO
  const s2 = Math.sin(t * omega) / sinO
  return fromCartesian(A[0] * s1 + B[0] * s2, A[1] * s1 + B[1] * s2, A[2] * s1 + B[2] * s2)
}

export function geodesicPoints(a, b, steps = 48) {
  const n = Math.max(2, steps)
  const pts = []
  for (let i = 0; i <= n; i++) pts.push(slerpCoord(a, b, i / n))
  return pts
}

export function headingAlong(a, b, t) {
  const p0 = slerpCoord(a, b, Math.max(0, t - 0.004))
  const p1 = slerpCoord(a, b, Math.min(1, t + 0.004))
  return bearingBetween(p0, p1)
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
