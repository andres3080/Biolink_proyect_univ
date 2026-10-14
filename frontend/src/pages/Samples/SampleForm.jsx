import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarOrdenes } from '../../api/ordenService.js'
import { crearMuestra } from '../../api/muestraService.js'
import { extraerMensajeError } from '../../utils/errorMessage.js'
import SuccessCheck from '../../components/SuccessCheck.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { SkeletonForm } from '../../components/Skeleton.jsx'
import { useToast } from '../../components/Toast.jsx'
import './SampleForm.css'

const TIPOS_MUESTRA = ['Sangre', 'Orina', 'Heces', 'Esputo', 'Hisopado', 'Otro']

function ahoraLocal() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`
}

function sugerirCodigo(ordenId, examenCodigo) {
  const sufijo = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `M-${ordenId}-${examenCodigo || 'EX'}-${sufijo}`
}

export default function SampleForm() {
  const [ordenes, setOrdenes] = useState([])
  const [loadingOrdenes, setLoadingOrdenes] = useState(true)
  const [errorOrdenes, setErrorOrdenes] = useState(null)

  const [ordenId, setOrdenId] = useState('')
  const [examenId, setExamenId] = useState('')
  const [tipoMuestra, setTipoMuestra] = useState('')
  const [tipoMuestraOtro, setTipoMuestraOtro] = useState('')
  const [fechaToma, setFechaToma] = useState(ahoraLocal())
  const [codigoBarras, setCodigoBarras] = useState('')
  const [codigoManual, setCodigoManual] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState({ status: 'idle' })
  const toast = useToast()

  useEffect(() => {
    let cancelado = false
    listarOrdenes()
      .then((data) => {
        if (!cancelado) setOrdenes(data)
      })
      .catch(() => {
        if (!cancelado) setErrorOrdenes('No se pudieron cargar las órdenes médicas.')
      })
      .finally(() => {
        if (!cancelado) setLoadingOrdenes(false)
      })
    return () => {
      cancelado = true
    }
  }, [])

  const ordenSeleccionada = useMemo(
    () => ordenes.find((o) => String(o.id) === ordenId) || null,
    [ordenes, ordenId]
  )

  const examenesDisponibles = ordenSeleccionada?.examenes || []

  useEffect(() => {
    if (!ordenId || !examenId || codigoManual) return
    const examen = examenesDisponibles.find((ex) => String(ex.id) === examenId)
    setCodigoBarras(sugerirCodigo(ordenId, examen?.codigo))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordenId, examenId])

  function handleOrdenChange(value) {
    setOrdenId(value)
    setExamenId('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!ordenId) {
      setError('Selecciona una orden médica.')
      return
    }
    if (!examenId) {
      setError('Selecciona a cuál examen de la orden corresponde esta muestra.')
      return
    }
    const tipo = tipoMuestra === 'Otro' ? tipoMuestraOtro.trim() : tipoMuestra
    if (!tipo) {
      setError('Indica el tipo de muestra.')
      return
    }
    if (!codigoBarras.trim()) {
      setError('El código de la muestra no puede estar vacío.')
      return
    }

    setLoading(true)
    setFeedback({ status: 'loading' })
    try {
      const muestra = await crearMuestra({
        codigoBarras: codigoBarras.trim(),
        ordenMedica: { id: Number(ordenId) },
        examen: { id: Number(examenId) },
        tipoMuestra: tipo,
        fechaToma,
        estado: 'TOMADA',
      })
      setFeedback({
        status: 'success',
        title: 'Muestra registrada',
        detail: `Código ${muestra.codigoBarras}`,
      })
      setOrdenId('')
      setExamenId('')
      setTipoMuestra('')
      setTipoMuestraOtro('')
      setFechaToma(ahoraLocal())
      setCodigoBarras('')
      setCodigoManual(false)
    } catch (err) {
      setFeedback({ status: 'idle' })
      toast.error(
        extraerMensajeError(err, 'No se pudo registrar la muestra. Verifica los datos e intenta de nuevo.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sample-form-page">
      <div className="sample-form-card">
        <div className="sample-form-header">
          <h1>Registrar muestra</h1>
          <Link to="/" className="back-link">
            ← Volver
          </Link>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {loadingOrdenes ? (
          <SkeletonForm campos={4} />
        ) : errorOrdenes ? (
          <EmptyState
            icono="senal"
            titulo="No pudimos cargar las órdenes"
            texto="Revisa que el servidor esté en ejecución y que tu sesión siga activa. Luego intenta de nuevo."
          >
            <button type="button" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          </EmptyState>
        ) : ordenes.length === 0 ? (
          <EmptyState
            icono="lista"
            titulo="Todavía no hay órdenes médicas"
            texto="Para registrar una muestra primero hay que crear la orden del paciente."
          >
            <Link to="/ordenes/nueva">Crear una orden</Link>
          </EmptyState>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="orden">Orden médica</label>
              <select
                id="orden"
                value={ordenId}
                onChange={(e) => handleOrdenChange(e.target.value)}
                required
              >
                <option value="">Seleccionar…</option>
                {ordenes.map((o) => (
                  <option key={o.id} value={o.id}>
                    Orden #{o.id} — {o.paciente?.nombreCompleto} ({o.fechaOrden})
                  </option>
                ))}
              </select>
            </div>

            {ordenId && (
              <div className="field">
                <label htmlFor="examen">Examen de la orden</label>
                {examenesDisponibles.length === 0 ? (
                  <p className="field-hint">Esta orden no tiene exámenes asociados.</p>
                ) : (
                  <select
                    id="examen"
                    value={examenId}
                    onChange={(e) => setExamenId(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar…</option>
                    {examenesDisponibles.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.nombre} ({ex.codigo})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="field-row">
              <div className="field">
                <label htmlFor="tipoMuestra">Tipo de muestra</label>
                <select
                  id="tipoMuestra"
                  value={tipoMuestra}
                  onChange={(e) => setTipoMuestra(e.target.value)}
                  required
                >
                  <option value="">Seleccionar…</option>
                  {TIPOS_MUESTRA.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="fechaToma">Fecha y hora de toma</label>
                <input
                  id="fechaToma"
                  type="datetime-local"
                  value={fechaToma}
                  onChange={(e) => setFechaToma(e.target.value)}
                  required
                />
              </div>
            </div>

            {tipoMuestra === 'Otro' && (
              <div className="field">
                <label htmlFor="tipoMuestraOtro">Especifica el tipo de muestra</label>
                <input
                  id="tipoMuestraOtro"
                  type="text"
                  value={tipoMuestraOtro}
                  onChange={(e) => setTipoMuestraOtro(e.target.value)}
                  placeholder="Ej. Líquido cefalorraquídeo"
                  required
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="codigoBarras">Código de la muestra</label>
              <input
                id="codigoBarras"
                type="text"
                value={codigoBarras}
                onChange={(e) => {
                  setCodigoBarras(e.target.value)
                  setCodigoManual(true)
                }}
                placeholder="Se genera automáticamente al elegir orden y examen"
                required
              />
              <p className="field-hint">
                Se sugiere automáticamente; puedes reemplazarlo por el código real del rótulo/etiqueta impresa.
              </p>
            </div>

            <button type="submit" className="cta" disabled={loading}>
              {loading ? 'Registrando…' : 'Registrar muestra'}
            </button>
          </form>
        )}
      </div>

      <SuccessCheck
        status={feedback.status}
        title={feedback.title}
        detail={feedback.detail}
        onClose={() => setFeedback({ status: 'idle' })}
      >
        <Link to="/muestras">Ver muestras</Link>
        <button type="button" onClick={() => setFeedback({ status: 'idle' })}>
          Registrar otra
        </button>
      </SuccessCheck>
    </div>
  )
}
