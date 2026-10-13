import apiClient from './client.js'

export async function listarEquipos() {
  const { data } = await apiClient.get('/equipos')
  return data
}

export async function listarEventosDeEquipo(equipoId) {
  const { data } = await apiClient.get(`/equipos/${equipoId}/eventos`)
  return data
}
