import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Search, MessageSquare, ThumbsUp, ShieldAlert } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { CATEGORIAS_FORO } from '../lib/constants'
import { detectarDatoPersonal, mensajeError } from '../lib/pii'
import { useI18n } from '../i18n'
import CartoonAvatar from '../components/CartoonAvatar'
import { Card, PageHeader, StatusBadge, Aviso, inputCls, btnPrimary, btnSecondary, useTiempoRelativo } from '../components/ui'

export function NormasForo() {
  const { t } = useI18n()
  return (
    <Aviso tipo="alerta">
      <span className="inline-flex items-center gap-1 font-bold"><ShieldAlert className="w-4 h-4" /> {t('foro.normas')}</span>{' '}
      {t('foro.normasTxt')}
    </Aviso>
  )
}

export default function Foro() {
  const { user, perfil } = useAuth()
  const { t, tv, lang } = useI18n()
  const hace = useTiempoRelativo()
  const [hilos, setHilos] = useState([])
  const [cat, setCat] = useState('Todas')
  const [q, setQ] = useState('')
  const [nuevo, setNuevo] = useState(null)
  const [error, setError] = useState('')
  const [errorCarga, setErrorCarga] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    if (!supabase) return setCargando(false)
    let query = supabase
      .from('re_threads')
      .select('id, categoria, titulo, contenido, provincia, estado_tramite, created_at, autor:re_profiles!re_threads_author_id_fkey(alias, avatar), re_replies(count), re_likes(count)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (cat !== 'Todas') query = query.eq('categoria', cat)
    if (q.trim()) {
      const qq = q.trim().replace(/[%,()]/g, ' ')
      query = query.or(`titulo.ilike.%${qq}%,contenido.ilike.%${qq}%,provincia.ilike.%${qq}%`)
    }
    const { data, error } = await query
    setErrorCarga(error ? 'foro.errorCarga' : '')
    setHilos(data || [])
    setCargando(false)
  }, [cat, q])

  useEffect(() => {
    const tm = setTimeout(cargar, 250)
    return () => clearTimeout(tm)
  }, [cargar])

  const publicar = async (e) => {
    e.preventDefault()
    setError('')
    const pii = detectarDatoPersonal(`${nuevo.titulo} ${nuevo.contenido}`)
    if (pii) return setError(t('foro.errPii', { t: t(`errores.tipos.${pii}`) }))
    setEnviando(true)
    const { error } = await supabase.from('re_threads').insert({ ...nuevo, author_id: user.id })
    setEnviando(false)
    if (error) return setError(mensajeError(error, t))
    setNuevo(null)
    cargar()
  }

  return (
    <>
      <PageHeader kicker={t('foro.kicker')} title={t('foro.titulo')}>{t('foro.intro')}</PageHeader>

      <div className="mb-4"><NormasForo /></div>
      {lang !== 'es' && <p className="text-xs text-slate-600 mb-3">{t('comun.contenidoUsuarios')}</p>}

      {user && perfil ? (
        nuevo ? (
          <Card className="mb-4">
            <form onSubmit={publicar} className="space-y-3">
              <p className="text-xs text-slate-600">{t('foro.publicandoComo')} <strong dir="ltr">{perfil.alias}</strong>. {t('foro.publicandoNota')}</p>
              <select className={inputCls} value={nuevo.categoria} onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })} aria-label={t('foro.categoria')}>
                {CATEGORIAS_FORO.map((c) => <option key={c} value={c}>{tv('categoria', c)}</option>)}
              </select>
              <input className={inputCls} required minLength={5} maxLength={140} placeholder={t('foro.tituloPh')} value={nuevo.titulo}
                onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })} aria-label={t('foro.tituloPh')} />
              <textarea className={inputCls} required minLength={10} maxLength={4000} rows={5} placeholder={t('foro.mensajePh')} value={nuevo.contenido}
                onChange={(e) => setNuevo({ ...nuevo, contenido: e.target.value })} aria-label={t('foro.mensaje')} />
              {error && <Aviso tipo="error">{error}</Aviso>}
              <div className="flex gap-2 justify-end">
                <button type="button" className={btnSecondary} onClick={() => { setNuevo(null); setError('') }}>{t('comun.cancelar')}</button>
                <button className={btnPrimary} disabled={enviando}>{enviando ? t('foro.publicando') : t('foro.publicar')}</button>
              </div>
            </form>
          </Card>
        ) : (
          <button className={`${btnPrimary} w-full mb-4`} onClick={() => setNuevo({ categoria: CATEGORIAS_FORO[0], titulo: '', contenido: '' })}>
            <PlusCircle className="w-4 h-4" /> {t('foro.nuevo')}
          </button>
        )
      ) : (
        <Card className="mb-4 text-sm">
          {t('foro.necesitasCuenta')} <Link to="/entrar" className="font-bold text-blue-700 underline">{t('foro.crearOEntrar')}</Link>
        </Card>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 -mx-4 px-4">
        {['Todas', ...CATEGORIAS_FORO].map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border ${cat === c ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-slate-700 border-slate-300'}`}>
            {c === 'Todas' ? t('foro.todas') : tv('categoria', c)}
          </button>
        ))}
      </div>
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
        <input className={`${inputCls} ps-9`} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('foro.buscar')} aria-label={t('foro.buscarAria')} />
      </div>

      {errorCarga && <div className="mb-3"><Aviso tipo="error">{t(errorCarga)}</Aviso></div>}
      {cargando ? (
        <p className="text-sm text-slate-600">{t('comun.cargando')}</p>
      ) : hilos.length === 0 ? (
        <Card className="text-sm text-slate-600">{cat !== 'Todas' ? t('foro.vacioCat') : t('foro.vacio')}</Card>
      ) : (
        <ul className="space-y-3">
          {hilos.map((h) => (
            <li key={h.id}>
              <Link to={`/foro/${h.id}`} className="block">
                <Card className="hover:border-blue-300">
                  <div className="flex gap-3">
                    <CartoonAvatar type={h.autor?.avatar} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900" dir="ltr">{h.autor?.alias}</span>
                        {h.provincia && <span className="text-slate-600">{h.provincia}</span>}
                        <StatusBadge estado={h.estado_tramite} />
                      </div>
                      <h2 className="font-bold text-slate-900 mt-1 leading-snug" dir="auto">{h.titulo}</h2>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2" dir="auto">{h.contenido}</p>
                      <p className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                        <span>{hace(h.created_at)}</span>
                        <span>{tv('categoria', h.categoria)}</span>
                        <span className="inline-flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {h.re_replies?.[0]?.count ?? 0}</span>
                        <span className="inline-flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {h.re_likes?.[0]?.count ?? 0}</span>
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
