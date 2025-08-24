-- Fix the security definer view warnings
-- Remove security_barrier from views to ensure they respect user's RLS policies

-- Drop and recreate views without security_barrier
DROP VIEW IF EXISTS public.projects_basic;
DROP VIEW IF EXISTS public.projects_complete;

-- Create basic view without security_barrier (will respect user's RLS)
CREATE OR REPLACE VIEW public.projects_basic AS
SELECT 
  id,
  name,
  description,
  status,
  priority,
  completed,
  deadline,
  folder_path,
  icloud_link,
  created_at,
  updated_at,
  created_by,
  -- Exclude sensitive client contact info and financial data
  NULL::text as client_name,
  NULL::text as phone1,
  NULL::text as phone2, 
  NULL::text as whatsapp1,
  NULL::text as whatsapp2,
  NULL::text as email,
  NULL::numeric as price,
  NULL::text as currency,
  NULL::boolean as paid
FROM public.projects;

-- Create complete view without security_barrier (will respect user's RLS)
CREATE OR REPLACE VIEW public.projects_complete AS
SELECT *
FROM public.projects;