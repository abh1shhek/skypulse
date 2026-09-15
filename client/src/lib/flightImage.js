import cabin from '../assets/aircraft-hero.png'
import landing from '../assets/flights/landing.jpg'
import cruise from '../assets/flights/cruise.jpg'
import taxi from '../assets/flights/taxi.jpg'
import wide from '../assets/flights/wide.jpg'

const STILLS = {
  cabin: { src: cabin, position: '28% 46%' },
  landing: { src: landing, position: '50% 42%' },
  cruise: { src: cruise, position: '50% 48%' },
  taxi: { src: taxi, position: '50% 50%' },
  wide: { src: wide, position: '50% 28%' },
}

const BY_AIRLINE = {
  'Air India': 'cabin',
  IndiGo: 'taxi',
  Vistara: 'cruise',
  SpiceJet: 'landing',
  Akasa: 'taxi',
  Emirates: 'wide',
  'Air Arabia': 'landing',
  flydubai: 'cruise',
  'British Airways': 'wide',
  Lufthansa: 'wide',
  'Singapore Airlines': 'wide',
  Qatar: 'wide',
}

function stillForAirframe(code) {
  const t = String(code || '').toUpperCase()
  if (/B77|B78|A33|A35|A38|B74/.test(t)) return 'wide'
  if (/ATR|DH8|E1|E7|CRJ/.test(t)) return 'taxi'
  if (/B73|B38|A32/.test(t)) return 'landing'
  return 'cruise'
}

export function resolveFlightImage(flight) {
  const key = BY_AIRLINE[flight?.airline] || stillForAirframe(flight?.aircraft)
  return STILLS[key] || STILLS.cruise
}
