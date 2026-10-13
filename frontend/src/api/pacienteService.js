import apiClient from './client.js'

// Backend: PacienteController -> POST /api/pacientes (requiere estar autenticado)
export async function crearPaciente(paciente) {
  const { data } = await apiClient.post('/pacientes', paciente)
  return data
}

export async function listarPacientes() {
  const { data } = await apiClient.get('/pacientes')
  return data
}

export async function buscarPacientePorId(id) {
  const { data } = await apiClient.get(`/pacientes/${id}`)
  return data
}
