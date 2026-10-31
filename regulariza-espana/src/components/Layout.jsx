import { useEffect, useState } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, FileCheck2, BookOpen, MessageSquare, Search, Coffee, LogOut, UserRound, Menu, X, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { KOFI_URL } from '../lib/constants'
import { supabaseConfigurado } from '../lib/supabase'
import CartoonAvatar from './CartoonAvatar'

const NAV = [
  { to: '/', label: 'Datos de la comunidad', short: 'Datos', icon: BarChart3, end: true },
  { to: '/mi-tramite', label: 'Mi trámite', short: 'Mi trámite', icon: FileCheck2 },
  { to: '/requisitos', label: 'Requisitos', short: 'Requisitos', icon: BookOpen },
  { to: '/foro', label: 'Foro', short: 'Foro', icon: MessageSquare },
  { to: '/expediente', label: 'Consultar mi expediente', short: 'Expediente', icon: Search },
]

export default function Layout() {
  const { perfil, user, salir } = useAuth()
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
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link to="/" className="font-extrabold text-slate-900 text-base py-2">
            Regulariza<span className="text-blue-700">España</span>
          </Link>

          <nav className="hidden md:flex gap-1" aria-label="Principal">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}
                className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-semibold ${isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                {n.short}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            {user ? (
              <>
                {perfil && <CartoonAvatar type={perfil.avatar} size="xs" />}
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline ml-1">{perfil?.alias}</span>
                <button onClick={salir} className="hidden md:inline-flex p-2.5 rounded-lg hover:bg-slate-100" aria-label="Cerrar sesión">
                  <LogOut className="w-4 h-4 text-slate-600" />
                </button>
              </>
            ) : (
              <Link to="/entrar" className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-blue-700 hover:bg-blue-50">
                <UserRound className="w-4 h-4" /> Entrar
              </Link>
            )}
            <button
              type="button"
              onClick={() => setAbierto((v) => !v)}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-800 hover:bg-slate-100"
              aria-expanded={abierto}
              aria-controls="menu-movil"
              aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            >
              {abierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {abierto && (
          <>
            <div className="md:hidden fixed inset-0 top-14 bg-slate-900/30" onClick={() => setAbierto(false)} aria-hidden="true" />
            <nav id="menu-movil" aria-label="Menú" className="md:hidden absolute inset-x-0 top-14 bg-white border-b border-slate-200 max-h-[calc(100dvh-3.5rem)] overflow-y-auto">
              <ul className="max-w-3xl mx-auto px-2 py-2">
                {NAV.map(({ to, label, icon: Icon, end }) => (
                  <li key={to}>
                    <NavLink to={to} end={end}
                      className={({ isActive }) => `flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-semibold ${isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-800 hover:bg-slate-50'}`}>
                      <Icon className="w-5 h-5" aria-hidden="true" /> {label}
                    </NavLink>
                  </li>
                ))}
                <li className="border-t border-slate-200 mt-2 pt-2">
                  <NavLink to="/privacidad" className="flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50">
                    <ShieldCheck className="w-5 h-5" aria-hidden="true" /> Privacidad
                  </NavLink>
                </li>
                <li>
                  {user ? (
                    <button onClick={() => { setAbierto(false); salir() }} className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-semibold text-rose-700 hover:bg-rose-50">
                      <LogOut className="w-5 h-5" aria-hidden="true" /> Cerrar sesión{perfil ? ` (${perfil.alias})` : ''}
                    </button>
                  ) : (
                    <NavLink to="/entrar" className="flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-bold text-blue-700 hover:bg-blue-50">
                      <UserRound className="w-5 h-5" aria-hidden="true" /> Entrar o crear cuenta
                    </NavLink>
                  )}
                </li>
              </ul>
            </nav>
          </>
        )}
      </header>

      {!supabaseConfigurado && (
        <div className="bg-amber-100 text-amber-900 text-xs text-center px-4 py-2">
          Falta configurar Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
        </div>
      )}

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-5">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-5 text-xs text-slate-600 space-y-3">
          <a href={KOFI_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold">
            <Coffee className="w-4 h-4" /> Invitar un cafecito en Ko-fi
          </a>
          <p>
            RegularizaEspaña es una comunidad independiente. No es una web oficial ni ofrece asesoramiento jurídico.
            Para tu caso concreto, consulta con un abogado o una entidad de apoyo.
          </p>
          <p className="flex gap-4">
            <Link to="/privacidad" className="underline py-1">Privacidad</Link>
            <Link to="/expediente" className="underline py-1">Enlaces oficiales</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
