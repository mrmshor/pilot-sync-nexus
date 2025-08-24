-- Create trigger to add project creator as owner when new project is created
CREATE OR REPLACE TRIGGER handle_new_project_trigger
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_project();

-- Also ensure the function exists and is correct
CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.project_members (project_id, user_id, role, added_by)
  VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';