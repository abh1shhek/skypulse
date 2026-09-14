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
    syncNavFromLocation,
  } = useFlightStore()

  const mapApi = useRef(null)
  const [shareState, setShareState] = useState('')
  const [mapFollow, setMapFollow] = useState(true)
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
    syncNavFromLocation()
    const onPop = () => syncNavFromLocation()
    window.addEventListener('popstate', onPop)
    window.addEventListener('hashchange', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('hashchange', onPop)
    }
  }, [syncNavFromLocation])

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

  const selectFlight = (id) => {
    setSelected(id)
    setMapFollow(true)
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
              onSelect={selectFlight}
              follow={mapFollow}
              onFollowChange={setMapFollow}
              onReady={(api) => { mapApi.current = api }}
            />
            <div className="map-vignette" />
            <button
              type="button"
              className="menu-fab"
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
              <div className="map-tools">
                <div className="zoom">
                  <button type="button" onClick={() => mapApi.current?.zoomIn()} aria-label="Zoom in">+</button>
                  <button type="button" onClick={() => mapApi.current?.zoomOut()} aria-label="Zoom out">−</button>
                </div>
                <button
                  type="button"
                  className={`map-follow ${mapFollow ? 'is-on' : ''}`}
                  aria-pressed={mapFollow}
                  onClick={() => setMapFollow((on) => !on)}
                >
                  Follow
                </button>
              </div>
            </div>
            <section className="live-strip" aria-label="Live flights">
              <p className="live-strip__label">Live flights</p>
              <div className="flight-strip">
                {loading && Array.from({ length: 3 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="fcard is-skeleton" aria-hidden="true" />
                ))}
                {!loading && visible.length === 0 && (
                  <p className="live-strip__empty">No matching flights.</p>
                )}
                {!loading && visible.map((f) => (
                  <FlightCard
                    key={f.uid}
                    flight={f}
                    followed={Boolean(followed[f.uid])}
                    selected={f.uid === selectedId}
                    pinSelected
                    onClick={() => selectFlight(f.uid)}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <button
              type="button"
              className="menu-fab"
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
              onSelect={(id) => { selectFlight(id); setNav('tracking') }}
              onOpenTracking={() => setNav('tracking')}
              onClearFollowed={clearFollowed}
            />
          </>
        )}
      </div>
    </div>
  )
}
