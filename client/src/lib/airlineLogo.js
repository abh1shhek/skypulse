export const AIRLINE_SLUGS = {
  'Air India': 'airindia',
  IndiGo: 'indigo',
  'Virgin Atlantic': 'virginatlantic',
  'Japan Airlines': 'japanairlines',
  Qantas: 'qantas',
  'British Airways': 'britishairways',
  Emirates: 'emirates',
  Lufthansa: 'lufthansa',
  'Singapore Airlines': 'singaporeairlines',
  Qatar: 'qatarairways',
  'Qatar Airways': 'qatarairways',
  'Ethiopian Airlines': 'ethiopianairlines',
  KLM: 'klm',
  'Air France': 'airfrance',
  'Turkish Airlines': 'turkishairlines',
  'Akasa Air': 'akasaair',
  'TAP Air Portugal': 'tapairportugal',
  TAP: 'tapairportugal',
  'American Airlines': 'americanairlines',
}

export function airlineSlug(name) {
  if (!name) return null
  if (AIRLINE_SLUGS[name]) return AIRLINE_SLUGS[name]
  const hit = Object.keys(AIRLINE_SLUGS).find(
    (key) => key.toLowerCase() === String(name).toLowerCase(),
  )
  return hit ? AIRLINE_SLUGS[hit] : null
}

export function airlineInitials(name) {
  const parts = String(name || 'Airline').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function airlineLogoSrc(name) {
  const slug = airlineSlug(name)
  if (!slug) return null
  return `https://cdn.simpleicons.org/${slug}/e8e6e1`
}
