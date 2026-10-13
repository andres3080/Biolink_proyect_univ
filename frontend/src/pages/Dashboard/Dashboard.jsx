import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { obtenerEstadisticasPublicas } from '../../api/statsService.js'
import { listarEquipos } from '../../api/equipoService.js'
import PulseBanner from '../../components/PulseBanner.jsx'
import './Dashboard.css'

const ROLES_PACIENTES_ORDENES = ['ADMIN', 'RECEPCIONISTA']
const ROLES_MUESTRAS = ['ADMIN', 'BIOANALISTA', 'RECEPCIONISTA']
const ROLES_CARGA_RESULTADO = ['BIOANALISTA', 'ADMIN']
const ROLES_EQUIPOS = ['ADMIN', 'BIOANALISTA']

export default function Dashboard() {
  const { user, logout } = useAuth()
  const puedeGestionarPacientesOrdenes = ROLES_PACIENTES_ORDENES.includes(user?.rol)
  const puedeRegistrarMuestra = ROLES_MUESTRAS.includes(user?.rol)
  const puedeCargarResultado = ROLES_CARGA_RESULTADO.includes(user?.rol)
  const puedeVerEquipos = ROLES_EQUIPOS.includes(user?.rol)
  const esAdmin = user?.rol === 'ADMIN'

  const [stats, setStats] = useState(null)
  const [equipos, setEquipos] = useState(null)

  useEffect(() => {
    let cancelado = false
    obtenerEstadisticasPublicas()
      .then((data) => {
        if (!cancelado) setStats(data)
      })
      .catch(() => {
        // Si falla, el panel simplemente muestra "—" en vez de romper la pantalla.
      })
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    if (!puedeVerEquipos) return
    let cancelado = false
    listarEquipos()
      .then((data) => {
        if (!cancelado) setEquipos(data)
      })
      .catch(() => {
        // Igual que con stats: si falla, el widget simplemente muestra "—".
      })
    return () => {
      cancelado = true
    }
  }, [puedeVerEquipos])

  const conectados = equipos ? equipos.filter((e) => e.conectado).length : null
  const desconectados = equipos ? equipos.length - conectados : null

  return (
    <div className="dashboard">
      <PulseBanner />
      <header>
        <div className="lockup">
          <svg width="24" height="24" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="8" cy="32" r="5" fill="#8fe3d6" />
            <path
              d="M8 32 H22 C26 32 26 16 32 16 C38 16 38 32 42 32 H56"
              fill="none"
              stroke="#8fe3d6"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="56" cy="32" r="5" fill="#f0895a" />
          </svg>
          <span>BioLink</span>
        </div>
        <div className="user-info">
          <span>{user?.username}</span>
          {user?.rol && <span className="rol-badge">{user.rol}</span>}
          {esAdmin && (
            <Link to="/usuarios/nuevo" className="create-user-link">
              + Crear usuario
            </Link>
          )}
          <button type="button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <main>
        <h1>
          Bienvenido a BioLink
          {user?.username && (
            <span className="welcome-user">
              {user.username}
              {user?.rol && <span className="welcome-user-rol">{user.rol}</span>}
            </span>
          )}
        </h1>
        <p>
          Gestioná pacientes, órdenes médicas, muestras y resultados, y seguí el estado de
          conexión de tus equipos biomédicos por HL7 — todo desde un mismo lugar.
        </p>

        <div className="dashboard-layout">
          <div className="quick-actions">
            {puedeVerEquipos && (
              <Link to="/equipos" className="action-card equipo-status-card">
                <span className="action-title">
                  <span className={`equipo-mini-dot ${conectados > 0 ? 'conectado' : 'desconectado'}`} />
                  Equipos biomédicos <span className="action-arrow">→</span>
                </span>
                <span className="action-desc">
                  {equipos === null
                    ? 'Estado de conexión y actividad HL7 de cada equipo'
                    : `${conectados} conectado${conectados === 1 ? '' : 's'} · ${desconectados} desconectado${desconectados === 1 ? '' : 's'}`}
                </span>
              </Link>
            )}
            <Link to="/pacientes" className="action-card">
              <span className="action-title">
                Ver pacientes <span className="action-arrow">→</span>
              </span>
              <span className="action-desc">Listado y búsqueda de pacientes registrados</span>
            </Link>
            {puedeGestionarPacientesOrdenes && (
              <Link to="/pacientes/nuevo" className="action-card">
                <span className="action-title">
                  Registrar paciente <span className="action-arrow">→</span>
                </span>
                <span className="action-desc">Crear un paciente nuevo en el sistema</span>
              </Link>
            )}
            <Link to="/ordenes" className="action-card">
              <span className="action-title">
                Ver órdenes médicas <span className="action-arrow">→</span>
              </span>
              <span className="action-desc">Listado de órdenes creadas</span>
            </Link>
            {puedeGestionarPacientesOrdenes && (
              <Link to="/ordenes/nueva" className="action-card">
                <span className="action-title">
                  Crear orden médica <span className="action-arrow">→</span>
                </span>
                <span className="action-desc">Solicitar exámenes para un paciente</span>
              </Link>
            )}
            <Link to="/muestras" className="action-card">
              <span className="action-title">
                Ver muestras <span className="action-arrow">→</span>
              </span>
              <span className="action-desc">Listado de muestras registradas</span>
            </Link>
            {puedeRegistrarMuestra && (
              <Link to="/muestras/nueva" className="action-card">
                <span className="action-title">
                  Registrar muestra <span className="action-arrow">→</span>
                </span>
                <span className="action-desc">Asociar una muestra a una orden y examen</span>
              </Link>
            )}
            <Link to="/resultados" className="action-card">
              <span className="action-title">
                Ver resultados <span className="action-arrow">→</span>
              </span>
              <span className="action-desc">Listado de resultados cargados</span>
            </Link>
            {puedeCargarResultado && (
              <Link to="/resultados/nuevo" className="action-card">
                <span className="action-title">
                  Cargar resultado <span className="action-arrow">→</span>
                </span>
                <span className="action-desc">Registrar el valor obtenido de una muestra</span>
              </Link>
            )}
            {esAdmin && (
              <Link to="/examenes" className="action-card">
                <span className="action-title">
                  Catálogo de exámenes <span className="action-arrow">→</span>
                </span>
                <span className="action-desc">Ver, crear y corregir exámenes del catálogo</span>
              </Link>
            )}
          </div>

          <aside className="stats-panel">
            <h2>Resumen del sistema</h2>
            {puedeVerEquipos && (
              <div className="stat-row">
                <span className="stat-label">Equipos conectados</span>
                <span className="stat-value equipos-live-value">
                  {equipos === null ? (
                    '—'
                  ) : (
                    <>
                      <span className={`equipo-mini-dot ${conectados > 0 ? 'conectado' : 'desconectado'}`} />
                      {conectados}/{equipos.length}
                    </>
                  )}
                </span>
              </div>
            )}
            <div className="stat-row">
              <span className="stat-label">Pacientes</span>
              <span className="stat-value">{stats ? stats.pacientes : '—'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Órdenes médicas</span>
              <span className="stat-value">{stats ? stats.ordenes : '—'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Muestras</span>
              <span className="stat-value">{stats ? stats.muestras : '—'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Resultados</span>
              <span className="stat-value">{stats ? stats.resultados : '—'}</span>
            </div>
            <p className="stats-note">Cifras totales registradas en el sistema.</p>
          </aside>
        </div>
      </main>
    </div>
  )
}
