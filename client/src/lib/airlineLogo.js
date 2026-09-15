export const AIRLINE_SLUGS = {
  'Air India': 'airindia',
  'Air India Express': 'airindia',
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

const SPICEJET_MARK = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e8e6e1"><path d="M3 13.4 12 3.8l9 9.6-3.2.8L12 8.4 6.2 14.2z"/><path d="M8.4 16.2h7.2L12 21z"/></svg>',
)}`

const CUSTOM_SRC = {
  spicejet: SPICEJET_MARK,
}

function compactName(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function airlineSlug(name) {
  if (!name) return null
  if (AIRLINE_SLUGS[name]) return AIRLINE_SLUGS[name]
  const compact = compactName(name)
  if (compact.includes('airindiaexpress')) return 'airindia'
  const hit = Object.keys(AIRLINE_SLUGS).find((key) => compactName(key) === compact)
  return hit ? AIRLINE_SLUGS[hit] : null
}

export function airlineInitials(name) {
  const parts = String(name || 'Airline').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function airlineLogoSrc(name) {
  const custom = CUSTOM_SRC[compactName(name)]
  if (custom) return custom
  const slug = airlineSlug(name)
  if (!slug) return null
  return `https://cdn.simpleicons.org/${slug}/e8e6e1`
}
