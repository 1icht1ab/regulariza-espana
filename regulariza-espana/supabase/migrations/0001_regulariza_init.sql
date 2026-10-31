-- RegularizaEspaña · esquema inicial
-- Todas las tablas usan el prefijo re_ porque comparten proyecto Supabase con carta-clara.
-- Principios:
--   * No se guarda NUNCA número de NIE, NUSS, DNI, pasaporte, teléfono ni email en contenido público.
--   * Los textos libres pasan por re_contains_pii() vía CHECK constraint (no se puede saltar desde el cliente).
--   * La fecha de ingreso nunca sale de la tabla: solo el propio usuario la ve.
--   * Las estadísticas públicas solo se muestran con un mínimo de casos (k-anonimato básico).

-- ---------------------------------------------------------------
-- 1. Detector de datos personales en texto libre
-- ---------------------------------------------------------------
create or replace function public.re_contains_pii(t text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    -- NIE: X/Y/Z + 7 dígitos + letra (con o sin guiones/espacios)
    t ~* '\m[xyz][\s.-]?\d{7}[\s.-]?[a-z]\M'
    -- DNI: 8 dígitos + letra
    or t ~* '\m\d{8}[\s.-]?[a-z]\M'
    -- NUSS: 12 dígitos (con separadores típicos 2/8/2)
    or t ~ '\m\d{2}[\s/.-]?\d{8}[\s/.-]?\d{2}\M'
    -- Pasaporte genérico: 1-3 letras + 6-9 dígitos
    or t ~* '\m[a-z]{1,3}\d{6,9}\M'
    -- Teléfonos o cualquier secuencia de 9+ dígitos (las fechas tipo 2026-04-16 tienen 8 y pasan)
    or exists (
      select 1 from regexp_matches(t, '\+?\d[\d\s.-]{7,}\d', 'g') as m
      where char_length(regexp_replace(m[1], '\D', '', 'g')) >= 9
    )
    -- Emails
    or t ~* '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}'
  , false);
$$;

-- ---------------------------------------------------------------
-- 2. Perfiles (solo alias + avatar, nada más)
-- ---------------------------------------------------------------
create table public.re_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  alias text not null unique
    check (alias ~ '^[A-Za-z0-9_]{3,20}$' and not public.re_contains_pii(alias)),
  avatar text not null default 'robot'
    check (avatar in ('robot','ninja','fox','astronaut','wizard')),
  adulto_confirmado boolean not null check (adulto_confirmado = true),
  consentimiento_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.re_profiles enable row level security;

create policy "perfiles visibles (alias y avatar)"
  on public.re_profiles for select using (true);
create policy "cada quien edita su perfil"
  on public.re_profiles for update
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Perfil creado al registrarse, solo para altas de esta app (el proyecto es compartido).
create or replace function public.re_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.raw_user_meta_data->>'app', '') = 'regulariza' then
    insert into public.re_profiles (id, alias, avatar, adulto_confirmado)
    values (
      new.id,
      new.raw_user_meta_data->>'alias',
      coalesce(new.raw_user_meta_data->>'avatar', 'robot'),
      coalesce((new.raw_user_meta_data->>'adulto')::boolean, false)
    );
  end if;
  return new;
end;
$$;

create trigger re_on_auth_user_created
  after insert on auth.users
  for each row execute function public.re_handle_new_user();

