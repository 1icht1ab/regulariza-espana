import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { useI18n } from '../i18n'
import { Card, PageHeader } from '../components/ui'

export default function Requisitos() {
  const { t } = useI18n()
  const bloques = t('req.bloques')
  const impresos = t('req.impresos')

  return (
    <>
      <Card className="mb-5 !bg-rose-50 !border-rose-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-extrabold text-rose-900">{t('req.plazoTitulo')}</p>
            <p className="text-sm text-rose-900 mt-1 leading-relaxed">{t('req.plazoTxt')}</p>
          </div>
        </div>
      </Card>

      <PageHeader kicker={t('req.kicker')} title={t('req.titulo')}>{t('req.intro')}</PageHeader>

      <div className="space-y-3 mb-6">
        {bloques.map((b, i) => (
          <Card key={i}>
            <p className="text-xs font-extrabold text-blue-700" dir="ltr">{String(i + 1).padStart(2, '0')}</p>
            <h2 className="font-bold text-slate-900 mt-0.5">{b.t}</h2>
            <p className="text-sm text-slate-700 mt-1 leading-relaxed">{b.d}</p>
          </Card>
        ))}
      </div>

      <h2 className="font-bold text-slate-900 mb-3">{t('req.impresosTitulo')}</h2>
      <div className="space-y-2 mb-6">
        {impresos.map(([f, d]) => (
          <Card key={f} className="!p-3">
            <h3 className="font-extrabold text-sm" dir="ltr">{f}</h3>
            <p className="text-sm text-slate-700 mt-0.5">{d}</p>
          </Card>
        ))}
      </div>

      <Card>
        <p className="text-sm">{t('req.pie')} <Link to="/expediente" className="font-bold text-blue-700 underline">{t('req.pieLink')}</Link></p>
      </Card>
    </>
  )
}
