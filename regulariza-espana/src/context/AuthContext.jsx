import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  const cargarPerfil = useCallback(async (userId) => {
    if (!supabase || !userId) return setPerfil(null)
    const { data } = await supabase.from('re_profiles').select('id, alias, avatar').eq('id', userId).maybeSingle()
    setPerfil(data)
  }, [])

  useEffect(() => {
    if (!supabase) return setCargando(false)
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      await cargarPerfil(data.session?.user?.id)
      setCargando(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      cargarPerfil(s?.user?.id)
    })
    return () => sub.subscription.unsubscribe()
  }, [cargarPerfil])

  const salir = () => supabase?.auth.signOut()

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, perfil, cargando, salir, recargarPerfil: () => cargarPerfil(session?.user?.id) }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
