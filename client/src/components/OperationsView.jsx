import FlightCard from './FlightCard'

const labels = {
  messages: { title: 'Messages', description: 'Operational communications and flight alerts will collect here.' },
  payments: { title: 'Payments', description: 'Manage plan billing, invoices, and workspace payment methods.' },
  history: { title: 'History', description: 'Review past tracking sessions, routes, and operational events.' },
  smart: { title: 'Smart Routes', description: 'Compare route patterns and discover more efficient flight paths.' },
  settings: { title: 'Settings', description: 'Configure workspace preferences, alerts, and team access.' },
  support: { title: 'Support', description: 'Find guidance and contact the team behind your operations workspace.' },
}

function Header({ eyebrow, title, detail }) {
  return <header className="ops-view__head"><div><span className="ops-view__eyebrow">{eyebrow}</span><h1>{title}</h1><p>{detail}</p></div></header>
}

function FlightList({ flights, selectedId, onSelect, empty = 'No flights match this view.' }) {
  if (!flights.length) return <div className="ops-empty"><strong>Nothing on radar</strong><span>{empty}</span></div>
  return <div className="ops-list">{flights.map((flight) => <FlightCard key={flight.uid} flight={flight} selected={flight.uid === selectedId} onClick={() => onSelect(flight.uid)} />)}</div>
}

export default function OperationsView({ nav, flights, selectedId, onSelect, news }) {
  const active = flights.filter((f) => ['En route', 'Boarding', 'Departed'].includes(f.status))
  const popular = [...flights].sort((a, b) => (b.progress || 0) - (a.progress || 0)).slice(0, 6)

  if (nav === 'overview') return <main className="ops-view"><Header eyebrow="Operations center" title="Overview" detail="A concise read on the network around Delhi." /><div className="ops-metrics"><div><strong>{flights.length}</strong><span>Visible flights</span></div><div><strong>{active.length}</strong><span>Active routes</span></div><div><strong>{news.length}</strong><span>Ops brief items</span></div></div><section className="ops-view__section"><div className="section-h"><i />Most active flights</div><FlightList flights={popular.slice(0, 3)} selectedId={selectedId} onSelect={onSelect} /></section></main>
  if (nav === 'tracking.orders') return <main className="ops-view"><Header eyebrow="Tracking / personal" title="My Flights" detail="Your selected flights and active watch list." /><FlightList flights={flights} selectedId={selectedId} onSelect={onSelect} /></main>
  if (nav === 'tracking.active') return <main className="ops-view"><Header eyebrow="Tracking / live" title="Active Routes" detail="Flights currently moving through the network." /><FlightList flights={active} selectedId={selectedId} onSelect={onSelect} /></main>
  if (nav === 'tracking.popular') return <main className="ops-view"><Header eyebrow="Tracking / pulse" title="Popular Routes" detail="The routes attracting the most current activity." /><FlightList flights={popular} selectedId={selectedId} onSelect={onSelect} /></main>
  if (nav === 'tracking.weather') return <main className="ops-view"><Header eyebrow="Tracking / conditions" title="Weather" detail="Weather monitoring is based on current route visibility." /><div className="ops-empty"><strong>Clear operational picture</strong><span>Live weather overlays will be added when the aviation feed exposes conditions.</span></div></main>
  const copy = labels[nav] || { title: 'Operations', description: 'Choose a section from the navigation rail.' }
  return <main className="ops-view"><Header eyebrow="Workspace" title={copy.title} detail={copy.description} /><div className="ops-empty"><strong>{copy.title} workspace ready</strong><span>This workspace is intentionally quiet until its data connection is enabled.</span></div></main>
}

export { FlightList }
