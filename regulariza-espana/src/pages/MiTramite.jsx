import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Trash2, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../i18n'
import { ESTADOS, FORMULARIOS, PROVINCIAS, SITUACIONES, AVATARES } from '../lib/constants'
import { detectarDatoPersonal, mensajeError } from '../lib/pii'
import CartoonAvatar from '../components/CartoonAvatar'
import { Card, PageHeader, Aviso, inputCls, btnPrimary, btnSecondary } from '../components/ui'

const VACIO = {
  formulario: 'EX-32', estado: 'En espera', empadronamiento: false, nie_recibido: false, nss_recibido: false,
  fecha_entrega: '', fecha_resolucion: '', provincia: '', con_abogado: false, situacion: 'Trabajando',
  nacionalidad: '', fecha_ingreso: '', doc_pasaporte: false, doc_antecedentes: false, doc_permanencia: false, doc_supuesto: false,
}

const HITOS = [
  { key: 'empadronamiento', title: 'hitoPadron', sub: 'hitoPadronSub' },
  { key: 'nie_recibido', title: 'hitoNie', sub: 'hitoSub' },
  { key: 'nss_recibido', title: 'hitoNss', sub: 'hitoSub' },
]

const DOCS = [
  { key: 'doc_pasaporte', label: 'docPasaporte' },
  { key: 'doc_antecedentes', label: 'docAntecedentes' },
  { key: 'doc_permanencia', label: 'docPermanencia' },
  { key: 'doc_supuesto', label: 'docSupuesto' },
]

const opcion = 'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-600'

