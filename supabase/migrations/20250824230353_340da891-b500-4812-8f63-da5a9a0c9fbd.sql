-- Add user_id column to personal_tasks table to associate tasks with users
ALTER TABLE public.personal_tasks 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing tasks to have a user_id (set to null for now, will need manual cleanup)
-- In production, you'd want to handle existing data more carefully

-- Drop existing RLS policies
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

-- Make user_id required for future inserts
ALTER TABLE public.personal_tasks 
ALTER COLUMN user_id SET NOT NULL;