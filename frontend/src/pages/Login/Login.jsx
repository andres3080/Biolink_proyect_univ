import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { obtenerEstadisticasPublicas } from '../../api/statsService.js'
import PulseBanner from '../../components/PulseBanner.jsx'
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

  const from = location.state?.from?.pathname ?? '/'

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
            <a className="primary" href="#conocer-biolink">
              Conocer BioLink →
            </a>
            <a className="ghost" href="#como-funciona">
              Ver cómo funciona
            </a>
          </div>
          <p className="stack-line">REACT · SPRING BOOT · POSTGRESQL</p>

          <div className="modules-row">
            <div className="module">
              <div className="m-head">
                <span className="m-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" fill="#bfe9ec" />
                    <path
                      d="M4 20c0-4 4-6 8-6s8 2 8 6"
                      stroke="#bfe9ec"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="m-label">Pacientes</span>
              </div>
              <div className="m-val">
                {stats ? stats.pacientes : '—'} <span className="m-sub">registrados</span>
              </div>
            </div>

            <div className="module">
              <div className="m-head">
                <span className="m-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="#bfe9ec" strokeWidth="2" />
                    <path
                      d="M8 13l3 3 6-7"
                      stroke="#f0895a"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="m-label">Resultados</span>
              </div>
              <div className="m-val">
                {stats ? stats.resultados : '—'} <span className="m-sub">cargados</span>
              </div>
            </div>

            <div className="module">
              <div className="m-head">
                <span className="m-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path
                      d="M2 12h5l2-7 4 14 2-7h7"
                      stroke="#bfe9ec"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="m-label">Muestras</span>
              </div>
              <div className="m-val">
                {stats ? stats.muestras : '—'} <span className="m-sub">registradas</span>
              </div>
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
            <input
              id="password"
              type="password"
              placeholder="••••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <div className="row-end">
            <span className="password-hint">¿Olvidaste tu contraseña? Contacta a un administrador.</span>
          </div>
          <button type="submit" className="cta" disabled={loading}>
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
    </div>
  )
}
