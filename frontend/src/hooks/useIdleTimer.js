import { useEffect, useRef } from 'react'

const DEFAULT_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']

/**
 * Llama a onIdle() si pasan `timeoutMs` sin ningún evento de actividad del
 * usuario (mouse, teclado, scroll, touch). El timer se reinicia con cada
 * evento. Se desactiva por completo cuando `active` es false (por ejemplo,
 * cuando no hay sesión iniciada).
 */
export function useIdleTimer({ timeoutMs, onIdle, active = true, events = DEFAULT_EVENTS }) {
  const timerRef = useRef(null)

  useEffect(() => {
    if (!active) return undefined

    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(onIdle, timeoutMs)
    }

    events.forEach((eventName) => window.addEventListener(eventName, resetTimer))
    resetTimer()

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [active, timeoutMs, onIdle, events])
}
