-- Wayfare — initial schema
-- Every table that stores user data has Row Level Security enabled with a
-- policy tied to auth.uid(). No table is readable/writable cross-user.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type goal_type as enum ('short_term', 'long_term');
create type goal_status as enum ('active', 'completed', 'archived');
create type milestone_status as enum ('pending', 'in_progress', 'completed');
create type task_priority as enum ('low', 'medium', 'high');
create type task_status as enum ('pending', 'completed', 'cancelled');
create type habit_status as enum ('active', 'archived');
create type note_link_type as enum ('goal', 'task', 'habit', 'event', 'date');
create type calendar_event_source as enum ('app', 'google');
create type calendar_event_status as enum ('confirmed', 'cancelled');
create type focus_session_type as enum ('focus', 'short_break', 'long_break');
create type focus_session_status as enum ('running', 'paused', 'completed', 'cancelled');
create type subscription_plan as enum ('free', 'premium');
create type subscription_status as enum ('active', 'trialing', 'past_due', 'canceled', 'none');
create type environment_scene as enum ('beach', 'space', 'rainforest', 'city', 'fields');
create type environment_time_mode as enum ('auto', 'always_day', 'always_night');
create type notification_type as enum
  ('task_reminder', 'habit_reminder', 'goal_reminder', 'calendar_reminder', 'focus_complete', 'system');
create type quote_frequency as enum ('every_open', 'daily', 'never');
create type theme_preference as enum ('light', 'dark', 'system');
create type calendar_integration_provider as enum ('google');

-- ---------------------------------------------------------------------------
-- profiles — one row per auth user
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "profiles_select_own" on profiles for select using (id = auth.uid());
create policy "profiles_update_own" on profiles for update using (id = auth.uid());
create policy "profiles_insert_own" on profiles for insert with check (id = auth.uid());

-- Auto-create a profile row when a new auth user signs up.
create function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name, timezone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', coalesce(new.raw_user_meta_data ->> 'timezone', 'UTC'));
  insert into public.user_settings (user_id) values (new.id);
  insert into public.environment_preferences (user_id) values (new.id);
  insert into public.subscriptions (user_id, plan, status) values (new.id, 'free', 'none');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- user_settings
-- ---------------------------------------------------------------------------
create table user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme theme_preference not null default 'system',
  reduced_motion boolean not null default false,
  quiet_hours_start time,
  quiet_hours_end time,
  quote_frequency quote_frequency not null default 'every_open',
  show_quotes_on_home boolean not null default true
);
alter table user_settings enable row level security;
create policy "user_settings_owner" on user_settings for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- environment_preferences
-- ---------------------------------------------------------------------------
create table environment_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  scene environment_scene not null default 'fields',
  time_mode environment_time_mode not null default 'auto'
);
alter table environment_preferences enable row level security;
create policy "environment_preferences_owner" on environment_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- categories — user rows + shared defaults (user_id null, readable by all)
-- ---------------------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#8C8C8C',
  is_default boolean not null default false
);
alter table categories enable row level security;
create policy "categories_select" on categories for select using (user_id = auth.uid() or user_id is null);
create policy "categories_insert_own" on categories for insert with check (user_id = auth.uid());
create policy "categories_update_own" on categories for update using (user_id = auth.uid());
create policy "categories_delete_own" on categories for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- goals (self-referential for nesting) + milestones
-- ---------------------------------------------------------------------------
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_goal_id uuid references goals(id) on delete cascade,
  title text not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  type goal_type not null default 'short_term',
  start_date date,
  target_date date,
  progress_override numeric(5,2) check (progress_override is null or (progress_override >= 0 and progress_override <= 100)),
  status goal_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index goals_user_id_idx on goals(user_id);
create index goals_parent_goal_id_idx on goals(parent_goal_id);
alter table goals enable row level security;
create policy "goals_owner" on goals for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references goals(id) on delete cascade,
  title text not null,
  description text,
  weight numeric(6,2) not null default 1 check (weight > 0),
  status milestone_status not null default 'pending',
  target_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index milestones_goal_id_idx on milestones(goal_id);
