import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, ProjectTask } from '@/types';
import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  title: string;
  projectId?: string;
  status: 'ממתין' | 'בעבודה' | 'הושלם';
  priority: 'נמוכה' | 'בינונית' | 'גבוהה';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Convert from Supabase format to app format
const convertFromSupabase = (data: any): Project => ({
  id: data.id,
  name: data.name,
  description: data.description || '',
  clientName: data.client_name || '',
  phone1: data.phone1 || '',
  phone2: data.phone2 || '',
  whatsapp1: data.whatsapp1 || '',
  whatsapp2: data.whatsapp2 || '',
  email: data.email || '',
  folderPath: data.folder_path || '',
  icloudLink: data.icloud_link || '',
  status: data.status as Project['status'],
  priority: data.priority as Project['priority'],
  price: data.price || 0,
  currency: data.currency as Project['currency'],
  paid: data.paid || false,
  completed: data.completed || false,
  deadline: data.deadline ? new Date(data.deadline) : undefined,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
  tasks: [], // Tasks are handled separately now
  subtasks: []
});

// Convert to Supabase format
const convertToSupabase = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'subtasks'>) => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  return {
    name: project.name,
    description: project.description,
    client_name: project.clientName,
    phone1: project.phone1,
    phone2: project.phone2,
    whatsapp1: project.whatsapp1,
    whatsapp2: project.whatsapp2,
    email: project.email,
    folder_path: project.folderPath,
    icloud_link: project.icloudLink,
    status: project.status,
    priority: project.priority,
    price: project.price,
    currency: project.currency,
    paid: project.paid,
    completed: project.completed,
    deadline: project.deadline?.toISOString(),
    created_by: user.id
  };
};

