import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { confirmarPago } from '../../api/pagoService.js'
import { extraerMensajeError } from '../../utils/errorMessage.js'
import { formatoCentavos } from '../../utils/planes.js'
import EstadoBadge from '../../components/EstadoBadge.jsx'
import SuccessCheck from '../../components/SuccessCheck.jsx'
import './Billing.css'

// Página a la que Wompi devuelve al usuario (?id=<transacción>). No confiamos en lo
// que diga la URL: el backend consulta a Wompi el estado real antes de dar el plan.
export default function PaymentResult() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const id = params.get('id')

  const [estado, setEstado] = useState(id ? 'loading' : 'sin-id')
  const [pago, setPago] = useState(null)
  const [error, setError] = useState(null)

  const verificar = useCallback(() => {
    if (!id) return
    setEstado('loading')
    setError(null)
    confirmarPago(id)
      .then((p) => {
        setPago(p)
        setEstado(p.estado === 'APROBADO' ? 'success' : 'fin')
      })
      .catch((err) => {
        setError(extraerMensajeError(err, 'No se pudo verificar el pago.'))
        setEstado('error')
      })
  }, [id])

  useEffect(() => {
    verificar()
  }, [verificar])

  let titulo = 'Resultado del pago'
  let texto = ''
  if (estado === 'sin-id') texto = 'No recibimos el identificador de la transacción. Si pagaste, revisa tu historial de facturación.'
  else if (estado === 'error') texto = error
  else if (pago?.estado === 'PENDIENTE') {
    titulo = 'Pago en proceso'
    texto = 'La entidad aún no confirma la transacción. Puedes volver a verificar en unos segundos.'
  } else if (pago?.estado === 'RECHAZADO') {
    titulo = 'Pago rechazado'
    texto = 'La entidad no aprobó la transacción. No se realizó ningún cobro; puedes intentar con otro método.'
  } else if (pago) {
    titulo = 'Pago no completado'
    texto = 'La transacción no se pudo completar. No se realizó ningún cobro.'
  }

  return (
    <div className="pay-page">
      <div className="pay-wrap">
        {estado !== 'loading' && estado !== 'success' && (
          <section className="pay-card pr-card">
            <h2>{titulo}</h2>
            {pago && (
              <p>
                <EstadoBadge estado={pago.estado} /> · {formatoCentavos(pago.montoCentavos)} · {pago.referencia}
              </p>
            )}
            <p>{texto}</p>
            <div className="pr-actions">
              {(estado === 'error' || pago?.estado === 'PENDIENTE') && (
                <button type="button" className="pr-btn" onClick={verificar}>
                  Verificar de nuevo
                </button>
              )}
              <Link className="pr-btn primario" to="/facturacion">
                Ir a mi facturación
              </Link>
            </div>
          </section>
        )}
      </div>

      <SuccessCheck
        status={estado === 'loading' ? 'loading' : estado === 'success' ? 'success' : 'idle'}
        title="¡Pago aprobado!"
        detail={pago ? `Referencia ${pago.referencia} · ${formatoCentavos(pago.montoCentavos)}` : undefined}
        onClose={() => navigate('/facturacion')}
      />
    </div>
  )
}
