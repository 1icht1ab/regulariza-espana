import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AVATARES } from '../lib/constants'
import { detectarDatoPersonal, mensajeError } from '../lib/pii'
import { useI18n } from '../i18n'
import { useAuth } from '../context/AuthContext'
import CartoonAvatar from '../components/CartoonAvatar'
import { Card, PageHeader, Aviso, inputCls, btnPrimary } from '../components/ui'

export default function Entrar() {
  const { user, perfil } = useAuth()
  const { t, tv } = useI18n()
  const navigate = useNavigate()
  const [modo, setModo] = useState('registro')
  const [f, setF] = useState({ alias: '', avatar: 'robot', email: '', password: '', adulto: false, privacidad: false })
  const [estado, setEstado] = useState({ cargando: false, error: '', ok: '' })
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  if (user && perfil) {
    return (
      <Card>
        <p className="text-sm">{t('entrar.yaDentro', { a: perfil.alias })}</p>
        <Link to="/mi-tramite" className={`${btnPrimary} mt-3`}>{t('entrar.irTramite')}</Link>
      </Card>
    )
  }

  const enviar = async (e) => {
    e.preventDefault()
    setEstado({ cargando: true, error: '', ok: '' })
    try {
      if (modo === 'registro') {
        if (!/^[A-Za-z0-9_]{3,20}$/.test(f.alias)) throw new Error(t('entrar.errAlias'))
        if (detectarDatoPersonal(f.alias)) throw new Error(t('entrar.errAliasPii'))
        if (!f.adulto || !f.privacidad) throw new Error(t('entrar.errConsent'))
        const { data: libre } = await supabase.rpc('re_alias_disponible', { p_alias: f.alias })
        if (libre === false) throw new Error(t('entrar.errAliasUsado'))
        const { error } = await supabase.auth.signUp({
          email: f.email,
          password: f.password,
          options: {
            emailRedirectTo: `${window.location.origin}/mi-tramite`,
            data: { app: 'regulariza', alias: f.alias, avatar: f.avatar, adulto: true },
          },
        })
        if (error) throw error
        setEstado({ cargando: false, error: '', ok: t('entrar.okEmail') })
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password })
        if (error) throw error
        const { data: p } = await supabase.from('re_profiles').select('id').eq('id', data.user.id).maybeSingle()
        if (!p) {
          await supabase.auth.signOut()
          throw new Error(t('entrar.errNoCuenta'))
        }
        navigate('/mi-tramite')
      }
    } catch (err) {
      setEstado({ cargando: false, error: mensajeError(err, t), ok: '' })
    }
  }

  return (
    <>
      <PageHeader kicker={t('entrar.kicker')} title={modo === 'registro' ? t('entrar.tituloRegistro') : t('entrar.tituloLogin')}>
        {t('entrar.intro')}
      </PageHeader>

      <div className="grid grid-cols-2 gap-2 mb-4" role="tablist">
        {['registro', 'login'].map((m) => (
          <button key={m} role="tab" aria-selected={modo === m} onClick={() => setModo(m)}
            className={`py-2 rounded-xl text-sm font-bold border ${modo === m ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-slate-700 border-slate-300'}`}>
            {m === 'registro' ? t('entrar.tabRegistro') : t('entrar.tabLogin')}
          </button>
        ))}
      </div>

      <Card>
        <form onSubmit={enviar} className="space-y-4">
          {modo === 'registro' && (
            <>
              <div>
                <label htmlFor="alias" className="block text-sm font-bold mb-1">{t('entrar.alias')}</label>
                <input id="alias" className={inputCls} value={f.alias} onChange={set('alias')} placeholder="Ej. Alex_MAD" required autoComplete="nickname" />
                <p className="text-xs text-slate-600 mt-1">{t('entrar.aliasAyuda')}</p>
              </div>
              <fieldset>
                <legend className="block text-sm font-bold mb-2">{t('entrar.avatar')}</legend>
                <div className="grid grid-cols-5 gap-2">
                  {AVATARES.map((a) => (
                    <label key={a.id} className={`flex flex-col items-center gap-1 p-2 rounded-xl border cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-600 ${f.avatar === a.id ? 'border-blue-700 bg-blue-50' : 'border-slate-200'}`}>
                      <input type="radio" name="avatar" value={a.id} checked={f.avatar === a.id} onChange={set('avatar')} className="sr-only peer" />
                      <CartoonAvatar type={a.id} size="sm" />
                      <span className="text-[11px] font-semibold">{tv('avatar', a.id)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-bold mb-1">{t('entrar.email')}</label>
            <input id="email" type="email" className={inputCls} value={f.email} onChange={set('email')} required autoComplete="email" />
          </div>
          <div>
            <label htmlFor="pw" className="block text-sm font-bold mb-1">{t('entrar.password')}</label>
            <input id="pw" type="password" minLength={8} className={inputCls} value={f.password} onChange={set('password')} required
              autoComplete={modo === 'registro' ? 'new-password' : 'current-password'} />
          </div>
          {modo === 'registro' && (
            <div className="space-y-2">
              <label className="flex gap-2 text-sm py-1"><input type="checkbox" checked={f.adulto} onChange={set('adulto')} className="mt-1 w-5 h-5 shrink-0" /> {t('entrar.adulto')}</label>
              <label className="flex gap-2 text-sm py-1">
                <input type="checkbox" checked={f.privacidad} onChange={set('privacidad')} className="mt-1 w-5 h-5 shrink-0" />
                <span>{t('entrar.privacidad1')} <Link to="/privacidad" className="underline text-blue-700" target="_blank">{t('entrar.privacidad2')}</Link> {t('entrar.privacidad3')}</span>
              </label>
            </div>
          )}
          {estado.error && <Aviso tipo="error">{estado.error}</Aviso>}
          {estado.ok && <Aviso tipo="ok">{estado.ok}</Aviso>}
          <button className={`${btnPrimary} w-full`} disabled={estado.cargando || !supabase}>
            {estado.cargando ? t('entrar.momento') : modo === 'registro' ? t('entrar.tituloRegistro') : t('entrar.tituloLogin')}
          </button>
        </form>
      </Card>
    </>
  )
}
