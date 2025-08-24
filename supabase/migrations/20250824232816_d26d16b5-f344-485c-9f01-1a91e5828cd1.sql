-- Remove RLS from all tables to allow public access

-- Disable RLS on projects table
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- Disable RLS on project_tasks table  
ALTER TABLE public.project_tasks DISABLE ROW LEVEL SECURITY;

-- Disable RLS on personal_tasks table
ALTER TABLE public.personal_tasks DISABLE ROW LEVEL SECURITY;

-- Disable RLS on project_members table
ALTER TABLE public.project_members DISABLE ROW LEVEL SECURITY;

-- Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies since we won't need them
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project members can view basic project info only" ON public.projects;
DROP POLICY IF EXISTS "Project owners and admins have full access" ON public.projects;
DROP POLICY IF EXISTS "Only project owners can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Creators can view their own projects" ON public.projects;

DROP POLICY IF EXISTS "Users can view tasks of projects they are members of" ON public.project_tasks;
DROP POLICY IF EXISTS "Project members can create tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Project members can update tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Project members can delete tasks" ON public.project_tasks;

DROP POLICY IF EXISTS "Users can read their own personal tasks" ON public.personal_tasks;
DROP POLICY IF EXISTS "Users can insert their own personal tasks" ON public.personal_tasks;
DROP POLICY IF EXISTS "Users can update their own personal tasks" ON public.personal_tasks;
DROP POLICY IF EXISTS "Users can delete their own personal tasks" ON public.personal_tasks;

DROP POLICY IF EXISTS "Users can view project members of projects they are members of" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can add members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can remove members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can update member roles" ON public.project_members;
DROP POLICY IF EXISTS "Bootstrap owner insert via trigger" ON public.project_members;

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles of users in shared projects" ON public.profiles;

-- Make user_id columns nullable since we won't have authentication
ALTER TABLE public.personal_tasks ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.projects ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.project_tasks ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.project_members ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.project_members ALTER COLUMN added_by DROP NOT NULL;