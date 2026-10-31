import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import es from './es'
import en from './en'
import fr from './fr'
import ar from './ar'

export const IDIOMAS = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
]

const DICS = { es, en, fr, ar }
const LOCALES = { es: 'es-ES', en: 'en-GB', fr: 'fr-FR', ar: 'ar-MA' }

function idiomaInicial() {
  try {
    const guardado = localStorage.getItem('re-idioma')
    if (guardado && DICS[guardado]) return guardado
  } catch { /* sin almacenamiento */ }
  const nav = (navigator.language || 'es').slice(0, 2)
  return DICS[nav] ? nav : 'es'
}

function buscar(dic, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dic)
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(idiomaInicial)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.title = buscar(DICS[lang], 'meta.title') || document.title
  }, [lang])

  const setLang = (l) => {
    setLangState(l)
    try { localStorage.setItem('re-idioma', l) } catch { /* sin almacenamiento */ }
  }

  // t('foro.title') · t('dash.casos', { n: 3 }) · devuelve arrays/objetos tal cual
  const t = useCallback((key, vars) => {
    let v = buscar(DICS[lang], key)
    if (v === undefined) v = buscar(es, key)
    if (v === undefined) return key
    if (typeof v === 'string' && vars) v = v.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''))
    return v
  }, [lang])

  // Traduce valores que se guardan en español en la base de datos (estado, categoría…)
  const tv = useCallback((grupo, valor) => {
    if (!valor) return valor
    const m = buscar(DICS[lang], `valores.${grupo}`) || {}
    return m[valor] ?? valor
  }, [lang])

  const locale = LOCALES[lang]

  return <I18nContext.Provider value={{ lang, setLang, t, tv, locale, rtl: lang === 'ar' }}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
