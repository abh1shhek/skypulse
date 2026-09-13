import { useEffect, useRef } from 'react'
import { formatClock, statusMeta } from '../lib/flightMath'

const COLORS = {
  'Air India': '#c81e1e',
  IndiGo: '#3b1c7a',
  Vistara: '#4e2683',
  SpiceJet: '#d01928',
  Akasa: '#e85d04',
  Emirates: '#c8102e',
  'Air Arabia': '#ed1c24',
}

export default function FlightCard({ flight, selected, onClick, followed = false, pinSelected = false }) {
  const ref = useRef(null)
  const color = COLORS[flight.airline] || '#3a3a42'
  const initials = (flight.airline || '??').slice(0, 2).toUpperCase()
  const st = statusMeta(flight.status)
  const dep = formatClock(flight.scheduled?.[0])
  const arr = formatClock(flight.scheduled?.[1])

  useEffect(() => {
    if (!selected || !pinSelected || !ref.current) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ref.current.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: reduce ? 'auto' : 'smooth',
    })
  }, [selected, pinSelected])

  return (
    <button
      ref={ref}
      type="button"
      className={`fcard ${selected ? 'is-selected' : ''}`}
      onClick={onClick}
      aria-current={selected ? 'true' : undefined}
      aria-label={`${flight.id}, ${flight.from} to ${flight.to}, ${st.label}`}
    >
      <div className="fcard__top">
        <div className="fcard__ident">
          <div className="badge" style={{ background: color }} aria-hidden="true">{initials}</div>
          <strong>{flight.id}</strong>
        </div>
        <div className={`fcard__status tone-${st.tone}`}>
          <i className={`status-dot ${st.tone}`} />
          {st.label}
        </div>
      </div>

      <div className="fcard__route">
        <span className="iata">{flight.from}</span>
        <span className="fcard__arrow" aria-hidden="true">→</span>
        <span className="iata">{flight.to}</span>
      </div>

      <div className="fcard__foot">
        <span>{flight.aircraft} · {dep} → {arr}</span>
        {followed ? <em>Watching</em> : null}
      </div>
    </button>
  )
}
