import { useEffect, useState } from 'react'
import aircraftHero from '../assets/aircraft-hero.png'
import { formatClock, statusMeta } from '../lib/flightMath'
import AnimatedNumber from './AnimatedNumber'
import { I, Icon, PlaneGlyph } from './icons'
import RouteArc from './RouteArc'

export default function DetailPanel({ flight, onClose, followed, onFollow, onRoute, onShare, shareState }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(false)
    const t = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(t)
  }, [flight.uid])

  const st = statusMeta(flight.status)
  const cells = [
    { k: 'Aircraft', v: flight.aircraftModel },
    { k: 'Registration', v: flight.registration, num: true },
    { k: 'Airline', v: flight.airline },
    { k: 'Country', v: flight.country },
    { k: 'Speed', v: flight.speed, live: 'speed' },
    { k: 'Altitude', v: flight.alt, live: 'alt' },
    { k: 'Heading', v: `${Math.round(flight.heading)}°`, num: true },
    { k: 'Category', v: flight.category },
    { k: 'Gate', v: flight.gate, num: true },
    { k: 'Terminal', v: flight.terminal, num: true },
    { k: 'Airframe', v: flight.age, num: true },
    { k: 'Status', v: st.label },
  ]

  return (
    <section className="detail" style={{ opacity: ready ? 1 : 0.96 }}>
      <header className="detail__head">
        <div className="detail__ids">
          <strong>{flight.id}</strong>
          <span>{flight.callsign}</span>
          <span>{flight.aircraft}</span>
          <span className={`pill ${st.tone}`}>{st.label}</span>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          <Icon d={I.close} size={14} />
        </button>
      </header>

      <div className="detail__scroll">
        <div className="detail__visual">
          <img src={aircraftHero} alt="" />
        </div>

        <div className="route-codes">
          <div>
            <div className="iata">{flight.from}</div>
            <div className="city">{flight.fromCity}</div>
            <div className="tz">{flight.fromTz}</div>
          </div>
          <div className="plane-mid">
            <PlaneGlyph size={13} />
          </div>
          <div className="align-right">
            <div className="iata">{flight.to}</div>
            <div className="city">{flight.toCity}</div>
            <div className="tz">{flight.toTz}</div>
          </div>
        </div>

        <div className="timeline">
          <div className="timeline__row">
            <div className="timeline__label"><i className="dot" />Scheduled</div>
            <span className="num">{formatClock(flight.scheduled?.[0])}</span>
            <span className="num">{formatClock(flight.scheduled?.[1])}</span>
          </div>
          <div className="timeline__row">
            <div className="timeline__label"><i className="dot on" />Actual</div>
            <span className="num">{formatClock(flight.actual?.[0])}</span>
            <span className="num">{formatClock(flight.actual?.[1])}</span>
          </div>
          <div className="timeline__row">
            <div className="timeline__label"><i className="dot" />Estimated</div>
            <span className="num">{formatClock(flight.actual?.[0] || flight.scheduled?.[0])}</span>
            <span className="num">{formatClock(flight.actual?.[1] || flight.scheduled?.[1])}</span>
          </div>
        </div>

        <RouteArc
          progress={flight.progress}
          flown={flight.flown}
          remaining={flight.remaining}
          elapsedMin={flight.elapsedMin}
          remainMin={flight.remainMin}
        />

        <div className="section-h"><i />Flight information</div>
        <div className="info-grid">
          {cells.map((cell) => (
            <div key={cell.k} className="info-cell">
              <span>{cell.k}</span>
              {cell.live === 'speed' ? (
                <AnimatedNumber value={flight.speed} format={(n) => `${Math.round(n)} km/h`} />
              ) : cell.live === 'alt' ? (
                <AnimatedNumber value={flight.alt} format={(n) => `${Math.round(n).toLocaleString()} m`} />
              ) : (
                <strong className={cell.num ? 'num' : ''}>{cell.v}</strong>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="detail__actions">
        <button type="button" onClick={onRoute}>Route</button>
        <button type="button" className={followed ? 'is-active' : ''} onClick={onFollow}>{followed ? 'Following' : 'Follow'}</button>
        <button type="button" onClick={onShare}>{shareState || 'Share'}</button>
      </div>
    </section>
  )
}
