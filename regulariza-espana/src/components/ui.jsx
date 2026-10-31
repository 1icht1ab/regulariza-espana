import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'

export function Card({ className = '', children }) {
  return <div className={`bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 ${className}`}>{children}</div>
}

export function PageHeader({ kicker, title, children }) {
  return (
    <header className="mb-5">
      {kicker && <p className="text-xs font-bold uppercase tracking-wide text-blue-700">{kicker}</p>}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 leading-tight">{title}</h1>
      {children && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{children}</p>}
    </header>
  )
}

const ESTILOS = {
  Favorable: ['bg-emerald-50 text-emerald-800 border-emerald-200', CheckCircle2],
  Denegado: ['bg-rose-50 text-rose-800 border-rose-200', XCircle],
  'Requerimiento de documentación': ['bg-amber-50 text-amber-800 border-amber-200', AlertCircle],
  'En espera': ['bg-slate-50 text-slate-700 border-slate-200', Clock],
}

export function StatusBadge({ estado }) {
  if (!estado) return null
  const [cls, Icon] = ESTILOS[estado] || ESTILOS['En espera']
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {estado === 'Requerimiento de documentación' ? 'Requerimiento' : estado}
    </span>
  )
}

export function Aviso({ tipo = 'info', children }) {
  const cls = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    alerta: 'bg-amber-50 border-amber-200 text-amber-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
    ok: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  }[tipo]
  return <div role={tipo === 'error' ? 'alert' : 'status'} className={`border rounded-xl p-3 text-sm leading-relaxed ${cls}`}>{children}</div>
}

export const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-base sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none'

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 disabled:opacity-50'

export const btnSecondary =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50'

export function tiempoRelativo(iso) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'Ahora mismo'
  if (s < 3600) return `Hace ${Math.floor(s / 60)} min`
  if (s < 86400) return `Hace ${Math.floor(s / 3600)} h`
  if (s < 172800) return 'Ayer'
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}
