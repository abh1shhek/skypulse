import { PlaneGlyph } from './icons'
import AnimatedNumber from './AnimatedNumber'

export default function RouteArc({ progress = 0, flown = 0, remaining = 0, elapsedMin = 0, remainMin = 0 }) {
  const pct = Math.max(0.04, Math.min(0.96, progress))
  const W = 292
  const H = 56
  const d = `M 10 ${H - 8} Q ${W / 2} 4 ${W - 10} ${H - 8}`
  const x = 10 + (W - 20) * pct
  const y = (H - 8) - Math.sin(pct * Math.PI) * 36

  return (
    <div className="route-arc">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8a5a28" />
            <stop offset="100%" stopColor="#d9a05a" />
          </linearGradient>
        </defs>
        <path d={d} className="route-arc__track" />
        <path
          d={d}
          className="route-arc__progress"
          pathLength="100"
          strokeDasharray={`${pct * 100} 100`}
        />
        <g className="route-arc__plane" style={{ transform: `translate(${x}px, ${y}px)` }}>
          <circle r="9" className="route-arc__glow" />
          <g transform="rotate(-18) translate(-6,-6)">
            <PlaneGlyph size={12} />
          </g>
        </g>
      </svg>
      <div className="route-arc__meta">
        <div>
          <AnimatedNumber value={flown} format={(n) => `${Math.round(n).toLocaleString()} km`} />
          <span>travelled · {elapsedMin ? `${Math.floor(elapsedMin / 60)}h ${elapsedMin % 60}m` : '—'}</span>
        </div>
        <div className="route-arc__meta-right">
          <AnimatedNumber value={remaining} format={(n) => `${Math.round(n).toLocaleString()} km`} />
          <span>remaining · {remainMin ? `${Math.floor(remainMin / 60)}h ${remainMin % 60}m` : '—'}</span>
        </div>
      </div>
    </div>
  )
}
