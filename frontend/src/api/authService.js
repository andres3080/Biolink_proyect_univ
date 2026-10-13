import apiClient from './client.js'

// El backend (AuthController) espera { username, password } y devuelve { token }.
// El formulario de login pide "correo", así que aquí se envía ese valor como username.
export async function login(username, password) {
  const { data } = await apiClient.post('/auth/login', { username, password })
  return data.token
}

// El backend (AuthController.registrar) espera { username, password, rol } y
// devuelve el Usuario creado (sin la contraseña en texto plano, ya la hashea).
export async function crearUsuario({ username, password, rol }) {
  const { data } = await apiClient.post('/auth/registro', { username, password, rol })
  return data
}
