-- Remove the problematic view that was flagged by the security linter
DROP VIEW IF EXISTS public.projects_basic_view;

-- The existing secure functions (get_user_projects and get_project_safe_view) 
-- already provide proper role-based filtering without security definer issues