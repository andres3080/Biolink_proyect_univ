import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { obtenerEstadisticasPublicas } from '../../api/statsService.js'
import PulseBanner from '../../components/PulseBanner.jsx'
import PlanesSection from '../../components/PlanesSection.jsx'
import useCountUp from '../../hooks/useCountUp.js'
import './Login.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [info] = useState(
    location.state?.reason === 'inactivity'
      ? 'Tu sesión se cerró por inactividad. Inicia sesión de nuevo.'
      : null
  )
  const [stats, setStats] = useState(null)
  const [verPassword, setVerPassword] = useState(false)

  const nPacientes = useCountUp(stats?.pacientes)
  const nResultados = useCountUp(stats?.resultados)
  const nMuestras = useCountUp(stats?.muestras)
  const mostrar = (n) => (n === null || n === undefined ? '—' : n.toLocaleString('es-CO'))

  // Si venía de una página protegida (p. ej. /checkout?plan=...), vuelve ahí tras entrar.
  const origen = location.state?.from
  const from = origen?.pathname ? `${origen.pathname}${origen.search || ''}` : '/'

  useEffect(() => {
    let cancelado = false
    obtenerEstadisticasPublicas()
      .then((data) => {
        if (!cancelado) setStats(data)
      })
      .catch(() => {
        // Si el backend no está arriba todavía, simplemente no mostramos cifras.
      })
    return () => {
      cancelado = true
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError('Credenciales inválidas. Verifica tu usuario y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="site">
      <PulseBanner />

      <div className="site-nav">
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
        <a className="nav-link" href="#planes">
          Planes
        </a>
      </div>

      <div className="site-hero">
        <div>
          <span className="site-badge">
            <span className="live-dot"></span>DATOS CLÍNICOS EN TIEMPO REAL
          </span>
          <h1 className="headline">
            PACIENTES, MUESTRAS, EQUIPOS.
            <br />
            UNA SOLA <span className="outline">SEÑAL.</span>
          </h1>
          <p className="sub">
            BioLink une el registro de pacientes, la carga de resultados y tus equipos de
            laboratorio en un solo sistema, con comunicación en tiempo real de punta a punta.
          </p>
          <div className="ctas">
            <a className="ghost" href="#como-funciona">
              Ver cómo funciona ↓
            </a>
          </div>

          <div className="preview" aria-label="Vista previa del sistema">
            <div className="preview-bar">
              <span className="pv-dot" />
              <span className="pv-dot" />
              <span className="pv-dot" />
              <span className="pv-title">Monitor de equipos</span>
              <span className="pv-tag">Vista previa</span>
            </div>

            <div className="pv-stats">
              <div className="pv-stat">
                <span className="pv-stat-label">Pacientes</span>
                <span className="pv-stat-val">{mostrar(nPacientes)}</span>
              </div>
              <div className="pv-stat">
                <span className="pv-stat-label">Muestras</span>
                <span className="pv-stat-val">{mostrar(nMuestras)}</span>
              </div>
              <div className="pv-stat">
                <span className="pv-stat-label">Resultados</span>
                <span className="pv-stat-val">{mostrar(nResultados)}</span>
              </div>
            </div>

            <ul className="pv-devices">
              <li>
                <span className="pv-led on" />
                <span className="pv-dev-name">Analizador HbA1c</span>
                <span className="pv-dev-meta">conectado · hace 12 s</span>
              </li>
              <li>
                <span className="pv-led on" />
                <span className="pv-dev-name">Hematología</span>
                <span className="pv-dev-meta">conectado · hace 3 min</span>
              </li>
              <li>
                <span className="pv-led off" />
                <span className="pv-dev-name">Química clínica</span>
                <span className="pv-dev-meta">desconectado</span>
              </li>
            </ul>

            <div className="pv-msg">
              <code>ORU^R01</code>
              <span>resultado recibido del equipo</span>
              <span className="pv-chip ok">Validado</span>
            </div>
          </div>
        </div>

        <form className="glass-card" onSubmit={handleSubmit}>
          <div className="accent-bar"></div>
          <div className="lockup">
            <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="8" cy="32" r="5" fill="#5fd6df" />
              <path
                d="M8 32 H22 C26 32 26 16 32 16 C38 16 38 32 42 32 H56"
                fill="none"
                stroke="#5fd6df"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="56" cy="32" r="5" fill="#f0895a" />
            </svg>
            <span>BioLink</span>
          </div>
          <p className="tagline">Ingresa con tu cuenta del laboratorio</p>

          {info && !error && <p className="form-info">{info}</p>}

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="field">
            <label htmlFor="username">Correo o usuario</label>
            <input
              id="username"
              type="text"
              placeholder="nombre@laboratorio.com"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <div className="pw-wrap">
              <input
                id="password"
                type={verPassword ? 'text' : 'password'}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setVerPassword((v) => !v)}
                aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={verPassword}
              >
                {verPassword ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M3 3l18 18M10.6 6.2A9.8 9.8 0 0 1 12 6c5 0 8.6 3.6 10 6-0.6 1.1-1.6 2.4-3 3.5M6.5 7.6C4.4 8.9 2.9 10.7 2 12c1.4 2.4 5 6 10 6 1.5 0 2.9-0.3 4.100-0.9M9.900 9.900a3 3 0 0 0 4.200 4.200" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M2 12c1.4-2.4 5-6 10-6s8.600 3.600 10 6c-1.400 2.400-5 6-10 6S3.400 14.400 2 12z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="row-end">
            <span className="password-hint">¿Olvidaste tu clave? Contacta al administrador.</span>
          </div>
          <button type="submit" className="cta" disabled={loading}>
            {loading && <span className="btn-spin" aria-hidden="true" />}
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
          <p className="foot">Acceso para recepción, bioanálisis y administración</p>
        </form>
      </div>

      <section id="conocer-biolink" className="info-section">
        <h2>¿Qué es BioLink?</h2>
        <p>
          BioLink es el sistema interno de este laboratorio para gestionar pacientes, órdenes
          médicas, muestras y resultados en un solo lugar, con acceso diferenciado por rol para
          el personal de recepción, bioanálisis y administración.
        </p>
      </section>

      <section id="como-funciona" className="info-section">
        <h2>¿Cómo funciona?</h2>
        <ol className="flow-steps">
          <li>
            <span className="step-num">1</span>
            <div>
              <strong>Registro del paciente</strong>
              <p>Se registran los datos básicos del paciente en el sistema.</p>
            </div>
          </li>
          <li>
            <span className="step-num">2</span>
            <div>
              <strong>Orden médica</strong>
              <p>Se crea una orden indicando qué exámenes debe realizarse el paciente.</p>
            </div>
          </li>
          <li>
            <span className="step-num">3</span>
            <div>
              <strong>Toma de muestra</strong>
              <p>Bioanálisis registra la muestra asociada a la orden y al examen correspondiente.</p>
            </div>
          </li>
          <li>
            <span className="step-num">4</span>
            <div>
              <strong>Resultado</strong>
              <p>
                Se carga el valor obtenido y el sistema valida automáticamente si está dentro del
                rango de referencia del examen.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <PlanesSection />
    </div>
  )
}
