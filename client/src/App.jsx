import { useEffect, useMemo, useRef, useState } from 'react'
import useFlightStore from './store/useFlightStore'
import Sidebar from './components/sidebar'
import MapCanvas from './components/MapCanvas'
import DetailPanel from './components/DetailPanel'
import FlightCard from './components/FlightCard'
import OperationsView from './components/OperationsView'
import { Icon, I } from './components/icons'

export default function App() {
  const {
    flights,
    news,
    selectedId,
    loading,
    query,
    error,
    nav,
    followed,
    fetchFlights,
    fetchNews,
    setSelected,
    tick,
    sidebarOpen,
    setSidebarOpen,
    toggleFollow,
    setNav,
    clearFollowed,
  } = useFlightStore()

  const mapApi = useRef(null)
  const [shareState, setShareState] = useState('')
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
    const id = setInterval(tick, 1200)
    return () => clearInterval(id)
  }, [tick])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        document.querySelector('.rail__search input')?.focus()
      }
      if (e.key === 'Escape') {
        if (sidebarOpen) setSidebarOpen(false)
        else setSelected(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSelected, sidebarOpen, setSidebarOpen])

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${selected.id} on SkyPulse`,
          text: `${selected.from} to ${selected.to}`,
          url,
        })
        setShareState('Shared')
      } else {
        await navigator.clipboard.writeText(url)
        setShareState('Copied')
      }
      setTimeout(() => setShareState(''), 1800)
    } catch {
      setShareState('Cancelled')
      setTimeout(() => setShareState(''), 1200)
    }
  }

  const live = nav === 'tracking'

  return (
    <div className="ops-shell">
      <Sidebar />
      {sidebarOpen && (
        <button
          type="button"
          className="rail-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <div className={`ops-stage ${live ? '' : 'ops-stage--view'}`}>
        {live ? (
          <>
            <MapCanvas
              flights={visible}
              selectedId={selectedId}
              onSelect={setSelected}
              onReady={(api) => { mapApi.current = api }}
            />
            <div className="map-vignette" />
            <button
              type="button"
              className="icon-btn menu-fab hud__chip"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              aria-expanded={sidebarOpen}
              aria-controls="skypulse-rail"
            >
              <Icon d={I.menu} size={16} />
            </button>
            {selected && (
              <DetailPanel
                flight={selected}
                followed={Boolean(followed[selected.uid])}
                onClose={() => setSelected(null)}
                onFollow={() => toggleFollow(selected.uid)}
                onRoute={() => mapApi.current?.focusRoute?.()}
                onShare={share}
                shareState={shareState}
              />
            )}
            <div className="hud">
              <button
                type="button"
                className="hud__chip"
                onClick={() => error && fetchFlights({ dep_iata: 'DEL' })}
              >
                <i className="live-dot" />
                {error ? 'Signal lost — retry' : 'Live operations'}
              </button>
              <div className="zoom">
                <button type="button" onClick={() => mapApi.current?.zoomIn()} aria-label="Zoom in">+</button>
                <button type="button" onClick={() => mapApi.current?.zoomOut()} aria-label="Zoom out">−</button>
              </div>
            </div>
            <div className="flight-strip">
              {loading && Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="fcard is-skeleton" aria-hidden="true" />
              ))}
              {!loading && visible.length === 0 && (
                <p className="mono" style={{ color: '#777', fontSize: 12, padding: 12 }}>No matching flights.</p>
              )}
              {!loading && visible.map((f) => (
                <FlightCard
                  key={f.uid}
                  flight={f}
                  followed={Boolean(followed[f.uid])}
                  selected={f.uid === selectedId}
                  onClick={() => setSelected(f.uid)}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              className="icon-btn menu-fab hud__chip"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              aria-expanded={sidebarOpen}
              aria-controls="skypulse-rail"
            >
              <Icon d={I.menu} size={16} />
            </button>
            <OperationsView
              nav={nav}
              flights={flights}
              selectedId={selectedId}
              followed={followed}
              query={query}
              news={news}
              onSelect={(id) => { setSelected(id); setNav('tracking') }}
              onOpenTracking={() => setNav('tracking')}
              onClearFollowed={clearFollowed}
            />
          </>
        )}
      </div>
    </div>
  )
}