alter table milestones enable row level security;
create policy "milestones_owner" on milestones for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  due_time time,
  priority task_priority not null default 'medium',
  category_id uuid references categories(id) on delete set null,
  goal_id uuid references goals(id) on delete set null,
  milestone_id uuid references milestones(id) on delete set null,
  estimated_duration_minutes integer,
  status task_status not null default 'pending',
  completed_at timestamptz,
  recurrence_rule jsonb,
  parent_task_id uuid references tasks(id) on delete set null,
  reminder_at timestamptz,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_user_id_due_date_idx on tasks(user_id, due_date);
create index tasks_goal_id_idx on tasks(goal_id);
create index tasks_milestone_id_idx on tasks(milestone_id);
alter table tasks enable row level security;
create policy "tasks_owner" on tasks for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- habits + completions
-- ---------------------------------------------------------------------------
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category_id uuid references categories(id) on delete set null,
  frequency jsonb not null default '{"type":"daily"}',
  target_streak integer,
  start_date date not null default current_date,
  reminder_at time,
  status habit_status not null default 'active',
  created_at timestamptz not null default now()
);
alter table habits enable row level security;
create policy "habits_owner" on habits for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_date)
);
create index habit_completions_habit_id_idx on habit_completions(habit_id);
alter table habit_completions enable row level security;
create policy "habit_completions_owner" on habit_completions for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- notes + links
-- Locked notes: content for a locked note is stored only in
-- `locked_content_encrypted` (via pgsodium/Supabase Vault, encrypted with a
-- per-user key derived server-side), never in the plaintext `content` column.
-- The API refuses to return locked_content_encrypted without a fresh
-- reauthentication check — see docs/SECURITY.md.
-- ---------------------------------------------------------------------------
create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content jsonb,
  locked_content_encrypted bytea,
  color text,
  tags text[] not null default '{}',
  is_pinned boolean not null default false,
  is_archived boolean not null default false,
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notes_locked_content_xor check (
    (is_locked and content is null and locked_content_encrypted is not null)
    or (not is_locked and content is not null and locked_content_encrypted is null)
  )
);
create index notes_user_id_idx on notes(user_id);
create index notes_tags_idx on notes using gin(tags);
alter table notes enable row level security;
create policy "notes_owner" on notes for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table note_links (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  linked_type note_link_type not null,
  linked_id uuid,
  linked_date date
);
create index note_links_note_id_idx on note_links(note_id);
create index note_links_linked_id_idx on note_links(linked_id);
alter table note_links enable row level security;
create policy "note_links_owner" on note_links for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- calendar integrations + events
-- OAuth tokens are stored encrypted via Supabase Vault (pgsodium); only
-- server-side (service-role) code can decrypt them — see docs/GOOGLE_CALENDAR.md.
-- ---------------------------------------------------------------------------
create table calendar_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider calendar_integration_provider not null default 'google',
  access_token_encrypted bytea,
  refresh_token_encrypted bytea,
  token_expires_at timestamptz,
  google_calendar_id text,
  last_synced_at timestamptz,
  sync_status text not null default 'connected',
  created_at timestamptz not null default now(),
  unique (user_id, provider)
);
alter table calendar_integrations enable row level security;
create policy "calendar_integrations_owner" on calendar_integrations for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  location text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  all_day boolean not null default false,
  source calendar_event_source not null default 'app',
  google_event_id text,
  google_etag text,
  calendar_integration_id uuid references calendar_integrations(id) on delete set null,
  task_id uuid references tasks(id) on delete set null,
  goal_id uuid references goals(id) on delete set null,
  status calendar_event_status not null default 'confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, google_event_id)
);
create index calendar_events_user_id_start_at_idx on calendar_events(user_id, start_at);
alter table calendar_events enable row level security;
create policy "calendar_events_owner" on calendar_events for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- focus_sessions — timestamp-derived, never trusts a running client interval
-- ---------------------------------------------------------------------------
create table focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_type focus_session_type not null default 'focus',
  started_at timestamptz not null default now(),
  expected_end_at timestamptz not null,
  ended_at timestamptz,
  paused_at timestamptz,
  accumulated_pause_seconds integer not null default 0,
  status focus_session_status not null default 'running',
  task_id uuid references tasks(id) on delete set null,
  goal_id uuid references goals(id) on delete set null,
  session_number integer not null default 1,
  created_at timestamptz not null default now()
);
create index focus_sessions_user_id_idx on focus_sessions(user_id);
alter table focus_sessions enable row level security;
create policy "focus_sessions_owner" on focus_sessions for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- daily_plans
-- ---------------------------------------------------------------------------
create table daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_date date not null,
  priorities text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, plan_date)
);
alter table daily_plans enable row level security;
create policy "daily_plans_owner" on daily_plans for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- quotes (global defaults) + user_quotes (per-user favorites)
-- ---------------------------------------------------------------------------
create table quotes (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  author text,
  is_default boolean not null default true
);
alter table quotes enable row level security;
create policy "quotes_select_all" on quotes for select using (true);

