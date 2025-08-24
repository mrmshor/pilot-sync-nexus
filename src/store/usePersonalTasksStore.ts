import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PersonalTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'נמוכה' | 'בינונית' | 'גבוהה';
  createdAt: Date;
  updatedAt: Date;
}

interface PersonalTasksStore {
  tasks: PersonalTask[];
  addTask: (task: Omit<PersonalTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<PersonalTask>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
}

export const usePersonalTasksStore = create<PersonalTasksStore>()(
  persist(
    (set) => ({
      tasks: [
        {
          id: '1',
          title: 'לקרוא לספק חומרים',
          completed: false,
          priority: 'גבוהה',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'לעדכן מחירון',
          completed: true,
          priority: 'בינונית',
          createdAt: new Date('2024-01-18'),
          updatedAt: new Date(),
        },
        {
          id: '3',
          title: 'לתקן דואר אלקטרוני',
          completed: false,
          priority: 'נמוכה',
          createdAt: new Date('2024-01-22'),
          updatedAt: new Date(),
        },
      ],
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
      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, completed: !task.completed, updatedAt: new Date() }
              : task
          ),
        })),
    }),
    {
      name: 'personal-tasks-store',
    }
  )
);