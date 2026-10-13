import './Pagination.css'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination-arrow"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        ←
      </button>
      <span className="pagination-info">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        className="pagination-arrow"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
      >
        →
      </button>
    </div>
  )
}
