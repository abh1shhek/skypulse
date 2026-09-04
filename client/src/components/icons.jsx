export function Icon({ d, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

export const I = {
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  radar: 'M12 21a9 9 0 1 0-9-9M12 17a5 5 0 1 0-5-5M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
  plane: 'M21 16v-2l-8-5V3.5A1.5 1.5 0 0012 2a1.5 1.5 0 00-1.5 1.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z',
  route: 'M4 19c4-12 12-12 16 0M8 12h8',
  star: 'M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z',
  cloud: 'M7 18h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 2A3.5 3.5 0 0 0 7 18z',
  message: 'M4 6h16v10H8l-4 4z',
  card: 'M3 7h18v12H3zM3 11h18',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  spark: 'M12 3v6M12 15v6M3 12h6M15 12h6',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a8 8 0 0 0 .1-6l2-1.2-2-3.4-2.3.8a8 8 0 0 0-5.2-3l-.4-2.4H10.4l-.4 2.4a8 8 0 0 0-5.2 3L2.5 4.4l-2 3.4 2 1.2a8 8 0 0 0 .1 6l-2 1.2 2 3.4 2.3-.8a8 8 0 0 0 5.2 3l.4 2.4h3.2l.4-2.4a8 8 0 0 0 5.2-3l2.3.8 2-3.4z',
  help: 'M12 17h.01M9.1 9a3 3 0 1 1 4.2 2.7c-.8.4-1.3 1-1.3 1.8V14M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  close: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  menu: 'M4 7h16M4 12h16M4 17h16',
}

export function PlaneGlyph({ size = 14, filled = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'} strokeWidth="1.5">
      <path d={I.plane} />
    </svg>
  )
}
