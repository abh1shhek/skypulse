import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getFlights = (params) =>
  api.get('/flights', { params }).then(r => r.data.data);

export const getNews = (params) =>
  api.get('/news', { params }).then(r => r.data.data);