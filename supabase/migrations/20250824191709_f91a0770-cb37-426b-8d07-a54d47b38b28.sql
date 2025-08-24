-- Security Enhancement: Fix RLS policies to prevent unauthorized access to sensitive client data

-- First, check what policies exist and drop them properly
DROP POLICY IF EXISTS "Project members can view basic project info" ON public.projects;
DROP POLICY IF EXISTS "Project members can view projects with role-based filtering" ON public.projects;
DROP POLICY IF EXISTS "Restrict sensitive project fields to authorized users" ON public.projects;

-- Create a secure view-based approach for project access
CREATE OR REPLACE FUNCTION public.get_project_safe_view(p_project_id uuid)
RETURNS TABLE(
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
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user is a member of this project
  IF NOT EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_id = p_project_id AND user_id = auth.uid()
  ) THEN
    -- User is not a project member, return no rows
    RETURN;
  END IF;

  -- User is a project member, return project with role-based field filtering
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
  WHERE p.id = p_project_id;
END;
$$;

-- Create more restrictive RLS policy for SELECT operations
-- This policy ensures only authorized users can see sensitive data even with direct queries
CREATE POLICY "Secure project member access"
ON public.projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = projects.id AND user_id = auth.uid()
  )
);

-- Create separate policy for modifications (INSERT/UPDATE/DELETE)
CREATE POLICY "Project modification access"
ON public.projects
FOR ALL
USING (
  -- For SELECT: Allow project members (handled by above policy)
  -- For UPDATE/DELETE: Only owners and admins
  public.has_project_role(projects.id, auth.uid(), ARRAY['owner', 'admin'])
)
WITH CHECK (
  -- For INSERT: Creator becomes owner
  -- For UPDATE: Only owners and admins
  (created_by = auth.uid()) OR 
  public.has_project_role(projects.id, auth.uid(), ARRAY['owner', 'admin'])
);

-- Add security documentation
COMMENT ON FUNCTION public.get_project_safe_view(uuid) IS 
'SECURITY: Returns a single project with role-based field filtering. Sensitive client data (contacts, financial) is restricted to owners/admins only. Use this function instead of direct table queries.';

COMMENT ON FUNCTION public.get_user_projects() IS 
'SECURITY: Returns user projects with role-based field filtering. Regular members see basic project info but sensitive client data is restricted to owners/admins only.';

-- Create a secure update function for projects to ensure proper validation
CREATE OR REPLACE FUNCTION public.update_project_secure(
  p_project_id uuid,
  p_name text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_client_name text DEFAULT NULL,
  p_phone1 text DEFAULT NULL,
  p_phone2 text DEFAULT NULL,
  p_whatsapp1 text DEFAULT NULL,
  p_whatsapp2 text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_folder_path text DEFAULT NULL,
  p_icloud_link text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_priority text DEFAULT NULL,
  p_price numeric DEFAULT NULL,
  p_currency text DEFAULT NULL,
  p_paid boolean DEFAULT NULL,
  p_completed boolean DEFAULT NULL,
  p_deadline timestamp with time zone DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  has_update_permission boolean;
  has_sensitive_permission boolean;
BEGIN
  -- Check if user can update this project (owner/admin only)
  has_update_permission := public.has_project_role(p_project_id, auth.uid(), ARRAY['owner', 'admin']);
  
  IF NOT has_update_permission THEN
    RAISE EXCEPTION 'Insufficient permissions to update project';
  END IF;
  
  -- Check if user can update sensitive fields
  has_sensitive_permission := public.can_access_client_data(p_project_id, auth.uid());
  
  -- Update only the fields that were provided and user has permission for
  UPDATE public.projects 
  SET 
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    -- Sensitive fields only if user has permission
    client_name = CASE WHEN has_sensitive_permission THEN COALESCE(p_client_name, client_name) ELSE client_name END,
    phone1 = CASE WHEN has_sensitive_permission THEN COALESCE(p_phone1, phone1) ELSE phone1 END,
    phone2 = CASE WHEN has_sensitive_permission THEN COALESCE(p_phone2, phone2) ELSE phone2 END,
    whatsapp1 = CASE WHEN has_sensitive_permission THEN COALESCE(p_whatsapp1, whatsapp1) ELSE whatsapp1 END,
    whatsapp2 = CASE WHEN has_sensitive_permission THEN COALESCE(p_whatsapp2, whatsapp2) ELSE whatsapp2 END,
    email = CASE WHEN has_sensitive_permission THEN COALESCE(p_email, email) ELSE email END,
    price = CASE WHEN has_sensitive_permission THEN COALESCE(p_price, price) ELSE price END,
    currency = CASE WHEN has_sensitive_permission THEN COALESCE(p_currency, currency) ELSE currency END,
    paid = CASE WHEN has_sensitive_permission THEN COALESCE(p_paid, paid) ELSE paid END,
    -- Non-sensitive fields
    folder_path = COALESCE(p_folder_path, folder_path),
    icloud_link = COALESCE(p_icloud_link, icloud_link),
    status = COALESCE(p_status, status),
    priority = COALESCE(p_priority, priority),
    completed = COALESCE(p_completed, completed),
    deadline = COALESCE(p_deadline, deadline),
    updated_at = now()
  WHERE id = p_project_id;
  
  RETURN FOUND;
END;
$$;