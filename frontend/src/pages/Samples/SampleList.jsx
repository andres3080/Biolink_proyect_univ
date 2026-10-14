import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { listarMuestras } from '../../api/muestraService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import Pagination from '../../components/Pagination.jsx'
import EstadoBadge from '../../components/EstadoBadge.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import './SampleList.css'

const ROLES_REGISTRAR = ['ADMIN', 'BIOANALISTA', 'RECEPCIONISTA']
const PAGE_SIZE = 50

function formatFechaHora(fecha) {
  if (!fecha) return '—'
  const [f, h] = fecha.split('T')
  if (!f) return fecha
  const [anio, mes, dia] = f.split('-')
  return h ? `${dia}/${mes}/${anio} ${h.slice(0, 5)}` : `${dia}/${mes}/${anio}`
}

export default function SampleList() {
  const { user } = useAuth()
  const puedeRegistrar = ROLES_REGISTRAR.includes(user?.rol)
  const [muestras, setMuestras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelado = false
    setLoading(true)
    setError(null)

    listarMuestras()
      .then((data) => {
        if (!cancelado) setMuestras(data)
      })
      .catch(() => {
        if (!cancelado) setError('No se pudo cargar la lista de muestras.')
      })
      .finally(() => {
        if (!cancelado) setLoading(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  const muestrasFiltradas = useMemo(() => {
    const texto = query.trim().toLowerCase()
    if (!texto) return muestras
    return muestras.filter(
      (m) =>
        m.codigoBarras?.toLowerCase().includes(texto) ||
        m.ordenMedica?.paciente?.nombreCompleto?.toLowerCase().includes(texto) ||
        m.examen?.nombre?.toLowerCase().includes(texto)
    )
  }, [muestras, query])

  useEffect(() => {
    setPage(1)
  }, [query])

  const totalPages = Math.max(1, Math.ceil(muestrasFiltradas.length / PAGE_SIZE))
  const muestrasPagina = muestrasFiltradas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="sample-list-page">
      <div className="sample-list-card">
        <div className="sample-list-header">
          <div>
            <h1>Muestras</h1>
            <p className="sample-list-count">
              {loading ? 'Cargando…' : `${muestrasFiltradas.length} de ${muestras.length} registradas`}
            </p>
          </div>
          <div className="sample-list-actions">
            {puedeRegistrar && (
              <Link to="/muestras/nueva" className="cta-link">
                + Registrar muestra
              </Link>
            )}
            <Link to="/" className="back-link">
              ← Volver
            </Link>
          </div>
        </div>

        <input
          type="search"
          className="sample-search"
          placeholder="Buscar por código, paciente o examen…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {loading && <SkeletonTable filas={6} columnas={6} />}

        {!loading && !error && muestrasFiltradas.length === 0 &&
          (muestras.length === 0 ? (
            <EmptyState
              icono="muestra"
              titulo="Todavía no hay muestras"
              texto="Cuando se registren muestras aparecerán aquí con su código y estado."
            >
              {puedeRegistrar && <Link to="/muestras/nueva">Registrar muestra</Link>}
            </EmptyState>
          ) : (
            <EmptyState icono="buscar" titulo="Sin coincidencias" texto="Ninguna muestra coincide con la búsqueda." />
          ))}

        {!loading && muestrasFiltradas.length > 0 && (
          <div className="sample-table-wrap">
            <table className="sample-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Paciente</th>
                  <th>Examen</th>
                  <th>Tipo</th>
                  <th>Fecha de toma</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {muestrasPagina.map((m) => (
                  <tr key={m.id}>
                    <td>{m.codigoBarras}</td>
                    <td>{m.ordenMedica?.paciente?.nombreCompleto || '—'}</td>
                    <td>{m.examen?.nombre || '—'}</td>
                    <td>{m.tipoMuestra}</td>
                    <td>{formatFechaHora(m.fechaToma)}</td>
                    <td>
                      <EstadoBadge estado={m.estado} />
                    </td>
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
