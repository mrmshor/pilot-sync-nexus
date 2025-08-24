-- Fix RLS policies for personal_tasks to require authentication
DROP POLICY IF EXISTS "Anyone can read personal tasks" ON public.personal_tasks;
DROP POLICY IF EXISTS "Anyone can insert personal tasks" ON public.personal_tasks;
DROP POLICY IF EXISTS "Anyone can update personal tasks" ON public.personal_tasks;
DROP POLICY IF EXISTS "Anyone can delete personal tasks" ON public.personal_tasks;

-- Create secure policies for personal_tasks that require authentication
CREATE POLICY "Authenticated users can read their personal tasks"
ON public.personal_tasks
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert their personal tasks"
ON public.personal_tasks
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their personal tasks"
ON public.personal_tasks
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their personal tasks"
ON public.personal_tasks
FOR DELETE
USING (auth.role() = 'authenticated');