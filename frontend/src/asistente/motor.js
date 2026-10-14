// Motor de coincidencia del asistente: normaliza el texto, quita palabras vacías,
// unifica sinónimos y puntúa cada intención. No usa IA ni servicios externos.
import { INTENCIONES } from './conocimiento.js'

const VACIAS = new Set([
  'de', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'que', 'como', 'para', 'por', 'en',
  'mi', 'me', 'se', 'es', 'y', 'o', 'a', 'al', 'del', 'quiero', 'puedo', 'necesito', 'hay', 'hago',
  'hacer', 'con', 'lo', 'le', 'su', 'sus', 'esta', 'este', 'donde', 'cual', 'cuales', 'debo', 'podria',
  'favor', 'porfa', 'si', 'no', 'ya', 'mas', 'pero', 'sobre', 'tengo', 'soy', 'estoy', 'son',
])

// Grupos de sinónimos (ya reducidos a su raíz de 5 letras) → palabra canónica.
const SINONIMOS = {
  crear: ['crear', 'nuevo', 'nueva', 'regis', 'agreg', 'anadi', 'ingre', 'alta', 'inscr', 'carga', 'cargo', 'creo', 'subir', 'digit'],
  ver: ['ver', 'lista', 'consu', 'busca', 'encon', 'mostr'],
}
const A_CANONICA = {}
for (const [canon, lista] of Object.entries(SINONIMOS)) {
  for (const s of lista) A_CANONICA[s] = canon
}

export function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function raiz(token) {
  const t = token.length <= 4 ? token : token.slice(0, 5)
  return A_CANONICA[t] || t
}

export function tokenizar(texto) {
  return normalizar(texto)
    .split(' ')
    .filter((t) => t && !VACIAS.has(t))
    .map(raiz)
}

// Se preparan una sola vez los tokens de cada palabra clave.
const INDICE = INTENCIONES.map((intencion) => ({
  intencion,
  claves: intencion.keywords
    .map((k) => ({ frase: normalizar(k), tokens: tokenizar(k) }))
    .filter((c) => c.frase.length > 0),
}))

// Puntaje = mejor palabra clave (una frase completa pesa más cuanto más larga es)
// + un pequeño aporte de las demás. Así una intención con muchas frases parecidas
// no gana solo por tener más sinónimos escritos.
function puntuar(tokensConsulta, fraseConsulta, claves) {
  const set = new Set(tokensConsulta)
  let mejor = 0
  let resto = 0
  for (const { frase, tokens } of claves) {
    let p = 0
    const aciertos = tokens.filter((t) => set.has(t)).length
    if (tokens.length > 0 && aciertos === tokens.length) p = tokens.length * 3
    else if (tokens.length > 1 && aciertos > 0) p = aciertos * 0.8
    // La frase tal cual aparece en lo que escribió el usuario (útil con palabras vacías).
    if (frase.length >= 6 && ` ${fraseConsulta} `.includes(` ${frase} `)) p = Math.max(p, 6)
    if (p > mejor) {
      resto += mejor * 0.2
      mejor = p
    } else {
      resto += p * 0.2
    }
  }
  return mejor + Math.min(resto, 2)
}

// Devuelve { mejor, puntaje, alternativas } ordenadas por puntaje.
export function interpretar(texto) {
  const tokens = tokenizar(texto)
  const frase = normalizar(texto)
  const ranking = INDICE.map(({ intencion, claves }) => ({
    intencion,
    puntaje: puntuar(tokens, frase, claves),
  }))
    .filter((r) => r.puntaje > 0)
    .sort((a, b) => b.puntaje - a.puntaje)
  if (ranking.length === 0) return { mejor: null, puntaje: 0, alternativas: [] }
  return {
    mejor: ranking[0].intencion,
    puntaje: ranking[0].puntaje,
    alternativas: ranking.slice(0, 3).map((r) => r.intencion),
  }
}

export const UMBRAL_CONFIANZA = 3
