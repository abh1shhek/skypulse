import { create } from 'zustand'
import { getFlights, getNews } from '../services/api'
import { enrichFlights, tickFlight } from '../lib/enrichFlights'

function readFollowed() {
  try {
    const raw = JSON.parse(localStorage.getItem('skypulse.followed') || '{}')
    return raw && typeof raw === 'object' ? raw : {}
  } catch {
    return {}
  }
}

const useFlightStore = create((set, get) => ({
  flights: [],
  news: [],
  selectedId: null,
  loading: false,
  error: null,
  query: '',
  nav: 'tracking',
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
      const flights = enrichFlights(data)
      set({
        flights,
        loading: false,
        selectedId: get().selectedId || flights[0]?.uid || null,
      })
    } catch {
      set({ error: 'Failed to load flights', loading: false })
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
  setNav: (nav) => set({ nav }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))

export default useFlightStore
