-- Ensure handle_new_project trigger is attached to projects
DROP TRIGGER IF EXISTS handle_new_project_trigger ON public.projects;
CREATE TRIGGER handle_new_project_trigger
AFTER INSERT ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.handle_new_project();

-- Realtime configuration for projects and project_tasks
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.project_tasks REPLICA IDENTITY FULL;

-- Add to realtime publication (ignore if already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'project_tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_tasks;
  END IF;
END $$;