import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarEquipos, listarEventosDeEquipo } from '../../api/equipoService.js'
import EmptyState from '../../components/EmptyState.jsx'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import './EquipoList.css'

function formatFechaHora(fecha) {
  if (!fecha) return '—'
  const [f, h] = fecha.split('T')
  if (!f) return fecha
  const [anio, mes, dia] = f.split('-')
  return h ? `${dia}/${mes}/${anio} ${h.slice(0, 5)}` : `${dia}/${mes}/${anio}`
}

function formatHaceTiempo(fecha) {
  if (!fecha) return 'nunca'
  const diffMs = Date.now() - new Date(fecha).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'hace instantes'
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffHoras = Math.floor(diffMin / 60)
  if (diffHoras < 24) return `hace ${diffHoras} h`
  const diffDias = Math.floor(diffHoras / 24)
  return `hace ${diffDias} d`
}

export default function EquipoList() {
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [equipoExpandido, setEquipoExpandido] = useState(null)
  const [eventos, setEventos] = useState([])
  const [loadingEventos, setLoadingEventos] = useState(false)
  const [errorEventos, setErrorEventos] = useState(null)

  function cargarEquipos() {
    setLoading(true)
    setError(null)
    listarEquipos()
      .then((data) => setEquipos(data))
      .catch(() => setError('No se pudo cargar la lista de equipos.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargarEquipos()
  }, [])

  function toggleEquipo(equipo) {
    if (equipoExpandido === equipo.id) {
      setEquipoExpandido(null)
      return
    }
    setEquipoExpandido(equipo.id)
    setEventos([])
    setErrorEventos(null)
    setLoadingEventos(true)
    listarEventosDeEquipo(equipo.id)
      .then((data) => setEventos(data))
      .catch(() => setErrorEventos('No se pudo cargar el historial de este equipo.'))
      .finally(() => setLoadingEventos(false))
  }

  return (
    <div className="equipo-list-page">
      <div className="equipo-list-card">
        <div className="equipo-list-header">
          <div>
            <h1>Equipos biomédicos</h1>
            <p className="equipo-list-count">
              {loading ? 'Cargando…' : `${equipos.length} equipo(s) registrados`}
            </p>
          </div>
          <Link to="/" className="back-link">
            ← Volver
          </Link>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {loading && <SkeletonTable filas={3} columnas={3} />}

        {!loading && !error && equipos.length === 0 && (
          <EmptyState
            icono="senal"
            titulo="Ningún equipo conectado todavía"
            texto="Aparecerán aquí en cuanto manden o reciban un mensaje HL7."
          />
        )}

        <div className="equipo-grid">
          {equipos.map((equipo) => (
            <div key={equipo.id} className="equipo-card">
              <button type="button" className="equipo-card-header" onClick={() => toggleEquipo(equipo)}>
                <span className={`equipo-dot ${equipo.conectado ? 'conectado' : 'desconectado'}`} />
                <span className="equipo-nombre">{equipo.nombre}</span>
                <span className="equipo-actividad">
                  {equipo.conectado ? 'Conectado' : 'Desconectado'} · última actividad{' '}
                  {formatHaceTiempo(equipo.ultimaConexion)}
                </span>
                <span className="equipo-toggle">{equipoExpandido === equipo.id ? '▲' : '▼'}</span>
              </button>

              {equipoExpandido === equipo.id && (
                <div className="equipo-eventos">
                  {loadingEventos && <p className="equipo-eventos-loading">Cargando eventos…</p>}
                  {errorEventos && (
                    <p className="form-error" role="alert">
                      {errorEventos}
                    </p>
                  )}
                  {!loadingEventos && !errorEventos && eventos.length === 0 && (
                    <p className="equipo-eventos-empty">Sin eventos registrados todavía.</p>
                  )}
                  {!loadingEventos && eventos.length > 0 && (
                    <div className="equipo-eventos-table-wrap">
                      <table className="equipo-eventos-table">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Dirección</th>
                            <th>Detalle</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eventos.map((evento) => (
                            <tr key={evento.id}>
                              <td>{formatFechaHora(evento.fecha)}</td>
                              <td>{evento.tipoMensaje}</td>
                              <td>
                                <span
                                  className={`direccion-pill ${
                                    evento.direccion === 'ENTRANTE' ? 'entrante' : 'saliente'
                                  }`}
                                >
                                  {evento.direccion === 'ENTRANTE' ? 'Entrante' : 'Saliente'}
                                </span>
                              </td>
                              <td>{evento.resumen || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
