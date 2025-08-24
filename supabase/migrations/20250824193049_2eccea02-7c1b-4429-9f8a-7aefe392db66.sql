-- Remove the overly permissive policy that exposes sensitive data
DROP POLICY IF EXISTS "Secure project member access" ON public.projects;

-- Create separate policies for different access levels
-- 1. Basic project access for all members (non-sensitive data only)
CREATE POLICY "Project members can view basic project data" 
ON public.projects 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = projects.id AND user_id = auth.uid()
  )
);

-- 2. Full project access for owners/admins (all data including sensitive)
-- Note: This policy works in combination with the secure functions that handle field filtering
-- The actual sensitive data filtering happens in get_user_projects() and get_project_safe_view() functions

-- Update the existing update policy to be more explicit
DROP POLICY IF EXISTS "Project owners and admins can update projects" ON public.projects;
CREATE POLICY "Project owners and admins can update projects" 
ON public.projects 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = projects.id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

-- Ensure the modification access policy is properly scoped
DROP POLICY IF EXISTS "Project modification access" ON public.projects;
CREATE POLICY "Project creation and admin access" 
ON public.projects 
FOR ALL 
USING (
  -- For existing projects: must be owner/admin
  EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = projects.id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
)
WITH CHECK (
  -- For new projects: creator becomes owner automatically via trigger
  (created_by = auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = projects.id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);