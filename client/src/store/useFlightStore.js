import { create } from 'zustand';
import { getFlights, getNews } from '../services/api';

const useFlightStore = create((set) => ({
  flights:    [],
  news:       [],
  selectedId: null,
  loading:    false,
  error:      null,

  fetchFlights: async (params = { dep_iata: 'DEL' }) => {
    set({ loading: true, error: null });
    try {
      const data = await getFlights(params);
      set({ flights: data, loading: false });
    } catch {
      set({ error: 'Failed to load flights', loading: false });
    }
  },

  fetchNews: async (keywords = 'aviation India') => {
    try {
      const data = await getNews({ keywords });
      set({ news: data });
    } catch {
      set({ error: 'Failed to load news' });
    }
  },

  setSelected: (id) => set({ selectedId: id }),
}));

export default useFlightStore;