function Check({ checked, onChange, title, sub }) {
  return (
    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${checked ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="mt-0.5 w-5 h-5 shrink-0" />
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        {sub && <span className="block text-xs text-slate-600">{sub}</span>}
      </span>
    </label>
  )
}

export default function MiTramite() {
  const { user, perfil, cargando, recargarPerfil, salir } = useAuth()
  const { t, tv } = useI18n()
  const [c, setC] = useState(VACIO)
  const [existe, setExiste] = useState(false)
  const [avatar, setAvatar] = useState('robot')
  const [msg, setMsg] = useState({ tipo: '', texto: '' })
  const [guardando, setGuardando] = useState(false)
  const [confirmarBorrado, setConfirmarBorrado] = useState('')

  useEffect(() => {
    if (!user || !supabase) return
    supabase.from('re_cases').select('*').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setExiste(true)
        setC({ ...VACIO, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ''])) })
      }
    })
  }, [user])

  useEffect(() => { if (perfil) setAvatar(perfil.avatar) }, [perfil])

  if (cargando) return <p className="text-sm text-slate-600">{t('comun.cargando')}</p>

  if (!user || !perfil) {
    return (
      <>
        <PageHeader kicker={t('tramite.kicker')} title={t('tramite.tituloAnon')}>{t('tramite.introAnon')}</PageHeader>
        <Link to="/entrar" className={btnPrimary}>{t('tramite.crearCuenta')}</Link>
      </>
    )
  }

  const set = (k) => (e) => setC((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const guardar = async (e) => {
    e.preventDefault()
    setMsg({ tipo: '', texto: '' })
    const pii = detectarDatoPersonal(c.nacionalidad)
    if (pii) return setMsg({ tipo: 'error', texto: t('tramite.errNac', { t: t(`errores.tipos.${pii}`) }) })
    setGuardando(true)
    const fila = {
      ...c,
      user_id: user.id,
      fecha_resolucion: c.fecha_resolucion || null,
      fecha_ingreso: c.fecha_ingreso || null,
      nacionalidad: c.nacionalidad.trim(),
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('re_cases').upsert(fila)
    if (!error && avatar !== perfil.avatar) {
      await supabase.from('re_profiles').update({ avatar }).eq('id', user.id)
      recargarPerfil()
    }
    setGuardando(false)
    if (error) return setMsg({ tipo: 'error', texto: mensajeError(error, t) })
    setExiste(true)
    setMsg({ tipo: 'ok', texto: t('tramite.ok') })
  }

  const borrarCaso = async () => {
    await supabase.from('re_cases').delete().eq('user_id', user.id)
    setC(VACIO)
    setExiste(false)
    setMsg({ tipo: 'ok', texto: t('tramite.casoBorrado') })
  }

  const borrarCuenta = async () => {
    const { error } = await supabase.rpc('re_borrar_mi_cuenta')
    if (error) return setMsg({ tipo: 'error', texto: mensajeError(error, t) })
    await salir()
  }

  const enPlazo = (d) => !d || (d >= '2026-04-16' && d <= '2026-06-30')
  const palabra = t('tramite.palabra')

  return (
    <>
      <PageHeader kicker={t('tramite.kicker')} title={t('tramite.hola', { a: perfil.alias })}>{t('tramite.intro')}</PageHeader>

      <Card className="mb-4">
        <div className="flex gap-3 items-start">
          <Search className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm">
            {t('tramite.consulta')}{' '}
            <Link to="/expediente" className="font-bold text-blue-700 underline">{t('tramite.verComo')}</Link>
          </p>
        </div>
      </Card>

      <form onSubmit={guardar} className="space-y-4">
        <Card className="space-y-4">
          <fieldset>
            <legend className="text-sm font-bold mb-2">{t('tramite.avatar')}</legend>
            <div className="grid grid-cols-5 gap-2">
              {AVATARES.map((a) => (
                <label key={a.id} className={`flex justify-center p-2 rounded-xl border cursor-pointer ${opcion} ${avatar === a.id ? 'border-blue-700 bg-blue-50' : 'border-slate-200'}`}>
                  <input type="radio" name="avatar" className="sr-only" checked={avatar === a.id} onChange={() => setAvatar(a.id)} aria-label={tv('avatar', a.id)} />
                  <CartoonAvatar type={a.id} size="sm" />
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="formulario" className="block text-sm font-bold mb-1">{t('tramite.impreso')}</label>
            <select id="formulario" className={inputCls} value={c.formulario} onChange={set('formulario')}>
              {FORMULARIOS.map((x) => <option key={x.value} value={x.value}>{tv('formulario', x.value)}</option>)}
            </select>
          </div>

          <fieldset>
            <legend className="text-sm font-bold mb-2">{t('tramite.estado')}</legend>
            <div className="grid grid-cols-2 gap-2">
              {ESTADOS.map((s) => (
                <label key={s} className={`text-center py-2.5 px-2 rounded-xl border text-xs font-bold cursor-pointer ${opcion} ${c.estado === s ? 'bg-blue-700 text-white border-blue-700' : 'bg-white border-slate-200'}`}>
                  <input type="radio" name="estado" value={s} checked={c.estado === s} onChange={set('estado')} className="sr-only" />
                  {tv('estado', s)}
                </label>
              ))}
            </div>
          </fieldset>
        </Card>

        <Card className="space-y-2">
          <h2 className="text-sm font-bold">{t('tramite.hitos')}</h2>
          <Aviso tipo="info">
            <span className="inline-flex items-center gap-1 font-bold"><Lock className="w-3.5 h-3.5" /> {t('tramite.sinNumeros')}</span>{' '}
            {t('tramite.sinNumerosTxt')}
          </Aviso>
          {HITOS.map((h) => <Check key={h.key} checked={!!c[h.key]} onChange={set(h.key)} title={t(`tramite.${h.title}`)} sub={t(`tramite.${h.sub}`)} />)}
        </Card>

        <Card className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fe" className="block text-sm font-bold mb-1">{t('tramite.entrega')}</label>
              <input id="fe" type="date" min="2026-04-16" max="2026-06-30" required className={inputCls} value={c.fecha_entrega} onChange={set('fecha_entrega')} />
              {!enPlazo(c.fecha_entrega) && <p className="text-xs text-rose-700 mt-1">{t('tramite.plazo')}</p>}
            </div>
            <div>
              <label htmlFor="fr" className="block text-sm font-bold mb-1">{t('tramite.resolucion')} <span className="font-normal text-slate-600">{t('tramite.siLaTienes')}</span></label>
              <input id="fr" type="date" min={c.fecha_entrega || '2026-04-16'} className={inputCls} value={c.fecha_resolucion} onChange={set('fecha_resolucion')} />
            </div>
            <div>
              <label htmlFor="prov" className="block text-sm font-bold mb-1">{t('tramite.provincia')}</label>
              <select id="prov" required className={inputCls} value={c.provincia} onChange={set('provincia')}>
                <option value="">{t('comun.elige')}</option>
                {PROVINCIAS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="abog" className="block text-sm font-bold mb-1">{t('tramite.abogado')}</label>
              <select id="abog" className={inputCls} value={c.con_abogado ? 'si' : 'no'} onChange={(e) => setC((p) => ({ ...p, con_abogado: e.target.value === 'si' }))}>
                <option value="no">{t('tramite.abogadoNo')}</option>
                <option value="si">{t('tramite.abogadoSi')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="sit" className="block text-sm font-bold mb-1">{t('tramite.situacion')}</label>
              <select id="sit" className={inputCls} value={c.situacion} onChange={set('situacion')}>
                {SITUACIONES.map((s) => <option key={s} value={s}>{tv('situacion', s)}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="nac" className="block text-sm font-bold mb-1">{t('tramite.nacionalidad')}</label>
              <input id="nac" required maxLength={40} className={inputCls} value={c.nacionalidad} onChange={set('nacionalidad')} placeholder={t('tramite.nacionalidadEj')} />
            </div>
            <div>
              <label htmlFor="fi" className="block text-sm font-bold mb-1">{t('tramite.ingreso')} <span className="font-normal text-slate-600">{t('tramite.ingresoOpc')}</span></label>
              <input id="fi" type="date" max="2025-12-31" className={inputCls} value={c.fecha_ingreso} onChange={set('fecha_ingreso')} />
              <p className="text-xs text-slate-600 mt-1">{t('tramite.ingresoAyuda')}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-2">
          <h2 className="text-sm font-bold">{t('tramite.docs')}</h2>
          {DOCS.map((d) => <Check key={d.key} checked={!!c[d.key]} onChange={set(d.key)} title={t(`tramite.${d.label}`)} />)}
        </Card>

        {msg.texto && <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>}
        <button className={`${btnPrimary} w-full`} disabled={guardando || !enPlazo(c.fecha_entrega)}>
          {guardando ? t('comun.guardando') : existe ? t('tramite.actualizar') : t('tramite.guardar')}
        </button>
      </form>

      <Card className="mt-8 space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-rose-800"><Trash2 className="w-4 h-4" /> {t('tramite.tusDatos')}</h2>
        {existe && (
          <button type="button" onClick={borrarCaso} className={`${btnSecondary} w-full`}>{t('tramite.borrarCaso')}</button>
        )}
        <p className="text-xs text-slate-600">
          {t('tramite.borrarAyuda1')} <strong>{palabra}</strong> {t('tramite.borrarAyuda2')}
        </p>
        <input className={inputCls} value={confirmarBorrado} onChange={(e) => setConfirmarBorrado(e.target.value)} aria-label={t('tramite.confirmarAria')} />
        <button type="button" onClick={borrarCuenta} disabled={confirmarBorrado.trim().toUpperCase() !== palabra.toUpperCase()}
          className="w-full px-4 py-2.5 rounded-xl bg-rose-700 text-white text-sm font-bold disabled:opacity-40">
          {t('tramite.borrarCuenta')}
        </button>
      </Card>
    </>
  )
}
