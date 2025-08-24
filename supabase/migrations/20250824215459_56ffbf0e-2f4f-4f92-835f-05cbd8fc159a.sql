-- Create projects table with JSONB tasks for simple sync
create extension if not exists pgcrypto;

-- Helper function to auto-update updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  workspace_id text not null default 'default',
  name text not null,
  description text,
  client_name text,
  phone1 text,
  phone2 text,
  whatsapp1 text,
  whatsapp2 text,
  email text,
  folder_path text,
  icloud_link text,
  status text not null default 'not-started',
  priority text not null default 'medium',
  price numeric not null default 0,
  currency text not null default 'ILS',
  paid boolean not null default false,
  completed boolean not null default false,
  deadline timestamptz,
  tasks jsonb not null default '[]'::jsonb,
  subtasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_workspace on public.projects(workspace_id);
create index if not exists idx_projects_updated_at on public.projects(updated_at desc);

-- Enable RLS
alter table public.projects enable row level security;

-- RLS policies
create policy if not exists "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy if not exists "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Trigger to auto-update updated_at
create or replace trigger update_projects_updated_at
before update on public.projects
for each row execute function public.update_updated_at_column();

-- Realtime configuration
alter table public.projects replica identity full;
alter publication supabase_realtime add table public.projects;
