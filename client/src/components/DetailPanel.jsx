import { useState, useEffect } from 'react'

export default function DetailPanel({ flight, onClose }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  const progress = flight.dist > 0 ? (flight.flown || 0) / flight.dist : 0
  const pct = Math.round(progress * 100)
  const W = 270

  return (
    <div style={{
      width: 310, flexShrink: 0, background: '#1c1c1f',
      borderRight: '1px solid #2a2a2e', display: 'flex',
      flexDirection: 'column', height: '100vh', overflow: 'hidden',
      transform: visible ? 'translateX(0)' : 'translateX(-10px)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1), opacity 0.2s ease',
    }}>

      {/* Header */}
      <div style={{ padding: '0 20px', borderBottom: '1px solid #2a2a2e', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 14, background: '#7c3aed', borderRadius: 2 }} />
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#aaa', letterSpacing: '0.05em' }}>
            {flight.id}, {flight.callsign}, {flight.aircraft}
          </span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}
          onMouseEnter={e => e.currentTarget.style.color = '#ccc'}
          onMouseLeave={e => e.currentTarget.style.color = '#555'}>×</button>
      </div>

      {/* IATA codes */}
      <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8 }}>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 42, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{flight.from}</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{flight.fromCity?.split('/')[0]}</div>
          <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{flight.fromTz}</div>
        </div>
        <div style={{ width: 28, height: 28, background: '#2a2a2e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff">
            <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0012 2a1.5 1.5 0 00-1.5 1.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
          </svg>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 42, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{flight.to}</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{flight.toCity?.split('/')[0]}</div>
          <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{flight.toTz}</div>
        </div>
      </div>

      {/* Times */}
      <div style={{ margin: '18px 20px 0', borderTop: '1px solid #2a2a2e', borderBottom: '1px solid #2a2a2e' }}>
        {[['Scheduled', flight.scheduled], ['Actual', flight.actual]].map(([label, times]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: label === 'Scheduled' ? '1px solid #2a2a2e' : 'none' }}>
            <div style={{ width: 3, height: 10, background: label === 'Actual' ? '#7c3aed' : 'transparent', borderRadius: 2, marginRight: 10 }} />
            <span style={{ fontSize: 12, color: '#666', width: 80 }}>{label}</span>
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#ddd', marginRight: 'auto' }}>{times?.[0] ? new Date(times[0]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#ddd' }}>{times?.[1] ? new Date(times[1]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
          </div>
        ))}
      </div>

      {/* Arc */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontSize: 12, color: '#555', textAlign: 'center', marginBottom: 12 }}>{flight.airline}</div>
        <svg width={W} height={48} style={{ overflow: 'visible' }}>
          <path d={`M 12 44 Q ${W/2} 4 ${W-12} 44`} fill="none" stroke="#2a2a2e" strokeWidth="1.5" />
          <path d={`M 12 44 Q ${W/2} 4 ${W-12} 44`} fill="none" stroke="#7c3aed" strokeWidth="1.5"
            strokeDasharray={`${pct * 3.2} 320`} strokeLinecap="round" />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#555' }}>{(flight.flown || 0).toLocaleString()} km flown</span>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#555' }}>{((flight.dist || 0) - (flight.flown || 0)).toLocaleString()} km left</span>
        </div>
      </div>

      {/* Info table */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Flight information</div>
        <div style={{ background: '#222226', borderRadius: 10, overflow: 'hidden' }}>
          {[
            ['Aircraft', flight.aircraft],
            ['Speed', flight.speed ? `${flight.speed} km/h` : '—'],
            ['Altitude', flight.alt ? `${flight.alt.toLocaleString()} m` : '—'],
            ['Status', flight.status],
          ].map(([label, val], i, arr) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < arr.length - 1 ? '1px solid #2a2a2e' : 'none' }}>
              <span style={{ fontSize: 12, color: '#666' }}>{label}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#ccc', textTransform: 'capitalize' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid #2a2a2e', display: 'flex', justifyContent: 'space-around', padding: '12px 0' }}>
        {['Route', 'Follow', 'Share'].map(action => (
          <button key={action} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 16px', transition: 'color 0.12s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ccc'}
            onMouseLeave={e => e.currentTarget.style.color = '#666'}>
            <span style={{ fontSize: 16 }}>{action === 'Route' ? '↗' : action === 'Follow' ? '☆' : '↑'}</span>
            {action}
          </button>
        ))}
      </div>
    </div>
  )
}