-- Create bootstrap insert policy for project_members (drop if exists due to no IF NOT EXISTS support)
DROP POLICY IF EXISTS "Bootstrap owner insert via trigger" ON public.project_members;
CREATE POLICY "Bootstrap owner insert via trigger"
ON public.project_members
FOR INSERT
TO public
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
  AND role = 'owner'
  AND added_by = auth.uid()
);

-- Backfill missing owner memberships for existing projects
INSERT INTO public.project_members (project_id, user_id, role, added_by)
SELECT p.id, p.created_by, 'owner', p.created_by
FROM public.projects p
WHERE p.created_by IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = p.id AND pm.user_id = p.created_by
  );