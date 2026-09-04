import { statusMeta } from '../lib/flightMath'
import { PlaneGlyph } from './icons'

const COLORS = {
  'Air India': '#c81e1e',
  IndiGo: '#3b1c7a',
  Vistara: '#4e2683',
  SpiceJet: '#d01928',
  Akasa: '#e85d04',
  Emirates: '#c8102e',
  'Air Arabia': '#ed1c24',
}

export default function FlightCard({ flight, selected, onClick }) {
  const color = COLORS[flight.airline] || '#3a3a42'
  const initials = (flight.airline || '??').slice(0, 2).toUpperCase()
  const st = statusMeta(flight.status)

  return (
    <button type="button" className={`fcard ${selected ? 'is-selected' : ''}`} onClick={onClick}>
      <div className="fcard__top">
        <div className="fcard__ident">
          <div className="badge" style={{ background: color }}>{initials}</div>
          <div>
            <strong>{flight.id}</strong>
            <em>{flight.aircraft} · {flight.from} → {flight.to}</em>
          </div>
        </div>
        <PlaneGlyph size={14} />
      </div>

      <div className="fcard__route">
        <div className="iata">{flight.from}</div>
        <span className="mono" style={{ fontSize: 11, color: '#6b6b72' }}>→</span>
        <div className="iata">{flight.to}</div>
      </div>

      <div className="fcard__foot">
        <span style={{ fontSize: 10, color: '#5c5c56' }}>Most tracked</span>
        <div className="status">
          <i className={`status-dot ${st.tone === 'warn' ? 'warn' : ''}`} />
          {st.label === 'En route' ? 'Live' : st.label}
        </div>
      </div>
    </button>
  )
}
