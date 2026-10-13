import apiClient from './client.js'

export async function listarUsuarios() {
  const { data } = await apiClient.get('/usuarios')
  return data
}

export async function restablecerPassword(id, password) {
  const { data } = await apiClient.put(`/usuarios/${id}/password`, { password })
  return data
}
