import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL, timeout: 20000 })

export const getFlights = (params) =>
  api.get('/flights', { params }).then((r) => r.data.data)

export const getNews = (params) =>
  api.get('/news', { params }).then((r) => r.data.data)
