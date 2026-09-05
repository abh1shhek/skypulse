import { useEffect, useMemo, useRef, useState } from 'react'
import useFlightStore from './store/useFlightStore'
import Sidebar from './components/sidebar'
import MapCanvas from './components/MapCanvas'
import DetailPanel from './components/DetailPanel'
import FlightCard from './components/FlightCard'
import OperationsView from './components/OperationsView'
import { Icon, I } from './components/icons'

export default function App() {
  const { flights, news, selectedId, loading, query, error, nav, followed, fetchFlights, fetchNews, setSelected, tick, sidebarOpen, setSidebarOpen, toggleFollow, setNav } = useFlightStore()
  const mapApi = useRef(null)
  const [shareState, setShareState] = useState('')
  const [routeExpanded, setRouteExpanded] = useState(false)
  const selected = flights.find((f) => f.uid === selectedId)
  const visible = useMemo(() => { const q = query.trim().toLowerCase(); return q ? flights.filter((f) => [f.id, f.callsign, f.airline, f.from, f.to, f.fromCity, f.toCity].join(' ').toLowerCase().includes(q)) : flights }, [flights, query])

  useEffect(() => { fetchFlights({ dep_iata: 'DEL' }); fetchNews('aviation') }, [])
  useEffect(() => { const id = setInterval(tick, 1200); return () => clearInterval(id) }, [tick])
  useEffect(() => { const onKey = (e) => { if (e.key === '/' && e.target.tagName !== 'INPUT') { e.preventDefault(); document.querySelector('.rail__search input')?.focus() }; if (e.key === 'Escape') setSelected(null) }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [setSelected])

  const share = async () => {
    const url = window.location.href
    try { if (navigator.share) await navigator.share({ title: `${selected.id} on SkyPulse`, text: `${selected.from} to ${selected.to}`, url }); else await navigator.clipboard.writeText(url); setShareState(navigator.share ? 'Shared' : 'Copied'); setTimeout(() => setShareState(''), 1800) } catch { setShareState('Cancelled'); setTimeout(() => setShareState(''), 1200) }
  }

  const live = nav.startsWith('tracking')
  return <div className="ops-shell"><Sidebar />{sidebarOpen && <div className="rail-backdrop" onClick={() => setSidebarOpen(false)} />}
    <div className={`ops-stage ${!live ? 'ops-stage--view' : ''}`}>
      {live ? <><MapCanvas flights={visible} selectedId={selectedId} routeExpanded={routeExpanded} onSelect={setSelected} onReady={(api) => { mapApi.current = api }} /><div className="map-vignette" /><button className="icon-btn menu-fab hud__chip" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Icon d={I.menu} size={16} /></button>
        {selected && <DetailPanel flight={selected} followed={Boolean(followed[selected.uid])} onClose={() => setSelected(null)} onFollow={() => toggleFollow(selected.uid)} onRoute={() => { setRouteExpanded(true); mapApi.current?.focusRoute?.() }} onShare={share} shareState={shareState} />}
        <div className="hud"><div className="hud__chip"><i className="live-dot" />{error ? 'Signal lost' : 'Live operations'}</div><div className="zoom"><button type="button" onClick={() => mapApi.current?.zoomIn()} aria-label="Zoom in">+</button><button type="button" onClick={() => mapApi.current?.zoomOut()} aria-label="Zoom out">−</button></div></div>
        <div className="flight-strip">{loading && <p className="mono" style={{ color: '#777', fontSize: 12, padding: 12 }}>Acquiring tracks…</p>}{!loading && visible.length === 0 && <p className="mono" style={{ color: '#777', fontSize: 12, padding: 12 }}>No matching flights.</p>}{visible.map((f) => <FlightCard key={f.uid} flight={f} followed={Boolean(followed[f.uid])} selected={f.uid === selectedId} onClick={() => setSelected(f.uid)} />)}</div>
      </> : <><button className="icon-btn menu-fab hud__chip" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Icon d={I.menu} size={16} /></button><OperationsView nav={nav} flights={flights} selectedId={selectedId} onSelect={(id) => { setSelected(id); setNav('tracking.orders') }} news={news} /></>}
    </div></div>
}
