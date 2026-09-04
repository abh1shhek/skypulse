import { useEffect, useMemo, useRef } from 'react'
import useFlightStore from './store/useFlightStore'
import Sidebar from './components/sidebar'
import MapCanvas from './components/MapCanvas'
import DetailPanel from './components/DetailPanel'
import FlightCard from './components/FlightCard'
import { I, Icon } from './components/icons'

export default function App() {
  const {
    flights, selectedId, loading, query, error,
    fetchFlights, fetchNews, setSelected, tick, sidebarOpen, setSidebarOpen,
  } = useFlightStore()

  const mapApi = useRef(null)
  const selected = flights.find((f) => f.uid === selectedId)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return flights
    return flights.filter((f) =>
      [f.id, f.callsign, f.airline, f.from, f.to, f.fromCity, f.toCity]
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }, [flights, query])

  useEffect(() => {
    fetchFlights({ dep_iata: 'DEL' })
    fetchNews('aviation')
  }, [])

  useEffect(() => {
    const id = setInterval(() => tick(), 1200)
    return () => clearInterval(id)
  }, [tick])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && e.target.tagName !== 'INPUT') {
        e.preventDefault()
        document.querySelector('.rail__search input')?.focus()
      }
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSelected])

  return (
    <div className="ops-shell">
      <Sidebar />
      {sidebarOpen && <div className="rail-backdrop" onClick={() => setSidebarOpen(false)} />}

      <div className="ops-stage">
        <MapCanvas
          flights={visible}
          selectedId={selectedId}
          onSelect={(id) => setSelected(id)}
          onReady={(api) => { mapApi.current = api }}
        />
        <div className="map-vignette" />

        <button className="icon-btn menu-fab hud__chip" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
          <Icon d={I.menu} size={16} />
        </button>

        {selected && (
          <DetailPanel flight={selected} onClose={() => setSelected(null)} />
        )}

        <div className="hud">
          <div className="hud__chip">
            <i className="live-dot" />
            {error ? 'Signal lost' : 'Live operations'}
          </div>
          <div className="zoom">
            <button type="button" onClick={() => mapApi.current?.zoomIn()}>+</button>
            <button type="button" onClick={() => mapApi.current?.zoomOut()}>−</button>
          </div>
        </div>

        <div className="flight-strip">
          {loading && <p className="mono" style={{ color: '#555', fontSize: 12, padding: 12 }}>Acquiring tracks…</p>}
          {!loading && visible.length === 0 && (
            <p className="mono" style={{ color: '#555', fontSize: 12, padding: 12 }}>No matching flights.</p>
          )}
          {visible.map((f) => (
            <FlightCard
              key={f.uid}
              flight={f}
              selected={f.uid === selectedId}
              onClick={() => setSelected(f.uid)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
