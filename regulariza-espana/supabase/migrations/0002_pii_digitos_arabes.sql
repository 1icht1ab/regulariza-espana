-- El filtro de datos personales también detecta números escritos con dígitos arábigo-índicos (٠-٩, ۰-۹)
create or replace function public.re_contains_pii(t text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  with n as (select translate(coalesce(t, ''), '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹', '01234567890123456789') as t)
  select
    n.t ~* '\m[xyz][\s.-]?\d{7}[\s.-]?[a-z]\M'
    or n.t ~* '\m\d{8}[\s.-]?[a-z]\M'
    or n.t ~ '\m\d{2}[\s/.-]?\d{8}[\s/.-]?\d{2}\M'
    or n.t ~* '\m[a-z]{1,3}\d{6,9}\M'
    or exists (
      select 1 from regexp_matches(n.t, '\+?\d[\d\s.-]{7,}\d', 'g') as m
      where char_length(regexp_replace(m[1], '\D', '', 'g')) >= 9
    )
    or n.t ~* '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}'
  from n;
$$;
