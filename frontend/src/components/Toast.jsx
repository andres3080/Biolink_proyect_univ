import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import './Toast.css'

// Avisos flotantes (toasts): reemplazan las cajas de texto fijas para mensajes
// de éxito, error e información. Se usan con el hook useToast().
const ToastContext = createContext(null)

const ICONOS = {
  success: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="7.5" r="1.4" fill="currentColor" />
      <path d="M12 11v6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const siguienteId = useRef(1)
  const timers = useRef(new Map())

  const cerrar = useCallback((id) => {
    setToasts((lista) => lista.map((t) => (t.id === id ? { ...t, saliendo: true } : t)))
    setTimeout(() => setToasts((lista) => lista.filter((t) => t.id !== id)), 220)
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const mostrar = useCallback(
    (tipo, mensaje, duracion) => {
      const id = siguienteId.current++
      setToasts((lista) => [...lista.slice(-3), { id, tipo, mensaje, saliendo: false }])
      const ms = duracion ?? (tipo === 'error' ? 6500 : 4200)
      timers.current.set(id, setTimeout(() => cerrar(id), ms))
      return id
    },
    [cerrar]
  )

  useEffect(() => {
    const actuales = timers.current
    return () => actuales.forEach((t) => clearTimeout(t))
  }, [])

  const api = useMemo(
    () => ({
      success: (m, d) => mostrar('success', m, d),
      error: (m, d) => mostrar('error', m, d),
      info: (m, d) => mostrar('info', m, d),
    }),
    [mostrar]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.tipo}${t.saliendo ? ' saliendo' : ''}`}
            role={t.tipo === 'error' ? 'alert' : 'status'}
          >
            <span className="toast-icon">{ICONOS[t.tipo]}</span>
            <span className="toast-msg">{t.mensaje}</span>
            <button type="button" className="toast-close" onClick={() => cerrar(t.id)} aria-label="Cerrar aviso">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
