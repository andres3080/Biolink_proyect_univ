// Base de conocimiento del asistente guiado de BioLink (sin IA externa).
// Cada "intención" tiene palabras clave (sin tildes), una respuesta y, opcionalmente,
// pasos, botones de acción y un "siguiente paso" para guiar el flujo de trabajo.
//
//   roles:     quién puede REALIZAR la acción (si falta, todos).
//   verTo:     pantalla de solo consulta para quien no puede realizarla.
//   dinamico:  consulta datos en vivo al backend (solo conteos y estados).
//
// Para agregar una respuesta nueva basta con añadir un objeto a INTENCIONES.

export const NOMBRE_ROL = {
  ADMIN: 'administrador',
  BIOANALISTA: 'bioanalista',
  RECEPCIONISTA: 'recepcionista',
}

export const INTENCIONES = [
  {
    id: 'saludo',
    keywords: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'saludos'],
    titulo: '¡Hola!',
    texto: 'Soy el asistente de BioLink. Te guío por el sistema paso a paso. Elige una opción o escríbeme tu duda.',
    oculta: true,
  },
  {
    id: 'gracias',
    keywords: ['gracias', 'muchas gracias', 'listo', 'perfecto', 'genial', 'excelente', 'vale', 'ok'],
    titulo: '¡Con gusto!',
    texto: 'Aquí estoy si necesitas algo más.',
    oculta: true,
  },
  {
    id: 'ayuda',
    keywords: ['ayuda', 'ayudame', 'que puedes hacer', 'que sabes', 'opciones', 'menu', 'como funcionas', 'quien eres'],
    titulo: 'Esto puedo hacer por ti',
    texto:
      'Te explico cómo registrar pacientes, órdenes, muestras y resultados, qué significa cada estado, cómo ver los equipos conectados y qué puede hacer cada rol. También consulto cifras del sistema en vivo (solo totales, nunca datos de pacientes).',
    sugerencias: ['flujo', 'estados', 'roles', 'stats'],
    oculta: true,
  },
  {
    id: 'queEs',
    keywords: ['que es biolink', 'para que sirve', 'biolink', 'que hace el sistema', 'de que trata'],
    titulo: '¿Qué es BioLink?',
    texto:
      'BioLink es un mini sistema de información de laboratorio (LIS). Registra pacientes, órdenes médicas, muestras y resultados, valida automáticamente cada resultado contra su rango de referencia y se comunica con los equipos biomédicos por HL7.',
    sugerencias: ['flujo', 'hl7'],
  },
  {
    id: 'flujo',
    keywords: ['flujo', 'paso a paso', 'proceso', 'por donde empiezo', 'como empiezo', 'como se usa', 'guiame', 'tutorial', 'empezar', 'inicio'],
    titulo: 'El recorrido completo, paso a paso',
    texto: 'Así se trabaja una muestra de principio a fin:',
    pasos: [
      'Registrar al paciente (recepción).',
      'Crear la orden médica con los exámenes que debe hacerse.',
      'Registrar la muestra asociada a la orden y a un examen.',
      'Cargar el resultado: el sistema lo valida solo contra el rango de referencia.',
      'Si queda fuera de rango, se marca "Pendiente de revisión" para que alguien lo revise.',
    ],
    acciones: [{ label: 'Empezar: registrar paciente', to: '/pacientes/nuevo', roles: ['ADMIN', 'RECEPCIONISTA'] }],
    siguiente: 'pacienteNuevo',
  },
  {
    id: 'pacienteNuevo',
    roles: ['ADMIN', 'RECEPCIONISTA'],
    verTo: '/pacientes',
    keywords: ['crear paciente', 'registrar paciente', 'nuevo paciente', 'agregar paciente', 'alta paciente', 'inscribir paciente'],
    titulo: 'Registrar un paciente',
    texto: 'Paso 1 del recorrido. Lo hace recepción o el administrador.',
    pasos: [
      'Entra a "Registrar paciente".',
      'Completa nombre, documento, fecha de nacimiento, sexo y teléfono.',
      'Guarda: verás una animación de confirmación.',
    ],
    acciones: [{ label: 'Ir a Registrar paciente', to: '/pacientes/nuevo' }],
    siguiente: 'ordenNueva',
  },
  {
    id: 'pacienteVer',
    keywords: ['ver pacientes', 'buscar paciente', 'lista pacientes', 'listado pacientes', 'encontrar paciente', 'pacientes registrados', 'pacientes'],
    titulo: 'Ver y buscar pacientes',
    texto: 'En el listado puedes buscar por nombre o documento y abrir la ficha de cada paciente.',
    acciones: [{ label: 'Ir a Pacientes', to: '/pacientes' }],
  },
  {
    id: 'ordenNueva',
    roles: ['ADMIN', 'RECEPCIONISTA'],
    verTo: '/ordenes',
    keywords: ['crear orden', 'nueva orden', 'registrar orden', 'orden medica', 'solicitar examenes', 'pedir examen', 'agregar orden'],
    titulo: 'Crear una orden médica',
    texto: 'Paso 2. La paciente o el paciente ya debe estar registrado.',
    pasos: [
      'Entra a "Crear orden médica".',
      'Elige el paciente y escribe el médico solicitante.',
      'Marca los exámenes que debe realizarse y guarda.',
    ],
    acciones: [{ label: 'Ir a Crear orden', to: '/ordenes/nueva' }],
    siguiente: 'muestraNueva',
  },
  {
    id: 'ordenVer',
    keywords: ['ver ordenes', 'lista ordenes', 'listado ordenes', 'ordenes creadas', 'ordenes'],
    titulo: 'Ver órdenes médicas',
    texto: 'Allí ves todas las órdenes con su estado: Pendiente, En proceso o Completada.',
    acciones: [{ label: 'Ir a Órdenes', to: '/ordenes' }],
    sugerencias: ['estados'],
  },
  {
    id: 'muestraNueva',
    roles: ['ADMIN', 'BIOANALISTA', 'RECEPCIONISTA'],
    verTo: '/muestras',
    keywords: ['crear muestra', 'registrar muestra', 'nueva muestra', 'tomar muestra', 'toma de muestra', 'agregar muestra'],
    titulo: 'Registrar una muestra',
    texto: 'Paso 3. Necesitas que la orden ya exista.',
    pasos: [
      'Entra a "Registrar muestra".',
      'Elige la orden médica y luego el examen de esa orden.',
      'Indica el tipo de muestra y la fecha y hora de toma.',
      'Escribe el código de la muestra y guarda.',
    ],
    acciones: [{ label: 'Ir a Registrar muestra', to: '/muestras/nueva' }],
    siguiente: 'resultadoNuevo',
    sugerencias: ['codigo'],
  },
  {
    id: 'codigo',
    keywords: ['codigo de la muestra', 'codigo de barras', 'codigo muestra', 'etiqueta', 'barcode', 'que codigo pongo', 'codigo tubo'],
    titulo: 'El código de la muestra',
    texto:
      'Es el identificador único de la muestra. Úsalo igual que en la etiqueta del tubo para que, cuando el equipo envíe el resultado por HL7, el sistema lo reconozca y lo asocie a la muestra correcta. No se puede repetir.',
    sugerencias: ['muestraNueva', 'hl7'],
  },
  {
    id: 'muestraVer',
    keywords: ['ver muestras', 'lista muestras', 'listado muestras', 'muestras registradas', 'muestras'],
    titulo: 'Ver muestras',
    texto: 'El listado muestra cada muestra con su código, examen, tipo y estado (Pendiente, Tomada o Procesada).',
    acciones: [{ label: 'Ir a Muestras', to: '/muestras' }],
    sugerencias: ['estados'],
  },
  {
    id: 'resultadoNuevo',
    roles: ['ADMIN', 'BIOANALISTA'],
    verTo: '/resultados',
    keywords: ['cargar resultado', 'crear resultado', 'registrar resultado', 'nuevo resultado', 'subir resultado', 'digitar resultado', 'ingresar valor', 'valor obtenido'],
    titulo: 'Cargar un resultado',
    texto: 'Paso 4. Lo hace el bioanalista (o el administrador).',
    pasos: [
      'Entra a "Cargar resultado".',
      'Elige la muestra y escribe el valor obtenido.',
      'Indica fecha y hora, y observaciones si hace falta.',
      'Al guardar, BioLink lo compara con el rango de referencia del examen y le asigna el estado.',
    ],
    acciones: [{ label: 'Ir a Cargar resultado', to: '/resultados/nuevo' }],
    sugerencias: ['revision'],
  },
  {
    id: 'resultadoVer',
    keywords: ['ver resultados', 'lista resultados', 'listado resultados', 'resultados cargados', 'resultados'],
    titulo: 'Ver resultados',
    texto: 'Allí ves cada resultado con su valor y su estado: Validado o Pendiente de revisión.',
    acciones: [{ label: 'Ir a Resultados', to: '/resultados' }],
    sugerencias: ['revision', 'revisionDin'],
  },
  {
    id: 'revision',
    keywords: ['pendiente de revision', 'por que revision', 'fuera de rango', 'rango de referencia', 'validacion automatica', 'validado', 'resultado alterado', 'resultado anormal', 'rango'],
    titulo: 'Validado o Pendiente de revisión',
    texto:
      'Cuando cargas un resultado, BioLink lo compara con el rango de referencia (mínimo y máximo) del examen. Si está dentro, queda "Validado". Si está fuera, queda "Pendiente de revisión" para que una persona lo revise. El sistema no emite diagnósticos: solo señala cuáles resultados merecen atención.',
    sugerencias: ['revisionDin', 'examenes'],
  },
  {
    id: 'estados',
    keywords: ['estados', 'estado', 'significado de los estados', 'que significan los estados', 'pendiente', 'en proceso', 'completada', 'procesada', 'tomada'],
    titulo: 'Qué significa cada estado',
    texto: 'Cada elemento tiene su propio ciclo:',
    pasos: [
      'Orden: Pendiente → En proceso → Completada.',
      'Muestra: Pendiente → Tomada → Procesada.',
      'Resultado: Validado (dentro del rango) o Pendiente de revisión (fuera del rango).',
    ],
  },
  {
    id: 'equipos',
    roles: ['ADMIN', 'BIOANALISTA'],
    keywords: ['equipos', 'equipo biomedico', 'analizador', 'conexion equipo', 'monitor de equipos', 'estado de equipos', 'ver equipos'],
    titulo: 'Equipos biomédicos',
    texto: 'En esa pantalla ves qué equipos están conectados, su última actividad y los mensajes HL7 recientes de cada uno.',
    acciones: [{ label: 'Ir a Equipos', to: '/equipos' }],
    sugerencias: ['equiposDin', 'hl7'],
  },
  {
    id: 'equiposDin',
    roles: ['ADMIN', 'BIOANALISTA'],
    dinamico: 'equipos',
    keywords: ['cuantos equipos', 'equipos conectados', 'hay equipos conectados', 'equipos desconectados', 'estan conectados', 'conectados', 'desconectado'],
    titulo: 'Equipos ahora mismo',
    texto: '',
    acciones: [{ label: 'Ver equipos', to: '/equipos' }],
  },
  {
    id: 'hl7',
    keywords: ['hl7', 'que es hl7', 'comunicacion equipo', 'mllp', 'oru', 'orm', 'protocolo'],
    titulo: '¿Qué es HL7?',
    texto:
      'HL7 es el estándar de mensajes que usan los equipos de laboratorio y los sistemas clínicos para hablar entre sí. BioLink recibe los resultados que envía el equipo (mensaje ORU) y puede enviarle las órdenes (mensaje ORM), así no hay que digitar los valores a mano.',
    sugerencias: ['equipos', 'codigo'],
  },
  {
    id: 'examenes',
    roles: ['ADMIN'],
    keywords: ['catalogo de examenes', 'crear examen', 'nuevo examen', 'editar examen', 'corregir examen', 'rangos del examen', 'examenes'],
    titulo: 'Catálogo de exámenes',
    texto: 'El administrador puede ver, crear y corregir los exámenes, incluido su rango de referencia (el que usa la validación automática).',
    acciones: [{ label: 'Ir al Catálogo', to: '/examenes' }],
    sugerencias: ['revision'],
  },
  {
    id: 'usuarioNuevo',
    roles: ['ADMIN'],
    keywords: ['crear usuario', 'nuevo usuario', 'registrar usuario', 'agregar usuario', 'dar acceso', 'nueva cuenta', 'agregar empleado'],
    titulo: 'Crear un usuario',
    texto: 'Solo el administrador crea cuentas.',
    pasos: [
      'Entra a "Crear usuario" (arriba a la derecha del panel).',
      'Escribe el usuario, una contraseña y elige el rol.',
      'Guarda. La persona ya puede iniciar sesión.',
    ],
    acciones: [{ label: 'Ir a Crear usuario', to: '/usuarios/nuevo' }],
    sugerencias: ['roles'],
  },
  {
    id: 'passwordReset',
    roles: ['ADMIN'],
    keywords: ['restablecer contrasena', 'cambiar contrasena', 'resetear contrasena', 'olvide mi contrasena', 'olvidaron la contrasena', 'recuperar clave', 'contrasena'],
    titulo: 'Restablecer una contraseña',
    texto:
      'El administrador puede asignar una contraseña nueva a cualquier cuenta desde la lista "Usuarios registrados", en la misma pantalla de Crear usuario. Si no eres administrador, pídele que lo haga.',
    acciones: [{ label: 'Ir a Usuarios', to: '/usuarios/nuevo' }],
  },
  {
    id: 'roles',
    keywords: ['rol', 'roles', 'que puedo hacer', 'permisos', 'que puede hacer', 'mi rol', 'no tengo permiso', 'por que no puedo', 'acceso'],
    titulo: 'Qué puede hacer cada rol',
    texto: 'Los permisos dependen del rol de tu cuenta:',
    pasos: [
      'Recepcionista: registra pacientes y órdenes, y registra muestras.',
      'Bioanalista: registra muestras, carga resultados y ve los equipos.',
      'Administrador: todo lo anterior, más catálogo de exámenes, usuarios y facturación.',
      'Todos pueden consultar pacientes, órdenes, muestras y resultados.',
    ],
    dinamico: 'rol',
  },
  {
    id: 'sesion',
    keywords: ['sesion', 'cerrar sesion', 'me saco', 'inactividad', 'se cerro', 'salir', 'logout', 'por que me desconecta'],
    titulo: 'Sesión e inactividad',
    texto:
      'Por seguridad, la sesión se cierra sola tras 15 minutos sin actividad, algo importante en software clínico. Solo tienes que iniciar sesión de nuevo. Para salir tú mismo, usa "Cerrar sesión" en el panel principal.',
  },
  {
    id: 'planes',
    roles: ['ADMIN'],
    keywords: ['plan', 'planes', 'facturacion', 'pagar', 'pago', 'suscripcion', 'precio', 'cuanto cuesta', 'licencia', 'factura'],
    titulo: 'Plan y facturación',
    texto: 'El administrador ve su plan actual, el uso (usuarios y equipos) y el historial de pagos. Los pagos de esta demostración son de prueba.',
    acciones: [
      { label: 'Ir a Plan y facturación', to: '/facturacion' },
      { label: 'Cambiar de plan', to: '/checkout' },
    ],
  },
  {
    id: 'stats',
    dinamico: 'stats',
    keywords: ['cuantos pacientes', 'cuantas muestras', 'cuantos resultados', 'cuantas ordenes', 'estadisticas', 'resumen', 'cifras', 'totales', 'cuantos hay', 'numeros'],
    titulo: 'Resumen del sistema',
    texto: '',
    sugerencias: ['revisionDin'],
  },
  {
    id: 'revisionDin',
    dinamico: 'revision',
    keywords: ['cuantos resultados pendientes', 'resultados pendientes', 'hay resultados por revisar', 'por revisar', 'que debo revisar', 'alertas'],
    titulo: 'Resultados por revisar',
    texto: '',
    acciones: [{ label: 'Ver resultados', to: '/resultados' }],
  },
]

export const POR_ID = Object.fromEntries(INTENCIONES.map((i) => [i.id, i]))

// Sugerencias según la pantalla en la que está el usuario.
export const SUGERENCIAS_POR_RUTA = {
  '/': ['flujo', 'stats', 'roles', 'revisionDin'],
  '/pacientes': ['pacienteNuevo', 'ordenNueva', 'flujo'],
  '/pacientes/nuevo': ['pacienteNuevo', 'ordenNueva'],
  '/ordenes': ['ordenNueva', 'estados', 'muestraNueva'],
  '/ordenes/nueva': ['ordenNueva', 'muestraNueva'],
  '/muestras': ['muestraNueva', 'estados', 'codigo'],
  '/muestras/nueva': ['muestraNueva', 'codigo', 'resultadoNuevo'],
  '/resultados': ['revision', 'revisionDin', 'resultadoNuevo'],
  '/resultados/nuevo': ['resultadoNuevo', 'revision'],
  '/equipos': ['equiposDin', 'hl7', 'codigo'],
  '/examenes': ['examenes', 'revision'],
  '/usuarios/nuevo': ['usuarioNuevo', 'passwordReset', 'roles'],
  '/facturacion': ['planes', 'roles'],
  '/checkout': ['planes'],
}
