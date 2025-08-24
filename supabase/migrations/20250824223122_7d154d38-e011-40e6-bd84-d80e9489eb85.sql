-- Allow creators to view their own projects even before membership bootstrap
CREATE POLICY IF NOT EXISTS "Creators can view their own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (created_by = auth.uid());