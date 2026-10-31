import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, ShieldCheck, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { PROVINCIAS } from '../lib/constants'
import { useI18n } from '../i18n'
import { Card, PageHeader, StatusBadge, Aviso, inputCls, btnPrimary, useTiempoRelativo } from '../components/ui'
import CartoonAvatar from '../components/CartoonAvatar'

function Stat({ label, value, sub }) {
  return (
    <Card>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{label}</p>
      <p className="text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </Card>
  )
}

function Barra({ label, pct, color }) {
  return (
    <div>
      <div className="flex justify-between text-sm"><span className="text-slate-700">{label}</span><span className="font-bold" dir="ltr">{pct}%</span></div>
      <div className="h-2 bg-slate-100 rounded-full mt-1"><div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useI18n()
  const hace = useTiempoRelativo()
  const [provincia, setProvincia] = useState('')
  const [stats, setStats] = useState(null)
  const [provincias, setProvincias] = useState([])
  const [recientes, setRecientes] = useState([])
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.rpc('re_stats', { p_provincia: provincia || null }).then(({ data, error }) => {
      if (error) setError(true)
      else { setError(false); setStats(data) }
    })
  }, [provincia])

  useEffect(() => {
    if (!supabase) return
    supabase.rpc('re_stats_provincias').then(({ data }) => setProvincias(data || []))
    supabase.rpc('re_casos_recientes', { p_limit: 8 }).then(({ data }) => setRecientes(data || []))
  }, [])

  return (
    <>
      <PageHeader kicker={t('dash.kicker')} title={t('dash.titulo')}>{t('dash.intro')}</PageHeader>

      <Card className="mb-4">
        <label htmlFor="prov" className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
          <Filter className="w-4 h-4" aria-hidden="true" /> {t('dash.filtrar')}
        </label>
        <select id="prov" className={inputCls} value={provincia} onChange={(e) => setProvincia(e.target.value)}>
          <option value="">{t('dash.todas')}</option>
          {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </Card>

      {error && <div className="mb-4"><Aviso tipo="error">{t('dash.errorCarga')}</Aviso></div>}

      {stats && !stats.suficiente && (
        <Card className="mb-4">
          <div className="flex gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-700 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-bold text-slate-900">{provincia ? t('dash.insuficienteEn', { p: provincia }) : t('dash.insuficiente')}</h2>
              <p className="text-sm text-slate-600 mt-1">
                {stats.total === 1 ? t('dash.casoRegistrado', { m: stats.minimo }) : t('dash.casosRegistrados', { n: stats.total, m: stats.minimo })}
              </p>
              <Link to="/mi-tramite" className={`${btnPrimary} mt-3`}>{t('dash.registrar')}</Link>
            </div>
          </div>
        </Card>
      )}

      {stats?.suficiente && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Stat label={t('dash.casos')} value={stats.total} sub={provincia || t('dash.espana')} />
            <Stat label={t('dash.favorables')} value={`${stats.favorable}%`} sub={t('dash.enEspera', { n: stats.espera })} />
            <Stat label={t('dash.conReq')} value={`${stats.requerimiento}%`} />
            <Stat label={t('dash.esperaMedia')} value={stats.espera_media_dias != null ? t('dash.dias', { n: stats.espera_media_dias }) : '—'}
              sub={t('dash.esperaSub', { n: stats.resueltos })} />
          </div>
          <Card className="mb-4 space-y-3">
            <h2 className="font-bold text-slate-900">{t('dash.hitos')}</h2>
            <Barra label={t('dash.padron')} pct={stats.padron} color="bg-blue-600" />
            <Barra label={t('dash.nie')} pct={stats.nie} color="bg-emerald-600" />
            <Barra label={t('dash.nss')} pct={stats.nss} color="bg-violet-600" />
            <Barra label={t('dash.abogado')} pct={stats.abogado} color="bg-slate-500" />
          </Card>
          <Card className="mb-4 space-y-3">
            <h2 className="font-bold text-slate-900">{t('dash.impreso')}</h2>
            <Barra label="EX-32" pct={stats.ex32} color="bg-blue-600" />
            <Barra label="EX-31" pct={stats.ex31} color="bg-blue-400" />
            <Barra label="EX-25" pct={stats.ex25} color="bg-blue-300" />
          </Card>
        </>
      )}

      {provincias.length > 0 && (
        <Card className="mb-4">
          <h2 className="font-bold text-slate-900 mb-3">{t('dash.porProvincia')}</h2>
          <ul className="divide-y divide-slate-100">
            {provincias.map((p) => (
              <li key={p.provincia} className="py-2 flex justify-between gap-2 text-sm">
                <span className="font-semibold">{p.provincia}</span>
                <span className="text-slate-600">{t('dash.filaProv', { c: p.casos, f: p.favorable, d: p.espera_media_dias ?? '—' })}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="flex items-center gap-2 font-bold text-slate-900 mb-3"><Users className="w-4 h-4" aria-hidden="true" /> {t('dash.actividad')}</h2>
        {recientes.length === 0 ? (
          <p className="text-sm text-slate-600">{t('dash.nadie')} <Link to="/mi-tramite" className="text-blue-700 font-semibold underline">{t('dash.primera')}</Link>.</p>
        ) : (
          <ul className="space-y-3">
            {recientes.map((c) => (
              <li key={c.alias} className="flex gap-3 items-start">
                <CartoonAvatar type={c.avatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm" dir="ltr">{c.alias}</span>
                    <StatusBadge estado={c.estado} />
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {c.provincia} · {c.formulario} · {c.nacionalidad} · {t('dash.entregado', { m: c.mes_entrega })}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {[c.empadronamiento && 'Padrón ✓', c.nie_recibido && 'NIE ✓', c.nss_recibido && 'NUSS ✓'].filter(Boolean).join(' · ') || t('dash.sinHitos')}
                    {' · '}{hace(c.updated_at)}
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
