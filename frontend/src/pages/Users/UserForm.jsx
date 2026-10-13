import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { crearUsuario } from '../../api/authService.js'
import { listarUsuarios, restablecerPassword } from '../../api/usuarioService.js'
import { extraerMensajeError } from '../../utils/errorMessage.js'
import './UserForm.css'

const ROLES_DISPONIBLES = ['ADMIN', 'BIOANALISTA', 'RECEPCIONISTA']

export default function UserForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('RECEPCIONISTA')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [usuarios, setUsuarios] = useState([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  const [errorUsuarios, setErrorUsuarios] = useState(null)
  const [listSuccess, setListSuccess] = useState(null)

  const [resetId, setResetId] = useState(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState(null)

  function cargarUsuarios() {
    setLoadingUsuarios(true)
    setErrorUsuarios(null)
    listarUsuarios()
      .then((data) => setUsuarios(data))
      .catch(() => setErrorUsuarios('No se pudo cargar la lista de usuarios.'))
      .finally(() => setLoadingUsuarios(false))
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!username.trim() || !password) {
      setError('Usuario y contraseña son obligatorios.')
      return
    }
    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.')
      return
    }

    setLoading(true)
    try {
      const creado = await crearUsuario({ username: username.trim(), password, rol })
      setSuccess(`Usuario "${creado.username}" creado con rol ${creado.rol}.`)
      setUsername('')
      setPassword('')
      setRol('RECEPCIONISTA')
      cargarUsuarios()
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo crear el usuario. Verifica los datos e intenta de nuevo.'))
    } finally {
      setLoading(false)
    }
  }

  function abrirReset(usuario) {
    setListSuccess(null)
    if (resetId === usuario.id) {
      setResetId(null)
      return
    }
    setResetId(usuario.id)
    setResetPassword('')
    setResetError(null)
  }

  function cancelarReset() {
    setResetId(null)
    setResetPassword('')
    setResetError(null)
  }

  async function handleResetSubmit(event, usuario) {
    event.preventDefault()
    setResetError(null)

    if (resetPassword.length < 4) {
      setResetError('La contraseña debe tener al menos 4 caracteres.')
      return
    }

    setResetLoading(true)
    try {
      await restablecerPassword(usuario.id, resetPassword)
      setResetId(null)
      setResetPassword('')
      setListSuccess(`Contraseña de "${usuario.username}" actualizada.`)
    } catch (err) {
      setResetError(extraerMensajeError(err, 'No se pudo actualizar la contraseña.'))
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="user-form-page">
      <div className="user-form-wrap">
        <div className="user-form-card">
          <div className="user-form-header">
            <h1>Crear usuario</h1>
            <Link to="/" className="back-link">
              ← Volver
            </Link>
          </div>
          <p className="user-form-subtitle">
            Crea una cuenta de acceso para personal de recepción, bioanálisis o administración.
          </p>

          {success && (
            <div className="form-success">
              <span className="success-check" aria-hidden="true">
                ✓
              </span>
              <span>{success}</span>
            </div>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. jperez"
                autoComplete="off"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                autoComplete="new-password"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="rol">Rol</label>
              <select id="rol" value={rol} onChange={(e) => setRol(e.target.value)} required>
                {ROLES_DISPONIBLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="cta" disabled={loading}>
              {loading ? 'Creando…' : 'Crear usuario'}
            </button>
          </form>
        </div>

        <div className="user-form-card">
          <h2>Usuarios registrados</h2>

          {listSuccess && (
            <div className="form-success">
              <span className="success-check" aria-hidden="true">
                ✓
              </span>
              <span>{listSuccess}</span>
            </div>
          )}
          {errorUsuarios && (
            <p className="form-error" role="alert">
              {errorUsuarios}
            </p>
          )}

          {loadingUsuarios ? (
            <p className="user-list-empty">Cargando…</p>
          ) : usuarios.length === 0 ? (
            <p className="user-list-empty">Todavía no hay usuarios registrados.</p>
          ) : (
            <div className="user-table-wrap">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <Fragment key={u.id}>
                      <tr>
                        <td>{u.username}</td>
                        <td>{u.rol}</td>
                        <td>
                          <button type="button" className="link-edit" onClick={() => abrirReset(u)}>
                            {resetId === u.id ? 'Cancelar' : 'Restablecer contraseña'}
                          </button>
                        </td>
                      </tr>
                      {resetId === u.id && (
                        <tr key={`${u.id}-reset`} className="user-reset-row">
                          <td colSpan={3}>
                            <form className="user-reset-form" onSubmit={(e) => handleResetSubmit(e, u)}>
                              <input
                                type="password"
                                value={resetPassword}
                                onChange={(e) => setResetPassword(e.target.value)}
                                placeholder="Nueva contraseña (mín. 4 caracteres)"
                                autoComplete="new-password"
                                required
                              />
                              <button type="submit" className="cta small" disabled={resetLoading}>
                                {resetLoading ? 'Guardando…' : 'Guardar'}
                              </button>
                              <button type="button" className="secondary small" onClick={cancelarReset}>
                                Cancelar
                              </button>
                              {resetError && (
                                <p className="form-error" role="alert">
                                  {resetError}
                                </p>
                              )}
                            </form>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
