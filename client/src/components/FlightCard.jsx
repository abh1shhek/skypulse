import { useEffect, useRef } from 'react'
import { formatClock, statusMeta } from '../lib/flightMath'
import FlightMedia from './FlightMedia'
import { PlaneGlyph } from './icons'

export default function FlightCard({ flight, selected, onClick, followed = false, pinSelected = false, compact = false }) {
  const ref = useRef(null)
  const st = statusMeta(flight.status)
  const dep = formatClock(flight.scheduled?.[0])
  const arr = formatClock(flight.scheduled?.[1])
  const pct = Math.max(4, Math.min(96, (flight.progress || 0) * 100))

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
      className={`fcard ${compact ? 'fcard--strip' : ''} ${selected ? 'is-selected' : ''}`}
      onClick={onClick}
      aria-current={selected ? 'true' : undefined}
      aria-label={`${flight.id}, ${flight.from} to ${flight.to}, ${st.label}`}
    >
      {!compact && <FlightMedia flight={flight} className="fcard__media" />}
      <div className="fcard__body">
        <div className="fcard__top">
          {compact && (
            <span className="fcard__mark" aria-hidden="true">
              <PlaneGlyph size={12} />
            </span>
          )}
          <strong>{flight.id}</strong>
          <span className={`fcard__status tone-${st.tone}`}>{st.label}</span>
        </div>
        <p className="fcard__route">
          <span className="iata">{flight.from}</span>
          <span className="fcard__arrow" aria-hidden="true">→</span>
          <span className="iata">{flight.to}</span>
        </p>
        <p className="fcard__foot">
          {flight.aircraft}
          {flight.airline ? ` · ${flight.airline}` : ''}
          {' · '}
          {dep} → {arr}
          {followed ? <em>Watching</em> : null}
        </p>
        <span className="fcard__progress" style={{ width: `${pct}%` }} aria-hidden="true" />
      </div>
    </button>
  )
}
