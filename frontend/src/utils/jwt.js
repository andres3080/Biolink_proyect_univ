// Decodifica el payload de un JWT sin verificar la firma (solo para leer
// claims en el cliente, como el rol). La verificación real la hace el backend.
export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(normalized)
    return JSON.parse(json)
  } catch (err) {
    return null
  }
}
