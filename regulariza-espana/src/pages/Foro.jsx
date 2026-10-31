import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Search, MessageSquare, ThumbsUp, ShieldAlert } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { CATEGORIAS_FORO } from '../lib/constants'
import { detectarDatoPersonal, mensajeError } from '../lib/pii'
import CartoonAvatar from '../components/CartoonAvatar'
import { Card, PageHeader, StatusBadge, Aviso, inputCls, btnPrimary, btnSecondary, tiempoRelativo } from '../components/ui'

export function NormasForo() {
  return (
    <Aviso tipo="alerta">
      <span className="inline-flex items-center gap-1 font-bold"><ShieldAlert className="w-4 h-4" /> Normas:</span>{' '}
      no publiques tu NIE, NUSS, DNI, pasaporte, teléfono, email ni dirección (ni los de nadie). Los mensajes que los contengan se bloquean
      automáticamente. Lo que se cuenta aquí son experiencias, no asesoramiento jurídico.
    </Aviso>
  )
}

export default function Foro() {
  const { user, perfil } = useAuth()
  const [hilos, setHilos] = useState([])
  const [cat, setCat] = useState('Todas')
  const [q, setQ] = useState('')
  const [nuevo, setNuevo] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    if (!supabase) return setCargando(false)
    let query = supabase
      .from('re_threads')
      .select('id, categoria, titulo, contenido, provincia, estado_tramite, created_at, autor:re_profiles(alias, avatar), re_replies(count), re_likes(count)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (cat !== 'Todas') query = query.eq('categoria', cat)
    if (q.trim()) {
      const t = q.trim().replace(/[%,()]/g, ' ')
      query = query.or(`titulo.ilike.%${t}%,contenido.ilike.%${t}%,provincia.ilike.%${t}%`)
    }
    const { data, error } = await query
    if (error) setError(mensajeError(error))
    setHilos(data || [])
    setCargando(false)
  }, [cat, q])

  useEffect(() => {
    const t = setTimeout(cargar, 250)
    return () => clearTimeout(t)
  }, [cargar])

  const publicar = async (e) => {
    e.preventDefault()
    setError('')
    const pii = detectarDatoPersonal(`${nuevo.titulo} ${nuevo.contenido}`)
    if (pii) return setError(`Tu mensaje parece contener ${pii}. Quítalo antes de publicar.`)
    const { error } = await supabase.from('re_threads').insert({ ...nuevo, author_id: user.id })
    if (error) return setError(mensajeError(error))
    setNuevo(null)
    cargar()
  }

  return (
    <>
      <PageHeader kicker="Apoyo mutuo" title="Foro de la comunidad">
        Comparte tu experiencia por provincia, resuelve dudas sobre documentos y apoya a otras personas.
      </PageHeader>

      <div className="mb-4"><NormasForo /></div>

      {user && perfil ? (
        nuevo ? (
          <Card className="mb-4">
            <form onSubmit={publicar} className="space-y-3">
              <p className="text-xs text-slate-600">Publicando como <strong>{perfil.alias}</strong>. Se mostrarán tu provincia y estado si tienes tu trámite registrado.</p>
              <select className={inputCls} value={nuevo.categoria} onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })} aria-label="Categoría">
                {CATEGORIAS_FORO.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input className={inputCls} required minLength={5} maxLength={140} placeholder="Título" value={nuevo.titulo}
                onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })} aria-label="Título" />
              <textarea className={inputCls} required minLength={10} maxLength={4000} rows={5} placeholder="Tu duda o experiencia…" value={nuevo.contenido}
                onChange={(e) => setNuevo({ ...nuevo, contenido: e.target.value })} aria-label="Mensaje" />
              {error && <Aviso tipo="error">{error}</Aviso>}
              <div className="flex gap-2 justify-end">
                <button type="button" className={btnSecondary} onClick={() => { setNuevo(null); setError('') }}>Cancelar</button>
                <button className={btnPrimary}>Publicar</button>
              </div>
            </form>
          </Card>
        ) : (
          <button className={`${btnPrimary} w-full mb-4`} onClick={() => setNuevo({ categoria: CATEGORIAS_FORO[0], titulo: '', contenido: '' })}>
            <PlusCircle className="w-4 h-4" /> Publicar una consulta o experiencia
          </button>
        )
      ) : (
        <Card className="mb-4 text-sm">
          Para publicar o responder necesitas una cuenta. <Link to="/entrar" className="font-bold text-blue-700 underline">Crear cuenta o entrar</Link>
        </Card>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 -mx-4 px-4">
        {['Todas', ...CATEGORIAS_FORO].map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border ${cat === c ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-slate-700 border-slate-300'}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
        <input className={`${inputCls} pl-9`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por provincia o tema…" aria-label="Buscar en el foro" />
      </div>

      {cargando ? (
        <p className="text-sm text-slate-600">Cargando…</p>
      ) : hilos.length === 0 ? (
        <Card className="text-sm text-slate-600">Todavía no hay mensajes{cat !== 'Todas' ? ' en esta categoría' : ''}.</Card>
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
                        <span className="font-bold text-slate-900">{h.autor?.alias}</span>
                        {h.provincia && <span className="text-slate-500">{h.provincia}</span>}
                        <StatusBadge estado={h.estado_tramite} />
                      </div>
                      <h2 className="font-bold text-slate-900 mt-1 leading-snug">{h.titulo}</h2>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{h.contenido}</p>
                      <p className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                        <span>{tiempoRelativo(h.created_at)}</span>
                        <span>{h.categoria}</span>
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
