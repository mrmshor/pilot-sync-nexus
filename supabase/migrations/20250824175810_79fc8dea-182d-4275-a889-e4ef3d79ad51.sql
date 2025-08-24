-- Fix infinite recursion and security issues

-- Create security definer functions to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.is_project_member(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_id = p_project_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_project_role(p_project_id UUID, p_user_id UUID, p_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_id = p_project_id AND user_id = p_user_id AND role = ANY(p_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.shares_project_with(p_target_user_id UUID, p_current_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.project_members pm1 
    JOIN public.project_members pm2 ON pm1.project_id = pm2.project_id
    WHERE pm1.user_id = p_current_user_id AND pm2.user_id = p_target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Update existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', new.email),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.project_members (project_id, user_id, role, added_by)
  VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop and recreate project_members policies to fix infinite recursion
DROP POLICY IF EXISTS "Users can view project members of projects they are members of" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can add members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can remove members" ON public.project_members;

CREATE POLICY "Users can view project members of projects they are members of" ON public.project_members
  FOR SELECT USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Project owners and admins can add members" ON public.project_members
  FOR INSERT WITH CHECK (
    public.has_project_role(project_id, auth.uid(), ARRAY['owner', 'admin']) 
    AND added_by = auth.uid()
  );

CREATE POLICY "Project owners and admins can remove members" ON public.project_members
  FOR DELETE USING (public.has_project_role(project_id, auth.uid(), ARRAY['owner', 'admin']));

-- Fix the critical security issue: Update profiles policy to only show users who share projects
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view profiles of users in shared projects" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR public.shares_project_with(id, auth.uid())
  );