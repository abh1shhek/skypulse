import useFlightStore from '../store/useFlightStore'
import { I, Icon } from './icons'

const PRIMARY = [
  { id: 'overview', label: 'Overview', icon: I.grid },
  { id: 'tracking', label: 'Live Tracking', icon: I.radar },
]

const TRACKING = [
  { id: 'tracking.orders', label: 'My Flights' },
  { id: 'tracking.active', label: 'Active Routes' },
  { id: 'tracking.popular', label: 'Popular Routes' },
  { id: 'tracking.weather', label: 'Weather' },
]

const SECONDARY = [
  { id: 'messages', label: 'Messages', icon: I.message },
  { id: 'payments', label: 'Payments', icon: I.card },
  { id: 'history', label: 'History', icon: I.clock },
  { id: 'smart', label: 'Smart Routes', icon: I.spark },
]

const FOOT = [
  { id: 'settings', label: 'Settings', icon: I.gear },
  { id: 'support', label: 'Support', icon: I.help },
]

export default function Sidebar() {
  const { query, setQuery, nav, setNav, sidebarOpen, setSidebarOpen, setSelected, flights, news } = useFlightStore()

  const go = (id) => {
    setNav(id)
    setSidebarOpen(false)
  }

  return (
    <aside className={`rail ${sidebarOpen ? 'is-open' : ''}`}>
      <div className="rail__brand">
        <div className="rail__mark">
          <Icon d={I.plane} size={13} />
        </div>
        <div className="rail__name">SkyPulse</div>
      </div>

      <label className="rail__search">
        <Icon d={I.search} size={14} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search flight, city, ICAO"
        />
        <span className="kbd">/</span>
      </label>

      <button
        className="btn-primary"
        onClick={() => {
          const first = flights[0]
          if (first) setSelected(first.uid)
        }}
      >
        <Icon d={I.plus} size={14} />
        Track flight
      </button>

      <nav className="rail__nav">
        {PRIMARY.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${nav.startsWith(item.id) ? 'is-active' : ''}`}
            onClick={() => go(item.id === 'tracking' ? 'tracking.orders' : item.id)}
          >
            <Icon d={item.icon} size={15} />
            {item.label}
          </button>
        ))}
        {TRACKING.map((item) => (
          <button
            key={item.id}
            className={`nav-sub ${nav === item.id ? 'is-active' : ''}`}
            onClick={() => go(item.id)}
          >
            {item.label}
          </button>
        ))}
        {SECONDARY.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${nav === item.id ? 'is-active' : ''}`}
            onClick={() => go(item.id)}
          >
            <Icon d={item.icon} size={15} />
            {item.label}
          </button>
        ))}

        {news.length > 0 && (
          <div className="brief">
            <div className="brief__h">Ops brief</div>
            {news.slice(0, 3).map((n) => (
              <a
                key={n.url || n.title}
                className="brief__item"
                href={n.url || '#'}
                target="_blank"
                rel="noreferrer"
              >
                <p>{n.title}</p>
                <span>{n.source}</span>
              </a>
            ))}
          </div>
        )}
      </nav>

      <div className="rail__foot">
        {FOOT.map((item) => (
          <button key={item.id} className="nav-item" onClick={() => go(item.id)}>
            <Icon d={item.icon} size={15} />
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  )
}
