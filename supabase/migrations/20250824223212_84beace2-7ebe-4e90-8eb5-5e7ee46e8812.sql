-- Drop and recreate the creator view policy without IF NOT EXISTS
DROP POLICY IF EXISTS "Creators can view their own projects" ON public.projects;
CREATE POLICY "Creators can view their own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (created_by = auth.uid());