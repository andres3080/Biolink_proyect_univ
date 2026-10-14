import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  crearCheckout,
  listarPlanes,
  obtenerSuscripcion,
  simularPago,
} from '../../api/pagoService.js'
import { PLANES_RESPALDO, formatoCop } from '../../utils/planes.js'
import { extraerMensajeError } from '../../utils/errorMessage.js'
import { useToast } from '../../components/Toast.jsx'
import SuccessCheck from '../../components/SuccessCheck.jsx'
import './Billing.css'

const METODOS = [
  { id: 'TARJETA', nombre: 'Tarjeta', nota: 'Crédito o débito' },
  { id: 'PSE', nombre: 'PSE', nota: 'Débito desde tu banco' },
  { id: 'NEQUI', nombre: 'Nequi', nota: 'Pago desde la app' },
  { id: 'BANCOLOMBIA', nombre: 'Bancolombia', nota: 'Botón de pago' },
]

function IconoMetodo({ id }) {
  const comun = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (id === 'TARJETA') {
    return (
      <svg {...comun}>
        <rect x="3" y="6" width="18" height="12" rx="2.5" />
        <path d="M3 10.5h18M7 15h3" />
      </svg>
    )
  }
  if (id === 'PSE') {
    return (
      <svg {...comun}>
        <path d="M4 10l8-5 8 5M6 10v7M10 10v7M14 10v7M18 10v7M4 19h16" />
      </svg>
    )
  }
  if (id === 'NEQUI') {
    return (
      <svg {...comun}>
        <rect x="7" y="3" width="10" height="18" rx="2.5" />
        <path d="M11 18h2" />
      </svg>
    )
  }
  return (
    <svg {...comun}>
      <path d="M4 8h16M4 8l2-3h12l2 3M6 8v10h12V8M10 12h4" />
    </svg>
  )
}

