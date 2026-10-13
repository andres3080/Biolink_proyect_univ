import axios from 'axios'

// baseURL relativa: en desarrollo la resuelve el proxy de vite.config.js,
// en producción debe servirse detrás del mismo dominio/reverse proxy que el backend.
const apiClient = axios.create({
  baseURL: '/api',
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('biolink_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient
