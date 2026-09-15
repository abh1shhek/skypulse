import { useEffect, useMemo, useState } from 'react'
import FlightMedia from './FlightMedia'
import { getWeather } from '../services/api'
import { formatClock, statusMeta } from '../lib/flightMath'
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

function isWatched(flight, followed) {
  if (!followed || !flight) return false
  if (followed[flight.uid]) return true
  const stem = `${flight.id}-${flight.from}-${flight.to}-`
  return Object.keys(followed).some((k) => followed[k] && k.startsWith(stem))
}

function formatRemain(min) {
  const n = Math.max(0, Math.round(Number(min) || 0))
  const h = Math.floor(n / 60)
  const m = n % 60
  if (h <= 0) return `${m} min`
  return `${h} h ${String(m).padStart(2, '0')} m`
}

function nextEvent(flight) {
  const st = statusMeta(flight.status)
  if (st.tone === 'live' || (flight.progress || 0) > 0.12) {
    return `${formatRemain(flight.remainMin)} remaining`
  }
  return `Departs ${formatClock(flight.scheduled?.[0])}`
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
  const watch = visible.filter((f) => isWatched(f, followed))
  const pairs = popularPairs(visible)
  const selected = flights.find((f) => f.uid === selectedId) || flights[0]
  const goLive = (
    <button type="button" className="ops-link" onClick={onOpenTracking}>
      Open Live Tracking
    </button>
  )

  if (nav === 'overview') {
    const ranked = [...visible].sort((a, b) => (b.progress || 0) - (a.progress || 0))
    const lead = ranked[0]
    const board = ranked.slice(1, 6)
    const briefs = news.filter((n) => n.url && n.url !== '#').slice(0, 4)
    const leadPct = Math.round((lead?.progress || 0) * 100)
    const leadStatus = lead ? statusMeta(lead.status) : null

    return (
      <main className="ops-view overview">
        <header className="overview__head">
          <h1 className="sp-display">Overview</h1>
          <p>Delhi departure window. Counts follow the live feed.</p>
        </header>

        <dl className="overview__metrics sp-inset">
          <div>
            <dt>Visible</dt>
            <dd className="num">{visible.length}</dd>
          </div>
          <div>
            <dt>Active</dt>
            <dd className="num">{active.length}</dd>
          </div>
          <div>
            <dt>Watching</dt>
            <dd className="num">{Object.keys(followed).length}</dd>
          </div>
        </dl>

        {!lead && (
          <div className="overview__empty">
            <strong>No flights in this window</strong>
            <span>Open Live Tracking when the feed returns.</span>
            {goLive}
          </div>
        )}

        {lead && (
          <button
            type="button"
            className="overview__feature"
            onClick={() => onSelect(lead.uid)}
            aria-label={`${lead.id}, ${lead.from} to ${lead.to}, ${leadStatus.label}`}
          >
            <FlightMedia flight={lead} className="overview__slab" />
            <div className="overview__feature-copy">
              <p className="overview__id num">{lead.id}</p>
              <p className={`overview__status tone-${leadStatus.tone}`}>{leadStatus.label}</p>
              <p className="overview__iata iata">
                <span>{lead.from}</span>
                <span aria-hidden="true">→</span>
                <span>{lead.to}</span>
              </p>
              <p className="overview__meta">
                {lead.fromCity} to {lead.toCity}
              </p>
              <p className="overview__meta">
                {lead.aircraft} · {formatClock(lead.scheduled?.[0])} to {formatClock(lead.scheduled?.[1])} · {leadPct}% of route
              </p>
            </div>
          </button>
        )}

        {board.length > 0 && (
          <section className="overview__section">
            <h2>On the board</h2>
            <ul className="overview__board">
              {board.map((flight) => {
                const st = statusMeta(flight.status)
                const pct = Math.round((flight.progress || 0) * 100)
                return (
                  <li key={flight.uid}>
                    <button type="button" onClick={() => onSelect(flight.uid)}>
                      <span className="num">{flight.id}</span>
                      <span className="iata">{flight.from} → {flight.to}</span>
                      <span className={`tone-${st.tone}`}>{st.label}</span>
                      <span className="num">{pct}%</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {briefs.length > 0 && (
          <section className="overview__section">
            <h2>Ops brief</h2>
            <ul className="overview__brief">
              {briefs.map((n) => (
                <li key={n.url}>
                  <a href={n.url} target="_blank" rel="noreferrer">{n.title}</a>
                  <span className="num">{n.source}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    )
  }

  if (nav === 'tracking.orders') {
    const saved = Object.keys(followed || {}).filter((k) => followed[k]).length
    const ranked = [...watch].sort((a, b) => (b.progress || 0) - (a.progress || 0))
    const lead = ranked[0]
    const rest = ranked.slice(1)
    const leadStatus = lead ? statusMeta(lead.status) : null

    return (
      <main className="ops-view overview">
        <header className="overview__head">
          <h1 className="sp-display">My Flights</h1>
          <p>Flights you watch from Live Tracking stay on this device.</p>
        </header>

        <dl className="overview__metrics sp-inset">
          <div>
            <dt>Saved</dt>
            <dd className="num">{saved}</dd>
          </div>
          <div>
            <dt>In window</dt>
            <dd className="num">{watch.length}</dd>
          </div>
          <div>
            <dt>Airborne</dt>
            <dd className="num">{watch.filter(isActiveFlight).length}</dd>
          </div>
        </dl>

        {!lead && (
          <div className="overview__empty">
            <strong>{saved ? 'None of your flights are in this window' : 'No flights on the watch list'}</strong>
            <span>
              {saved
                ? 'The live sample changed. Open Live Tracking and follow the flight again.'
                : 'Select an aircraft on the map, then Watch.'}
            </span>
            {goLive}
          </div>
        )}

        {lead && (
          <button
            type="button"
            className="overview__feature"
            onClick={() => onSelect(lead.uid)}
            aria-label={`${lead.id}, ${lead.from} to ${lead.to}, ${leadStatus.label}`}
          >
            <FlightMedia flight={lead} className="overview__slab" />
            <div className="overview__feature-copy">
              <p className="overview__id num">{lead.id}</p>
              <p className={`overview__status tone-${leadStatus.tone}`}>{leadStatus.label}</p>
              <p className="overview__iata iata">
                <span>{lead.from}</span>
                <span aria-hidden="true">→</span>
                <span>{lead.to}</span>
              </p>
              <p className="overview__meta">
                {lead.airline} · {lead.aircraft}
              </p>
              <p className="overview__meta">{nextEvent(lead)}</p>
            </div>
          </button>
        )}

        {rest.length > 0 && (
          <section className="overview__section">
            <h2>Watch list</h2>
            <ul className="overview__board overview__board--watch">
              {rest.map((flight) => {
                const st = statusMeta(flight.status)
                return (
                  <li key={flight.uid}>
                    <button type="button" onClick={() => onSelect(flight.uid)}>
                      <span className="num">{flight.id}</span>
                      <span className="iata">{flight.from} → {flight.to}</span>
                      <span className={`tone-${st.tone}`}>{st.label}</span>
                      <span className="num">{nextEvent(flight)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </main>
    )
  }

  if (nav === 'tracking.active') {
    const rankedPairs = popularPairs(active)
    const leadPair = rankedPairs[0]
    const otherPairs = rankedPairs.slice(1)
    const onLead = leadPair
      ? active
        .filter((f) => f.from === leadPair.from && f.to === leadPair.to)
        .sort((a, b) => (b.progress || 0) - (a.progress || 0))
      : []
    const furthest = onLead[0]
      ? Math.round((onLead[0].progress || 0) * 100)
      : 0
    const remainAvg = onLead.length
      ? Math.round(onLead.reduce((sum, f) => sum + (f.remainMin || 0), 0) / onLead.length)
      : 0
    const leadFlight = onLead[0]
    const leadTone = leadFlight ? statusMeta(leadFlight.status).tone : 'idle'

    return (
      <main className="ops-view overview">
        <header className="overview__head">
          <h1 className="sp-display">Active Routes</h1>
          <p>City pairs that are airborne or boarding in the Delhi sample.</p>
        </header>

        <dl className="overview__metrics sp-inset">
          <div>
            <dt>Airborne</dt>
            <dd className="num">{active.length}</dd>
          </div>
          <div>
            <dt>Pairs</dt>
            <dd className="num">{rankedPairs.length}</dd>
          </div>
          <div>
            <dt>Lead pair</dt>
            <dd className="num">{leadPair ? leadPair.count : 0}</dd>
          </div>
        </dl>

        {!leadPair && (
          <div className="overview__empty">
            <strong>No airborne flights in this sample</strong>
            <span>Open Live Tracking when the feed returns.</span>
            {goLive}
          </div>
        )}

        {leadPair && leadFlight && (
          <button
            type="button"
            className="overview__feature overview__feature--route"
            onClick={() => onSelect(leadFlight.uid)}
            aria-label={`${leadPair.from} to ${leadPair.to}, ${leadPair.count} flights`}
          >
            <div className="overview__feature-copy">
              <p className="overview__id num">{leadPair.count} in this window</p>
              <p className={`overview__status tone-${leadTone}`}>{statusMeta(leadFlight.status).label}</p>
              <p className="overview__iata iata">
                <span>{leadPair.from}</span>
                <span aria-hidden="true">→</span>
                <span>{leadPair.to}</span>
              </p>
              <p className="overview__meta">
                {AIRPORTS[leadPair.from]?.city || leadPair.fromCity} to {AIRPORTS[leadPair.to]?.city || leadPair.toCity}
              </p>
              <p className="overview__meta">
                {furthest}% along · {formatRemain(remainAvg)} typical remaining
              </p>
              <span className="overview__track" aria-hidden="true">
                <i style={{ width: `${Math.max(6, furthest)}%` }} />
              </span>
            </div>
          </button>
        )}

        {onLead.length > 1 && (
          <section className="overview__section">
            <h2>On this pair</h2>
            <ul className="overview__board">
              {onLead.map((flight) => {
                const st = statusMeta(flight.status)
                return (
                  <li key={flight.uid}>
                    <button type="button" onClick={() => onSelect(flight.uid)}>
                      <span className="num">{flight.id}</span>
                      <span className="iata">{flight.airline}</span>
                      <span className={`tone-${st.tone}`}>{st.label}</span>
                      <span className="num">{Math.round((flight.progress || 0) * 100)}%</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {otherPairs.length > 0 && (
          <section className="overview__section">
            <h2>Other pairs</h2>
            <ul className="overview__board overview__board--pairs">
              {otherPairs.map((row) => {
                const sample = row.sample
                const st = statusMeta(sample.status)
                return (
                  <li key={row.key}>
                    <button type="button" onClick={() => onSelect(sample.uid)}>
                      <span className="iata">{row.from} → {row.to}</span>
                      <span>{AIRPORTS[row.from]?.city || row.fromCity} to {AIRPORTS[row.to]?.city || row.toCity}</span>
                      <span className={`tone-${st.tone}`}>{st.label}</span>
                      <span className="num">{row.count}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
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
