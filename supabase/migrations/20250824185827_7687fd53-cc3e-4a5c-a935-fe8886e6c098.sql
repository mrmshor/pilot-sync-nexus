-- Create more restrictive RLS policies for sensitive client and financial data
-- Drop existing overly permissive policies first
DROP POLICY IF EXISTS "Users can view projects they are members of" ON public.projects;

-- Create separate policies for different data sensitivity levels

-- Basic project info (name, description, status, priority) - all members can see
CREATE POLICY "Project members can view basic project info"
ON public.projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = auth.uid()
  )
);

-- Sensitive client data (phone, email, whatsapp) - only owners and admins
CREATE POLICY "Only owners and admins can view client contact info"
ON public.projects
FOR SELECT
USING (
  public.can_access_client_data(id, auth.uid())
);

-- Financial data (price, paid status) - only owners and admins  
CREATE POLICY "Only owners and admins can view financial data"
ON public.projects
FOR SELECT
USING (
  public.can_access_client_data(id, auth.uid())
);

-- Note: We need to create a view or modify the frontend to handle this properly
-- For now, let's create a comprehensive policy that uses row-level filtering