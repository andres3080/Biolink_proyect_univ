import { useEffect, useRef, useState } from 'react'
import './SuccessCheck.css'

// Pantalla de confirmación animada: primero un círculo que gira mientras se
// procesa, luego el círculo se cierra y aparece el check dibujándose.
//
//   status: 'idle' | 'loading' | 'success'
//   - 'loading' muestra el círculo girando.
//   - 'success' completa el círculo y dibuja el check (respeta un mínimo de
//     giro para que la animación se alcance a ver aunque el servidor responda rápido).
//   - 'idle' oculta todo.
const MIN_GIRO_MS = 750

export default function SuccessCheck({
  status,
  title = 'Listo',
  detail,
  onClose,
  autoCloseMs = 3200,
  tone = 'ok',
  children,
}) {
  const [fase, setFase] = useState('oculto') // 'oculto' | 'girando' | 'listo'
  const inicio = useRef(0)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (status === 'idle') {
      setFase('oculto')
      return undefined
    }
    if (status === 'loading') {
      inicio.current = Date.now()
      setFase('girando')
      return undefined
    }
    if (status === 'success') {
      if (inicio.current === 0) inicio.current = Date.now()
      const restante = Math.max(0, MIN_GIRO_MS - (Date.now() - inicio.current))
      setFase('girando')
      const t1 = setTimeout(() => setFase('listo'), restante)
      return () => clearTimeout(t1)
    }
    return undefined
  }, [status])

  useEffect(() => {
    if (fase !== 'listo' || !autoCloseMs) return undefined
    const t = setTimeout(() => onCloseRef.current?.(), autoCloseMs)
    return () => clearTimeout(t)
  }, [fase, autoCloseMs])

  useEffect(() => {
    if (fase === 'oculto') return undefined
    function onKey(e) {
      if (e.key === 'Escape' && fase === 'listo') onCloseRef.current?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fase])

  if (fase === 'oculto') {
    inicio.current = 0
    return null
  }

  const listo = fase === 'listo'

  return (
    <div
      className="sc-overlay"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label={listo ? title : 'Procesando'}
      onClick={() => listo && onClose?.()}
    >
      <div className={`sc-card${listo ? ' sc-listo' : ''}${tone === 'alerta' ? ' sc-alerta' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="sc-badge">
          <svg viewBox="0 0 120 120" width="108" height="108" aria-hidden="true">
            <circle className="sc-track" cx="60" cy="60" r="50" />
            {!listo && <circle className="sc-spin" cx="60" cy="60" r="50" />}
            {listo && <circle className="sc-ring" cx="60" cy="60" r="50" />}
            {listo && <circle className="sc-fill" cx="60" cy="60" r="50" />}
            {listo && <path className="sc-check" d="M37 62 L53 78 L84 44" />}
          </svg>
          {listo && <span className="sc-burst" aria-hidden="true" />}
        </div>
        <h2 className="sc-title">{listo ? title : 'Procesando…'}</h2>
        {listo && detail && <p className="sc-detail">{detail}</p>}
        {listo && children && <div className="sc-actions">{children}</div>}
        {listo && (
          <button type="button" className="sc-close" onClick={() => onClose?.()}>
            Continuar
          </button>
        )}
      </div>
    </div>
  )
}
