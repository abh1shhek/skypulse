import { useEffect, useMemo, useState } from 'react'
import FlightCard from './FlightCard'
import { getWeather } from '../services/api'
import { statusMeta } from '../lib/flightMath'
import { AIRPORTS } from '../lib/airports'

function Header({ eyebrow, title, detail }) {
  return (
    <header className="ops-view__head">
      <div>
        <span className="ops-view__eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{detail}</p>
      </div>
    </header>
  )
}

function FlightList({ flights, selectedId, followed, onSelect, empty, emptyAction }) {
  if (!flights.length) {
    return (
      <div className="ops-empty">
        <strong>Nothing on radar</strong>
        <span>{empty}</span>
        {emptyAction}
      </div>
    )
  }
  return (
    <div className="ops-list">
      {flights.map((flight) => (
        <FlightCard
          key={flight.uid}
          flight={flight}
          followed={Boolean(followed?.[flight.uid])}
          selected={flight.uid === selectedId}
          onClick={() => onSelect(flight.uid)}
        />
      ))}
    </div>
  )
}

const WX = {
  0: 'Clear',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  61: 'Rain',
  71: 'Snow',
  80: 'Showers',
  95: 'Thunderstorm',
}

function wxLabel(code) {
  return WX[code] || 'Conditions available'
}

function WeatherCard({ title, code, point, data, err }) {
  const current = data?.current
  return (
    <div className="ops-wx">
      <span className="ops-view__eyebrow">{title}</span>
      <strong>{code}</strong>
      <p>{point?.city || 'Airport'}</p>
      {err && <span>Unable to load METAR-style snapshot.</span>}
      {!err && !current && <span>Loading…</span>}
      {current && (
        <dl>
          <div><dt>Sky</dt><dd>{wxLabel(current.weather_code)}</dd></div>
          <div><dt>Temp</dt><dd className="num">{Math.round(current.temperature_2m)}°C</dd></div>
          <div><dt>Wind</dt><dd className="num">{Math.round(current.wind_speed_10m)} km/h</dd></div>
          <div><dt>Humidity</dt><dd className="num">{Math.round(current.relative_humidity_2m)}%</dd></div>
        </dl>
      )}
    </div>
  )
}

function WeatherPanel({ flight }) {
  const origin = flight?.origin || AIRPORTS.DEL
  const dest = flight?.dest || AIRPORTS.BOM
  const from = flight?.from || 'DEL'
  const to = flight?.to || 'BOM'
  const [pack, setPack] = useState({ from: null, to: null, err: false })

  useEffect(() => {
    let cancelled = false
    Promise.all([getWeather(origin.lat, origin.lng), getWeather(dest.lat, dest.lng)])
      .then(([a, b]) => {
        if (!cancelled) setPack({ from: a, to: b, err: false })
      })
      .catch(() => {
        if (!cancelled) setPack({ from: null, to: null, err: true })
      })
    return () => { cancelled = true }
  }, [origin.lat, origin.lng, dest.lat, dest.lng])

  return (
    <div className="ops-wx-grid">
      <WeatherCard title="Departure" code={from} point={origin} data={pack.from} err={pack.err} />
      <WeatherCard title="Arrival" code={to} point={dest} data={pack.to} err={pack.err} />
    </div>
  )
}

function popularPairs(flights) {
  const map = new Map()
  flights.forEach((f) => {
    const key = `${f.from}→${f.to}`
    const cur = map.get(key) || { key, from: f.from, to: f.to, fromCity: f.fromCity, toCity: f.toCity, count: 0, sample: f }
    cur.count += 1
    map.set(key, cur)
  })
  return [...map.values()].sort((a, b) => b.count - a.count)
}

function isActiveFlight(f) {
  const tone = statusMeta(f.status).tone
  if (tone === 'live' || tone === 'warn') return true
  return (f.progress || 0) > 0.08 && (f.progress || 0) < 0.95
}

