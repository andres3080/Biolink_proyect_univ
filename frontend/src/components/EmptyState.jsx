import './EmptyState.css'

const ICONOS = {
  lista: (
    <>
      <rect x="14" y="12" width="36" height="42" rx="6" />
      <path d="M22 24h20M22 33h20M22 42h12" />
    </>
  ),
  muestra: (
    <>
      <path d="M24 10h16M27 10v14L16 48a6 6 0 0 0 5.4 8.6h21.2A6 6 0 0 0 48 48L37 24V10" />
      <path d="M22 40h20" />
    </>
  ),
  persona: (
    <>
      <circle cx="32" cy="22" r="9" />
      <path d="M14 54c0-10 8-16 18-16s18 6 18 16" />
    </>
  ),
  senal: (
    <>
      <path d="M6 32h12l6-16 10 32 6-16h18" />
    </>
  ),
  buscar: (
    <>
      <circle cx="28" cy="28" r="14" />
      <path d="M38.5 38.5L52 52" />
    </>
  ),
}

// Estado vacío con ícono, mensaje y una acción opcional (enlace o botón).
export default function EmptyState({ icono = 'lista', titulo, texto, children, className = '' }) {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-icon" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          {ICONOS[icono] || ICONOS.lista}
        </svg>
      </div>
      {titulo && <h3 className="empty-title">{titulo}</h3>}
      {texto && <p className="empty-text">{texto}</p>}
      {children && <div className="empty-action">{children}</div>}
    </div>
  )
}
