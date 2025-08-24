import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'תכנון' | 'פעיל' | 'בהמתנה' | 'הושלם';
  priority: 'נמוכה' | 'בינונית' | 'גבוהה';
  createdAt: Date;
  updatedAt: Date;
}

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
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
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
          name: 'פיתוח אתר חברה',
          description: 'פיתוח אתר תדמית עסקי מתקדם',
          status: 'פעיל',
          priority: 'גבוהה',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'עיצוב לוגו',
          description: 'יצירת לוגו מקצועי וזהות חזותית',
          status: 'תכנון',
          priority: 'בינונית',
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date(),
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
    }),
    {
      name: 'project-store',
    }
  )
);