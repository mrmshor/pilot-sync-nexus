-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  client_name TEXT,
  phone1 TEXT,
  phone2 TEXT,
  whatsapp1 TEXT,
  whatsapp2 TEXT,
  email TEXT,
  folder_path TEXT,
  icloud_link TEXT,
  status TEXT NOT NULL DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'in-review', 'completed', 'on-hold')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'ILS' CHECK (currency IN ('USD', 'EUR', 'ILS', 'GBP', 'CAD')),
  paid BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  deadline TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project tasks table
CREATE TABLE public.project_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project members table for sharing
CREATE TABLE public.project_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  added_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view projects they are members of" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Project owners and admins can update projects" ON public.projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Project owners can delete projects" ON public.projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_id = projects.id AND user_id = auth.uid() AND role = 'owner'
    )
  );

-- RLS Policies for project_tasks
CREATE POLICY "Users can view tasks of projects they are members of" ON public.project_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_id = project_tasks.project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can create tasks" ON public.project_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_id = project_tasks.project_id AND user_id = auth.uid()
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Project members can update tasks" ON public.project_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_id = project_tasks.project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can delete tasks" ON public.project_tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_id = project_tasks.project_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for project_members
CREATE POLICY "Users can view project members of projects they are members of" ON public.project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners and admins can add members" ON public.project_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_id = project_members.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
    ) AND added_by = auth.uid()
  );

CREATE POLICY "Project owners and admins can remove members" ON public.project_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Create function to handle new user signup
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to automatically add creator as project owner
CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.project_members (project_id, user_id, role, added_by)
  VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new projects
CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_project();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;