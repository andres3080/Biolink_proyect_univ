import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarPlanes } from '../api/pagoService.js'
import { PLANES_RESPALDO, formatoCop } from '../utils/planes.js'
import './PlanesSection.css'

// Sección de planes y precios para la portada. Los precios son de demostración.
export default function PlanesSection() {
  const navigate = useNavigate()
  const [planes, setPlanes] = useState(PLANES_RESPALDO)
  const [anual, setAnual] = useState(false)

  useEffect(() => {
    let cancelado = false
    listarPlanes()
      .then((data) => {
        if (!cancelado && Array.isArray(data) && data.length > 0) setPlanes(data)
      })
      .catch(() => {
        // Sin backend se quedan los planes de respaldo.
      })
    return () => {
      cancelado = true
    }
  }, [])

  function contratar(plan) {
    navigate(`/checkout?plan=${encodeURIComponent(plan.codigo)}&periodo=${anual ? 'ANUAL' : 'MENSUAL'}`)
  }

  return (
    <section id="planes" className="planes-section">
      <span className="planes-kicker">PLANES Y PRECIOS</span>
      <h2>Elige el plan que se ajusta a tu laboratorio</h2>
      <p className="planes-sub">
        Sin permanencia. Cambia de plan cuando lo necesites. Precios en pesos colombianos.
      </p>

      <div className="planes-toggle" role="group" aria-label="Periodo de facturación">
        <button
          type="button"
          className={!anual ? 'activo' : ''}
          aria-pressed={!anual}
          onClick={() => setAnual(false)}
        >
          Mensual
        </button>
        <button
          type="button"
          className={anual ? 'activo' : ''}
          aria-pressed={anual}
          onClick={() => setAnual(true)}
        >
          Anual <span className="planes-ahorro">2 meses gratis</span>
        </button>
      </div>

      <div className="planes-grid">
        {planes.map((plan, i) => {
          const precio = anual ? plan.anualCop : plan.mensualCop
          return (
            <article
              key={plan.codigo}
              className={`plan-card${plan.destacado ? ' destacado' : ''}`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              {plan.destacado && <span className="plan-tag">Más elegido</span>}
              <h3>{plan.nombre}</h3>
              <p className="plan-desc">{plan.descripcion}</p>
              <p className="plan-precio">
                <span className="plan-monto">{formatoCop(precio)}</span>
                <span className="plan-periodo">/ {anual ? 'año' : 'mes'}</span>
              </p>
              <p className="plan-equiv">
                {anual
                  ? `Equivale a ${formatoCop(Math.round(plan.anualCop / 12))} al mes`
                  : 'Facturación mensual'}
              </p>
              <ul className="plan-lista">
                {plan.caracteristicas.map((c) => (
                  <li key={c}>
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {c}
                  </li>
                ))}
              </ul>
              <button type="button" className="plan-cta" onClick={() => contratar(plan)}>
                Contratar {plan.nombre}
              </button>
            </article>
          )
        })}
      </div>
      <p className="planes-nota">
        Demostración académica: los pagos se procesan en modo de pruebas y no se cobra dinero real.
      </p>
    </section>
  )
}
