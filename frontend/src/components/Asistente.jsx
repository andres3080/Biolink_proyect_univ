import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { obtenerEstadisticasPublicas } from '../api/statsService.js'
import { listarEquipos } from '../api/equipoService.js'
import { listarResultados } from '../api/resultadoService.js'
import {
  INTENCIONES,
  NOMBRE_ROL,
  POR_ID,
  SUGERENCIAS_POR_RUTA,
} from '../asistente/conocimiento.js'
import { UMBRAL_CONFIANZA, interpretar } from '../asistente/motor.js'
import './Asistente.css'

// Asistente virtual GUIADO (sin IA externa): responde con una base de conocimiento
// propia, guía el flujo de trabajo por rol y consulta solo totales del sistema.
// El historial vive en memoria: no se guarda nada en el navegador.

const RUTAS_OCULTAS = ['/login']
let contador = 0
const nuevoId = () => `m${++contador}`

function puedeRealizar(intencion, rol) {
  return !intencion.roles || intencion.roles.includes(rol)
}

export default function Asistente() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const rol = user?.rol

  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([])
  const [escribiendo, setEscribiendo] = useState(false)
  const [texto, setTexto] = useState('')
  const finRef = useRef(null)
  const inputRef = useRef(null)
  const temporizadores = useRef([])

  const ruta = location.pathname
  const sugerenciasContexto = useMemo(() => {
    const ids = SUGERENCIAS_POR_RUTA[ruta] || SUGERENCIAS_POR_RUTA['/']
    return ids.map((id) => POR_ID[id]).filter(Boolean)
  }, [ruta])

  useEffect(
    () => () => {
      temporizadores.current.forEach(clearTimeout)
    },
    []
  )

  const agregar = useCallback((msg) => {
    setMensajes((prev) => [...prev, { id: nuevoId(), ...msg }])
  }, [])

  // Saludo inicial la primera vez que se abre.
  useEffect(() => {
    if (!abierto || mensajes.length > 0) return
    agregar({
      de: 'bot',
      titulo: `Hola${user?.username ? `, ${user.username}` : ''}`,
      texto: `Soy el asistente de BioLink. Te guío paso a paso${
        rol ? ` según tu rol de ${NOMBRE_ROL[rol] || rol.toLowerCase()}` : ''
      }. Elige una opción o escríbeme tu duda.`,
      chips: ['flujo', 'estados', 'roles', 'stats'],
    })
  }, [abierto, mensajes.length, agregar, user, rol])

  // Enfocar el campo al abrir, cerrar con Escape y bajar al último mensaje.
  useEffect(() => {
    if (abierto) inputRef.current?.focus()
  }, [abierto])
  useEffect(() => {
    if (!abierto) return undefined
    const onKey = (e) => e.key === 'Escape' && setAbierto(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierto])
  useEffect(() => {
    finRef.current?.scrollIntoView?.({ block: 'end' })
  }, [mensajes, escribiendo, abierto])

  // Respuestas con datos en vivo: solo conteos y estados, nunca datos de pacientes.
  async function datosEnVivo(intencion) {
    try {
      if (intencion.dinamico === 'stats') {
        const s = await obtenerEstadisticasPublicas()
        return {
          texto: 'Esto es lo que hay registrado en el sistema ahora mismo:',
          pasos: [
            `Pacientes: ${s.pacientes ?? 0}`,
            `Órdenes médicas: ${s.ordenes ?? 0}`,
            `Muestras: ${s.muestras ?? 0}`,
            `Resultados: ${s.resultados ?? 0}`,
          ],
        }
      }
      if (intencion.dinamico === 'equipos') {
        const lista = await listarEquipos()
        const conectados = lista.filter((e) => e.conectado).length
        if (lista.length === 0) return { texto: 'Todavía no hay equipos registrados. Aparecen cuando envían su primer mensaje HL7.' }
        return {
          texto: `Hay ${conectados} equipo${conectados === 1 ? '' : 's'} conectado${conectados === 1 ? '' : 's'} y ${lista.length - conectados} desconectado${lista.length - conectados === 1 ? '' : 's'} (de ${lista.length}).`,
        }
      }
      if (intencion.dinamico === 'revision') {
        const lista = await listarResultados()
        const pendientes = lista.filter((r) => r.estado === 'PENDIENTE_REVISION').length
        return {
          texto:
            pendientes === 0
              ? 'No hay resultados pendientes de revisión. Todo está dentro de rango.'
              : `Hay ${pendientes} resultado${pendientes === 1 ? '' : 's'} pendiente${pendientes === 1 ? '' : 's'} de revisión (fuera del rango de referencia).`,
        }
      }
      if (intencion.dinamico === 'rol') {
        return { extra: rol ? `Tu cuenta tiene el rol de ${NOMBRE_ROL[rol] || rol.toLowerCase()}.` : null }
      }
    } catch (e) {
      return { texto: 'No pude consultar los datos en este momento. Verifica que el servidor esté en ejecución.' }
    }
    return {}
  }

  // Construye la respuesta del bot para una intención.
  async function responder(intencion) {
    const permitido = puedeRealizar(intencion, rol)
    const vivo = intencion.dinamico ? await datosEnVivo(intencion) : {}

    if (!permitido) {
      const quienes = intencion.roles.map((r) => NOMBRE_ROL[r] || r.toLowerCase()).join(' o ')
      return {
        de: 'bot',
        titulo: intencion.titulo,
        texto: `Esto lo gestiona el ${quienes}. Tu rol es ${NOMBRE_ROL[rol] || 'otro'}, por eso no te aparece la opción.${
          intencion.verTo ? ' Sí puedes consultar la información.' : ' Si la necesitas, pídeselo a esa persona.'
        }`,
        acciones: intencion.verTo ? [{ label: 'Ver el listado', to: intencion.verTo }] : [],
        chips: ['roles'],
      }
    }

    const acciones = (intencion.acciones || []).filter((a) => !a.roles || a.roles.includes(rol))
    const chips = []
    if (intencion.siguiente && POR_ID[intencion.siguiente] && puedeRealizar(POR_ID[intencion.siguiente], rol)) {
      chips.push(`sig:${intencion.siguiente}`)
    }
    for (const id of intencion.sugerencias || []) {
      if (POR_ID[id] && puedeRealizar(POR_ID[id], rol) && !chips.includes(id)) chips.push(id)
    }

    return {
      de: 'bot',
      titulo: intencion.titulo,
      texto: [vivo.extra, vivo.texto || intencion.texto].filter(Boolean).join(' '),
      pasos: vivo.pasos || intencion.pasos,
      acciones,
      chips: chips.slice(0, 3),
    }
  }

  function preguntar(textoUsuario, idDirecto) {
    const limpio = (textoUsuario || '').trim()
    if (!limpio || escribiendo) return
    agregar({ de: 'user', texto: limpio })
    setTexto('')
    setEscribiendo(true)

    const retraso = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : 520
    const t = setTimeout(async () => {
      let respuesta
      if (idDirecto && POR_ID[idDirecto]) {
        respuesta = await responder(POR_ID[idDirecto])
      } else {
        const { mejor, puntaje, alternativas } = interpretar(limpio)
        if (mejor && puntaje >= UMBRAL_CONFIANZA) {
          respuesta = await responder(mejor)
        } else {
          const utiles = alternativas.filter((a) => !a.oculta && puedeRealizar(a, rol) || (!a.oculta && a.verTo))
          respuesta = {
            de: 'bot',
            titulo: utiles.length ? '¿Te refieres a alguna de estas?' : 'No estoy seguro de haber entendido',
            texto: utiles.length
              ? 'No encontré una respuesta exacta, pero quizá estos temas te sirven:'
              : 'Todavía no sé responder eso. Prueba con otras palabras o elige un tema:',
            chips: (utiles.length ? utiles.map((a) => a.id) : ['flujo', 'estados', 'roles', 'ayuda']).slice(0, 3),
          }
        }
      }
      setEscribiendo(false)
      agregar(respuesta)
    }, retraso)
    temporizadores.current.push(t)
  }

  function pulsarChip(chip) {
    const esSiguiente = chip.startsWith('sig:')
    const id = esSiguiente ? chip.slice(4) : chip
    const intencion = POR_ID[id]
    if (intencion) preguntar(esSiguiente ? `Siguiente paso: ${intencion.titulo}` : intencion.titulo, id)
  }

  function irA(to) {
    navigate(to)
    if (window.innerWidth < 640) setAbierto(false)
  }

  function etiquetaChip(chip) {
    const esSiguiente = chip.startsWith('sig:')
    const intencion = POR_ID[esSiguiente ? chip.slice(4) : chip]
    if (!intencion) return null
    return esSiguiente ? `Siguiente paso → ${intencion.titulo}` : intencion.titulo
  }

  if (!token || RUTAS_OCULTAS.includes(ruta)) return null

  return (
    <div className="asis-root">
      {abierto && (
        <section className="asis-panel" role="dialog" aria-label="Asistente de BioLink">
          <header className="asis-head">
            <span className="asis-avatar" aria-hidden="true">
              <svg viewBox="0 0 64 64" width="22" height="22">
                <circle cx="8" cy="32" r="5" fill="#8fe3d6" />
                <path d="M8 32 H22 C26 32 26 16 32 16 C38 16 38 32 42 32 H56" fill="none" stroke="#8fe3d6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="56" cy="32" r="5" fill="#f0895a" />
              </svg>
            </span>
            <div className="asis-head-text">
              <strong>Asistente BioLink</strong>
            </div>
            <button type="button" className="asis-icon-btn" onClick={() => setMensajes([])} aria-label="Reiniciar conversación" title="Reiniciar">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
              </svg>
            </button>
            <button type="button" className="asis-icon-btn" onClick={() => setAbierto(false)} aria-label="Cerrar asistente">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div className="asis-body" aria-live="polite">
            {mensajes.map((m) =>
              m.de === 'user' ? (
                <div key={m.id} className="asis-msg user">
                  <p>{m.texto}</p>
                </div>
              ) : (
                <div key={m.id} className="asis-msg bot">
                  {m.titulo && <strong className="asis-titulo">{m.titulo}</strong>}
                  {m.texto && <p>{m.texto}</p>}
                  {m.pasos && (
                    <ol className="asis-pasos">
                      {m.pasos.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ol>
                  )}
                  {m.acciones?.length > 0 && (
                    <div className="asis-acciones">
                      {m.acciones.map((a) => (
                        <button key={a.to + a.label} type="button" className="asis-accion" onClick={() => irA(a.to)}>
                          {a.label} →
                        </button>
                      ))}
                    </div>
                  )}
                  {m.chips?.length > 0 && (
                    <div className="asis-chips">
                      {m.chips.map((c) => {
                        const et = etiquetaChip(c)
                        return et ? (
                          <button key={c} type="button" className="asis-chip" onClick={() => pulsarChip(c)}>
                            {et}
                          </button>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              )
            )}
            {escribiendo && (
              <div className="asis-msg bot asis-typing" aria-label="El asistente está escribiendo">
                <span /><span /><span />
              </div>
            )}
            <div ref={finRef} />
          </div>

          <div className="asis-contexto" aria-label="Sugerencias para esta pantalla">
            {sugerenciasContexto
              .filter((i) => puedeRealizar(i, rol) || i.verTo)
              .map((i) => (
                <button key={i.id} type="button" className="asis-chip pequeño" onClick={() => preguntar(i.titulo, i.id)}>
                  {i.titulo}
                </button>
              ))}
          </div>

          <form
            className="asis-form"
            onSubmit={(e) => {
              e.preventDefault()
              preguntar(texto)
            }}
          >
            <label htmlFor="asis-input" className="asis-sr">Escribe tu pregunta</label>
            <input
              id="asis-input"
              ref={inputRef}
              type="text"
              autoComplete="off"
              maxLength={200}
              placeholder="Escribe tu duda…"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            <button type="submit" disabled={!texto.trim() || escribiendo} aria-label="Enviar">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className={`asis-launcher${abierto ? ' abierto' : ''}`}
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? 'Cerrar asistente' : 'Abrir asistente de ayuda'}
        aria-expanded={abierto}
      >
        {abierto ? (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5z" />
            <path d="M8.5 10h7" />
          </svg>
        )}
      </button>
    </div>
  )
}
