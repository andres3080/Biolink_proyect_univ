import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { listarResultados } from '../../api/resultadoService.js'
import Pagination from '../../components/Pagination.jsx'
import EstadoBadge from '../../components/EstadoBadge.jsx'
import './ResultList.css'

const ROLES_CARGA = ['BIOANALISTA', 'ADMIN']
const PAGE_SIZE = 50

function formatFechaHora(fecha) {
  if (!fecha) return '—'
  const [f, h] = fecha.split('T')
  if (!f) return fecha
  const [anio, mes, dia] = f.split('-')
  return h ? `${dia}/${mes}/${anio} ${h.slice(0, 5)}` : `${dia}/${mes}/${anio}`
}

export default function ResultList() {
  const { user } = useAuth()
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelado = false
    setLoading(true)
    setError(null)

    listarResultados()
      .then((data) => {
        if (!cancelado) setResultados(data)
      })
      .catch(() => {
        if (!cancelado) setError('No se pudo cargar la lista de resultados.')
      })
      .finally(() => {
        if (!cancelado) setLoading(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  const resultadosFiltrados = useMemo(() => {
    const texto = query.trim().toLowerCase()
    if (!texto) return resultados
    return resultados.filter(
      (r) =>
        r.muestra?.ordenMedica?.paciente?.nombreCompleto?.toLowerCase().includes(texto) ||
        r.muestra?.examen?.nombre?.toLowerCase().includes(texto) ||
        r.muestra?.codigoBarras?.toLowerCase().includes(texto)
    )
  }, [resultados, query])

  useEffect(() => {
    setPage(1)
  }, [query])

  const totalPages = Math.max(1, Math.ceil(resultadosFiltrados.length / PAGE_SIZE))
  const resultadosPagina = resultadosFiltrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const puedeCargar = ROLES_CARGA.includes(user?.rol)

  return (
    <div className="result-list-page">
      <div className="result-list-card">
        <div className="result-list-header">
          <div>
            <h1>Resultados</h1>
            <p className="result-list-count">
              {loading ? 'Cargando…' : `${resultadosFiltrados.length} de ${resultados.length} registrados`}
            </p>
          </div>
          <div className="result-list-actions">
            {puedeCargar && (
              <Link to="/resultados/nuevo" className="cta-link">
                + Cargar resultado
              </Link>
            )}
            <Link to="/" className="back-link">
              ← Volver
            </Link>
          </div>
        </div>

        <input
          type="search"
          className="result-search"
          placeholder="Buscar por paciente, examen o código de muestra…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && resultadosFiltrados.length === 0 && (
          <p className="result-empty">
            {resultados.length === 0
              ? 'Todavía no hay resultados cargados.'
              : 'Ningún resultado coincide con la búsqueda.'}
          </p>
        )}

        {!loading && resultadosFiltrados.length > 0 && (
          <div className="result-table-wrap">
            <table className="result-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Examen</th>
                  <th>Muestra</th>
                  <th>Valor</th>
                  <th>Fecha resultado</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {resultadosPagina.map((r) => (
                  <tr key={r.id}>
                    <td>{r.muestra?.ordenMedica?.paciente?.nombreCompleto || '—'}</td>
                    <td>{r.muestra?.examen?.nombre || '—'}</td>
                    <td>{r.muestra?.codigoBarras || '—'}</td>
                    <td>
                      {r.valorObtenido} {r.muestra?.examen?.unidadMedida || ''}
                    </td>
                    <td>{formatFechaHora(r.fechaResultado)}</td>
                    <td>
                      <EstadoBadge estado={r.estado} />
                    </td>
                    <td className="obs-cell">{r.observaciones || '—'}</td>
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
