import apiClient from './client.js'

// Endpoint público (no requiere token) — solo conteos, para la pantalla de login.
export async function obtenerEstadisticasPublicas() {
  const { data } = await apiClient.get('/publico/estadisticas')
  return data
}
