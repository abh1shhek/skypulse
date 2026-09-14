import AnimatedNumber from './AnimatedNumber'

export default function RouteArc({ progress = 0, flown = 0, remaining = 0, elapsedMin = 0, remainMin = 0 }) {
  const pct = Math.max(0.04, Math.min(0.96, progress))
  const elapsed = elapsedMin ? `${Math.floor(elapsedMin / 60)}h ${elapsedMin % 60}m` : '—'
  const remain = remainMin ? `${Math.floor(remainMin / 60)}h ${remainMin % 60}m` : '—'

  return (
    <div className="route-arc">
      <div className="route-arc__bar" aria-hidden="true">
        <i style={{ width: `${pct * 100}%` }} />
      </div>
      <div className="route-arc__meta">
        <div>
          <AnimatedNumber value={flown} format={(n) => `${Math.round(n).toLocaleString()} km`} />
          <span>travelled · {elapsed}</span>
        </div>
        <div className="route-arc__meta-right">
          <AnimatedNumber value={remaining} format={(n) => `${Math.round(n).toLocaleString()} km`} />
          <span>remaining · {remain}</span>
        </div>
      </div>
    </div>
  )
}
