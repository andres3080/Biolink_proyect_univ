import apiClient from './client.js'

export async function crearMuestra(muestra) {
  const { data } = await apiClient.post('/muestras', muestra)
  return data
}

export async function listarMuestras() {
  const { data } = await apiClient.get('/muestras')
  return data
}
