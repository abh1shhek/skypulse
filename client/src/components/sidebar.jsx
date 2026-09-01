import useFlightStore from '../store/useFlightStore'

const NAV = [
  { label: 'Overview', icon: '⊞' },
  { label: 'Tracking', icon: '⌖', children: ['My flights', 'Active routes', 'Popular routes'] },
  { label: 'Message', icon: '○' },
  { label: 'History', icon: '◷' },
  { label: 'Smart routes', icon: '✦' },
]

export default function Sidebar() {
  const { news } = useFlightStore()

  return (
    <div style={{
      width: 260, flexShrink: 0, background: '#1c1c1f',
      display: 'flex', flexDirection: 'column', height: '100vh',
      borderRight: '1px solid #2a2a2e'
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid #2a2a2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: '#fff', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✈</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>SkyPulse</span>
        </div>
        <span style={{ color: '#444', fontSize: 16, cursor: 'pointer' }}>⊡</span>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 14px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#222226', borderRadius: 8, padding: '8px 12px' }}>
          <span style={{ color: '#555' }}>⌕</span>
          <input placeholder="Search flights" style={{ background: 'none', border: 'none', outline: 'none', color: '#888', fontSize: 12, flex: 1, fontFamily: 'inherit' }} />
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#444' }}>/</span>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '4px 14px 12px' }}>
        <button style={{ width: '100%', background: '#7c3aed', border: 'none', borderRadius: 8, padding: '10px 0', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Track flight
        </button>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {NAV.map((item, i) => (
          <div key={item.label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 7, color: i === 1 ? '#fff' : '#777', fontSize: 13, cursor: 'pointer', background: i === 1 ? '#2a2a2e' : 'transparent' }}>
              <span style={{ fontSize: 13, width: 16, textAlign: 'center' }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            {item.children && item.children.map((child, ci) => (
              <div key={child} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px 8px 40px', color: ci === 0 ? '#ccc' : '#555', fontSize: 12, cursor: 'pointer', borderRadius: 7 }}>
                <span style={{ color: '#444', fontSize: 10 }}>↳</span> {child}
              </div>
            ))}
          </div>
        ))}

        {/* News section */}
        {news.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #2a2a2e' }}>
            <div style={{ fontSize: 10, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 12px 8px', fontWeight: 600 }}>Aviation News</div>
            {news.slice(0, 4).map((n, i) => (
              <div key={i} style={{ padding: '10px 12px', borderBottom: '1px solid #1e1e22', cursor: 'pointer' }}>
                <p style={{ fontSize: 11, color: '#666', lineHeight: 1.5, margin: 0 }}>{n.title}</p>
                <span style={{ fontSize: 10, color: '#444', marginTop: 4, display: 'block' }}>{n.source}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ borderTop: '1px solid #2a2a2e', padding: '10px 8px' }}>
        {['Settings', 'Support', 'Log out'].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', color: '#666', fontSize: 13, cursor: 'pointer', borderRadius: 7 }}>
            <span style={{ width: 16, textAlign: 'center' }}>{item === 'Settings' ? '⚙' : item === 'Support' ? '?' : '→'}</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}