import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginRequest } from '../api/authService.js'
import { decodeJwt } from '../utils/jwt.js'
import { useIdleTimer } from '../hooks/useIdleTimer.js'
import { SESSION_IDLE_TIMEOUT_MS } from '../config.js'

const AuthContext = createContext(null)
const TOKEN_KEY = 'biolink_token'

function buildUserFromToken(token) {
  const payload = decodeJwt(token)
  if (!payload) return null
  // JwtUtil.generarToken pone el username como "subject" y el rol en el claim "rol"
  return { username: payload.sub, rol: payload.rol }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    return stored ? buildUserFromToken(stored) : null
  })

  const login = useCallback(async (username, password) => {
    const newToken = await loginRequest(username, password)
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setUser(buildUserFromToken(newToken))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  // Cierra sesión sola si no hay actividad del usuario por SESSION_IDLE_TIMEOUT_MS.
  // Esto es independiente de la expiración del JWT (10h, definida en el backend):
  // el JWT es el límite máximo absoluto, esto es el límite por inactividad.
  const handleIdleLogout = useCallback(() => {
    logout()
    navigate('/login', { replace: true, state: { reason: 'inactivity' } })
  }, [logout, navigate])

  useIdleTimer({
    timeoutMs: SESSION_IDLE_TIMEOUT_MS,
    onIdle: handleIdleLogout,
    active: Boolean(token),
  })

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
