import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { listarOrdenes } from '../../api/ordenService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import Pagination from '../../components/Pagination.jsx'
import EstadoBadge from '../../components/EstadoBadge.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import './OrderList.css'

const ROLES_CREAR = ['ADMIN', 'RECEPCIONISTA']
const PAGE_SIZE = 50

function formatFecha(fecha) {
  if (!fecha) return '—'
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

export default function OrderList() {
  const { user } = useAuth()
  const puedeCrear = ROLES_CREAR.includes(user?.rol)
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelado = false
    setLoading(true)
    setError(null)

    listarOrdenes()
      .then((data) => {
        if (!cancelado) setOrdenes(data)
      })
      .catch(() => {
        if (!cancelado) setError('No se pudo cargar la lista de órdenes médicas.')
      })
      .finally(() => {
        if (!cancelado) setLoading(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  const ordenesFiltradas = useMemo(() => {
    const texto = query.trim().toLowerCase()
    if (!texto) return ordenes
    return ordenes.filter((o) => {
      const nombrePaciente = o.paciente?.nombreCompleto?.toLowerCase() || ''
      const documento = o.paciente?.documentoIdentidad?.toLowerCase() || ''
      const medico = o.medicoSolicitante?.toLowerCase() || ''
      const examenes = (o.examenes || []).map((ex) => ex.nombre?.toLowerCase() || '').join(' ')
      return (
        nombrePaciente.includes(texto) ||
        documento.includes(texto) ||
        medico.includes(texto) ||
        examenes.includes(texto)
      )
    })
  }, [ordenes, query])

  useEffect(() => {
    setPage(1)
  }, [query])

  const totalPages = Math.max(1, Math.ceil(ordenesFiltradas.length / PAGE_SIZE))
  const ordenesPagina = ordenesFiltradas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="order-list-page">
      <div className="order-list-card">
        <div className="order-list-header">
          <div>
            <h1>Órdenes médicas</h1>
            <p className="order-list-count">
              {loading ? 'Cargando…' : `${ordenesFiltradas.length} de ${ordenes.length} registradas`}
            </p>
          </div>
          <div className="order-list-actions">
            {puedeCrear && (
              <Link to="/ordenes/nueva" className="cta-link">
                + Crear orden
              </Link>
            )}
            <Link to="/" className="back-link">
              ← Volver
            </Link>
          </div>
        </div>

        <input
          type="search"
          className="order-search"
          placeholder="Buscar por paciente, documento, médico o examen…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {loading && <SkeletonTable filas={6} columnas={5} />}

        {!loading && !error && ordenesFiltradas.length === 0 &&
          (ordenes.length === 0 ? (
            <EmptyState
              icono="lista"
              titulo="Todavía no hay órdenes médicas"
              texto="Crea la primera orden para que se pueda registrar su muestra."
            >
              <Link to="/ordenes/nueva">Crear una orden</Link>
            </EmptyState>
          ) : (
            <EmptyState icono="buscar" titulo="Sin coincidencias" texto="Ninguna orden coincide con la búsqueda." />
          ))}

        {!loading && ordenesPagina.length > 0 && (
          <div className="order-table-wrap">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Médico solicitante</th>
                  <th>Fecha</th>
                  <th>Exámenes</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {ordenesPagina.map((o) => (
                  <tr key={o.id}>
                    <td className="nowrap">
                      {o.paciente?.nombreCompleto}
                      {o.paciente?.documentoIdentidad ? ` — ${o.paciente.documentoIdentidad}` : ''}
                    </td>
                    <td className="nowrap">{o.medicoSolicitante}</td>
                    <td className="nowrap">{formatFecha(o.fechaOrden)}</td>
                    <td>
                      <div className="exam-tags">
                        {(o.examenes || []).map((ex) => (
                          <span key={ex.id} className="exam-tag">
                            {ex.nombre}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="nowrap">
                      <EstadoBadge estado={o.estado} />
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
