import apiClient from './client.js'

export async function crearOrden(orden) {
  const { data } = await apiClient.post('/ordenes', orden)
  return data
}

export async function listarOrdenes() {
  const { data } = await apiClient.get('/ordenes')
  return data
}
