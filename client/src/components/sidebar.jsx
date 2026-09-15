import useFlightStore from '../store/useFlightStore'
import { I, Icon } from './icons'
import BrandMark from './BrandMark'

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

  const brief = news.filter((n) => n.url && n.url !== '#').slice(0, 3)

  const go = (id) => {
    setNav(id)
    setSidebarOpen(false)
  }

  return (
    <aside
      id="skypulse-rail"
      className={`rail ${sidebarOpen ? 'is-open' : ''}`}
      aria-label="SkyPulse navigation"
    >
      <div className="rail__brand">
        <div className="rail__mark">
          <BrandMark size={30} />
        </div>
        <div className="rail__name" aria-label="SkyPulse">
          <span className="rail__name-sky">SKY</span>
          <span className="rail__name-pulse">PULSE</span>
        </div>
        <button
          type="button"
          className="rail__close"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        >
          <Icon d={I.close} size={14} />
        </button>
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
        type="button"
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
          <div key={group.id} className="nav-group" role="group" aria-label={group.label}>
            <p className="nav-group__label" aria-hidden="true">{group.label}</p>
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

        {brief.length > 0 && (
          <div className="brief">
            <div className="brief__h">Ops brief</div>
            {brief.map((n) => (
              <a
                key={n.url}
                className="brief__item"
                href={n.url}
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
