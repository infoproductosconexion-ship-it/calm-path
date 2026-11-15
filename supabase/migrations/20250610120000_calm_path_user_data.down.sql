-- Rollback de 20250610120000_calm_path_user_data.sql
-- Las tablas se renombran (nunca se eliminan) para conservar los datos existentes.

drop view if exists public.user_progress;

alter table public.favorites rename to favorites_rollback_20250610120000;
alter table public.session_logs rename to session_logs_rollback_20250610120000;
alter table public.wellness_activities rename to wellness_activities_rollback_20250610120000;
alter table public.check_ins rename to check_ins_rollback_20250610120000;
alter table public.profiles rename to profiles_rollback_20250610120000;
