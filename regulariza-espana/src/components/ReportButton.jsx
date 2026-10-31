import { useState } from 'react'
import { Flag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { MOTIVOS_REPORTE } from '../lib/constants'
import { useAuth } from '../context/AuthContext'

export default function ReportButton({ tipo, id }) {
  const { user } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const [hecho, setHecho] = useState(false)

  if (!user) return null
  if (hecho) return <span className="text-xs text-slate-500">Reportado. Gracias.</span>

  const reportar = async (motivo) => {
    await supabase.from('re_reports').insert({ target_type: tipo, target_id: id, reporter_id: user.id, motivo })
    setHecho(true)
  }

  return abierto ? (
    <div className="flex flex-wrap gap-1">
      {MOTIVOS_REPORTE.map((m) => (
        <button key={m} onClick={() => reportar(m)} className="text-xs px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-100">{m}</button>
      ))}
      <button onClick={() => setAbierto(false)} className="text-xs px-2 py-1 text-slate-500">Cancelar</button>
    </div>
  ) : (
    <button onClick={() => setAbierto(true)} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-700">
      <Flag className="w-3.5 h-3.5" aria-hidden="true" /> Reportar
    </button>
  )
}
