import { useState } from 'react'
import { Link } from 'react-router-dom'
import { crearPaciente } from '../../api/pacienteService.js'
import SuccessCheck from '../../components/SuccessCheck.jsx'
import { useToast } from '../../components/Toast.jsx'
import './PatientForm.css'

const initialForm = {
  nombreCompleto: '',
  documentoIdentidad: '',
  fechaNacimiento: '',
  sexo: '',
  telefono: '',
}

export default function PatientForm() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState({ status: 'idle' })
  const toast = useToast()

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    setFeedback({ status: 'loading' })
    try {
      const paciente = await crearPaciente({
        ...form,
        fechaNacimiento: form.fechaNacimiento || null,
      })
      setFeedback({
        status: 'success',
        title: 'Paciente registrado',
        detail: paciente.nombreCompleto,
      })
      setForm(initialForm)
    } catch (err) {
      const backendMsg = err.response?.data?.error || err.response?.data?.message
      setFeedback({ status: 'idle' })
      toast.error(
        backendMsg ||
          'No se pudo registrar el paciente. Verifica los datos (el documento debe ser único) e intenta de nuevo.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="patient-form-page">
      <div className="patient-form-card">
        <div className="patient-form-header">
          <h1>Registrar paciente</h1>
          <Link to="/" className="back-link">
            ← Volver
          </Link>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="nombreCompleto">Nombre completo</label>
            <input
              id="nombreCompleto"
              name="nombreCompleto"
              type="text"
              value={form.nombreCompleto}
              onChange={handleChange}
              placeholder="Ej. María Fernanda Rojas"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="documentoIdentidad">Documento de identidad</label>
            <input
              id="documentoIdentidad"
              name="documentoIdentidad"
              type="text"
              value={form.documentoIdentidad}
              onChange={handleChange}
              placeholder="Ej. 1020304050"
              required
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
              <input
                id="fechaNacimiento"
                name="fechaNacimiento"
                type="date"
                value={form.fechaNacimiento}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="sexo">Sexo</label>
              <select id="sexo" name="sexo" value={form.sexo} onChange={handleChange}>
                <option value="">Seleccionar…</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="telefono">Teléfono</label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Ej. 3001234567"
            />
          </div>

          <button type="submit" className="cta" disabled={loading}>
            {loading ? 'Guardando…' : 'Registrar paciente'}
          </button>
        </form>
      </div>

      <SuccessCheck
        status={feedback.status}
        title={feedback.title}
        detail={feedback.detail}
        onClose={() => setFeedback({ status: 'idle' })}
      >
        <Link to="/ordenes/nueva">Crear una orden</Link>
        <Link to="/pacientes">Ver pacientes</Link>
      </SuccessCheck>
    </div>
  )
}
