import { useI18n } from '../i18n'
import { Card, PageHeader, Aviso } from '../components/ui'

const RESPONSABLE = 'Luz Lucia Guzman'
const CONTACTO = 'regularizacion2026.es@gmail.com'

function S({ t, children }) {
  return (
    <section className="mb-5">
      <h2 className="font-bold text-slate-900 mb-1">{t}</h2>
      <div className="text-sm text-slate-700 leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

function Par({ par }) {
  return <p><strong>{par[0]}</strong> {par[1]}</p>
}

export default function Privacidad() {
  const { t } = useI18n()
  const nota = t('priv.versionValida')
  return (
    <>
      <PageHeader kicker={t('priv.kicker')} title={t('priv.titulo')} />
      {nota && <div className="mb-4"><Aviso tipo="info">{nota}</Aviso></div>}
      <Card>
        <S t={t('priv.responsable')}>
          <p>{RESPONSABLE}. {t('priv.contacto')} <a href={`mailto:${CONTACTO}`} className="underline text-blue-700" dir="ltr">{CONTACTO}</a></p>
        </S>
        <S t={t('priv.datos')}>
          <Par par={t('priv.datosCuenta')} />
          <Par par={t('priv.datosTramite')} />
          <Par par={t('priv.datosForo')} />
          <Par par={t('priv.datosNo')} />
        </S>
        <S t={t('priv.para')}><p>{t('priv.paraTxt')}</p></S>
        <S t={t('priv.publico')}><p>{t('priv.publicoTxt')}</p></S>
        <S t={t('priv.donde')}><p>{t('priv.dondeTxt')}</p></S>
        <S t={t('priv.cuanto')}><p>{t('priv.cuantoTxt')}</p></S>
        <S t={t('priv.derechos')}><p>{t('priv.derechosTxt', { c: CONTACTO })}</p></S>
        <S t={t('priv.sinAseso')}><p>{t('priv.sinAsesoTxt')}</p></S>
      </Card>
    </>
  )
}
