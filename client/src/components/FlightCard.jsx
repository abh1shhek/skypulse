const AIRLINE_COLORS = {
    'Air India': '#e32119', 'IndiGo': '#4b0082',
    'Vistara': '#4e2683', 'SpiceJet': '#e8192c',
  }
  
  export default function FlightCard({ flight, onClick }) {
    const color = AIRLINE_COLORS[flight.airline] || '#444'
    const initials = flight.airline?.slice(0, 2).toUpperCase() || '??'
  
    return (
      <div onClick={onClick} style={{
        background: '#222226', borderRadius: 14, padding: '14px 16px',
        minWidth: 240, flex: '0 0 240px', cursor: 'pointer',
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = '#28282d'}
        onMouseLeave={e => e.currentTarget.style.background = '#222226'}>
  
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#fff' }}>{initials}</span>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#fff' }}>{flight.id}</div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{flight.callsign} · {flight.aircraft}</div>
            </div>
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#444' }}>
            {flight.dist?.toLocaleString() || '—'}
          </span>
        </div>
  
        {/* Route */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>{flight.fromCity?.split('/')[0]}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{flight.from}</div>
          </div>
          <div style={{ paddingBottom: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
              <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0012 2a1.5 1.5 0 00-1.5 1.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
            </svg>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>{flight.toCity?.split('/')[0]}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{flight.to}</div>
          </div>
        </div>
  
        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#555' }}>Most tracked flights</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: flight.status === 'delayed' ? '#f59e0b' : '#e53935' }} />
            <span style={{ fontSize: 11, color: flight.status === 'delayed' ? '#f59e0b' : '#e53935' }}>
              {flight.status === 'delayed' ? 'Delayed' : 'Live'}
            </span>
          </div>
        </div>
      </div>
    )
  }