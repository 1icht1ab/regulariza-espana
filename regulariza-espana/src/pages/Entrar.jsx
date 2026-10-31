import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AVATARES } from '../lib/constants'
import { detectarDatoPersonal, mensajeError } from '../lib/pii'
import { useAuth } from '../context/AuthContext'
import CartoonAvatar from '../components/CartoonAvatar'
import { Card, PageHeader, Aviso, inputCls, btnPrimary } from '../components/ui'

export default function Entrar() {
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const [modo, setModo] = useState('registro')
  const [f, setF] = useState({ alias: '', avatar: 'robot', email: '', password: '', adulto: false, privacidad: false })
  const [estado, setEstado] = useState({ cargando: false, error: '', ok: '' })
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  if (user && perfil) {
    return (
      <Card>
        <p className="text-sm">Has entrado como <strong>{perfil.alias}</strong>.</p>
        <Link to="/mi-tramite" className={`${btnPrimary} mt-3`}>Ir a mi trámite</Link>
      </Card>
    )
  }

  const enviar = async (e) => {
    e.preventDefault()
    setEstado({ cargando: true, error: '', ok: '' })
    try {
      if (modo === 'registro') {
        if (!/^[A-Za-z0-9_]{3,20}$/.test(f.alias)) throw new Error('El alias debe tener de 3 a 20 caracteres: letras, números o _.')
        if (detectarDatoPersonal(f.alias)) throw new Error('El alias no puede contener números de documentos ni teléfonos.')
        if (!f.adulto || !f.privacidad) throw new Error('Debes confirmar que eres mayor de edad y aceptar la política de privacidad.')
        const { data: libre } = await supabase.rpc('re_alias_disponible', { p_alias: f.alias })
        if (libre === false) throw new Error('Ese alias ya está en uso. Elige otro.')
        const { error } = await supabase.auth.signUp({
          email: f.email,
          password: f.password,
          options: {
            emailRedirectTo: `${window.location.origin}/mi-tramite`,
            data: { app: 'regulariza', alias: f.alias, avatar: f.avatar, adulto: true },
          },
        })
        if (error) throw error
        setEstado({ cargando: false, error: '', ok: 'Te hemos enviado un email de confirmación. Ábrelo para activar tu cuenta.' })
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password })
        if (error) throw error
        const { data: p } = await supabase.from('re_profiles').select('id').eq('id', data.user.id).maybeSingle()
        if (!p) {
          await supabase.auth.signOut()
          throw new Error('Esta cuenta no está registrada en RegularizaEspaña. Crea una cuenta nueva.')
        }
        navigate('/mi-tramite')
      }
    } catch (err) {
      setEstado({ cargando: false, error: mensajeError(err), ok: '' })
    }
  }

  return (
    <>
      <PageHeader kicker="Cuenta" title={modo === 'registro' ? 'Crear cuenta' : 'Entrar'}>
        Solo pedimos un alias, un avatar y un email para verificar la cuenta. El email nunca se muestra.
        No te pediremos NIE, NUSS ni ningún número de documento.
      </PageHeader>

      <div className="grid grid-cols-2 gap-2 mb-4" role="tablist">
        {['registro', 'login'].map((m) => (
          <button key={m} role="tab" aria-selected={modo === m} onClick={() => setModo(m)}
            className={`py-2 rounded-xl text-sm font-bold border ${modo === m ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-slate-700 border-slate-300'}`}>
            {m === 'registro' ? 'Crear cuenta' : 'Ya tengo cuenta'}
          </button>
        ))}
      </div>

      <Card>
        <form onSubmit={enviar} className="space-y-4">
          {modo === 'registro' && (
            <>
              <div>
                <label htmlFor="alias" className="block text-sm font-bold mb-1">Alias público</label>
                <input id="alias" className={inputCls} value={f.alias} onChange={set('alias')} placeholder="Ej. Alex_MAD" required autoComplete="nickname" />
                <p className="text-xs text-slate-500 mt-1">No uses tu nombre completo.</p>
              </div>
              <fieldset>
                <legend className="block text-sm font-bold mb-2">Avatar</legend>
                <div className="grid grid-cols-5 gap-2">
                  {AVATARES.map((a) => (
                    <label key={a.id} className={`flex flex-col items-center gap-1 p-2 rounded-xl border cursor-pointer ${f.avatar === a.id ? 'border-blue-700 bg-blue-50' : 'border-slate-200'}`}>
                      <input type="radio" name="avatar" value={a.id} checked={f.avatar === a.id} onChange={set('avatar')} className="sr-only" />
                      <CartoonAvatar type={a.id} size="sm" />
                      <span className="text-[11px] font-semibold">{a.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-bold mb-1">Email</label>
            <input id="email" type="email" className={inputCls} value={f.email} onChange={set('email')} required autoComplete="email" />
          </div>
          <div>
            <label htmlFor="pw" className="block text-sm font-bold mb-1">Contraseña</label>
            <input id="pw" type="password" minLength={8} className={inputCls} value={f.password} onChange={set('password')} required
              autoComplete={modo === 'registro' ? 'new-password' : 'current-password'} />
          </div>
          {modo === 'registro' && (
            <div className="space-y-2">
              <label className="flex gap-2 text-sm"><input type="checkbox" checked={f.adulto} onChange={set('adulto')} className="mt-1" /> Confirmo que soy mayor de 18 años.</label>
              <label className="flex gap-2 text-sm">
                <input type="checkbox" checked={f.privacidad} onChange={set('privacidad')} className="mt-1" />
                <span>He leído la <Link to="/privacidad" className="underline text-blue-700" target="_blank">política de privacidad</Link> y doy mi consentimiento para que se traten los datos que yo decida registrar.</span>
              </label>
            </div>
          )}
          {estado.error && <Aviso tipo="error">{estado.error}</Aviso>}
          {estado.ok && <Aviso tipo="ok">{estado.ok}</Aviso>}
          <button className={`${btnPrimary} w-full`} disabled={estado.cargando || !supabase}>
            {estado.cargando ? 'Un momento…' : modo === 'registro' ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>
      </Card>
    </>
  )
}
