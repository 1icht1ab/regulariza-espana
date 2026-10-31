// Espejo en el cliente de public.re_contains_pii() (la base de datos vuelve a comprobarlo).
// Devuelve la clave del tipo de dato detectado (errores.tipos.*) o null.
const REGLAS = [
  { tipo: 'nie', re: /\b[xyz][\s.-]?\d{7}[\s.-]?[a-z]\b/i },
  { tipo: 'dni', re: /\b\d{8}[\s.-]?[a-z]\b/i },
  { tipo: 'nuss', re: /\b\d{2}[\s/.-]?\d{8}[\s/.-]?\d{2}\b/ },
  { tipo: 'pasaporte', re: /\b[a-z]{1,3}\d{6,9}\b/i },
  { tipo: 'email', re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i },
]

// Convierte dígitos arábigo-índicos (٠-٩ / ۰-۹) a latinos para que el filtro no se salte
const normalizar = (t) => t.replace(/[٠-٩۰-۹]/g, (d) => String((d.charCodeAt(0) & 0xf)))

export function detectarDatoPersonal(texto = '') {
  const t = normalizar(texto)
  for (const r of REGLAS) if (r.re.test(t)) return r.tipo
  const largas = t.match(/\+?\d[\d\s.-]{7,}\d/g) || []
  if (largas.some((m) => m.replace(/\D/g, '').length >= 9)) return 'telefono'
  return null
}

// Devuelve la clave de traducción del error, o el mensaje crudo si no se reconoce
export function claveError(error) {
  const msg = error?.message || ''
  if (msg.includes('re_contains_pii') || msg.includes('check constraint')) return 'errores.pii'
  if (msg.includes('duplicate key') && msg.includes('alias')) return 'errores.aliasUsado'
  if (msg.includes('Invalid login credentials')) return 'errores.credenciales'
  if (msg.includes('Email not confirmed')) return 'errores.sinConfirmar'
  return msg ? null : 'errores.generico'
}

export function mensajeError(error, t) {
  const k = claveError(error)
  return k ? t(k) : error.message
}