export default function OperationsView({
  nav,
  flights,
  selectedId,
  followed,
  query,
  onSelect,
  onOpenTracking,
  onClearFollowed,
  news,
}) {
  const q = (query || '').trim().toLowerCase()
  const visible = useMemo(() => {
    if (!q) return flights
    return flights.filter((f) =>
      [f.id, f.callsign, f.airline, f.from, f.to, f.fromCity, f.toCity].join(' ').toLowerCase().includes(q)
    )
  }, [flights, q])

  const active = visible.filter(isActiveFlight)
  const watch = visible.filter((f) => followed[f.uid])
  const pairs = popularPairs(visible)
  const selected = flights.find((f) => f.uid === selectedId) || flights[0]
  const goLive = (
    <button type="button" className="ops-link" onClick={onOpenTracking}>
      Open Live Tracking
    </button>
  )

  if (nav === 'overview') {
    return (
      <main className="ops-view">
        <Header eyebrow="Operations center" title="Overview" detail="Network snapshot for the current Delhi departure window." />
        <div className="ops-metrics">
          <div><strong>{visible.length}</strong><span>Visible flights</span></div>
          <div><strong>{active.length}</strong><span>Active routes</span></div>
          <div><strong>{Object.keys(followed).length}</strong><span>On watch</span></div>
        </div>
        <section className="ops-view__section">
          <div className="section-h"><i />Most progressed</div>
          <FlightList
            flights={[...visible].sort((a, b) => (b.progress || 0) - (a.progress || 0)).slice(0, 4)}
            selectedId={selectedId}
            followed={followed}
            onSelect={onSelect}
            empty="No flights in this window."
          />
        </section>
        {news.filter((n) => n.url && n.url !== '#').length > 0 && (
          <section className="ops-view__section">
            <div className="section-h"><i />Ops brief</div>
            <ul className="ops-brief-list">
              {news.filter((n) => n.url && n.url !== '#').slice(0, 4).map((n) => (
                <li key={n.url}>
                  <a href={n.url} target="_blank" rel="noreferrer">{n.title}</a>
                  <span>{n.source}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    )
  }

  if (nav === 'tracking.orders') {
    return (
      <main className="ops-view">
        <Header eyebrow="Watch list" title="My Flights" detail="Flights you follow from the live map stay here across sessions." />
        <FlightList
          flights={watch}
          selectedId={selectedId}
          followed={followed}
          onSelect={onSelect}
          empty="Follow a flight from Live Tracking to build this list."
          emptyAction={goLive}
        />
      </main>
    )
  }

  if (nav === 'tracking.active') {
    return (
      <main className="ops-view">
        <Header eyebrow="Network" title="Active Routes" detail="Airborne and boarding flights in the current feed." />
        <FlightList
          flights={active}
          selectedId={selectedId}
          followed={followed}
          onSelect={onSelect}
          empty="No airborne flights in this sample."
          emptyAction={goLive}
        />
      </main>
    )
  }

  if (nav === 'tracking.popular') {
    return (
      <main className="ops-view">
        <Header eyebrow="Discover" title="Popular Routes" detail="City pairs appearing most often in the live sample." />
        {!pairs.length && <div className="ops-empty"><strong>No routes yet</strong><span>Routes appear once flights are loaded.</span></div>}
        <ul className="ops-routes">
          {pairs.map((row) => (
            <li key={row.key}>
              <button type="button" onClick={() => onSelect(row.sample.uid)}>
                <span className="iata">{row.from}</span>
                <span className="ops-routes__arrow">→</span>
                <span className="iata">{row.to}</span>
                <em>{row.fromCity} to {row.toCity}</em>
                <strong className="num">{row.count}</strong>
              </button>
            </li>
          ))}
        </ul>
      </main>
    )
  }

  if (nav === 'tracking.weather') {
    return (
      <main className="ops-view">
        <Header
          eyebrow="Conditions"
          title="Weather"
          detail={selected ? `Departure and arrival snapshot for ${selected.id}.` : 'Regional snapshot around the default Delhi window.'}
        />
        <WeatherPanel flight={selected} />
        {goLive}
      </main>
    )
  }

  if (nav === 'settings') {
    const count = Object.keys(followed).length
    return (
      <main className="ops-view">
        <Header eyebrow="Workspace" title="Settings" detail="Local preferences for this browser only. Flight keys stay on the server." />
        <div className="ops-settings">
          <div>
            <strong>Watch list</strong>
            <p>{count} followed flight{count === 1 ? '' : 's'} stored on this device.</p>
            <button type="button" className="ops-link" onClick={onClearFollowed} disabled={!count}>
              Clear watch list
            </button>
          </div>
          <div>
            <strong>Live map</strong>
            <p>SkyPulse opens on Live Tracking. Search with / from any page.</p>
            {goLive}
          </div>
        </div>
      </main>
    )
  }

  if (nav === 'support') {
    return (
      <main className="ops-view">
        <Header eyebrow="Help" title="Support" detail="Short operational notes for this workspace." />
        <ul className="ops-support">
          <li><strong>Track a flight</strong><span>Open Live Tracking, select an aircraft, then Follow.</span></li>
          <li><strong>Search</strong><span>Press / and type a flight number, city, or ICAO.</span></li>
          <li><strong>Contact</strong><span><a href="mailto:ops@skypulse.app">ops@skypulse.app</a></span></li>
        </ul>
      </main>
    )
  }

  return (
    <main className="ops-view">
      <Header eyebrow="Workspace" title="SkyPulse" detail="Choose a section from the rail." />
    </main>
  )
}
