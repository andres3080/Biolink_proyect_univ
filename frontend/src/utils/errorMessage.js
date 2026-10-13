// El backend (GlobalExceptionHandler) devuelve los errores como
// { "error": "mensaje legible" } en JSON. Esta función intenta usar ese
// mensaje real y, si no viene (por ejemplo si el backend está caído), cae
// al mensaje genérico que le pasemos.
export function extraerMensajeError(err, mensajePorDefecto) {
  return err?.response?.data?.error || mensajePorDefecto
}
