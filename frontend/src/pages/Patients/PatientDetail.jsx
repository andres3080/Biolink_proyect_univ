import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { buscarPacientePorId } from '../../api/pacienteService.js'
import { listarOrdenes } from '../../api/ordenService.js'
import { listarMuestras } from '../../api/muestraService.js'
import { listarResultados } from '../../api/resultadoService.js'
import EstadoBadge from '../../components/EstadoBadge.jsx'
import './PatientDetail.css'

const SEXO_LABEL = { F: 'Femenino', M: 'Masculino', OTRO: 'Otro' }

function formatFecha(fecha) {
  if (!fecha) return '—'
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

function formatFechaHora(fecha) {
  if (!fecha) return '—'
  const [f, h] = fecha.split('T')
  if (!f) return fecha
  const [anio, mes, dia] = f.split('-')
  return h ? `${dia}/${mes}/${anio} ${h.slice(0, 5)}` : `${dia}/${mes}/${anio}`
}

export default function PatientDetail() {
  const { id } = useParams()

  const [paciente, setPaciente] = useState(null)
  const [ordenes, setOrdenes] = useState([])
  const [muestras, setMuestras] = useState([])
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false
    setLoading(true)
    setError(null)

    Promise.all([
      buscarPacientePorId(id),
      listarOrdenes(),
      listarMuestras(),
      listarResultados(),
    ])
      .then(([datosPaciente, todasOrdenes, todasMuestras, todosResultados]) => {
        if (cancelado) return
        setPaciente(datosPaciente)
        setOrdenes(todasOrdenes)
        setMuestras(todasMuestras)
        setResultados(todosResultados)
      })
      .catch(() => {
        if (!cancelado) setError('No se pudo cargar la información del paciente.')
      })
      .finally(() => {
        if (!cancelado) setLoading(false)
      })

    return () => {
      cancelado = true
    }
  }, [id])

  const ordenesPaciente = useMemo(
    () => ordenes.filter((o) => String(o.paciente?.id) === String(id)),
    [ordenes, id]
  )

  const idsOrdenesPaciente = useMemo(
    () => new Set(ordenesPaciente.map((o) => o.id)),
    [ordenesPaciente]
  )

  const muestrasPaciente = useMemo(
    () => muestras.filter((m) => idsOrdenesPaciente.has(m.ordenMedica?.id)),
    [muestras, idsOrdenesPaciente]
  )

  const idsMuestrasPaciente = useMemo(
    () => new Set(muestrasPaciente.map((m) => m.id)),
    [muestrasPaciente]
  )

  const resultadosPaciente = useMemo(
    () => resultados.filter((r) => idsMuestrasPaciente.has(r.muestra?.id)),
    [resultados, idsMuestrasPaciente]
  )

  if (loading) {
    return (
      <div className="patient-detail-page">
        <div className="patient-detail-wrap">
          <p className="patient-detail-loading">Cargando…</p>
        </div>
      </div>
    )
  }

  if (error || !paciente) {
    return (
      <div className="patient-detail-page">
        <div className="patient-detail-wrap">
          <p className="patient-detail-error">{error || 'Paciente no encontrado.'}</p>
          <Link to="/pacientes" className="back-link">
            ← Volver a pacientes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="patient-detail-page">
      <div className="patient-detail-wrap">
        <div className="patient-detail-header">
          <div>
            <h1>{paciente.nombreCompleto}</h1>
            <div className="patient-detail-facts">
              <div className="patient-detail-fact">
                <span>Documento</span>
                <span>{paciente.documentoIdentidad}</span>
              </div>
              <div className="patient-detail-fact">
                <span>Nacimiento</span>
                <span>{formatFecha(paciente.fechaNacimiento)}</span>
              </div>
              <div className="patient-detail-fact">
                <span>Sexo</span>
                <span>{SEXO_LABEL[paciente.sexo] || paciente.sexo || '—'}</span>
              </div>
              <div className="patient-detail-fact">
                <span>Teléfono</span>
                <span>{paciente.telefono || '—'}</span>
              </div>
            </div>
          </div>
          <Link to="/pacientes" className="back-link">
            ← Volver a pacientes
          </Link>
        </div>

        <div className="patient-detail-section">
          <h2>Órdenes médicas ({ordenesPaciente.length})</h2>
          {ordenesPaciente.length === 0 ? (
            <p className="patient-detail-empty">Este paciente todavía no tiene órdenes médicas.</p>
          ) : (
            <div className="patient-detail-table-wrap">
              <table className="patient-detail-table">
                <thead>
                  <tr>
                    <th>Médico solicitante</th>
                    <th>Fecha</th>
                    <th>Exámenes</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesPaciente.map((o) => (
                    <tr key={o.id}>
                      <td>{o.medicoSolicitante}</td>
                      <td>{formatFecha(o.fechaOrden)}</td>
                      <td>
                        <div className="exam-tags">
                          {(o.examenes || []).map((ex) => (
                            <span key={ex.id} className="exam-tag">
                              {ex.nombre}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <EstadoBadge estado={o.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="patient-detail-section">
          <h2>Muestras ({muestrasPaciente.length})</h2>
          {muestrasPaciente.length === 0 ? (
            <p className="patient-detail-empty">Todavía no se han registrado muestras.</p>
          ) : (
            <div className="patient-detail-table-wrap">
              <table className="patient-detail-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Examen</th>
                    <th>Tipo</th>
                    <th>Fecha de toma</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {muestrasPaciente.map((m) => (
                    <tr key={m.id}>
                      <td>{m.codigoBarras}</td>
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
        </div>

        <div className="patient-detail-section">
          <h2>Resultados ({resultadosPaciente.length})</h2>
          {resultadosPaciente.length === 0 ? (
            <p className="patient-detail-empty">Todavía no hay resultados cargados.</p>
          ) : (
            <div className="patient-detail-table-wrap">
              <table className="patient-detail-table">
                <thead>
                  <tr>
                    <th>Examen</th>
                    <th>Valor</th>
                    <th>Fecha resultado</th>
                    <th>Estado</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {resultadosPaciente.map((r) => (
                    <tr key={r.id}>
                      <td>{r.muestra?.examen?.nombre || '—'}</td>
                      <td>
                        {r.valorObtenido} {r.muestra?.examen?.unidadMedida || ''}
                      </td>
                      <td>{formatFechaHora(r.fechaResultado)}</td>
                      <td>
                        <EstadoBadge estado={r.estado} />
                      </td>
                      <td>{r.observaciones || '—'}</td>
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
