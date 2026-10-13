import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarPacientes } from '../../api/pacienteService.js'
import { listarExamenes } from '../../api/examenService.js'
import { crearOrden } from '../../api/ordenService.js'
import { extraerMensajeError } from '../../utils/errorMessage.js'
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
  const [success, setSuccess] = useState(null)

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
    setSuccess(null)
    if (!pacienteId) {
      setError('Selecciona un paciente.')
      return
    }
    if (examenesSeleccionados.length === 0) {
      setError('Selecciona al menos un examen.')
      return
    }
    setLoading(true)
    try {
      const orden = await crearOrden({
        paciente: { id: Number(pacienteId) },
        examenes: examenesSeleccionados.map((id) => ({ id })),
        medicoSolicitante,
        fechaOrden,
        estado: 'PENDIENTE',
      })
      setSuccess(`Orden #${orden.id} creada con ${examenesSeleccionados.length} examen(es).`)
      setPacienteId('')
      setMedicoSolicitante('')
      setFechaOrden(hoyISO())
      setExamenesSeleccionados([])
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo crear la orden. Verifica los datos e intenta de nuevo.'))
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
        {success && <p className="form-info">{success}</p>}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {errorCatalogos && (
          <p className="form-error" role="alert">
            {errorCatalogos}
          </p>
        )}
        {loadingCatalogos ? (
          <p className="order-loading">Cargando pacientes y exámenes…</p>
        ) : pacientes.length === 0 ? (
          <p className="order-empty">
            Todavía no hay pacientes registrados.{' '}
            <Link to="/pacientes/nuevo">Registra uno primero</Link>.
          </p>
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
    </div>
  )
}
