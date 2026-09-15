import { create } from 'zustand'
import { getFlights, getNews } from '../services/api'
import { enrichFlights, tickFlight } from '../lib/enrichFlights'
import { NAV_IDS } from '../lib/nav'

function readFollowed() {
  try {
    const raw = JSON.parse(localStorage.getItem('skypulse.followed') || '{}')
    return raw && typeof raw === 'object' ? raw : {}
  } catch {
    return {}
  }
}

function navFromHash() {
  if (typeof window === 'undefined') return 'tracking'
  const id = window.location.hash.replace(/^#/, '')
  return NAV_IDS.includes(id) ? id : 'tracking'
}

function writeHash(nav, replace = false) {
  if (typeof window === 'undefined') return
  const next = `#${nav}`
  if (window.location.hash === next) return
  if (replace) window.history.replaceState({ nav }, '', next)
  else window.history.pushState({ nav }, '', next)
}

const useFlightStore = create((set, get) => ({
  flights: [],
  news: [],
  selectedId: null,
  loading: true,
  error: null,
  query: '',
  nav: navFromHash(),
  sidebarOpen: false,
  followed: typeof window === 'undefined' ? {} : readFollowed(),
  toggleFollow: (id) => set((state) => {
    const followed = { ...state.followed, [id]: !state.followed[id] }
    if (!followed[id]) delete followed[id]
    localStorage.setItem('skypulse.followed', JSON.stringify(followed))
    return { followed }
  }),
  clearFollowed: () => {
    localStorage.setItem('skypulse.followed', '{}')
    set({ followed: {} })
  },

  fetchFlights: async (params = { dep_iata: 'DEL' }) => {
    set({ loading: true, error: null })
    try {
      const data = await getFlights(params)
      if (!Array.isArray(data)) throw new Error('Invalid flights payload')
      const flights = enrichFlights(data)
      const selectedId = get().selectedId
      const stillThere = selectedId && flights.some((f) => f.uid === selectedId)
      set({
        flights,
        loading: false,
        selectedId: stillThere ? selectedId : flights[0]?.uid || null,
      })
    } catch {
      set({ error: 'Failed to load flights', loading: false, flights: [] })
    }
  },

  fetchNews: async (keywords = 'aviation India') => {
    try {
      const data = await getNews({ keywords })
      set({ news: data || [] })
    } catch {
      set({ news: [] })
    }
  },

  tick: () => {
    const { flights } = get()
    if (!flights.length) return
    set({ flights: flights.map((f) => tickFlight(f)) })
  },

  setSelected: (id) => set({ selectedId: id }),
  setQuery: (query) => set({ query }),
  setNav: (nav) => {
    if (!NAV_IDS.includes(nav)) return
    set({ nav })
    writeHash(nav)
  },
  syncNavFromLocation: () => {
    const next = navFromHash()
    if (get().nav === next) return
    set({ nav: next })
  },
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))

export default useFlightStore
