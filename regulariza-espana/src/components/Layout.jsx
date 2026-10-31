import { NavLink, Link, Outlet } from 'react-router-dom'
import { BarChart3, FileCheck2, BookOpen, MessageSquare, Search, Coffee, LogOut, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { KOFI_URL } from '../lib/constants'
import { supabaseConfigurado } from '../lib/supabase'
import CartoonAvatar from './CartoonAvatar'

const NAV = [
  { to: '/', label: 'Datos', icon: BarChart3, end: true },
  { to: '/mi-tramite', label: 'Mi trámite', icon: FileCheck2 },
  { to: '/requisitos', label: 'Requisitos', icon: BookOpen },
  { to: '/foro', label: 'Foro', icon: MessageSquare },
  { to: '/expediente', label: 'Expediente', icon: Search },
]

export default function Layout() {
  const { perfil, user, salir } = useAuth()

  return (
    <div className="min-h-dvh flex flex-col pb-20 md:pb-0">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link to="/" className="font-extrabold text-slate-900 text-base">
            Regulariza<span className="text-blue-700">España</span>
          </Link>
          <nav className="hidden md:flex gap-1" aria-label="Principal">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}
                className={({ isActive }) => `px-3 py-1.5 rounded-lg text-sm font-semibold ${isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          {user ? (
            <div className="flex items-center gap-2">
              {perfil && <CartoonAvatar type={perfil.avatar} size="xs" />}
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline">{perfil?.alias}</span>
              <button onClick={salir} className="p-2 rounded-lg hover:bg-slate-100" aria-label="Cerrar sesión">
                <LogOut className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          ) : (
            <Link to="/entrar" className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700">
              <UserRound className="w-4 h-4" /> Entrar
            </Link>
          )}
        </div>
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
            <Link to="/privacidad" className="underline">Privacidad</Link>
            <Link to="/expediente" className="underline">Enlaces oficiales</Link>
          </p>
        </div>
      </footer>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30" aria-label="Principal móvil">
        <ul className="grid grid-cols-5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end}
                className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
