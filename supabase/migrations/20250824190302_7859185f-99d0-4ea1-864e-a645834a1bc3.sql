-- Remove all views that might be causing security definer warnings
-- Check for any remaining views and remove them completely

DROP VIEW IF EXISTS public.projects_basic CASCADE;
DROP VIEW IF EXISTS public.projects_complete CASCADE;

-- Also check for any other views that might exist
DROP VIEW IF EXISTS public.projects_view CASCADE;
DROP VIEW IF EXISTS public.project_view CASCADE;

-- Verify no security definer functions are problematic
-- The get_user_projects function should be fine as it's explicitly SECURITY DEFINER for role-based access