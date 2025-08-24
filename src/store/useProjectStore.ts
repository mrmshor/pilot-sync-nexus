import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, ProjectTask } from '@/types';

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

interface ProjectStore {
  projects: Project[];
  tasks: Task[];
  refreshData: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'subtasks'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
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
      addProject: (projectData) =>
        set((state) => ({
          projects: [
            ...state.projects,
            {
              ...projectData,
              id: Date.now().toString(),
              createdAt: new Date(),
              updatedAt: new Date(),
              tasks: [],
              subtasks: []
            },
          ],
        })),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date() }
              : project
          ),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          tasks: state.tasks.filter((task) => task.projectId !== id),
        })),
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
      refreshData: async () => {
        // For now, just a placeholder since we're using local data
        // In the future, this will fetch from Supabase
        console.log('Refreshing data from store');
        return Promise.resolve();
      },
    }),
    {
      name: 'project-store',
    }
  )
);