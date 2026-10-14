import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarPagos, listarPlanes, obtenerSuscripcion } from '../../api/pagoService.js'
import { PLANES_RESPALDO, formatoCentavos, formatoFecha } from '../../utils/planes.js'
import EstadoBadge from '../../components/EstadoBadge.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import './Billing.css'

function Medidor({ titulo, uso, max }) {
  const ilimitado = max < 0
  const sinCupo = max === 0
  const pct = ilimitado ? 8 : sinCupo ? 0 : Math.min(100, Math.round((uso / max) * 100))
  const clase = !ilimitado && !sinCupo ? (uso > max ? ' exceso' : pct >= 80 ? ' alto' : '') : ''
  return (
    <div>
      <div className="bl-meter-head">
        <span>{titulo}</span>
        <span>{sinCupo ? `${uso} · no incluido` : ilimitado ? `${uso} · ilimitado` : `${uso} de ${max}`}</span>
      </div>
      <div className={`bl-bar${clase}`}>
        <i style={{ '--w': `${pct}%` }} />
      </div>
    </div>
  )
}

export default function Billing() {
  const [sus, setSus] = useState(null)
  const [pagos, setPagos] = useState(null)
  const [planes, setPlanes] = useState(PLANES_RESPALDO)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelado = false
    obtenerSuscripcion()
      .then((d) => !cancelado && setSus(d))
      .catch(() => !cancelado && setError(true))
    listarPagos()
      .then((d) => !cancelado && setPagos(d))
      .catch(() => !cancelado && setError(true))
    listarPlanes()
      .then((d) => !cancelado && Array.isArray(d) && d.length > 0 && setPlanes(d))
      .catch(() => {})
    return () => {
      cancelado = true
    }
  }, [])

  return (
    <div className="pay-page">
      <div className="pay-wrap">
        <div className="pay-header">
          <div>
            <h1>Plan y facturación</h1>
            <p>Tu suscripción, el uso de tu laboratorio y el historial de pagos.</p>
          </div>
          <Link to="/" className="pay-back">
            ← Volver al panel
          </Link>
        </div>

        <div className="pay-demo" role="note">
          <span>
            <strong>Modo demostración.</strong> Los pagos son de prueba y no se cobra dinero real.
          </span>
        </div>

        {error && (
          <EmptyState icono="senal" titulo="No pudimos cargar la facturación" texto="Verifica que el backend esté en ejecución e intenta de nuevo." />
        )}

        {!error && (
          <>
            <div className="bl-top">
              <section className="pay-card" aria-label="Plan actual">
                <h2>Plan actual</h2>
                {sus === null ? (
                  <SkeletonTable filas={2} columnas={2} />
                ) : sus.plan ? (
                  <>
                    <div className="bl-plan-head">
                      <span className="bl-plan-name">{sus.planNombre}</span>
                      <span className={`estado-pill tono-${sus.activa ? 'ok' : 'alerta'}`}>
                        {sus.activa ? 'Activo' : 'Vencido'}
                      </span>
                    </div>
                    <p className="bl-meta">
                      Facturación {sus.periodo === 'ANUAL' ? 'anual' : 'mensual'}
                      <br />
                      Desde {formatoFecha(sus.desde)} · {sus.activa ? 'renueva' : 'venció'} el {formatoFecha(sus.vence)}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="bl-plan-head">
                      <span className="bl-plan-name">Sin plan</span>
                      <span className="estado-pill tono-pendiente">Sin suscripción</span>
                    </div>
                    <p className="bl-meta">Aún no has contratado un plan. Elige uno para activar tu laboratorio.</p>
                  </>
                )}
                <div className="bl-switch">
                  {planes.map((p) => (
                    <Link
                      key={p.codigo}
                      to={`/checkout?plan=${p.codigo}&periodo=MENSUAL`}
                      className={`bl-chip${sus?.plan === p.codigo && sus?.activa ? ' actual' : ''}`}
                    >
                      {sus?.plan === p.codigo && sus?.activa ? `${p.nombre} (actual)` : `${sus?.plan ? 'Cambiar a' : 'Elegir'} ${p.nombre}`}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="pay-card bl-usage" aria-label="Uso del plan">
                <h2 style={{ marginBottom: 0 }}>Uso del plan</h2>
                {sus === null ? (
                  <SkeletonTable filas={2} columnas={2} />
                ) : (
                  <>
                    <Medidor titulo="Usuarios" uso={sus.usuariosEnUso} max={sus.plan ? sus.maxUsuarios : 3} />
                    <Medidor titulo="Equipos conectados (HL7)" uso={sus.equiposEnUso} max={sus.plan ? sus.maxEquipos : 0} />
                    {!sus.plan && (
                      <p className="bl-meta" style={{ margin: 0 }}>
                        Límites de referencia del plan Básico.
                      </p>
                    )}
                  </>
                )}
              </section>
            </div>

            <section className="pay-card" aria-label="Historial de pagos">
              <h2>Historial de pagos</h2>
              {pagos === null ? (
                <SkeletonTable filas={4} columnas={6} />
              ) : pagos.length === 0 ? (
                <EmptyState icono="lista" titulo="Aún no hay pagos" texto="Cuando contrates un plan, tus facturas aparecerán aquí.">
                  <Link className="pr-btn primario" to="/checkout">
                    Contratar un plan
                  </Link>
                </EmptyState>
              ) : (
                <div className="bl-table-wrap">
                  <table className="bl-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Referencia</th>
                        <th>Plan</th>
                        <th>Método</th>
                        <th className="num">Monto</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagos.map((p) => (
                        <tr key={p.id}>
                          <td>{formatoFecha(p.creadoEn)}</td>
                          <td className="ref">{p.referencia}</td>
                          <td>
                            {p.plan} · {p.periodo === 'ANUAL' ? 'anual' : 'mensual'}
                          </td>
                          <td>{p.metodoPago || '—'}</td>
                          <td className="num">{formatoCentavos(p.montoCentavos)}</td>
                          <td>
                            <EstadoBadge estado={p.estado} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
