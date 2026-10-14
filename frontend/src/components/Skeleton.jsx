import './Skeleton.css'

// Esqueletos de carga: bloques grises con brillo que reemplazan al texto
// "Cargando…" mientras llegan los datos.
export function SkeletonTable({ filas = 6, columnas = 5 }) {
  return (
    <div className="sk-table" role="status" aria-label="Cargando datos">
      <div className="sk-row sk-head">
        {Array.from({ length: columnas }, (_, c) => (
          <span key={c} className="sk sk-th" />
        ))}
      </div>
      {Array.from({ length: filas }, (_, r) => (
        <div key={r} className="sk-row" style={{ animationDelay: `${r * 60}ms` }}>
          {Array.from({ length: columnas }, (_, c) => (
            <span
              key={c}
              className="sk"
              style={{ width: `${60 + ((r * 7 + c * 13) % 35)}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonForm({ campos = 4 }) {
  return (
    <div className="sk-form" role="status" aria-label="Cargando formulario">
      {Array.from({ length: campos }, (_, i) => (
        <div key={i} className="sk-field">
          <span className="sk sk-label" />
          <span className="sk sk-input" />
        </div>
      ))}
    </div>
  )
}
