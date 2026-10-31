export const KOFI_URL = 'https://ko-fi.com/regularizacion2026'

export const SHORT_URL = import.meta.env.VITE_SHORT_URL || ''

// Enlaces oficiales (fuente: hoja informativa de la Delegación del Gobierno en Madrid)
export const ENLACES_OFICIALES = [
  {
    titulo: 'Consultar el estado de mi expediente',
    desc: 'Información sobre el estado de expedientes de extranjería (Sede Electrónica).',
    url: 'https://sede.administracionespublicas.gob.es/infoext2/',
  },
  {
    titulo: 'Aportar documentación o responder un requerimiento',
    desc: 'Plataforma Mercurio en la Sede Electrónica. Necesitas certificado digital.',
    url: 'https://sede.administracionespublicas.gob.es/procedimientos/index/categoria/34',
  },
  {
    titulo: 'Formulario de consultas de la Regularización',
    desc: 'Ministerio de Inclusión, Seguridad Social y Migraciones.',
    url: 'https://www.inclusion.gob.es/formulario-consultas-regularizacion-extraordinaria-2026',
  },
  {
    titulo: 'Comunicar una incidencia o error',
    desc: 'Errores en la tramitación o en la documentación presentada.',
    url: 'https://sede.administracionespublicas.gob.es/ayuda/consulta/ExtranjeriaREG',
  },
]

export const PROVINCIAS = [
  'A Coruña', 'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz',
  'Barcelona', 'Bizkaia', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ceuta',
  'Ciudad Real', 'Córdoba', 'Cuenca', 'Gipuzkoa', 'Girona', 'Granada', 'Guadalajara', 'Huelva',
  'Huesca', 'Islas Baleares', 'Jaén', 'La Rioja', 'Las Palmas', 'León', 'Lleida', 'Lugo',
  'Madrid', 'Málaga', 'Melilla', 'Murcia', 'Navarra', 'Ourense', 'Palencia', 'Pontevedra',
  'Salamanca', 'Santa Cruz de Tenerife', 'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel',
  'Toledo', 'Valencia', 'Valladolid', 'Zamora', 'Zaragoza',
]

export const ESTADOS = ['En espera', 'Requerimiento de documentación', 'Favorable', 'Denegado']

export const FORMULARIOS = [
  { value: 'EX-32', label: 'EX-32 (situación irregular)' },
  { value: 'EX-31', label: 'EX-31 (asilo solicitado antes del 1 ene 2026)' },
  { value: 'EX-25', label: 'EX-25 (menor con progenitor con residencia legal)' },
  { value: 'Otro', label: 'Otro impreso' },
]

export const SITUACIONES = ['Trabajando', 'Con contrato de trabajo', 'Estudiando', 'Buscando empleo']

export const CATEGORIAS_FORO = [
  'Dudas sobre documentos',
  'Experiencias por provincia',
  'Abogados y trámites',
  'Apoyo mutuo',
]

export const MOTIVOS_REPORTE = ['Datos personales', 'Spam o publicidad', 'Información falsa', 'Ofensivo', 'Otro']

export const AVATARES = [
  { id: 'robot', name: 'Robot' },
  { id: 'ninja', name: 'Ninja' },
  { id: 'fox', name: 'Zorrito' },
  { id: 'astronaut', name: 'Astronauta' },
  { id: 'wizard', name: 'Mago' },
]