interface ProjectStore {
  projects: Project[];
  tasks: Task[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncError: string | null;
  refreshData: () => Promise<void>;
  initializeSupabase: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'subtasks'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  syncWithSupabase: () => Promise<void>;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [
        {
          id: '1',
          name: 'פיתוח אתר אינטרנט עסקי מתקדם',
          description: 'פיתוח אתר תדמית עסקי מתקדם עם מערכת ניהול תוכן ומערכת הזמנות מקוונת',
          clientName: 'אליעזר שפירא',
          phone1: '+972-54-628-2522',
          phone2: '',
          whatsapp1: '+972-54-628-2522',
          whatsapp2: '',
          email: 'eliezer@business.co.il',
          folderPath: '/Users/Projects/WebDev/Eliezer',
          icloudLink: 'https://icloud.com/project1',
          status: 'in-progress',
          priority: 'high',
          price: 15000,
          currency: 'ILS',
          paid: false,
          completed: false,
          deadline: new Date('2024-02-28'),
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date(),
          tasks: [
            { id: '1', title: 'לחזור בקרוב', completed: false, createdAt: new Date('2024-01-16') },
            { id: '2', title: 'לבצע עיצוב ראשוני', completed: true, createdAt: new Date('2024-01-20'), completedAt: new Date('2024-01-25') },
            { id: '3', title: 'להזמין חומר', completed: false, createdAt: new Date('2024-01-21') },
          ],
          subtasks: []
        },
        {
          id: '2',
          name: 'עיצוב לוגו וזהות חזותית',
          description: 'יצירת לוגו מקצועי וחבילת זהות חזותית מלאה כולל כרטיסי ביקור וניירת',
          clientName: 'אברהם קורן',
          phone1: '+972-50-123-4567',
          phone2: '',
          whatsapp1: '+972-50-123-4567',
          whatsapp2: '',
          email: 'avraham@company.com',
          folderPath: '',
          icloudLink: '',
          status: 'on-hold',
          priority: 'medium',
          price: 8000,
          currency: 'ILS',
          paid: false,
          completed: false,
          deadline: new Date('2024-02-10'),
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-15'),
          tasks: [],
          subtasks: []
        },
      ],
      tasks: [
        {
          id: '1',
          title: 'לחזור בקרוב לקוח',
          projectId: '1',
          status: 'בעבודה',
          priority: 'גבוהה',
          dueDate: new Date('2024-02-28'),
          createdAt: new Date('2024-01-16'),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'לבצע עיצוב ראשוני',
          projectId: '1',
          status: 'הושלם',
          priority: 'בינונית',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date(),
        },
        {
          id: '3',
          title: 'להזמין חומר',
          projectId: '1',
          status: 'ממתין',
          priority: 'נמוכה',
          createdAt: new Date('2024-01-21'),
          updatedAt: new Date(),
        },
      ],
      isLoading: false,
      isSyncing: false,
      lastSyncError: null,
      
      // Initialize Supabase connection and realtime sync
      initializeSupabase: async () => {
        set({ isLoading: true });
        try {
          await get().syncWithSupabase();
          
          // Set up realtime subscription for projects
          const projectsChannel = supabase
            .channel('projects-changes')
            .on('postgres_changes', 
              { event: '*', schema: 'public', table: 'projects' },
              async (payload) => {
                console.log('Projects realtime change:', payload);
                await get().syncWithSupabase();
              }
            )
            .subscribe();

          // Set up realtime subscription for project tasks
          const tasksChannel = supabase
            .channel('project-tasks-changes')
            .on('postgres_changes', 
              { event: '*', schema: 'public', table: 'project_tasks' },
              async (payload) => {
                console.log('Project tasks realtime change:', payload);
                await get().syncWithSupabase();
              }
            )
            .subscribe();

          set({ isLoading: false });
        } catch (error) {
          console.error('Failed to initialize Supabase:', error);
          set({ isLoading: false, lastSyncError: 'שגיאה בחיבור לשרת' });
        }
      },

      // Sync with Supabase - robust implementation
      syncWithSupabase: async () => {
        const currentState = get();
        if (currentState.isSyncing) {
          console.log('Sync already in progress, skipping...');
          return;
        }

        set({ isSyncing: true, lastSyncError: null });
        
        try {
          // Check authentication first
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.warn('Auth error during sync:', authError);
            set({ isSyncing: false, lastSyncError: null });
            return;
          }

          if (!user) {
            console.warn('No authenticated user, skipping sync');
            set({ isSyncing: false, lastSyncError: null });
            return;
          }

          // Fetch projects and tasks in parallel
          const [projectsRes, tasksRes] = await Promise.all([
            supabase
              .from('projects')
              .select('*')
              .order('created_at', { ascending: false }),
            supabase
              .from('project_tasks')
              .select('*')
              .order('created_at', { ascending: false })
          ]);

          const { data: projectsData, error: projectsError } = projectsRes;
          const { data: tasksData, error: tasksError } = tasksRes;

          if (projectsError) {
            console.error('Projects fetch error:', projectsError);
            // Don't clear projects on error - keep existing data
            set({ isSyncing: false, lastSyncError: 'שגיאה בטעינת פרויקטים' });
            return;
          }

          if (tasksError) {
            console.warn('Tasks fetch warning (will keep local tasks):', tasksError);
          }

          // Merge server projects with existing local tasks; if server has tasks use them, otherwise keep local
          const existingProjects = currentState.projects;
          const projects = (projectsData || []).map((projectData) => {
            const base = convertFromSupabase(projectData);
            const existing = existingProjects.find(p => p.id === base.id);

            // Start with existing local tasks to avoid wiping
            let mergedTasks = existing?.tasks ?? [];

            // If we successfully fetched tasks, prefer server tasks for this project when available
            if (tasksData) {
              const serverTasks = tasksData
                .filter((t: any) => t.project_id === base.id)
                .map((task: any) => ({
                  id: task.id,
                  title: task.title,
                  completed: task.completed ?? false,
                  createdAt: new Date(task.created_at),
                  completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
                }));
              if (serverTasks.length > 0) {
                mergedTasks = serverTasks;
              }
            }

            return { ...base, tasks: mergedTasks };
          });

          set({ projects, isSyncing: false, lastSyncError: null });
          console.log('Successfully synced projects:', projects.length);
          if (tasksData) {
            console.log('✅ Synced tasks from Supabase:', tasksData.length);
          }
          
        } catch (error) {
          console.error('Unexpected sync error:', error);
          // Preserve existing data on error
          set({ isSyncing: false, lastSyncError: 'שגיאה בסנכרון נתונים' });
        }
      },

