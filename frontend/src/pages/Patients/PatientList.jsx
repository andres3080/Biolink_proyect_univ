import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { listarPacientes } from '../../api/pacienteService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import Pagination from '../../components/Pagination.jsx'
import './PatientList.css'

const SEXO_LABEL = { F: 'Femenino', M: 'Masculino', OTRO: 'Otro' }
const ROLES_REGISTRAR = ['ADMIN', 'RECEPCIONISTA']
const PAGE_SIZE = 50

function formatFecha(fecha) {
  if (!fecha) return '—'
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

export default function PatientList() {
  const { user } = useAuth()
  const puedeRegistrar = ROLES_REGISTRAR.includes(user?.rol)
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelado = false
    setLoading(true)
    setError(null)

    listarPacientes()
      .then((data) => {
        if (!cancelado) setPacientes(data)
      })
      .catch(() => {
        if (!cancelado) setError('No se pudo cargar la lista de pacientes.')
      })
      .finally(() => {
        if (!cancelado) setLoading(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  const pacientesFiltrados = useMemo(() => {
    const texto = query.trim().toLowerCase()
    if (!texto) return pacientes
    return pacientes.filter(
      (p) =>
        p.nombreCompleto?.toLowerCase().includes(texto) ||
        p.documentoIdentidad?.toLowerCase().includes(texto)
    )
  }, [pacientes, query])

  useEffect(() => {
    setPage(1)
  }, [query])

  const totalPages = Math.max(1, Math.ceil(pacientesFiltrados.length / PAGE_SIZE))
  const pacientesPagina = pacientesFiltrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="patient-list-page">
      <div className="patient-list-card">
        <div className="patient-list-header">
          <div>
            <h1>Pacientes</h1>
            <p className="patient-list-count">
              {loading ? 'Cargando…' : `${pacientesFiltrados.length} de ${pacientes.length} registrados`}
            </p>
          </div>
          <div className="patient-list-actions">
            {puedeRegistrar && (
              <Link to="/pacientes/nuevo" className="cta-link">
                + Registrar paciente
              </Link>
            )}
            <Link to="/" className="back-link">
              ← Volver
            </Link>
          </div>
        </div>

        <input
          type="search"
          className="patient-search"
          placeholder="Buscar por nombre o documento…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && pacientesFiltrados.length === 0 && (
          <p className="patient-empty">
            {pacientes.length === 0
              ? 'Todavía no hay pacientes registrados.'
              : 'Ningún paciente coincide con la búsqueda.'}
          </p>
        )}

        {!loading && pacientesFiltrados.length > 0 && (
          <div className="patient-table-wrap">
            <table className="patient-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Nacimiento</th>
                  <th>Sexo</th>
                  <th>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {pacientesPagina.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/pacientes/${p.id}`} className="patient-name-link">
                        {p.nombreCompleto}
                      </Link>
                    </td>
                    <td>{p.documentoIdentidad}</td>
                    <td>{formatFecha(p.fechaNacimiento)}</td>
                    <td>{SEXO_LABEL[p.sexo] || p.sexo || '—'}</td>
                    <td>{p.telefono || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}
