import apiClient from './client.js'

export async function crearResultado(resultado) {
  const { data } = await apiClient.post('/resultados', resultado)
  return data
}

export async function listarResultados() {
  const { data } = await apiClient.get('/resultados')
  return data
}
