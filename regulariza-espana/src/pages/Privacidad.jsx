import { Card, PageHeader } from '../components/ui'

// TODO antes de publicar: completar RESPONSABLE y CONTACTO con datos reales.
const RESPONSABLE = '[COMPLETAR: nombre o razón social del responsable]'
const CONTACTO = '[COMPLETAR: email de contacto para privacidad]'

function S({ t, children }) {
  return (
    <section className="mb-5">
      <h2 className="font-bold text-slate-900 mb-1">{t}</h2>
      <div className="text-sm text-slate-700 leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

export default function Privacidad() {
  return (
    <>
      <PageHeader kicker="Legal" title="Política de privacidad" />
      <Card>
        <S t="Quién es responsable">
          <p>{RESPONSABLE}. Contacto: {CONTACTO}.</p>
        </S>
        <S t="Qué datos tratamos">
          <p><strong>Cuenta:</strong> email (solo para verificar la cuenta y entrar; nunca se muestra), alias y avatar.</p>
          <p><strong>Trámite (opcional):</strong> impreso, estado, provincia, nacionalidad, fechas de entrega y resolución, fecha de ingreso (privada),
            si fue con abogado, situación, y casillas sí/no (empadronamiento, NIE recibido, NUSS recibido, documentos aportados).</p>
          <p><strong>Foro:</strong> los mensajes que publiques.</p>
          <p><strong>No pedimos ni guardamos</strong> números de NIE, NUSS, DNI, pasaporte, expediente, teléfono ni dirección. El foro bloquea automáticamente los mensajes que los contienen.</p>
        </S>
        <S t="Para qué y con qué base">
          <p>Para que funcione la comunidad y para calcular estadísticas agregadas. La base legal es tu consentimiento, que puedes retirar cuando quieras borrando tus datos.</p>
        </S>
        <S t="Qué se ve públicamente">
          <p>Tu alias y avatar; en la actividad reciente, además: provincia, impreso, estado, nacionalidad, mes y año de entrega y las casillas marcadas.
            Las estadísticas por provincia solo aparecen con 10 casos o más. Tu email y tu fecha de ingreso no se muestran nunca.</p>
        </S>
        <S t="Dónde se guardan">
          <p>En una base de datos de Supabase alojada en la Unión Europea (Irlanda). La web se sirve desde Vercel.</p>
        </S>
        <S t="Cuánto tiempo">
          <p>Mientras mantengas tu cuenta. Al borrarla, se eliminan tu perfil, tu trámite, tus mensajes y tus “útil”.</p>
        </S>
        <S t="Tus derechos">
          <p>Puedes acceder, rectificar y borrar tus datos desde “Mi trámite”. Para otros derechos (oposición, limitación, portabilidad) escribe a {CONTACTO}.
            También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>
        </S>
        <S t="Sin asesoramiento jurídico">
          <p>RegularizaEspaña es una comunidad independiente. No es una web oficial y lo que se publica son experiencias personales, no asesoramiento jurídico.</p>
        </S>
      </Card>
    </>
  )
}
