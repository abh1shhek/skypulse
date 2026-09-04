import { airportOf } from './airports'
import { bearingBetween, haversine, lerpCoord, seedFrom } from './flightMath'

const MODELS = {
  A20N: 'Airbus A320neo',
  A21N: 'Airbus A321neo',
  A320: 'Airbus A320-200',
  A321: 'Airbus A321-200',
  A333: 'Airbus A330-300',
  B738: 'Boeing 737-800',
  B38M: 'Boeing 737 MAX 8',
  B77W: 'Boeing 777-300ER',
  B788: 'Boeing 787-8',
  B789: 'Boeing 787-9',
}

const REG_PREFIX = {
  'Air India': 'VT',
  IndiGo: 'VT',
  Vistara: 'VT',
  SpiceJet: 'VT',
  Akasa: 'VT',
  Emirates: 'A6',
  'Air Arabia': 'A6',
  flydubai: 'A6',
}

function hashUnit(seed, min, max) {
  return min + (seed % (max - min + 1))
}

function cityName(raw, code) {
  if (raw && !raw.includes('Airport')) return raw.split('/')[0]
  return airportOf(code)?.city || raw?.split(' ')[0] || code
}

export function enrichFlights(raw = []) {
  return raw.map((f, i) => {
    const uid = `${f.id || 'FLT'}-${f.from || 'XXX'}-${f.to || 'YYY'}-${i}`
    const seed = seedFrom(uid)
    const origin = airportOf(f.from)
    const dest = airportOf(f.to)
    const dist = origin && dest ? Math.round(haversine(origin, dest)) : f.dist || 0
    const progress = Math.min(0.92, Math.max(0.08, ((seed % 780) + 80) / 1000))
    const pos =
      f.lat && f.lng
        ? { lat: f.lat, lng: f.lng }
        : origin && dest
          ? lerpCoord(origin, dest, progress)
          : origin || dest || { lat: 22, lng: 78 }

    const bearing =
      f.bearing || (origin && dest ? bearingBetween(origin, dest) : 45)
    const speed = f.speed > 40 ? f.speed : hashUnit(seed, 740, 910)
    const alt = f.alt > 100 ? f.alt : hashUnit(seed >> 3, 9800, 12500)
    const flown = dist ? Math.round(dist * progress) : 0
    const remaining = Math.max(0, dist - flown)
    const elapsedMin = dist ? Math.round((flown / Math.max(speed, 1)) * 60) : 0
    const remainMin = dist ? Math.round((remaining / Math.max(speed, 1)) * 60) : 0
    const icaoType = f.aircraft && f.aircraft !== 'N/A' ? f.aircraft : ['A20N', 'B38M', 'A321', 'B738'][seed % 4]
    const airline = f.airline || 'Unknown'
    const prefix = REG_PREFIX[airline] || 'VT'
    const registration = f.registration || `${prefix}-${String.fromCharCode(65 + (seed % 26))}${String(seed % 9000 + 1000).slice(0, 4)}`

    return {
      ...f,
      uid,
      aircraft: icaoType,
      aircraftModel: MODELS[icaoType] || `Type ${icaoType}`,
      airline,
      fromCity: cityName(f.fromCity, f.from),
      toCity: cityName(f.toCity, f.to),
      fromTz: f.fromTz || origin?.tz || 'UTC',
      toTz: f.toTz || dest?.tz || 'UTC',
      lat: pos.lat,
      lng: pos.lng,
      origin,
      dest,
      bearing,
      speed,
      alt,
      heading: Math.round(bearing),
      dist,
      flown,
      remaining,
      progress,
      elapsedMin,
      remainMin,
      registration,
      country: prefix === 'VT' ? 'India' : prefix === 'A6' ? 'UAE' : '—',
      category: 'Passenger',
      gate: f.gate || `${['A', 'B', 'C', 'D'][seed % 4]}${hashUnit(seed, 2, 28)}`,
      terminal: f.terminal || String((seed % 3) + 1),
      age: `${hashUnit(seed >> 5, 1, 11)}y`,
      _seed: seed,
    }
  })
}

export function tickFlight(f, dt = 1) {
  const nextProgress = Math.min(0.97, f.progress + (0.00022 * dt))
  const origin = f.origin
  const dest = f.dest
  const pos = origin && dest ? lerpCoord(origin, dest, nextProgress) : { lat: f.lat, lng: f.lng }
  const speed = Math.max(420, f.speed + Math.sin((Date.now() / 900) + (f._seed % 50)) * 1.4)
  const alt = Math.max(300, f.alt + Math.cos((Date.now() / 1400) + (f._seed % 40)) * 8)
  const flown = f.dist ? Math.round(f.dist * nextProgress) : f.flown
  const remaining = Math.max(0, (f.dist || 0) - flown)
  return {
    ...f,
    progress: nextProgress,
    lat: pos.lat,
    lng: pos.lng,
    speed,
    alt,
    flown,
    remaining,
    elapsedMin: f.dist ? Math.round((flown / Math.max(speed, 1)) * 60) : f.elapsedMin,
    remainMin: f.dist ? Math.round((remaining / Math.max(speed, 1)) * 60) : f.remainMin,
  }
}
