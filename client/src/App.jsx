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
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      <Sidebar news={news} />
      {selected && <DetailPanel flight={selected} onClose={() => setSelected(null)} />}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapCanvas flights={flights} selectedId={selectedId} onSelect={setSelected} />
        <div style={{
          position: 'absolute', bottom: 20, left: 20, right: 20,
          display: 'flex', gap: 12, overflowX: 'auto', zIndex: 10
        }}>
          {loading
            ? <p style={{ color: '#555', fontSize: 13 }}>Loading flights…</p>
            : flights.map(f => (
                <FlightCard key={f.id} flight={f} onClick={() => setSelected(f.id === selectedId ? null : f.id)} />
              ))}
        </div>
      </div>
    </div>
  )
}