      // Add new project - bulletproof implementation  
      addProject: async (projectData) => {
        const currentState = get();
        if (currentState.isSyncing) {
          throw new Error('פעולה אחרת בתהליך, נסה שוב בעוד מספר שניות');
        }

        set({ isSyncing: true, lastSyncError: null });
        
        try {
          // Verify user authentication
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          
          if (authError || !user) {
            throw new Error('יש להתחבר למערכת כדי ליצור פרויקט');
          }

          const supabaseData = await convertToSupabase(projectData);
          
          const { data, error } = await supabase
            .from('projects')
            .insert([supabaseData])
            .select()
            .single();

          if (error) {
            console.error('Supabase insert error:', error);
            throw new Error('שגיאה ביצירת פרויקט בשרת');
          }

          const newProject = convertFromSupabase(data);
          
          // Add to local state
          set((state) => ({
            projects: [newProject, ...state.projects],
            isSyncing: false,
            lastSyncError: null
          }));
          
          console.log('Project created successfully:', newProject.name);
          
        } catch (error) {
          console.error('Error adding project:', error);
          set({ isSyncing: false, lastSyncError: error.message || 'שגיאה ביצירת פרויקט' });
          throw error;
        }
      },

      // Update project with Supabase sync
      updateProject: async (id, updates) => {
        set({ isSyncing: true });
        try {
          const { error } = await supabase
            .from('projects')
            .update({
              name: updates.name,
              description: updates.description,
              client_name: updates.clientName,
              phone1: updates.phone1,
              phone2: updates.phone2,
              whatsapp1: updates.whatsapp1,
              whatsapp2: updates.whatsapp2,
              email: updates.email,
              folder_path: updates.folderPath,
              icloud_link: updates.icloudLink,
              status: updates.status,
              priority: updates.priority,
              price: updates.price,
              currency: updates.currency,
              paid: updates.paid,
              completed: updates.completed,
              deadline: updates.deadline?.toISOString()
            })
            .eq('id', id);

          if (error) throw error;

          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === id
                ? { ...project, ...updates, updatedAt: new Date() }
                : project
            ),
            isSyncing: false
          }));
          
          console.log('Project updated in Supabase');
        } catch (error) {
          console.error('Error updating project:', error);
          set({ isSyncing: false, lastSyncError: 'שגיאה בעדכון פרויקט' });
          // Update locally as fallback
          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === id
                ? { ...project, ...updates, updatedAt: new Date() }
                : project
            ),
          }));
        }
      },

      // Delete project with Supabase sync
      deleteProject: async (id) => {
        set({ isSyncing: true });
        try {
          const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set((state) => ({
            projects: state.projects.filter((project) => project.id !== id),
            tasks: state.tasks.filter((task) => task.projectId !== id),
            isSyncing: false
          }));
          
          console.log('Project deleted from Supabase');
        } catch (error) {
          console.error('Error deleting project:', error);
          set({ isSyncing: false, lastSyncError: 'שגיאה במחיקת פרויקט' });
          // Delete locally as fallback
          set((state) => ({
            projects: state.projects.filter((project) => project.id !== id),
            tasks: state.tasks.filter((task) => task.projectId !== id),
          }));
        }
      },

      // Keep legacy task methods for backward compatibility
      addTask: (taskData) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...taskData,
              id: Date.now().toString(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      // Enhanced refresh function
      refreshData: async () => {
        console.log('Refreshing data from Supabase...');
        await get().syncWithSupabase();
      },
    }),
    {
      name: 'project-store',
      partialize: (state) => ({ 
        projects: state.projects,
        tasks: state.tasks 
      }),
    }
  )
);