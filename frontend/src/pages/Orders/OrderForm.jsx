import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarPacientes } from '../../api/pacienteService.js'
import { listarExamenes } from '../../api/examenService.js'
import { crearOrden } from '../../api/ordenService.js'
import { extraerMensajeError } from '../../utils/errorMessage.js'
import SuccessCheck from '../../components/SuccessCheck.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { SkeletonForm } from '../../components/Skeleton.jsx'
import { useToast } from '../../components/Toast.jsx'
import './OrderForm.css'

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function OrderForm() {
  const [pacientes, setPacientes] = useState([])
  const [examenes, setExamenes] = useState([])
  const [loadingCatalogos, setLoadingCatalogos] = useState(true)
  const [errorCatalogos, setErrorCatalogos] = useState(null)

  const [pacienteId, setPacienteId] = useState('')
  const [medicoSolicitante, setMedicoSolicitante] = useState('')
  const [fechaOrden, setFechaOrden] = useState(hoyISO())
  const [examenesSeleccionados, setExamenesSeleccionados] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState({ status: 'idle' })
  const toast = useToast()

  function cargarCatalogos() {
    setLoadingCatalogos(true)
    setErrorCatalogos(null)
    Promise.all([listarPacientes(), listarExamenes()])
      .then(([listaPacientes, listaExamenes]) => {
        setPacientes(listaPacientes)
        setExamenes(listaExamenes)
      })
      .catch(() => setErrorCatalogos('No se pudieron cargar pacientes/exámenes.'))
      .finally(() => setLoadingCatalogos(false))
  }

  useEffect(() => {
    cargarCatalogos()
  }, [])

  function toggleExamen(id) {
    setExamenesSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    if (!pacienteId) {
      setError('Selecciona un paciente.')
      return
    }
    if (examenesSeleccionados.length === 0) {
      setError('Selecciona al menos un examen.')
      return
    }
    setLoading(true)
    setFeedback({ status: 'loading' })
    try {
      const orden = await crearOrden({
        paciente: { id: Number(pacienteId) },
        examenes: examenesSeleccionados.map((id) => ({ id })),
        medicoSolicitante,
        fechaOrden,
        estado: 'PENDIENTE',
      })
      setFeedback({
        status: 'success',
        title: 'Orden creada',
        detail: `Orden #${orden.id} con ${examenesSeleccionados.length} examen(es).`,
      })
      setPacienteId('')
      setMedicoSolicitante('')
      setFechaOrden(hoyISO())
      setExamenesSeleccionados([])
    } catch (err) {
      setFeedback({ status: 'idle' })
      toast.error(extraerMensajeError(err, 'No se pudo crear la orden. Verifica los datos e intenta de nuevo.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="order-form-page">
      <div className="order-form-card">
        <div className="order-form-header">
          <h1>Nueva orden médica</h1>
          <Link to="/" className="back-link">
            ← Volver
          </Link>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {loadingCatalogos ? (
          <SkeletonForm campos={4} />
        ) : errorCatalogos ? (
          <EmptyState
            icono="senal"
            titulo="No pudimos cargar los datos"
            texto="Revisa que el servidor esté en ejecución y que tu sesión siga activa. Luego intenta de nuevo."
          >
            <button type="button" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          </EmptyState>
        ) : pacientes.length === 0 ? (
          <EmptyState
            icono="persona"
            titulo="Todavía no hay pacientes"
            texto="Para crear una orden primero hay que registrar al paciente."
          >
            <Link to="/pacientes/nuevo">Registrar paciente</Link>
          </EmptyState>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="paciente">Paciente</label>
              <select
                id="paciente"
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value)}
                required
              >
                <option value="">Seleccionar…</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombreCompleto} — {p.documentoIdentidad}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="medicoSolicitante">Médico solicitante</label>
                <input
                  id="medicoSolicitante"
                  type="text"
                  value={medicoSolicitante}
                  onChange={(e) => setMedicoSolicitante(e.target.value)}
                  placeholder="Ej. Dr. Camilo Restrepo"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="fechaOrden">Fecha de la orden</label>
                <input
                  id="fechaOrden"
                  type="date"
                  value={fechaOrden}
                  onChange={(e) => setFechaOrden(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="field">
              <div className="exam-list-header">
                <label>Exámenes a realizar</label>
              </div>
              {examenes.length === 0 ? (
                <p className="order-empty">
                  Todavía no hay exámenes en el catálogo. Pide a un administrador que los agregue.
                </p>
              ) : (
                <div className="exam-checklist">
                  {examenes.map((ex) => (
                    <label key={ex.id} className="exam-checkbox">
                      <input
                        type="checkbox"
                        checked={examenesSeleccionados.includes(ex.id)}
                        onChange={() => toggleExamen(ex.id)}
                      />
                      <span>
                        {ex.nombre} <span className="exam-codigo">({ex.codigo})</span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="cta" disabled={loading}>
              {loading ? 'Creando orden…' : 'Crear orden'}
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
        <Link to="/muestras/nueva">Registrar muestra</Link>
        <Link to="/ordenes">Ver órdenes</Link>
      </SuccessCheck>
    </div>
  )
}
