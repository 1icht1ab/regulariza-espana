// Espejo en el cliente de public.re_contains_pii() (la base de datos vuelve a comprobarlo).
// Devuelve el tipo de dato detectado o null.
const REGLAS = [
  { tipo: 'un número de NIE', re: /\b[xyz][\s.-]?\d{7}[\s.-]?[a-z]\b/i },
  { tipo: 'un número de DNI', re: /\b\d{8}[\s.-]?[a-z]\b/i },
  { tipo: 'un número de la Seguridad Social (NUSS)', re: /\b\d{2}[\s/.-]?\d{8}[\s/.-]?\d{2}\b/ },
  { tipo: 'un número de pasaporte', re: /\b[a-z]{1,3}\d{6,9}\b/i },
  { tipo: 'un email', re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i },
]

export function detectarDatoPersonal(texto = '') {
  for (const r of REGLAS) if (r.re.test(texto)) return r.tipo
  const largas = texto.match(/\+?\d[\d\s.-]{7,}\d/g) || []
  if (largas.some((m) => m.replace(/\D/g, '').length >= 9)) return 'un teléfono o un número largo'
  return null
}

export function mensajeError(error) {
  const msg = error?.message || ''
  if (msg.includes('re_contains_pii') || msg.includes('check constraint')) {
    return 'El texto parece contener un dato personal (NIE, NUSS, DNI, pasaporte, teléfono o email). Quítalo y vuelve a intentarlo.'
  }
  if (msg.includes('duplicate key') && msg.includes('alias')) return 'Ese alias ya está en uso.'
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.'
  if (msg.includes('Email not confirmed')) return 'Todavía no has confirmado tu email. Revisa tu bandeja de entrada.'
  return msg || 'Algo ha fallado. Vuelve a intentarlo.'
}
