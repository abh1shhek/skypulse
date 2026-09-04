import { create } from 'zustand'
import { getFlights, getNews } from '../services/api'
import { enrichFlights, tickFlight } from '../lib/enrichFlights'

const useFlightStore = create((set, get) => ({
  flights: [],
  news: [],
  selectedId: null,
  loading: false,
  error: null,
  query: '',
  nav: 'tracking.orders',
  sidebarOpen: false,

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
