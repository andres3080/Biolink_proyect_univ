// Planes de respaldo: se usan en la portada si el backend todavía no está arriba.
// Deben coincidir con PagoService.PLANES. Precios de EJEMPLO para la demostración.
export const PLANES_RESPALDO = [
  {
    codigo: 'BASICO',
    nombre: 'Básico',
    descripcion: 'Para laboratorios pequeños que empiezan a digitalizar.',
    mensualCop: 79000,
    anualCop: 790000,
    maxUsuarios: 3,
    maxEquipos: 0,
    hl7: false,
    caracteristicas: [
      'Hasta 3 usuarios',
      'Pacientes, órdenes, muestras y resultados',
      'Validación automática de rangos',
      'Soporte por correo',
    ],
    destacado: false,
  },
  {
    codigo: 'PROFESIONAL',
    nombre: 'Profesional',
    descripcion: 'Para laboratorios con equipos conectados.',
    mensualCop: 189000,
    anualCop: 1890000,
    maxUsuarios: 10,
    maxEquipos: 3,
    hl7: true,
    caracteristicas: [
      'Hasta 10 usuarios',
      'Hasta 3 equipos por HL7',
      'Monitor de conexión de equipos',
      'Soporte prioritario',
    ],
    destacado: true,
  },
  {
    codigo: 'INTEGRAL',
    nombre: 'Integral',
    descripcion: 'Para redes de laboratorios y alto volumen.',
    mensualCop: 389000,
    anualCop: 3890000,
    maxUsuarios: -1,
    maxEquipos: 10,
    hl7: true,
    caracteristicas: [
      'Usuarios ilimitados',
      'Hasta 10 equipos por HL7',
      'Capacitación del personal',
      'Acompañamiento en la instalación',
    ],
    destacado: false,
  },
]

const FORMATO_COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function formatoCop(valor) {
  return FORMATO_COP.format(valor ?? 0).replace(/ /g, ' ')
}

export function formatoCentavos(centavos) {
  return formatoCop((centavos ?? 0) / 100)
}

export function formatoFecha(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const PERIODOS = { MENSUAL: 'mensual', ANUAL: 'anual' }
