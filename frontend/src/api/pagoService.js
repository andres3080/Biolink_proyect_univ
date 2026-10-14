import apiClient from './client.js'

// Catálogo público de planes (sin login), para la portada.
export async function listarPlanes() {
  const { data } = await apiClient.get('/publico/planes')
  return data
}

// Crea el pedido. Si Wompi está configurado devuelve { modo:'WOMPI', checkoutUrl };
// si no, { modo:'SIMULADO' } y el pago se cierra con simularPago().
export async function crearCheckout(plan, periodo) {
  const { data } = await apiClient.post('/pagos/checkout', { plan, periodo })
  return data
}

// Tras volver de Wompi: el backend consulta a Wompi el estado real de la transacción.
export async function confirmarPago(transactionId) {
  const { data } = await apiClient.post('/pagos/confirmar', { transactionId })
  return data
}

// Solo modo demostración (sin claves de Wompi).
export async function simularPago(referencia, resultado, metodo) {
  const { data } = await apiClient.post(`/pagos/simulado/${encodeURIComponent(referencia)}`, {
    resultado,
    metodo,
  })
  return data
}

export async function listarPagos() {
  const { data } = await apiClient.get('/pagos')
  return data
}

export async function obtenerSuscripcion() {
  const { data } = await apiClient.get('/pagos/suscripcion')
  return data
}
