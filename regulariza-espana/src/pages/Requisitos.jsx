import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Card, PageHeader } from '../components/ui'

const BLOQUES = [
  {
    n: '01',
    t: 'Permanencia y fechas',
    d: 'Encontrarse en España antes del 1 de enero de 2026 y acreditar una permanencia ininterrumpida de al menos 5 meses en el momento de la solicitud.',
  },
  {
    n: '02',
    t: 'Antecedentes',
    d: 'Carecer de antecedentes penales y no suponer una amenaza para el orden público, la seguridad o la salud pública.',
  },
  {
    n: '03',
    t: 'Condiciones excluyentes',
    d: 'Ser mayor de edad y no ser titular de una autorización de estancia o residencia en vigor.',
  },
  {
    n: '04',
    t: 'Situaciones (vía irregular)',
    d: 'Quien no había pedido asilo antes del 1 de enero de 2026 debía encontrarse en al menos una de estas situaciones: actividad laboral (previa, oferta de empleo o actividad por cuenta propia), unidad familiar (hijos menores o mayores con discapacidad) o vulnerabilidad acreditada.',
  },
]

const IMPRESOS = [
  ['EX-32', 'Personas en situación irregular que llegaron antes del 1 ene 2026 y no eran solicitantes de asilo. También menores irregulares vinculados al expediente de su progenitor.'],
  ['EX-31', 'Personas que habían solicitado protección internacional (asilo) antes del 1 ene 2026.'],
  ['EX-25', 'Menores cuyo progenitor ya tiene residencia legal (se presenta en la Oficina de Extranjería).'],
]

export default function Requisitos() {
  return (
    <>
      <Card className="mb-5 !bg-rose-50 !border-rose-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="font-extrabold text-rose-900">Plazo cerrado</h2>
            <p className="text-sm text-rose-900 mt-1 leading-relaxed">
              Las solicitudes de la Regularización Extraordinaria 2026 se presentaron del <strong>16 de abril al 30 de junio de 2026</strong>.
              Ya no se admiten solicitudes nuevas. Esta guía sirve a quienes ya presentaron y necesitan aportar documentos o responder a un requerimiento.
            </p>
          </div>
        </div>
      </Card>

      <PageHeader kicker="Guía" title="Requisitos del procedimiento">
        Resumen del Real Decreto 316/2026. Es orientativo: para tu caso concreto consulta con un abogado o una entidad de apoyo.
      </PageHeader>

      <div className="space-y-3 mb-6">
        {BLOQUES.map((b) => (
          <Card key={b.n}>
            <p className="text-xs font-extrabold text-blue-700">{b.n}</p>
            <h3 className="font-bold text-slate-900 mt-0.5">{b.t}</h3>
            <p className="text-sm text-slate-700 mt-1 leading-relaxed">{b.d}</p>
          </Card>
        ))}
      </div>

      <h2 className="font-bold text-slate-900 mb-3">Qué impreso correspondía</h2>
      <div className="space-y-2 mb-6">
        {IMPRESOS.map(([f, d]) => (
          <Card key={f} className="!p-3">
            <p className="font-extrabold text-sm">{f}</p>
            <p className="text-sm text-slate-700 mt-0.5">{d}</p>
          </Card>
        ))}
      </div>

      <Card>
        <p className="text-sm">¿Necesitas ver cómo va tu expediente o aportar documentos? <Link to="/expediente" className="font-bold text-blue-700 underline">Enlaces oficiales</Link></p>
      </Card>
    </>
  )
}
