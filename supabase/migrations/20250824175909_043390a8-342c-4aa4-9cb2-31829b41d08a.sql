-- Fix remaining security issues

-- Add UPDATE policy for project_members to allow role management
CREATE POLICY "Project owners and admins can update member roles" ON public.project_members
  FOR UPDATE USING (public.has_project_role(project_id, auth.uid(), ARRAY['owner', 'admin']));

-- Restrict access to sensitive client data - only owners and admins can see full client details
-- First, let's create a view for limited project access for regular members
CREATE OR REPLACE VIEW public.projects_limited AS
SELECT 
  id,
  name,
  description,
  status,
  priority,
  -- Hide sensitive client data from regular members
  CASE 
    WHEN public.has_project_role(id, auth.uid(), ARRAY['owner', 'admin']) THEN client_name
    ELSE 'Client Information Restricted'
  END as client_name,
  CASE 
    WHEN public.has_project_role(id, auth.uid(), ARRAY['owner', 'admin']) THEN phone1
    ELSE NULL
  END as phone1,
  CASE 
    WHEN public.has_project_role(id, auth.uid(), ARRAY['owner', 'admin']) THEN phone2
    ELSE NULL
  END as phone2,
  CASE 
    WHEN public.has_project_role(id, auth.uid(), ARRAY['owner', 'admin']) THEN whatsapp1
    ELSE NULL
  END as whatsapp1,
  CASE 
    WHEN public.has_project_role(id, auth.uid(), ARRAY['owner', 'admin']) THEN whatsapp2
    ELSE NULL
  END as whatsapp2,
  CASE 
    WHEN public.has_project_role(id, auth.uid(), ARRAY['owner', 'admin']) THEN email
    ELSE NULL
  END as email,
  folder_path,
  icloud_link,
  price,
  currency,
  paid,
  completed,
  deadline,
  created_by,
  created_at,
  updated_at
FROM public.projects
WHERE EXISTS (
  SELECT 1 FROM public.project_members 
  WHERE project_id = projects.id AND user_id = auth.uid()
);

-- Enable RLS on the view
ALTER VIEW public.projects_limited SET (security_barrier = true);

-- Grant access to the view
GRANT SELECT ON public.projects_limited TO authenticated;