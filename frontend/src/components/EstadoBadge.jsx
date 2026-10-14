import './EstadoBadge.css'

// Traduce los valores de los enums de estado del backend (EstadoOrden,
// EstadoMuestra, EstadoResultado) a una etiqueta en español y un color
// consistente en toda la app.
const ESTADO_INFO = {
  PENDIENTE: { label: 'Pendiente', tono: 'pendiente' },
  EN_PROCESO: { label: 'En proceso', tono: 'proceso' },
  TOMADA: { label: 'Tomada', tono: 'proceso' },
  COMPLETADA: { label: 'Completada', tono: 'ok' },
  PROCESADA: { label: 'Procesada', tono: 'ok' },
  VALIDADO: { label: 'Validado', tono: 'ok' },
  PENDIENTE_REVISION: { label: 'Pendiente de revisión', tono: 'alerta' },
  // Pagos de suscripción
  APROBADO: { label: 'Aprobado', tono: 'ok' },
  RECHAZADO: { label: 'Rechazado', tono: 'error' },
  ANULADO: { label: 'Anulado', tono: 'desconocido' },
  ERROR: { label: 'Error', tono: 'error' },
}

export default function EstadoBadge({ estado }) {
  if (!estado) {
    return <span className="estado-pill tono-desconocido">—</span>
  }
  const info = ESTADO_INFO[estado] || { label: estado, tono: 'desconocido' }
  return <span className={`estado-pill tono-${info.tono}`}>{info.label}</span>
}