create or replace function public.re_alias_disponible(p_alias text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (select 1 from public.re_profiles where lower(alias) = lower(p_alias));
$$;

-- ---------------------------------------------------------------
-- 3. Seguimiento del trámite (privado; solo checkboxes, sin números)
-- ---------------------------------------------------------------
create table public.re_cases (
  user_id uuid primary key references public.re_profiles(id) on delete cascade,
  formulario text not null check (formulario in ('EX-32','EX-31','EX-25','Otro')),
  estado text not null check (estado in ('En espera','Requerimiento de documentación','Favorable','Denegado')),
  empadronamiento boolean not null default false,
  nie_recibido boolean not null default false,       -- solo "lo tengo / no lo tengo"
  nss_recibido boolean not null default false,       -- solo "lo tengo / no lo tengo"
  fecha_entrega date not null check (fecha_entrega between '2026-04-16' and '2026-06-30'),
  fecha_resolucion date check (fecha_resolucion is null or fecha_resolucion >= fecha_entrega),
  provincia text not null check (char_length(provincia) <= 40),
  con_abogado boolean not null default false,
  situacion text not null check (situacion in ('Trabajando','Con contrato de trabajo','Estudiando','Buscando empleo')),
  nacionalidad text not null check (char_length(nacionalidad) between 2 and 40 and not public.re_contains_pii(nacionalidad)),
  fecha_ingreso date check (fecha_ingreso is null or fecha_ingreso < '2026-01-01'),
  doc_pasaporte boolean not null default false,
  doc_antecedentes boolean not null default false,
  doc_permanencia boolean not null default false,
  doc_supuesto boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.re_cases enable row level security;

create policy "ver mi caso" on public.re_cases for select using ((select auth.uid()) = user_id);
create policy "crear mi caso" on public.re_cases for insert with check ((select auth.uid()) = user_id);
create policy "editar mi caso" on public.re_cases for update
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "borrar mi caso" on public.re_cases for delete using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------
-- 4. Foro
-- ---------------------------------------------------------------
create table public.re_threads (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.re_profiles(id) on delete cascade,
  categoria text not null check (categoria in ('Dudas sobre documentos','Experiencias por provincia','Abogados y trámites','Apoyo mutuo')),
  titulo text not null check (char_length(titulo) between 5 and 140 and not public.re_contains_pii(titulo)),
  contenido text not null check (char_length(contenido) between 10 and 4000 and not public.re_contains_pii(contenido)),
  -- foto del caso del autor al publicar (lo rellena el trigger, no el cliente)
  provincia text,
  estado_tramite text,
  oculto boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.re_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.re_threads(id) on delete cascade,
  author_id uuid not null references public.re_profiles(id) on delete cascade,
  texto text not null check (char_length(texto) between 2 and 2000 and not public.re_contains_pii(texto)),
  provincia text,
  estado_tramite text,
  oculto boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.re_likes (
  thread_id uuid not null references public.re_threads(id) on delete cascade,
  user_id uuid not null references public.re_profiles(id) on delete cascade,
  primary key (thread_id, user_id)
);

create table public.re_reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('thread','reply')),
  target_id uuid not null,
  reporter_id uuid not null references public.re_profiles(id) on delete cascade,
  motivo text not null check (motivo in ('Datos personales','Spam o publicidad','Información falsa','Ofensivo','Otro')),
  created_at timestamptz not null default now(),
  unique (target_type, target_id, reporter_id)
);

create index re_threads_created_idx on public.re_threads (created_at desc);
create index re_threads_author_idx on public.re_threads (author_id);
create index re_replies_thread_idx on public.re_replies (thread_id, created_at);
create index re_replies_author_idx on public.re_replies (author_id);
create index re_likes_user_idx on public.re_likes (user_id);
create index re_reports_reporter_idx on public.re_reports (reporter_id);
create index re_reports_target_idx on public.re_reports (target_type, target_id);

alter table public.re_threads enable row level security;
alter table public.re_replies enable row level security;
alter table public.re_likes enable row level security;
alter table public.re_reports enable row level security;

create policy "hilos visibles" on public.re_threads for select
  using (not oculto or (select auth.uid()) = author_id);
create policy "publicar hilo" on public.re_threads for insert
  with check ((select auth.uid()) = author_id);
create policy "borrar mi hilo" on public.re_threads for delete
  using ((select auth.uid()) = author_id);

create policy "respuestas visibles" on public.re_replies for select
  using (not oculto or (select auth.uid()) = author_id);
create policy "responder" on public.re_replies for insert
  with check ((select auth.uid()) = author_id);
create policy "borrar mi respuesta" on public.re_replies for delete
  using ((select auth.uid()) = author_id);

create policy "likes visibles" on public.re_likes for select using (true);
create policy "dar like" on public.re_likes for insert with check ((select auth.uid()) = user_id);
create policy "quitar like" on public.re_likes for delete using ((select auth.uid()) = user_id);

create policy "reportar" on public.re_reports for insert with check ((select auth.uid()) = reporter_id);

-- Rellena provincia/estado desde el caso del autor + límite anti-spam
create or replace function public.re_before_post()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  c record;
  recientes int;
begin
  select provincia, estado into c from public.re_cases where user_id = new.author_id;
  new.provincia := c.provincia;
  new.estado_tramite := c.estado;
  new.oculto := false;

  if tg_table_name = 're_threads' then
    select count(*) into recientes from public.re_threads
      where author_id = new.author_id and created_at > now() - interval '1 hour';
    if recientes >= 5 then
      raise exception 'Has publicado demasiados hilos en la última hora. Prueba más tarde.';
    end if;
  else
    select count(*) into recientes from public.re_replies
      where author_id = new.author_id and created_at > now() - interval '1 hour';
    if recientes >= 30 then
      raise exception 'Has publicado demasiadas respuestas en la última hora. Prueba más tarde.';
    end if;
  end if;
  return new;
end;
$$;

create trigger re_threads_before_insert before insert on public.re_threads
  for each row execute function public.re_before_post();
create trigger re_replies_before_insert before insert on public.re_replies
  for each row execute function public.re_before_post();

-- 3 reportes distintos ocultan el contenido automáticamente
create or replace function public.re_after_report()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  n int;
begin
  select count(*) into n from public.re_reports
    where target_type = new.target_type and target_id = new.target_id;
  if n >= 3 then
    if new.target_type = 'thread' then
      update public.re_threads set oculto = true where id = new.target_id;
    else
      update public.re_replies set oculto = true where id = new.target_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger re_reports_after_insert after insert on public.re_reports
  for each row execute function public.re_after_report();

-- ---------------------------------------------------------------
-- 5. Estadísticas públicas (agregadas, con umbral mínimo)
-- ---------------------------------------------------------------
create or replace function public.re_stats(p_provincia text default null)
returns json
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  minimo constant int := 10;
  total int;
  result json;
begin
  select count(*) into total from public.re_cases
    where p_provincia is null or provincia = p_provincia;

  if total < minimo then
    return json_build_object('total', total, 'minimo', minimo, 'suficiente', false);
  end if;

  select json_build_object(
    'total', total,
    'minimo', minimo,
    'suficiente', true,
    'favorable', round(100.0 * count(*) filter (where estado = 'Favorable') / total),
    'espera', round(100.0 * count(*) filter (where estado = 'En espera') / total),
    'requerimiento', round(100.0 * count(*) filter (where estado = 'Requerimiento de documentación') / total),
    'denegado', round(100.0 * count(*) filter (where estado = 'Denegado') / total),
    'ex32', round(100.0 * count(*) filter (where formulario = 'EX-32') / total),
    'ex31', round(100.0 * count(*) filter (where formulario = 'EX-31') / total),
    'ex25', round(100.0 * count(*) filter (where formulario = 'EX-25') / total),
    'padron', round(100.0 * count(*) filter (where empadronamiento) / total),
    'nie', round(100.0 * count(*) filter (where nie_recibido) / total),
    'nss', round(100.0 * count(*) filter (where nss_recibido) / total),
    'abogado', round(100.0 * count(*) filter (where con_abogado) / total),
    'resueltos', count(*) filter (where fecha_resolucion is not null),
    'espera_media_dias', round(avg(fecha_resolucion - fecha_entrega) filter (where fecha_resolucion is not null))
  ) into result
  from public.re_cases
  where p_provincia is null or provincia = p_provincia;

  return result;
end;
$$;

create or replace function public.re_stats_provincias()
returns table (provincia text, casos bigint, favorable numeric, espera_media_dias numeric)
language sql
stable
security definer
set search_path = ''
as $$
  select provincia,
         count(*) as casos,
         round(100.0 * count(*) filter (where estado = 'Favorable') / count(*)) as favorable,
         round(avg(fecha_resolucion - fecha_entrega) filter (where fecha_resolucion is not null)) as espera_media_dias
  from public.re_cases
  group by provincia
  having count(*) >= 10
  order by casos desc;
$$;

-- Actividad reciente: sin fecha de ingreso, entrega solo como mes/año
create or replace function public.re_casos_recientes(p_limit int default 10)
returns table (
  alias text, avatar text, estado text, formulario text, provincia text,
  nacionalidad text, mes_entrega text, empadronamiento boolean,
  nie_recibido boolean, nss_recibido boolean, con_abogado boolean, updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.alias, p.avatar, c.estado, c.formulario, c.provincia, c.nacionalidad,
         to_char(c.fecha_entrega, 'MM/YYYY'), c.empadronamiento, c.nie_recibido,
         c.nss_recibido, c.con_abogado, c.updated_at
  from public.re_cases c
  join public.re_profiles p on p.id = c.user_id
  order by c.updated_at desc
  limit least(greatest(p_limit, 1), 30);
$$;

-- ---------------------------------------------------------------
-- 6. Derecho de supresión: borrar cuenta y todo lo asociado
-- ---------------------------------------------------------------
create or replace function public.re_borrar_mi_cuenta()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;
  if not exists (select 1 from public.re_profiles where id = auth.uid()) then
    raise exception 'Esta cuenta no pertenece a RegularizaEspaña';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

-- Permisos de ejecución
revoke all on function public.re_borrar_mi_cuenta() from public, anon;
grant execute on function public.re_borrar_mi_cuenta() to authenticated;
revoke all on function public.re_handle_new_user() from public, anon, authenticated;
revoke all on function public.re_before_post() from public, anon, authenticated;
revoke all on function public.re_after_report() from public, anon, authenticated;
grant execute on function public.re_stats(text), public.re_stats_provincias(),
  public.re_casos_recientes(int), public.re_alias_disponible(text) to anon, authenticated;
