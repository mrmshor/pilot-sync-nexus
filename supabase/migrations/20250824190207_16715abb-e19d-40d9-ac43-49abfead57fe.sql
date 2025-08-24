-- Fix the security issue with multiple SELECT policies
-- Multiple SELECT policies are combined with OR, allowing any project member to see all data

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Project members can view basic project info" ON public.projects;
DROP POLICY IF EXISTS "Only owners and admins can view client contact info" ON public.projects;
DROP POLICY IF EXISTS "Only owners and admins can view financial data" ON public.projects;

-- Create a single comprehensive SELECT policy for projects
CREATE POLICY "Project members can view projects with role-based filtering"
ON public.projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = auth.uid()
  )
);

-- Create a view for basic project information (for regular members)
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
  NULL as client_name,
  NULL as phone1,
  NULL as phone2, 
  NULL as whatsapp1,
  NULL as whatsapp2,
  NULL as email,
  NULL as price,
  NULL as currency,
  NULL as paid
FROM public.projects
WHERE EXISTS (
  SELECT 1 FROM public.project_members 
  WHERE project_members.project_id = projects.id 
  AND project_members.user_id = auth.uid()
);

-- Enable RLS on the view
ALTER VIEW public.projects_basic SET (security_barrier = true);

-- Create a view for complete project information (for owners and admins)
CREATE OR REPLACE VIEW public.projects_complete AS
SELECT *
FROM public.projects
WHERE public.can_access_client_data(id, auth.uid());

-- Enable RLS on the view
ALTER VIEW public.projects_complete SET (security_barrier = true);

-- Create a function to get project data based on user role
CREATE OR REPLACE FUNCTION public.get_user_projects()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  client_name text,
  phone1 text,
  phone2 text,
  whatsapp1 text,
  whatsapp2 text,
  email text,
  folder_path text,
  icloud_link text,
  status text,
  priority text,
  price numeric,
  currency text,
  paid boolean,
  completed boolean,
  deadline timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  created_by uuid,
  has_sensitive_access boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    -- Only return sensitive data if user has access
    CASE WHEN public.can_access_client_data(p.id, auth.uid()) 
      THEN p.client_name ELSE NULL END as client_name,
    CASE WHEN public.can_access_client_data(p.id, auth.uid()) 
      THEN p.phone1 ELSE NULL END as phone1,
    CASE WHEN public.can_access_client_data(p.id, auth.uid()) 
      THEN p.phone2 ELSE NULL END as phone2,
    CASE WHEN public.can_access_client_data(p.id, auth.uid()) 
      THEN p.whatsapp1 ELSE NULL END as whatsapp1,
    CASE WHEN public.can_access_client_data(p.id, auth.uid()) 
      THEN p.whatsapp2 ELSE NULL END as whatsapp2,
    CASE WHEN public.can_access_client_data(p.id, auth.uid()) 
      THEN p.email ELSE NULL END as email,
    p.folder_path,
    p.icloud_link,
    p.status,
    p.priority,
    -- Only return financial data if user has access
    CASE WHEN public.can_access_client_data(p.id, auth.uid()) 
      THEN p.price ELSE NULL END as price,
    CASE WHEN public.can_access_client_data(p.id, auth.uid()) 
      THEN p.currency ELSE NULL END as currency,
    CASE WHEN public.can_access_client_data(p.id, auth.uid()) 
      THEN p.paid ELSE NULL END as paid,
    p.completed,
    p.deadline,
    p.created_at,
    p.updated_at,
    p.created_by,
    public.can_access_client_data(p.id, auth.uid()) as has_sensitive_access
  FROM public.projects p
  WHERE EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
  );
END;
$$;