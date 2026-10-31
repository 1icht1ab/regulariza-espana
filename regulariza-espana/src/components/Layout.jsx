import { useEffect, useState } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, FileCheck2, BookOpen, MessageSquare, Search, Coffee, LogOut, UserRound, Menu, X, ShieldCheck, Moon, Sun, Globe } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useI18n, IDIOMAS } from '../i18n'
import { KOFI_URL } from '../lib/constants'
import { supabaseConfigurado } from '../lib/supabase'
import CartoonAvatar from './CartoonAvatar'

const NAV = [
  { to: '/', k: 'datos', largo: 'datosLargo', icon: BarChart3, end: true },
  { to: '/mi-tramite', k: 'tramite', largo: 'tramite', icon: FileCheck2 },
  { to: '/requisitos', k: 'requisitos', largo: 'requisitos', icon: BookOpen },
  { to: '/foro', k: 'foro', largo: 'foro', icon: MessageSquare },
  { to: '/expediente', k: 'expediente', largo: 'expedienteLargo', icon: Search },
]

function SelectorIdioma({ className = '' }) {
  const { lang, setLang, t } = useI18n()
  return (
    <label className={`relative items-center ${className}`}>
      <span className="sr-only">{t('nav.idioma')}</span>
      <Globe className="w-4 h-4 text-slate-600 absolute start-2.5 pointer-events-none" aria-hidden="true" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="appearance-none ps-8 pe-3 h-11 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
      >
        {IDIOMAS.map((i) => <option key={i.code} value={i.code} lang={i.code}>{i.label}</option>)}
      </select>
    </label>
  )
}

function BotonTema({ className = '' }) {
  const { oscuro, alternar } = useTheme()
  const { t } = useI18n()
  const label = oscuro ? t('nav.modoClaro') : t('nav.modoOscuro')
  return (
    <button type="button" onClick={alternar} aria-label={label} title={label}
      className={`items-center justify-center w-11 h-11 rounded-xl text-slate-700 hover:bg-slate-100 ${className}`}>
      {oscuro ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}

export default function Layout() {
  const { perfil, user, salir } = useAuth()
  const { oscuro, alternar } = useTheme()
  const { t } = useI18n()
  const [abierto, setAbierto] = useState(false)
  const { pathname } = useLocation()

  // Cierra el menú al cambiar de página y con la tecla Escape
  useEffect(() => { setAbierto(false) }, [pathname])
  useEffect(() => {
    if (!abierto) return
    const onKey = (e) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [abierto])

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <Link to="/" className="font-extrabold text-slate-900 text-base py-2 shrink-0" dir="ltr">
            Regulariza<span className="text-blue-700">España</span>
          </Link>

          <nav className="hidden lg:flex gap-1" aria-label={t('nav.principal')}>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}
                className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                {t(`nav.${n.k}`)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <SelectorIdioma className="hidden lg:inline-flex" />
            <BotonTema className="hidden lg:inline-flex" />
            {user ? (
              <>
                {perfil && <CartoonAvatar type={perfil.avatar} size="xs" />}
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline ms-1">{perfil?.alias}</span>
                <button onClick={salir} className="hidden lg:inline-flex p-3 rounded-lg hover:bg-slate-100" aria-label={t('nav.salir')}>
                  <LogOut className="w-4 h-4 text-slate-600 rtl:-scale-x-100" />
                </button>
              </>
            ) : (
              <Link to="/entrar" className="hidden lg:inline-flex items-center gap-1.5 px-3 h-11 rounded-lg text-sm font-bold text-blue-700 hover:bg-blue-50 whitespace-nowrap">
                <UserRound className="w-4 h-4" /> {t('nav.entrar')}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setAbierto((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-800 hover:bg-slate-100"
              aria-expanded={abierto}
              aria-controls="menu-movil"
              aria-label={abierto ? t('nav.cerrarMenu') : t('nav.abrirMenu')}
            >
              {abierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {abierto && (
          <>
            <div className="lg:hidden fixed inset-0 top-14 bg-black/40" onClick={() => setAbierto(false)} aria-hidden="true" />
            <nav id="menu-movil" aria-label={t('nav.menu')} className="lg:hidden absolute inset-x-0 top-14 bg-white border-b border-slate-200 max-h-[calc(100dvh-3.5rem)] overflow-y-auto">
              <ul className="max-w-3xl mx-auto px-2 py-2">
                {NAV.map(({ to, largo, icon: Icon, end }) => (
                  <li key={to}>
                    <NavLink to={to} end={end}
                      className={({ isActive }) => `flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-semibold ${isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-800 hover:bg-slate-50'}`}>
                      <Icon className="w-5 h-5" aria-hidden="true" /> {t(`nav.${largo}`)}
                    </NavLink>
                  </li>
                ))}
                <li className="border-t border-slate-200 mt-2 pt-2">
                  <NavLink to="/privacidad" className="flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50">
                    <ShieldCheck className="w-5 h-5" aria-hidden="true" /> {t('nav.privacidad')}
                  </NavLink>
                </li>
                <li>
                  <button type="button" onClick={alternar} className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50">
                    {oscuro ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
                    {oscuro ? t('nav.modoClaro') : t('nav.modoOscuro')}
                  </button>
                </li>
                <li className="px-3 py-2">
                  <SelectorIdioma className="flex w-full [&>select]:w-full" />
                </li>
                <li>
                  {user ? (
                    <button onClick={() => { setAbierto(false); salir() }} className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-semibold text-rose-700 hover:bg-rose-50">
                      <LogOut className="w-5 h-5 rtl:-scale-x-100" aria-hidden="true" /> {t('nav.salir')}{perfil ? ` (${perfil.alias})` : ''}
                    </button>
                  ) : (
                    <NavLink to="/entrar" className="flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-bold text-blue-700 hover:bg-blue-50">
                      <UserRound className="w-5 h-5" aria-hidden="true" /> {t('nav.entrarLargo')}
                    </NavLink>
                  )}
                </li>
              </ul>
            </nav>
          </>
        )}
      </header>

      {!supabaseConfigurado && (
        <div className="bg-amber-100 text-amber-900 text-xs text-center px-4 py-2">{t('comun.falta')}</div>
      )}

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-5">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-5 text-xs text-slate-600 space-y-3">
          <a href={KOFI_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold">
            <Coffee className="w-4 h-4" /> {t('footer.kofi')}
          </a>
          <p>{t('footer.aviso')}</p>
          <p className="flex gap-4">
            <Link to="/privacidad" className="underline py-1">{t('nav.privacidad')}</Link>
            <Link to="/expediente" className="underline py-1">{t('footer.enlaces')}</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
