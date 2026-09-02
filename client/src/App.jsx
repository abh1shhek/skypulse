import { useEffect } from 'react'
import useFlightStore from './store/useFlightStore'
import Sidebar from './components/sidebar'
import MapCanvas from './components/MapCanvas'
import DetailPanel from './components/DetailPanel'
import FlightCard from './components/FlightCard'

export default function App() {
  const { flights, news, selectedId, loading, fetchFlights, fetchNews, setSelected } = useFlightStore()
  const selected = flights.find(f => f.id === selectedId)

  useEffect(() => {
    fetchFlights({ dep_iata: 'DEL' })
    fetchNews('aviation India')
  }, [])

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100vw',
      overflow: 'hidden', background: '#111'
    }}>

      {/* Sidebar — always visible */}
      <Sidebar news={news} />

      {/* Detail panel — slides in when flight selected */}
      {selected && (
        <DetailPanel
          flight={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Map + bottom cards */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
        <MapCanvas
          flights={flights}
          selectedId={selectedId}
          onSelect={(id) => setSelected(id === selectedId ? null : id)}
        />

        {/* Bottom flight cards */}
        <div style={{
          position: 'absolute', bottom: 20, left: 16, right: 16,
          display: 'flex', gap: 12, overflowX: 'auto',
          zIndex: 10, paddingBottom: 4,
        }}>
          {loading && (
            <p style={{ color: '#555', fontSize: 12, padding: '14px 0' }}>Loading flights…</p>
          )}
          {!loading && flights.length === 0 && (
            <p style={{ color: '#555', fontSize: 12, padding: '14px 0' }}>No flights found. Check your API key.</p>
          )}
          {flights.map(f => (
            <FlightCard
              key={f.id}
              flight={f}
              onClick={() => setSelected(f.id === selectedId ? null : f.id)}
            />
          ))}
        </div>

        {/* Top-right view label */}
        <div style={{
          position: 'absolute', top: 14, right: 14, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(28,28,31,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid #2a2a2e', borderRadius: 8, padding: '7px 12px',
        }}>
          <span style={{ fontSize: 12, color: '#aaa' }}>Default View</span>
          <span style={{ color: '#555' }}>▾</span>
        </div>

        {/* Zoom controls */}
        <div style={{
          position: 'absolute', top: 54, right: 14, zIndex: 10,
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {['+', '−'].map((icon, i) => (
            <button key={i} style={{
              width: 32, height: 32,
              background: 'rgba(28,28,31,0.85)', backdropFilter: 'blur(8px)',
              border: '1px solid #2a2a2e',
              borderRadius: i === 0 ? '7px 7px 3px 3px' : '3px 3px 7px 7px',
              color: '#888', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{icon}</button>
          ))}
        </div>
      </div>
    </div>
  )
}