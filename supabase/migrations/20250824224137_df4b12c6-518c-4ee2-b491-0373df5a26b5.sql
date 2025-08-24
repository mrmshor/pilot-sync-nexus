-- Remove the problematic trigger temporarily to avoid conflicts
DROP TRIGGER IF EXISTS handle_new_project_trigger ON public.projects;

-- Create a better trigger that handles all edge cases
CREATE OR REPLACE FUNCTION public.handle_new_project_safe()
RETURNS TRIGGER AS $$
BEGIN
  -- Only add member if user is authenticated and not already a member
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.project_members (project_id, user_id, role, added_by)
    VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by)
    ON CONFLICT (project_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Create the new trigger
CREATE TRIGGER handle_new_project_safe_trigger
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_project_safe();