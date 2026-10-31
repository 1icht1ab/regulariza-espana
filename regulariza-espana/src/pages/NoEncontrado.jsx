import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { Card } from '../components/ui'

export default function NoEncontrado() {
  const { t } = useI18n()
  return (
    <Card>
      <h1 className="font-bold">{t('noEncontrado.titulo')}</h1>
      <Link to="/" className="text-sm text-blue-700 underline">{t('noEncontrado.volver')}</Link>
    </Card>
  )
}
