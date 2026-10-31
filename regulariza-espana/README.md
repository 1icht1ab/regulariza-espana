# RegularizaEspaña

Comunidad de apoyo mutuo para quienes presentaron la Regularización Extraordinaria 2026.
Vite + React + Tailwind · Supabase (proyecto `carta-clara`, tablas con prefijo `re_`) · Vercel.

## Principio de privacidad
- Nadie escribe su NIE, NUSS, DNI, pasaporte, teléfono ni email: solo casillas “lo tengo / no lo tengo”.
- Todo texto libre (alias, nacionalidad, foro) pasa por `re_contains_pii()` como CHECK en la base de datos, y se repite la comprobación en el cliente (`src/lib/pii.js`).
- La fecha de ingreso es privada. La actividad pública muestra la entrega como mes/año.
- Las estadísticas solo aparecen con ≥10 casos (global o por provincia).
- 3 reportes distintos ocultan un mensaje automáticamente.
- “Borrar mi cuenta” elimina perfil, trámite, mensajes y likes (cascada desde `auth.users`).

## Páginas (rutas independientes)
`/` datos · `/mi-tramite` · `/requisitos` · `/foro` · `/foro/:id` · `/expediente` (enlaces oficiales + short) · `/privacidad` · `/entrar`

## Variables de entorno
Ver `.env.example`. `VITE_SHORT_URL` acepta una URL de YouTube Short; vacía = hueco reservado.

## Pendiente antes de lanzar
1. `src/pages/Privacidad.jsx`: completar RESPONSABLE y CONTACTO.
2. Supabase → Authentication → URL Configuration: Site URL = dominio de Vercel y añadirlo a Redirect URLs.
3. Supabase → Authentication → Emails: traducir las plantillas de confirmación al español.
4. Revisar el texto de Requisitos con un profesional.

## Migración / siguientes pasos
- v2: moderación con panel (rol admin) para revisar `re_reports` y restaurar contenido.
- v2: recuperar contraseña (`resetPasswordForEmail` + página `/nueva-clave`).
- v3: mover a un proyecto Supabase propio si crece (las tablas `re_*` se exportan tal cual con `supabase/migrations`).
