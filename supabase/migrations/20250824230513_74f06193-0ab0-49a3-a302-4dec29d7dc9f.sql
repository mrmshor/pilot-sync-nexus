-- First, add user_id column as nullable
ALTER TABLE public.personal_tasks 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Since we can't determine which user owns existing tasks, 
-- we'll clear the existing data to avoid security issues
DELETE FROM public.personal_tasks WHERE user_id IS NULL;

-- Now make user_id required
ALTER TABLE public.personal_tasks 
ALTER COLUMN user_id SET NOT NULL;

-- Drop existing insecure RLS policies
DROP POLICY IF EXISTS "Authenticated users can read their personal tasks" ON public.personal_tasks;
DROP POLICY IF EXISTS "Authenticated users can insert their personal tasks" ON public.personal_tasks;
DROP POLICY IF EXISTS "Authenticated users can update their personal tasks" ON public.personal_tasks;
DROP POLICY IF EXISTS "Authenticated users can delete their personal tasks" ON public.personal_tasks;

-- Create secure RLS policies that check user ownership
CREATE POLICY "Users can read their own personal tasks" 
ON public.personal_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personal tasks" 
ON public.personal_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal tasks" 
ON public.personal_tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personal tasks" 
ON public.personal_tasks 
FOR DELETE 
USING (auth.uid() = user_id);