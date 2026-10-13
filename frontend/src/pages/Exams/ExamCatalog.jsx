import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarExamenes, crearExamen, actualizarExamen } from '../../api/examenService.js'
import { extraerMensajeError } from '../../utils/errorMessage.js'
import './ExamCatalog.css'

const initialForm = {
  nombre: '',
  codigo: '',
  unidadMedida: '',
  rangoReferenciaMin: '',
  rangoReferenciaMax: '',
}

export default function ExamCatalog() {
  const [examenes, setExamenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(null)

  function cargarExamenes() {
    setLoading(true)
    setError(null)
    listarExamenes()
      .then((data) => setExamenes(data))
      .catch(() => setError('No se pudo cargar el catálogo de exámenes.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargarExamenes()
  }, [])

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function empezarEdicion(examen) {
    setEditingId(examen.id)
    setForm({
      nombre: examen.nombre || '',
      codigo: examen.codigo || '',
      unidadMedida: examen.unidadMedida || '',
      rangoReferenciaMin: examen.rangoReferenciaMin ?? '',
      rangoReferenciaMax: examen.rangoReferenciaMax ?? '',
    })
    setSaveError(null)
    setSaveSuccess(null)
  }

  function cancelarEdicion() {
    setEditingId(null)
    setForm(initialForm)
    setSaveError(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaveError(null)
    setSaveSuccess(null)

    if (!form.nombre.trim() || !form.codigo.trim()) {
      setSaveError('Nombre y código son obligatorios.')
      return
    }

    const payload = {
      nombre: form.nombre.trim(),
      codigo: form.codigo.trim(),
      unidadMedida: form.unidadMedida.trim() || null,
      rangoReferenciaMin: form.rangoReferenciaMin === '' ? null : Number(form.rangoReferenciaMin),
      rangoReferenciaMax: form.rangoReferenciaMax === '' ? null : Number(form.rangoReferenciaMax),
    }

    setSaving(true)
    try {
      if (editingId) {
        const actualizado = await actualizarExamen(editingId, payload)
        setExamenes((prev) => prev.map((ex) => (ex.id === actualizado.id ? actualizado : ex)))
        setSaveSuccess(`"${actualizado.nombre}" actualizado.`)
      } else {
        const creado = await crearExamen(payload)
        setExamenes((prev) => [...prev, creado])
        setSaveSuccess(`"${creado.nombre}" creado.`)
      }
      setForm(initialForm)
      setEditingId(null)
    } catch (err) {
      if (err?.response?.status === 403) {
        setSaveError('No tienes permiso para editar el catálogo de exámenes.')
      } else {
        setSaveError(extraerMensajeError(err, 'No se pudo guardar (revisa que el código no esté repetido).'))
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="exam-catalog-page">
      <div className="exam-catalog-wrap">
        <div className="exam-catalog-header">
          <div>
            <h1>Catálogo de exámenes</h1>
            <p>Solo visible para administradores</p>
          </div>
          <Link to="/" className="back-link">
            ← Volver
          </Link>
        </div>

        <div className="exam-catalog-card">
          <h2>{editingId ? 'Editar examen' : 'Nuevo examen'}</h2>
          {saveSuccess && <p className="form-info">{saveSuccess}</p>}
          {saveError && (
            <p className="form-error" role="alert">
              {saveError}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="field-row">
              <div className="field">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Ej. Glicemia"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="codigo">Código único</label>
                <input
                  id="codigo"
                  type="text"
                  value={form.codigo}
                  onChange={(e) => handleChange('codigo', e.target.value)}
                  placeholder="Ej. GLU"
                  required
                />
              </div>
            </div>
            <div className="field-row three">
              <div className="field">
                <label htmlFor="unidadMedida">Unidad de medida</label>
                <input
                  id="unidadMedida"
                  type="text"
                  value={form.unidadMedida}
                  onChange={(e) => handleChange('unidadMedida', e.target.value)}
                  placeholder="Ej. mg/dL"
                />
              </div>
              <div className="field">
                <label htmlFor="rangoMin">Rango mínimo</label>
                <input
                  id="rangoMin"
                  type="number"
                  step="any"
                  value={form.rangoReferenciaMin}
                  onChange={(e) => handleChange('rangoReferenciaMin', e.target.value)}
                  placeholder="Ej. 70"
                />
              </div>
              <div className="field">
                <label htmlFor="rangoMax">Rango máximo</label>
                <input
                  id="rangoMax"
                  type="number"
                  step="any"
                  value={form.rangoReferenciaMax}
                  onChange={(e) => handleChange('rangoReferenciaMax', e.target.value)}
                  placeholder="Ej. 100"
                />
              </div>
            </div>
            <div className="exam-form-actions">
              <button type="submit" className="cta" disabled={saving}>
                {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear examen'}
              </button>
              {editingId && (
                <button type="button" className="secondary" onClick={cancelarEdicion} disabled={saving}>
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="exam-catalog-card">
          <h2>Exámenes registrados</h2>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {loading ? (
            <p className="exam-empty">Cargando…</p>
          ) : examenes.length === 0 ? (
            <p className="exam-empty">Todavía no hay exámenes en el catálogo.</p>
          ) : (
            <div className="exam-table-wrap">
              <table className="exam-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Código</th>
                    <th>Unidad</th>
                    <th>Rango mínimo</th>
                    <th>Rango máximo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {examenes.map((ex) => (
                    <tr key={ex.id} className={editingId === ex.id ? 'editing' : ''}>
                      <td>{ex.nombre}</td>
                      <td>{ex.codigo}</td>
                      <td>{ex.unidadMedida || '—'}</td>
                      <td>{ex.rangoReferenciaMin ?? '—'}</td>
                      <td>{ex.rangoReferenciaMax ?? '—'}</td>
                      <td>
                        <button type="button" className="link-edit" onClick={() => empezarEdicion(ex)}>
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
