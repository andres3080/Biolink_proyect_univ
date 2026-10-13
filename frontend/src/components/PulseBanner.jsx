import './PulseBanner.css'

// Genera una línea de "pulso" tipo monitor cardíaco: un latido corto (P-QRS-T)
// seguido de un tramo plano largo, repetido `unidades` veces — para que se
// vea como saltos/latidos separados, no una onda continua.
function buildPulsePath(unidades, anchoUnidad = 260, alto = 60) {
  const base = alto / 2
  let d = `M0,${base} `
  for (let i = 0; i < unidades; i++) {
    const x = i * anchoUnidad
    d += `L${x + 14},${base} `
    d += `L${x + 20},${base - 6} L${x + 25},${base} `
    d += `L${x + 34},${base} `
    d += `L${x + 38},${base + 6} `
    d += `L${x + 42},${base - 30} `
    d += `L${x + 46},${base + 26} `
    d += `L${x + 50},${base} `
    d += `L${x + 58},${base - 9} L${x + 66},${base - 9} L${x + 74},${base} `
  }
  d += `L${unidades * anchoUnidad},${base}`
  return d
}

const PULSE_UNITS = 7
const PULSE_UNIT_WIDTH = 260
const PULSE_PATH = buildPulsePath(PULSE_UNITS, PULSE_UNIT_WIDTH)
const PULSE_VIEWBOX_WIDTH = PULSE_UNITS * PULSE_UNIT_WIDTH

// El punto que recorre la línea tarda esto en cruzarla una vez, y va dejando
// una estela de puntos que lo siguen con un pequeño retraso cada uno.
const PULSE_DOT_DURATION = 7
const PULSE_TRAIL_COUNT = 12
const PULSE_TRAIL_STEP = 0.05
const PULSE_TRAIL_DOTS = Array.from({ length: PULSE_TRAIL_COUNT }, (_, i) => {
  const factor = (i + 1) / (PULSE_TRAIL_COUNT + 1)
  return {
    key: i,
    begin: ((i + 1) * PULSE_TRAIL_STEP).toFixed(3),
    radius: (4 - factor * 3.4).toFixed(2),
    opacity: (0.6 * (1 - factor)).toFixed(2),
  }
})

// Barra decorativa de pulso: una línea de monitor cardíaco casi invisible con
// un punto brillante que la recorre dejando una estela. Se usa en el login y
// en el dashboard para mantener la misma identidad visual.
export default function PulseBanner() {
  return (
    <div className="pulse-banner" aria-hidden="true">
      <svg
        className="pulse-svg"
        width="100%"
        height="78"
        viewBox={`0 0 ${PULSE_VIEWBOX_WIDTH} 60`}
        preserveAspectRatio="none"
      >
        <path
          d={PULSE_PATH}
          className="pulse-line"
          fill="none"
          stroke="#8fe3d6"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g className="pulse-dots">
          {PULSE_TRAIL_DOTS.map((dot) => (
            <circle key={dot.key} r={dot.radius} fill="#8fe3d6" opacity={dot.opacity}>
              <animateMotion
                path={PULSE_PATH}
                dur={`${PULSE_DOT_DURATION}s`}
                begin={`${dot.begin}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
          <circle r="4.5" fill="#d4fbf3" className="pulse-dot-head">
            <animateMotion
              path={PULSE_PATH}
              dur={`${PULSE_DOT_DURATION}s`}
              begin="0s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </svg>
    </div>
  )
}
