import { ArrowUpRight, PlayCircle, Lock } from 'lucide-react'
import { ENLACES_OFICIALES, SHORT_URL } from '../lib/constants'
import { Card, PageHeader, Aviso } from '../components/ui'

function embedDe(url) {
  const m = url.match(/(?:shorts\/|youtu\.be\/|v=)([A-Za-z0-9_-]{6,})/)
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null
}

export default function Expediente() {
  const embed = SHORT_URL ? embedDe(SHORT_URL) : null

  return (
    <>
      <PageHeader kicker="Webs oficiales" title="Consulta tu expediente">
        El estado de tu expediente solo se puede consultar en las webs oficiales. RegularizaEspaña no accede a tu expediente ni te pedirá nunca tus números.
      </PageHeader>

      <div className="mb-4">
        <Aviso tipo="info">
          <span className="inline-flex items-center gap-1 font-bold"><Lock className="w-3.5 h-3.5" /> Importante:</span>{' '}
          tus datos (NIE, número de expediente, contraseñas) se escriben solo en las webs oficiales <strong>.gob.es</strong>, nunca aquí ni en el foro.
        </Aviso>
      </div>

      <section className="mb-6" aria-labelledby="video">
        <h2 id="video" className="font-bold text-slate-900 mb-2 flex items-center gap-2"><PlayCircle className="w-4 h-4" /> Cómo hacerlo, en vídeo</h2>
        {embed ? (
          <div className="mx-auto max-w-xs aspect-[9/16] rounded-2xl overflow-hidden border border-slate-200 bg-black">
            <iframe src={embed} title="Cómo consultar el estado del expediente" className="w-full h-full" loading="lazy"
              allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          </div>
        ) : (
          <Card className="mx-auto max-w-xs aspect-[9/16] flex items-center justify-center text-center !bg-slate-100 border-dashed">
            <p className="text-sm text-slate-500 px-4">Vídeo explicativo próximamente.</p>
          </Card>
        )}
      </section>

      <h2 className="font-bold text-slate-900 mb-2">Enlaces oficiales</h2>
      <ul className="space-y-2">
        {ENLACES_OFICIALES.map((e) => (
          <li key={e.url}>
            <a href={e.url} target="_blank" rel="noopener noreferrer" className="block">
              <Card className="hover:border-blue-300 !p-3">
                <p className="flex items-center justify-between gap-2 font-bold text-sm text-blue-800">
                  {e.titulo} <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </p>
                <p className="text-xs text-slate-600 mt-0.5">{e.desc}</p>
              </Card>
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}
