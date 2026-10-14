import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarMuestras } from '../../api/muestraService.js'
import { crearResultado } from '../../api/resultadoService.js'
import { extraerMensajeError } from '../../utils/errorMessage.js'
import SuccessCheck from '../../components/SuccessCheck.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { SkeletonForm } from '../../components/Skeleton.jsx'
import { useToast } from '../../components/Toast.jsx'
import './ResultForm.css'

// El backend guarda observaciones en un VARCHAR(255) (Resultado.java no define
// @Lob ni @Column(length=...)), así que respetamos ese límite aquí también.
const OBSERVACIONES_MAX_LENGTH = 255

function ahoraLocal() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`
}

export default function ResultForm() {
  const [muestras, setMuestras] = useState([])
  const [loadingMuestras, setLoadingMuestras] = useState(true)
  const [errorMuestras, setErrorMuestras] = useState(null)

  const [muestraId, setMuestraId] = useState('')
  const [valorObtenido, setValorObtenido] = useState('')
  const [fechaResultado, setFechaResultado] = useState(ahoraLocal())
  const [observaciones, setObservaciones] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState({ status: 'idle' })
  const toast = useToast()

  useEffect(() => {
    let cancelado = false
    listarMuestras()
      .then((data) => {
        if (!cancelado) setMuestras(data)
      })
      .catch(() => {
        if (!cancelado) setErrorMuestras('No se pudieron cargar las muestras.')
      })
      .finally(() => {
        if (!cancelado) setLoadingMuestras(false)
      })
    return () => {
      cancelado = true
    }
  }, [])

  const muestraSeleccionada = useMemo(
    () => muestras.find((m) => String(m.id) === muestraId) || null,
    [muestras, muestraId]
  )

  const examen = muestraSeleccionada?.examen

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!muestraId) {
      setError('Selecciona la muestra a la que pertenece este resultado.')
      return
    }
    if (valorObtenido === '' || Number.isNaN(Number(valorObtenido))) {
      setError('Ingresa el valor obtenido.')
      return
    }

    setLoading(true)
    setFeedback({ status: 'loading' })
    try {
      const resultado = await crearResultado({
        muestra: { id: Number(muestraId) },
        valorObtenido: Number(valorObtenido),
        fechaResultado,
        observaciones: observaciones.trim() || null,
      })
      const alerta = resultado.estado === 'PENDIENTE_REVISION'
      setFeedback({
        status: 'success',
        tone: alerta ? 'alerta' : 'ok',
        title: 'Resultado guardado',
        detail: alerta
          ? 'Quedó fuera del rango de referencia: pendiente de revisión.'
          : 'Está dentro del rango de referencia: validado.',
      })
      setMuestraId('')
      setValorObtenido('')
      setFechaResultado(ahoraLocal())
      setObservaciones('')
    } catch (err) {
      setFeedback({ status: 'idle' })
      if (err?.response?.status === 403) {
        toast.error('No tienes permiso para cargar resultados.')
      } else {
        toast.error(extraerMensajeError(err, 'No se pudo guardar el resultado. Verifica los datos e intenta de nuevo.'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="result-form-page">
      <div className="result-form-card">
        <div className="result-form-header">
          <h1>Cargar resultado</h1>
          <Link to="/" className="back-link">
            ← Volver
          </Link>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {loadingMuestras ? (
          <SkeletonForm campos={4} />
        ) : errorMuestras ? (
          <EmptyState
            icono="senal"
            titulo="No pudimos cargar las muestras"
            texto="Revisa que el servidor esté en ejecución y que tu sesión siga activa. Luego intenta de nuevo."
          >
            <button type="button" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          </EmptyState>
        ) : muestras.length === 0 ? (
          <EmptyState
            icono="muestra"
            titulo="Todavía no hay muestras"
            texto="Para cargar un resultado primero hay que registrar la muestra."
          >
            <Link to="/muestras/nueva">Registrar muestra</Link>
          </EmptyState>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="muestra">Muestra</label>
              <select
                id="muestra"
                value={muestraId}
                onChange={(e) => setMuestraId(e.target.value)}
                required
              >
                <option value="">Seleccionar…</option>
                {muestras.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.codigoBarras} — {m.ordenMedica?.paciente?.nombreCompleto} — {m.examen?.nombre}
                  </option>
                ))}
              </select>
              {examen && (examen.rangoReferenciaMin != null || examen.rangoReferenciaMax != null) && (
                <p className="field-hint">
                  Rango de referencia: {examen.rangoReferenciaMin ?? '—'} a{' '}
                  {examen.rangoReferenciaMax ?? '—'} {examen.unidadMedida || ''}
                </p>
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="valorObtenido">
                  Valor obtenido {examen?.unidadMedida ? `(${examen.unidadMedida})` : ''}
                </label>
                <input
                  id="valorObtenido"
                  type="number"
                  step="any"
                  value={valorObtenido}
                  onChange={(e) => setValorObtenido(e.target.value)}
                  placeholder="Ej. 95"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="fechaResultado">Fecha y hora del resultado</label>
                <input
                  id="fechaResultado"
                  type="datetime-local"
                  value={fechaResultado}
                  onChange={(e) => setFechaResultado(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="observaciones">Observaciones (opcional)</label>
              <textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value.slice(0, OBSERVACIONES_MAX_LENGTH))}
                maxLength={OBSERVACIONES_MAX_LENGTH}
                placeholder="Notas adicionales sobre el resultado…"
              />
              <p className="field-hint">
                {observaciones.length}/{OBSERVACIONES_MAX_LENGTH} caracteres
              </p>
            </div>

            <button type="submit" className="cta" disabled={loading}>
              {loading ? 'Guardando…' : 'Guardar resultado'}
            </button>
          </form>
        )}
      </div>

      <SuccessCheck
        status={feedback.status}
        tone={feedback.tone}
        title={feedback.title}
        detail={feedback.detail}
        onClose={() => setFeedback({ status: 'idle' })}
      >
        <Link to="/resultados">Ver resultados</Link>
      </SuccessCheck>
    </div>
  )
}
