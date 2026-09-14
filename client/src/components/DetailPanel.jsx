import { useEffect, useState } from 'react'
import aircraftHero from '../assets/aircraft-hero.png'
import { formatClock, statusMeta } from '../lib/flightMath'
import AnimatedNumber from './AnimatedNumber'
import { I, Icon } from './icons'
import RouteArc from './RouteArc'

function toFeet(meters) {
  return Math.round((Number(meters) || 0) * 3.28084)
}

export default function DetailPanel({ flight, onClose, followed, onFollow, onRoute, onShare, shareState }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(false)
    const t = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(t)
  }, [flight.uid])

  const st = statusMeta(flight.status)
  const heading = Math.round(flight.heading || flight.bearing || 0)

  return (
    <section className={`detail ${ready ? 'is-ready' : ''}`} aria-label="Selected flight">
      <header className="detail__head">
        <div className="detail__ids">
          <strong>{flight.id}</strong>
          <p>
            {flight.aircraft}
            {flight.registration ? ` · ${flight.registration}` : ''}
          </p>
          <span className={`detail__status tone-${st.tone}`}>{st.label}</span>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close flight details">
          <Icon d={I.close} size={14} />
        </button>
      </header>

      <div className="detail__scroll">
        <div className="detail__visual sp-slab">
          <img src={aircraftHero} alt="" />
        </div>

        <div className="route-codes">
          <div>
            <div className="iata">{flight.from}</div>
            <div className="city">{flight.fromCity}</div>
          </div>
          <span className="route-codes__to" aria-hidden="true">→</span>
          <div className="align-right">
            <div className="iata">{flight.to}</div>
            <div className="city">{flight.toCity}</div>
          </div>
        </div>

        <RouteArc
          progress={flight.progress}
          flown={flight.flown}
          remaining={flight.remaining}
          elapsedMin={flight.elapsedMin}
          remainMin={flight.remainMin}
        />

        <div className="telemetry" aria-label="Live telemetry">
          <div>
            <span>Altitude</span>
            <AnimatedNumber value={toFeet(flight.alt)} format={(n) => `${Math.round(n).toLocaleString()} ft`} />
          </div>
          <div>
            <span>Speed</span>
            <AnimatedNumber value={flight.speed} format={(n) => `${Math.round(n).toLocaleString()} km/h`} />
          </div>
          <div>
            <span>Heading</span>
            <strong className="num">{heading}°</strong>
          </div>
          <div>
            <span>Remain</span>
            <AnimatedNumber value={flight.remaining} format={(n) => `${Math.round(n).toLocaleString()} km`} />
          </div>
        </div>

        <div className="timeline">
          <div className="timeline__row">
            <div className="timeline__label">Scheduled</div>
            <span className="num">{formatClock(flight.scheduled?.[0])}</span>
            <span className="num">{formatClock(flight.scheduled?.[1])}</span>
          </div>
          <div className="timeline__row">
            <div className="timeline__label">Actual</div>
            <span className="num">{formatClock(flight.actual?.[0])}</span>
            <span className="num">{formatClock(flight.actual?.[1])}</span>
          </div>
          <div className="timeline__row">
            <div className="timeline__label">Estimated</div>
            <span className="num">{formatClock(flight.actual?.[0] || flight.scheduled?.[0])}</span>
            <span className="num">{formatClock(flight.actual?.[1] || flight.scheduled?.[1])}</span>
          </div>
        </div>
      </div>

      <div className="detail__actions">
        <button type="button" onClick={onRoute}>Route</button>
        <button type="button" className={followed ? 'is-active' : ''} onClick={onFollow}>
          {followed ? 'Watching' : 'Watch'}
        </button>
        <button type="button" onClick={onShare}>{shareState || 'Share'}</button>
      </div>
    </section>
  )
}
