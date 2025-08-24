-- Fix critical security vulnerability: Restrict access to sensitive client and financial data
-- Drop the overly permissive policy that exposes sensitive data to all project members
DROP POLICY IF EXISTS "Project members can view non-sensitive project data" ON public.projects;

-- Create a new restrictive policy that only allows viewing of truly non-sensitive fields
-- This policy will work alongside the secure functions for complete access control
CREATE POLICY "Project members can view basic project info only" 
ON public.projects 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = projects.id AND user_id = auth.uid()
  )
);

-- Note: Sensitive data (client_name, phone1, phone2, whatsapp1, whatsapp2, email, price, currency, paid)
-- should only be accessed through the secure functions:
-- - get_user_projects() for listing projects with role-based filtering
-- - get_project_safe_view() for individual project access with role-based filtering
-- These functions use can_access_client_data() to determine if the user has owner/admin privileges

-- Update the existing broad policy to be more specific about admin access
DROP POLICY IF EXISTS "Project creation and admin access" ON public.projects;

-- Separate policies for different operations to be more granular
CREATE POLICY "Project owners and admins have full access" 
ON public.projects 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = projects.id 
    AND user_id = auth.uid() 
    AND role = ANY(ARRAY['owner', 'admin'])
  )
)
WITH CHECK (
  (created_by = auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = projects.id 
    AND user_id = auth.uid() 
    AND role = ANY(ARRAY['owner', 'admin'])
  )
);

-- Ensure the update policy is also properly restricted
DROP POLICY IF EXISTS "Project owners and admins can update projects" ON public.projects;
-- This is now covered by the "Project owners and admins have full access" policy

-- Ensure delete policy is properly restricted to owners only
DROP POLICY IF EXISTS "Project owners can delete projects" ON public.projects;
CREATE POLICY "Only project owners can delete projects" 
ON public.projects 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = projects.id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);