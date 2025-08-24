-- Create table for cross-device synced personal tasks
create table if not exists public.personal_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  completed boolean not null default false,
  priority text not null default 'בינונית',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  workspace_id text not null default 'default'
);

-- Enable Row Level Security
alter table public.personal_tasks enable row level security;

-- Reset policies (idempotent)
drop policy if exists "Anyone can read personal tasks" on public.personal_tasks;
drop policy if exists "Anyone can insert personal tasks" on public.personal_tasks;
drop policy if exists "Anyone can update personal tasks" on public.personal_tasks;
drop policy if exists "Anyone can delete personal tasks" on public.personal_tasks;

-- Permissive policies (public demo). NOTE: Replace with proper auth later.
create policy "Anyone can read personal tasks"
  on public.personal_tasks
  for select
  using (true);

create policy "Anyone can insert personal tasks"
  on public.personal_tasks
  for insert
  with check (true);

create policy "Anyone can update personal tasks"
  on public.personal_tasks
  for update
  using (true);

create policy "Anyone can delete personal tasks"
  on public.personal_tasks
  for delete
  using (true);

-- Trigger function to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach trigger (recreate idempotently)
drop trigger if exists set_personal_tasks_updated_at on public.personal_tasks;
create trigger set_personal_tasks_updated_at
before update on public.personal_tasks
for each row execute function public.set_updated_at();

-- Realtime configuration
alter table public.personal_tasks replica identity full;
-- Add table to realtime publication
alter publication supabase_realtime add table if not exists public.personal_tasks;

-- Index for workspace queries
create index if not exists idx_personal_tasks_workspace on public.personal_tasks (workspace_id);
