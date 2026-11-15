-- Calm Path: cuentas de usuario, check-ins emocionales, catálogo de actividades,
-- historial de sesiones, favoritos y una vista de progreso agregada.
-- Ninguna tabla aquí contiene datos de ejemplo.

-- =========================================================
-- 1. profiles — datos básicos del usuario autenticado
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

grant select, insert, update on public.profiles to authenticated;

create policy "profiles_select_own" on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- =========================================================
-- 2. check_ins — registros emocionales del check-in
-- =========================================================
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood text not null check (mood in ('anxious', 'stressed', 'overwhelmed', 'restless', 'low', 'calm')),
  energy text not null check (energy in ('low', 'steady', 'wired')),
  sleep_need text not null check (sleep_need in ('falling', 'waking', 'tired', 'none')),
  note text,
  created_at timestamptz not null default now()
);

create index check_ins_user_id_created_at_idx on public.check_ins (user_id, created_at desc);

alter table public.check_ins enable row level security;

grant select, insert, update, delete on public.check_ins to authenticated;

create policy "check_ins_select_own" on public.check_ins
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "check_ins_insert_own" on public.check_ins
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "check_ins_update_own" on public.check_ins
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "check_ins_delete_own" on public.check_ins
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- =========================================================
-- 3. wellness_activities — catálogo de actividades (lectura pública,
--    sin datos personales; no se insertan datos de ejemplo)
-- =========================================================
create table public.wellness_activities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('breathing', 'meditation', 'relaxation')),
  duration_minutes integer not null check (duration_minutes > 0),
  description text not null default '',
  guidance jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.wellness_activities enable row level security;

grant select on public.wellness_activities to anon, authenticated;

create policy "wellness_activities_public_read" on public.wellness_activities
  for select
  to anon, authenticated
  using (is_active = true);

-- =========================================================
-- 4. session_logs — historial de sesiones realizadas por el usuario
-- =========================================================
create table public.session_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id uuid references public.wellness_activities(id) on delete set null,
  activity_slug text not null,
  activity_title text not null,
  category text not null check (category in ('breathing', 'meditation', 'relaxation')),
  duration_seconds integer not null check (duration_seconds >= 0),
  completed boolean not null default true,
  started_at timestamptz,
  completed_at timestamptz not null default now()
);

create index session_logs_user_id_completed_at_idx on public.session_logs (user_id, completed_at desc);

alter table public.session_logs enable row level security;

grant select, insert, update, delete on public.session_logs to authenticated;

create policy "session_logs_select_own" on public.session_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "session_logs_insert_own" on public.session_logs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "session_logs_update_own" on public.session_logs
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "session_logs_delete_own" on public.session_logs
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- =========================================================
-- 5. favorites — rutinas/actividades marcadas como favoritas
-- =========================================================
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_slug text not null,
  activity_title text not null,
  category text not null check (category in ('breathing', 'meditation', 'relaxation')),
  created_at timestamptz not null default now(),
  unique (user_id, activity_slug)
);

create index favorites_user_id_idx on public.favorites (user_id);

alter table public.favorites enable row level security;

grant select, insert, update, delete on public.favorites to authenticated;

create policy "favorites_select_own" on public.favorites
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "favorites_insert_own" on public.favorites
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "favorites_update_own" on public.favorites
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "favorites_delete_own" on public.favorites
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- =========================================================
-- 6. user_progress — vista agregada de progreso (respeta RLS del usuario
--    que consulta gracias a security_invoker = true)
-- =========================================================
create view public.user_progress
with (security_invoker = true) as
select
  user_id,
  count(distinct date_trunc('day', completed_at))::integer as active_days,
  (coalesce(sum(duration_seconds), 0) / 60)::integer as minutes_practiced,
  count(*) filter (where completed)::integer as completed_sessions
from public.session_logs
group by user_id;

grant select on public.user_progress to authenticated;
