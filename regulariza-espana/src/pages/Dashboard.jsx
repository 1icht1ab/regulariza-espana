import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, ShieldCheck, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { PROVINCIAS } from '../lib/constants'
import { Card, PageHeader, StatusBadge, Aviso, inputCls, btnPrimary, tiempoRelativo } from '../components/ui'
import CartoonAvatar from '../components/CartoonAvatar'

function Stat({ label, value, sub }) {
  return (
    <Card>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </Card>
  )
}

function Barra({ label, pct, color }) {
  return (
    <div>
      <div className="flex justify-between text-sm"><span className="text-slate-700">{label}</span><span className="font-bold">{pct}%</span></div>
      <div className="h-2 bg-slate-100 rounded-full mt-1"><div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

export default function Dashboard() {
  const [provincia, setProvincia] = useState('')
  const [stats, setStats] = useState(null)
  const [provincias, setProvincias] = useState([])
  const [recientes, setRecientes] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) return
    supabase.rpc('re_stats', { p_provincia: provincia || null }).then(({ data, error }) => {
      if (error) setError('No se pudieron cargar las estadísticas. Inténtalo más tarde.')
      else setStats(data)
    })
  }, [provincia])

  useEffect(() => {
    if (!supabase) return
    supabase.rpc('re_stats_provincias').then(({ data }) => setProvincias(data || []))
    supabase.rpc('re_casos_recientes', { p_limit: 8 }).then(({ data }) => setRecientes(data || []))
  }, [])

  return (
    <>
      <PageHeader kicker="Datos de la comunidad" title="¿Cómo avanzan los expedientes?">
        Estadísticas calculadas solo con los casos que la comunidad registra en “Mi trámite”. No son datos oficiales.
      </PageHeader>

      <Card className="mb-4">
        <label htmlFor="prov" className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
          <Filter className="w-4 h-4" aria-hidden="true" /> Filtrar por provincia
        </label>
        <select id="prov" className={inputCls} value={provincia} onChange={(e) => setProvincia(e.target.value)}>
          <option value="">Todas las provincias</option>
          {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </Card>

      {error && <Aviso tipo="error">{error}</Aviso>}

      {stats && !stats.suficiente && (
        <Card className="mb-4">
          <div className="flex gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-700 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold text-slate-900">Aún no hay datos suficientes{provincia ? ` en ${provincia}` : ''}</p>
              <p className="text-sm text-slate-600 mt-1">
                Hay {stats.total} {stats.total === 1 ? 'caso registrado' : 'casos registrados'}. Mostramos estadísticas a partir de {stats.minimo} casos
                para que nadie pueda ser identificado.
              </p>
              <Link to="/mi-tramite" className={`${btnPrimary} mt-3`}>Registrar mi caso</Link>
            </div>
          </div>
        </Card>
      )}

      {stats?.suficiente && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Stat label="Casos" value={stats.total} sub={provincia || 'Toda España'} />
            <Stat label="Favorables" value={`${stats.favorable}%`} sub={`${stats.espera}% en espera`} />
            <Stat label="Con requerimiento" value={`${stats.requerimiento}%`} />
            <Stat label="Espera media" value={stats.espera_media_dias != null ? `${stats.espera_media_dias} d` : '—'}
              sub={`De entrega a resolución · ${stats.resueltos} resueltos`} />
          </div>
          <Card className="mb-4 space-y-3">
            <h2 className="font-bold text-slate-900">Hitos alcanzados</h2>
            <Barra label="Empadronamiento" pct={stats.padron} color="bg-blue-600" />
            <Barra label="NIE recibido" pct={stats.nie} color="bg-emerald-600" />
            <Barra label="Nº Seguridad Social recibido" pct={stats.nss} color="bg-violet-600" />
            <Barra label="Presentado con abogado/gestor" pct={stats.abogado} color="bg-slate-500" />
          </Card>
          <Card className="mb-4 space-y-3">
            <h2 className="font-bold text-slate-900">Impreso presentado</h2>
            <Barra label="EX-32" pct={stats.ex32} color="bg-blue-600" />
            <Barra label="EX-31" pct={stats.ex31} color="bg-blue-400" />
            <Barra label="EX-25" pct={stats.ex25} color="bg-blue-300" />
          </Card>
        </>
      )}

      {provincias.length > 0 && (
        <Card className="mb-4">
          <h2 className="font-bold text-slate-900 mb-3">Por provincia (mín. 10 casos)</h2>
          <ul className="divide-y divide-slate-100">
            {provincias.map((p) => (
              <li key={p.provincia} className="py-2 flex justify-between text-sm">
                <span className="font-semibold">{p.provincia}</span>
                <span className="text-slate-600">{p.casos} casos · {p.favorable}% fav. · {p.espera_media_dias ?? '—'} d</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="flex items-center gap-2 font-bold text-slate-900 mb-3"><Users className="w-4 h-4" aria-hidden="true" /> Actividad reciente</h2>
        {recientes.length === 0 ? (
          <p className="text-sm text-slate-600">Todavía nadie ha registrado su caso. <Link to="/mi-tramite" className="text-blue-700 font-semibold underline">Sé la primera persona</Link>.</p>
        ) : (
          <ul className="space-y-3">
            {recientes.map((c) => (
              <li key={c.alias} className="flex gap-3 items-start">
                <CartoonAvatar type={c.avatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm">{c.alias}</span>
                    <StatusBadge estado={c.estado} />
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {c.provincia} · {c.formulario} · {c.nacionalidad} · entregado {c.mes_entrega}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {[c.empadronamiento && 'Padrón ✓', c.nie_recibido && 'NIE ✓', c.nss_recibido && 'NUSS ✓'].filter(Boolean).join(' · ') || 'Sin hitos aún'}
                    {' · '}{tiempoRelativo(c.updated_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
