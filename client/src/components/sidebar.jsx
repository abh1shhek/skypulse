import useFlightStore from '../store/useFlightStore'
import { I, Icon } from './icons'

const GROUPS = [
  {
    id: 'core',
    label: 'Core',
    items: [
      { id: 'overview', label: 'Overview', icon: I.grid },
      { id: 'tracking', label: 'Live Tracking', icon: I.radar, primary: true },
    ],
  },
  {
    id: 'mine',
    label: 'My flights',
    items: [
      { id: 'tracking.orders', label: 'My Flights', icon: I.plane },
      { id: 'tracking.active', label: 'Active Routes', icon: I.route },
    ],
  },
  {
    id: 'discover',
    label: 'Discover',
    items: [
      { id: 'tracking.popular', label: 'Popular Routes', icon: I.star },
      { id: 'tracking.weather', label: 'Weather', icon: I.cloud },
    ],
  },
]

const FOOT = [
  { id: 'settings', label: 'Settings', icon: I.gear },
  { id: 'support', label: 'Support', icon: I.help },
]

function isActive(nav, id) {
  return nav === id
}

export default function Sidebar() {
  const { query, setQuery, nav, setNav, sidebarOpen, setSidebarOpen, setSelected, flights, news } = useFlightStore()

  const go = (id) => {
    setNav(id)
    setSidebarOpen(false)
  }

  return (
    <aside className={`rail ${sidebarOpen ? 'is-open' : ''}`} aria-label="SkyPulse">
      <div className="rail__brand">
        <div className="rail__mark" aria-hidden="true">
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
          aria-label="Search flights"
        />
        <span className="kbd">/</span>
      </label>

      <button
        className="btn-primary"
        onClick={() => {
          const first = flights[0]
          go('tracking')
          if (first) setSelected(first.uid)
        }}
      >
        <Icon d={I.plus} size={14} />
        Track flight
      </button>

      <nav className="rail__nav" aria-label="Main">
        {GROUPS.map((group) => (
          <div key={group.id} className="nav-group">
            <p className="nav-group__label">{group.label}</p>
            {group.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={[
                  'nav-item',
                  item.primary ? 'nav-item--primary' : '',
                  isActive(nav, item.id) ? 'is-active' : '',
                ].filter(Boolean).join(' ')}
                aria-current={isActive(nav, item.id) ? 'page' : undefined}
                onClick={() => go(item.id)}
              >
                <Icon d={item.icon} size={item.primary ? 16 : 15} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
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
          <button
            key={item.id}
            type="button"
            className={`nav-item ${isActive(nav, item.id) ? 'is-active' : ''}`}
            aria-current={isActive(nav, item.id) ? 'page' : undefined}
            onClick={() => go(item.id)}
          >
            <Icon d={item.icon} size={15} />
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  )
}