create table user_quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  author text,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
alter table user_quotes enable row level security;
create policy "user_quotes_owner" on user_quotes for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- productivity_guides — global content, admin-managed
-- ---------------------------------------------------------------------------
create table productivity_guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  body jsonb not null,
  category text not null default 'general',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table productivity_guides enable row level security;
create policy "productivity_guides_select_all" on productivity_guides for select using (true);

-- ---------------------------------------------------------------------------
-- notifications + notification_preferences
-- ---------------------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text not null,
  related_type text,
  related_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_id_created_at_idx on notifications(user_id, created_at desc);
alter table notifications enable row level security;
create policy "notifications_owner" on notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  task_reminders boolean not null default true,
  habit_reminders boolean not null default true,
  goal_reminders boolean not null default true,
  calendar_reminders boolean not null default true,
  focus_complete boolean not null default true,
  web_push_enabled boolean not null default false,
  web_push_subscription jsonb
);
alter table notification_preferences enable row level security;
create policy "notification_preferences_owner" on notification_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- subscriptions + feature_flags
-- ---------------------------------------------------------------------------
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan subscription_plan not null default 'free',
  status subscription_status not null default 'none',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
alter table subscriptions enable row level security;
create policy "subscriptions_select_own" on subscriptions for select using (user_id = auth.uid());
-- Inserts/updates to subscriptions happen only via the Stripe webhook using
-- the service role key, so no client-facing write policy is defined here.

create table feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  enabled boolean not null default true,
  description text,
  rollout jsonb
);
alter table feature_flags enable row level security;
create policy "feature_flags_select_all" on feature_flags for select using (true);

-- ---------------------------------------------------------------------------
-- audit_events — sensitive-action trail (account deletion, export, billing)
-- ---------------------------------------------------------------------------
create table audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);
alter table audit_events enable row level security;
create policy "audit_events_select_own" on audit_events for select using (user_id = auth.uid());
-- Writes happen only via server-side code using the service role key.

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger goals_set_updated_at before update on goals for each row execute function set_updated_at();
create trigger tasks_set_updated_at before update on tasks for each row execute function set_updated_at();
create trigger notes_set_updated_at before update on notes for each row execute function set_updated_at();
create trigger calendar_events_set_updated_at before update on calendar_events for each row execute function set_updated_at();
create trigger subscriptions_set_updated_at before update on subscriptions for each row execute function set_updated_at();

-- Trigger must be created after all tables it inserts into exist.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- fn_goal_progress — mirrors packages/utils/src/progress.ts exactly.
-- Recomputes weighted progress from child goals + milestones on demand.
-- ---------------------------------------------------------------------------
create function fn_goal_progress(p_goal_id uuid) returns numeric as $$
declare
  v_override numeric;
  v_total_weight numeric := 0;
  v_weighted_sum numeric := 0;
  v_direct_ratio numeric;
begin
  select progress_override into v_override from goals where id = p_goal_id;
  if v_override is not null then
    return v_override;
  end if;

  select
    coalesce(sum(weight), 0),
    coalesce(sum(weight * case status when 'completed' then 100 when 'in_progress' then 50 else 0 end), 0)
  into v_total_weight, v_weighted_sum
  from milestones where goal_id = p_goal_id;

  select
    v_total_weight + coalesce(sum(1), 0),
    v_weighted_sum + coalesce(sum(fn_goal_progress(id)), 0)
  into v_total_weight, v_weighted_sum
  from goals where parent_goal_id = p_goal_id;

  if v_total_weight > 0 then
    return round(v_weighted_sum / v_total_weight, 2);
  end if;

  select
    case when count(*) = 0 then null
    else round(100.0 * count(*) filter (where status = 'completed') / count(*), 2) end
  into v_direct_ratio
  from tasks where goal_id = p_goal_id and milestone_id is null;

  return coalesce(v_direct_ratio, 0);
end;
$$ language plpgsql stable;