export default function Checkout() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [planes, setPlanes] = useState(PLANES_RESPALDO)
  const [codigo, setCodigo] = useState((params.get('plan') || 'PROFESIONAL').toUpperCase())
  const [periodo, setPeriodo] = useState(params.get('periodo') === 'ANUAL' ? 'ANUAL' : 'MENSUAL')
  const [metodo, setMetodo] = useState('TARJETA')
  const [resultadoSim, setResultadoSim] = useState('APROBADO')
  const [modo, setModo] = useState(null)
  const [feedback, setFeedback] = useState({ status: 'idle' })

  useEffect(() => {
    let cancelado = false
    listarPlanes()
      .then((d) => {
        if (!cancelado && Array.isArray(d) && d.length > 0) setPlanes(d)
      })
      .catch(() => {})
    obtenerSuscripcion()
      .then((s) => {
        if (!cancelado) setModo(s.modo)
      })
      .catch(() => {})
    return () => {
      cancelado = true
    }
  }, [])

  const plan = useMemo(
    () => planes.find((p) => p.codigo === codigo) || planes[0],
    [planes, codigo]
  )
  const total = periodo === 'ANUAL' ? plan.anualCop : plan.mensualCop
  const ahorro = plan.mensualCop * 12 - plan.anualCop
  const ocupado = feedback.status === 'loading'

  async function pagar() {
    setFeedback({ status: 'loading' })
    try {
      const pedido = await crearCheckout(plan.codigo, periodo)
      if (pedido.modo === 'WOMPI' && pedido.checkoutUrl) {
        // El navegador va a Wompi: ahí se capturan los datos de pago, no en BioLink.
        window.location.assign(pedido.checkoutUrl)
        return
      }
      const pago = await simularPago(pedido.referencia, resultadoSim, metodo)
      if (pago.estado === 'APROBADO') {
        setFeedback({
          status: 'success',
          title: '¡Pago aprobado!',
          detail: `Plan ${plan.nombre} activo. Referencia ${pago.referencia}`,
        })
      } else {
        setFeedback({ status: 'idle' })
        toast.error('El pago fue rechazado. Prueba con otro método de pago.')
      }
    } catch (err) {
      setFeedback({ status: 'idle' })
      toast.error(extraerMensajeError(err, 'No se pudo procesar el pago. Intenta de nuevo.'))
    }
  }

  return (
    <div className="pay-page">
      <div className="pay-wrap">
        <div className="pay-header">
          <div>
            <h1>Finalizar contratación</h1>
            <p>Revisa tu pedido y elige cómo quieres pagar.</p>
          </div>
          <Link to="/facturacion" className="pay-back">
            ← Plan y facturación
          </Link>
        </div>

        <div className="pay-demo" role="note">
          <span>
            <strong>Modo demostración.</strong>{' '}
            {modo === 'WOMPI'
              ? 'Conectado a Wompi en ambiente de pruebas: usa las tarjetas de prueba de Wompi. No se cobra dinero real.'
              : 'No hay pasarela configurada: el pago se simula dentro de BioLink. No se cobra dinero real.'}
          </span>
        </div>

        <div className="co-grid">
          <section className="pay-card" aria-label="Resumen del pedido">
            <h2>Resumen del pedido</h2>
            <div className="co-plan">
              <span className="co-plan-name">Plan {plan.nombre}</span>
            </div>
            <p className="co-plan-desc">{plan.descripcion}</p>

            <label className="sr-only" htmlFor="co-plan">Plan</label>
            <select id="co-plan" className="co-select" value={plan.codigo} onChange={(e) => setCodigo(e.target.value)}>
              {planes.map((p) => (
                <option key={p.codigo} value={p.codigo}>
                  {p.nombre} — {formatoCop(p.mensualCop)}/mes
                </option>
              ))}
            </select>

            <div className="co-seg" role="group" aria-label="Periodo">
              <button type="button" className={periodo === 'MENSUAL' ? 'activo' : ''} onClick={() => setPeriodo('MENSUAL')}>
                Mensual
              </button>
              <button type="button" className={periodo === 'ANUAL' ? 'activo' : ''} onClick={() => setPeriodo('ANUAL')}>
                Anual · 2 meses gratis
              </button>
            </div>

            <ul className="co-lines">
              <li>
                <span>Plan {plan.nombre} ({periodo === 'ANUAL' ? '12 meses' : '1 mes'})</span>
                <span>{formatoCop(total)}</span>
              </li>
              {periodo === 'ANUAL' && ahorro > 0 && (
                <li>
                  <span>Ahorro por pago anual</span>
                  <span style={{ color: '#7ed69a' }}>− {formatoCop(ahorro)}</span>
                </li>
              )}
            </ul>
            <div className="co-total">
              <span>Total a pagar</span>
              <strong>{formatoCop(total)}</strong>
            </div>
          </section>

          <section className="pay-card" aria-label="Método de pago">
            <h2>Método de pago</h2>
            <div className="co-methods" role="radiogroup" aria-label="Método de pago">
              {METODOS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={metodo === m.id}
                  className={`co-method${metodo === m.id ? ' activo' : ''}`}
                  onClick={() => setMetodo(m.id)}
                >
                  <IconoMetodo id={m.id} />
                  <span>
                    {m.nombre}
                    <small>{m.nota}</small>
                  </span>
                </button>
              ))}
            </div>

            {modo !== 'WOMPI' && (
              <div className="co-sim">
                <p>
                  Simulación: elige qué resultado devolvería el banco para ver ambos caminos del
                  flujo.
                </p>
                <div className="co-seg" role="group" aria-label="Resultado simulado">
                  <button type="button" className={resultadoSim === 'APROBADO' ? 'activo' : ''} onClick={() => setResultadoSim('APROBADO')}>
                    Pago aprobado
                  </button>
                  <button type="button" className={`rechazo${resultadoSim === 'RECHAZADO' ? ' activo' : ''}`} onClick={() => setResultadoSim('RECHAZADO')}>
                    Pago rechazado
                  </button>
                </div>
              </div>
            )}

            <button type="button" className="co-pay" onClick={pagar} disabled={ocupado}>
              {modo === 'WOMPI' ? `Continuar a Wompi · ${formatoCop(total)}` : `Pagar ${formatoCop(total)}`}
            </button>
            <p className="co-secure">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              BioLink no guarda datos de tu tarjeta; los procesa la pasarela de pagos.
            </p>
          </section>
        </div>
      </div>

      <SuccessCheck
        status={feedback.status}
        title={feedback.title}
        detail={feedback.detail}
        onClose={() => navigate('/facturacion')}
      />
    </div>
  )
}
