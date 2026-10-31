import { useEffect, useState, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ThumbsUp, Send, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { detectarDatoPersonal, mensajeError } from '../lib/pii'
import { useI18n } from '../i18n'
import CartoonAvatar from '../components/CartoonAvatar'
import ReportButton from '../components/ReportButton'
import { NormasForo } from './Foro'
import { Card, StatusBadge, Aviso, inputCls, btnPrimary, useTiempoRelativo } from '../components/ui'

export default function Hilo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, perfil } = useAuth()
  const { t, tv } = useI18n()
  const hace = useTiempoRelativo()
  const [enviando, setEnviando] = useState(false)
  const [hilo, setHilo] = useState(null)
  const [likes, setLikes] = useState({ total: 0, mio: false })
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')
  const [noExiste, setNoExiste] = useState(false)

  const cargar = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase
      .from('re_threads')
      .select('id, author_id, categoria, titulo, contenido, provincia, estado_tramite, created_at, autor:re_profiles!re_threads_author_id_fkey(alias, avatar), re_replies(id, author_id, texto, provincia, estado_tramite, created_at, autor:re_profiles!re_replies_author_id_fkey(alias, avatar))')
      .eq('id', id)
      .order('created_at', { referencedTable: 're_replies', ascending: true })
      .maybeSingle()
    if (!data) return setNoExiste(true)
    setHilo(data)
    const { data: ls } = await supabase.from('re_likes').select('user_id').eq('thread_id', id)
    setLikes({ total: ls?.length || 0, mio: !!ls?.some((l) => l.user_id === user?.id) })
  }, [id, user?.id])

  useEffect(() => { cargar() }, [cargar])

  const toggleLike = async () => {
    if (!user) return navigate('/entrar')
    if (likes.mio) await supabase.from('re_likes').delete().eq('thread_id', id).eq('user_id', user.id)
    else await supabase.from('re_likes').insert({ thread_id: id, user_id: user.id })
    cargar()
  }

  const responder = async (e) => {
    e.preventDefault()
    setError('')
    const pii = detectarDatoPersonal(texto)
    if (pii) return setError(t('hilo.errPii', { t: t(`errores.tipos.${pii}`) }))
    setEnviando(true)
    const { error } = await supabase.from('re_replies').insert({ thread_id: id, author_id: user.id, texto: texto.trim() })
    setEnviando(false)
    if (error) return setError(mensajeError(error, t))
    setTexto('')
    cargar()
  }

  const borrar = async (tabla, rid) => {
    await supabase.from(tabla).delete().eq('id', rid)
    if (tabla === 're_threads') navigate('/foro')
    else cargar()
  }

  if (noExiste) return <Card>{t('hilo.noExiste')} <Link to="/foro" className="underline text-blue-700">{t('hilo.volverForo')}</Link></Card>
  if (!hilo) return <p className="text-sm text-slate-600">{t('comun.cargando')}</p>

  return (
    <>
      <Link to="/foro" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 mb-4 py-2"><ArrowLeft className="w-4 h-4 rtl:-scale-x-100" /> {t('hilo.volver')}</Link>

      <Card className="mb-4">
        <div className="flex gap-3">
          <CartoonAvatar type={hilo.autor?.avatar} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-900" dir="ltr">{hilo.autor?.alias}</span>
              {hilo.provincia && <span className="text-slate-600">{hilo.provincia}</span>}
              <StatusBadge estado={hilo.estado_tramite} />
            </div>
            <p className="text-xs text-slate-600 mt-0.5">{hace(hilo.created_at)} · {tv('categoria', hilo.categoria)}</p>
          </div>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 mt-3 leading-snug" dir="auto">{hilo.titulo}</h1>
        <p className="text-sm text-slate-700 mt-2 whitespace-pre-line leading-relaxed" dir="auto">{hilo.contenido}</p>
        <div className="flex items-center justify-between gap-2 mt-4">
          <button onClick={toggleLike} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold ${likes.mio ? 'bg-blue-50 border-blue-300 text-blue-800' : 'border-slate-300 text-slate-700'}`}>
            <ThumbsUp className="w-3.5 h-3.5" /> {t('hilo.util', { n: likes.total })}
          </button>
          {user?.id === hilo.author_id
            ? <button onClick={() => borrar('re_threads', hilo.id)} className="inline-flex items-center gap-1 text-xs text-rose-700 py-2"><Trash2 className="w-3.5 h-3.5" /> {t('comun.borrar')}</button>
            : <ReportButton tipo="thread" id={hilo.id} />}
        </div>
      </Card>

      <h2 className="text-sm font-bold text-slate-900 mb-2">{hilo.re_replies.length === 1 ? t('hilo.respuesta') : t('hilo.respuestas', { n: hilo.re_replies.length })}</h2>
      <ul className="space-y-2 mb-4">
        {hilo.re_replies.map((r) => (
          <li key={r.id}>
            <Card className="!p-3">
              <div className="flex gap-2">
                <CartoonAvatar type={r.autor?.avatar} size="xs" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold" dir="ltr">{r.autor?.alias}</span>
                    {r.provincia && <span className="text-slate-600">{r.provincia}</span>}
                    <span className="text-slate-600">{hace(r.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-line" dir="auto">{r.texto}</p>
                  <div className="mt-1">
                    {user?.id === r.author_id
                      ? <button onClick={() => borrar('re_replies', r.id)} className="text-xs text-rose-700 py-2">{t('comun.borrar')}</button>
                      : <ReportButton tipo="reply" id={r.id} />}
                  </div>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {user && perfil ? (
        <Card>
          <form onSubmit={responder} className="space-y-3">
            <NormasForo />
            <textarea className={inputCls} rows={3} required minLength={2} maxLength={2000} value={texto} onChange={(e) => setTexto(e.target.value)}
              placeholder={t('hilo.respuestaPh')} aria-label={t('hilo.respuestaAria')} />
            {error && <Aviso tipo="error">{error}</Aviso>}
            <button className={`${btnPrimary} w-full`} disabled={enviando}><Send className="w-4 h-4 rtl:-scale-x-100" /> {t('hilo.responder')}</button>
          </form>
        </Card>
      ) : (
        <Card className="text-sm">{t('hilo.necesitasCuenta')} <Link to="/entrar" className="font-bold text-blue-700 underline">{t('hilo.entrar')}</Link></Card>
      )}
    </>
  )
}
