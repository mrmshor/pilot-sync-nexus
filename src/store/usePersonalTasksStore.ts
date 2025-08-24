import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PersonalTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'נמוכה' | 'בינונית' | 'גבוהה';
  createdAt: Date;
  updatedAt: Date;
  completed_at?: Date;
  user_id: string | null;
}

interface PersonalTasksStore {
  tasks: PersonalTask[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncError: string | null;
  initializeSupabase: () => Promise<void>;
  addTask: (task: Omit<PersonalTask, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<PersonalTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  syncWithSupabase: () => Promise<void>;
}

const convertSupabaseTask = (task: any): PersonalTask => ({
  id: task.id,
  title: task.title,
  completed: task.completed,
  priority: task.priority,
  createdAt: new Date(task.created_at),
  updatedAt: new Date(task.updated_at),
  completed_at: task.completed_at ? new Date(task.completed_at) : undefined,
  user_id: task.user_id,
});

const convertToSupabaseTask = (task: PersonalTask) => ({
  id: task.id,
  title: task.title,
  completed: task.completed,
  priority: task.priority,
  created_at: task.createdAt.toISOString(),
  updated_at: task.updatedAt.toISOString(),
  completed_at: task.completed_at?.toISOString() || null,
  workspace_id: 'default',
  user_id: task.user_id
});

export const usePersonalTasksStore = create<PersonalTasksStore>()(
  persist(
    (set, get) => ({
      tasks: [
        // Start with empty tasks - they'll be loaded from Supabase when authenticated
      ],
      isLoading: false,
      isSyncing: false,
      lastSyncError: null,

      initializeSupabase: async () => {
        set({ isLoading: true });
        try {
          await get().syncWithSupabase();
          
          // Set up realtime subscription
          const channel = supabase
            .channel('personal-tasks-changes')
            .on('postgres_changes', 
              { event: '*', schema: 'public', table: 'personal_tasks' },
              (payload) => {
                console.log('Real-time update:', payload);
                // Refresh data on any changes
                get().syncWithSupabase();
              }
            )
            .subscribe();

          // Store channel reference for cleanup (optional)
          (window as any).supabaseChannel = channel;
        } catch (error) {
          console.error('Supabase initialization failed:', error);
          set({ lastSyncError: 'Failed to connect to sync service' });
        } finally {
          set({ isLoading: false });
        }
      },

      syncWithSupabase: async () => {
        set({ isSyncing: true, lastSyncError: null });
        try {
          const { data, error } = await supabase
            .from('personal_tasks')
            .select('*')
            .eq('workspace_id', 'default')
            .order('created_at', { ascending: false });

          if (error) throw error;
          
          const supabaseTasks = (data || []).map(convertSupabaseTask);
          set({ tasks: supabaseTasks, lastSyncError: null });
          console.log('✅ Synced tasks from Supabase:', supabaseTasks.length);
        } catch (error) {
          console.error('❌ Sync failed:', error);
          set({ lastSyncError: 'Sync failed - using local data' });
        } finally {
          set({ isSyncing: false });
        }
      },

      addTask: async (taskData) => {
        const newTask: PersonalTask = {
          ...taskData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          user_id: null, // No authentication needed
        };

        // Optimistic update
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));

        try {
          const { error } = await supabase
            .from('personal_tasks')
            .insert([convertToSupabaseTask(newTask)]);

          if (error) throw error;
          console.log('✅ Task added to Supabase');
        } catch (error) {
          console.error('❌ Failed to add task to Supabase:', error);
          // Rollback on error
          set((state) => ({
            tasks: state.tasks.filter(t => t.id !== newTask.id),
            lastSyncError: 'Failed to save task'
          }));
        }
      },

      updateTask: async (id, updates) => {
        const updatedTask = { ...updates, updatedAt: new Date() };

        // Optimistic update
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updatedTask } : task
          ),
        }));

        try {
          const { error } = await supabase
            .from('personal_tasks')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
              completed_at: updates.completed !== undefined 
                ? (updates.completed ? new Date().toISOString() : null)
                : undefined
            })
            .eq('id', id);

          if (error) throw error;
          console.log('✅ Task updated in Supabase');
        } catch (error) {
          console.error('❌ Failed to update task in Supabase:', error);
          set({ lastSyncError: 'Failed to update task' });
          // Refresh from server to restore consistency
          get().syncWithSupabase();
        }
      },

      deleteTask: async (id) => {
        // Optimistic update
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));

        try {
          const { error } = await supabase
            .from('personal_tasks')
            .delete()
            .eq('id', id);

          if (error) throw error;
          console.log('✅ Task deleted from Supabase');
        } catch (error) {
          console.error('❌ Failed to delete task from Supabase:', error);
          set({ lastSyncError: 'Failed to delete task' });
          // Refresh from server to restore consistency
          get().syncWithSupabase();
        }
      },

      toggleTask: async (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (task) {
          await get().updateTask(id, { 
            completed: !task.completed,
            completed_at: !task.completed ? new Date() : undefined
          });
        }
      },
    }),
    {
      name: 'personal-tasks-store',
      // Only persist basic state, not loading states
      partialize: (state) => ({ 
        tasks: state.tasks
      }),
    }
  )
);