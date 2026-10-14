import { useEffect, useRef, useState } from 'react'

// Anima un número desde 0 hasta `objetivo` (efecto "contador"). Si el valor
// no es numérico (por ejemplo mientras carga) devuelve null.
export default function useCountUp(objetivo, duracionMs = 1100) {
  const [valor, setValor] = useState(null)
  const raf = useRef(0)

  useEffect(() => {
    if (typeof objetivo !== 'number' || Number.isNaN(objetivo)) {
      setValor(null)
      return undefined
    }
    const reducir =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducir || objetivo === 0) {
      setValor(objetivo)
      return undefined
    }
    const inicio = performance.now()
    function paso(ahora) {
      const t = Math.min(1, (ahora - inicio) / duracionMs)
      const suave = 1 - Math.pow(1 - t, 3)
      setValor(Math.round(objetivo * suave))
      if (t < 1) raf.current = requestAnimationFrame(paso)
    }
    raf.current = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf.current)
  }, [objetivo, duracionMs])

  return valor
}
