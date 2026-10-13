import apiClient from './client.js'

export async function listarExamenes() {
  const { data } = await apiClient.get('/examenes')
  return data
}

export async function crearExamen(examen) {
  const { data } = await apiClient.post('/examenes', examen)
  return data
}

export async function actualizarExamen(id, examen) {
  const { data } = await apiClient.put(`/examenes/${id}`, examen)
  return data
}
