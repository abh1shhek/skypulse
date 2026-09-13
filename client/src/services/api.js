import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL, timeout: 20000 })

export const getFlights = (params) =>
  api.get('/flights', { params }).then((r) => r.data.data)

export const getNews = (params) =>
  api.get('/news', { params }).then((r) => r.data.data)

export async function getWeather(lat, lng) {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lng))
  url.searchParams.set('current', 'temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m')
  url.searchParams.set('wind_speed_unit', 'kmh')
  const res = await fetch(url)
  if (!res.ok) throw new Error('weather')
  return res.json()
}
