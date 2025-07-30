// File System Access API Types
declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  }
}

interface FileSystemDirectoryHandle {
  name: string;
  kind: 'directory';
}

export interface TaskItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientName: string;
  phone1: string;
  phone2?: string;
  whatsapp1: string;
  whatsapp2?: string;
  email: string;
  folderPath?: string;
  icloudLink?: string;
  status: 'not-started' | 'in-progress' | 'in-review' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  price: number;
  currency: 'USD' | 'EUR' | 'ILS' | 'GBP' | 'CAD';
  paid: boolean;
  completed: boolean;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  tasks: ProjectTask[];
  subtasks?: TaskItem[];
}

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface QuickTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

// Enhanced Task interface (from your repo)
export interface Task {
  id: string;
  projectName: string;
  projectDescription: string;
  folderPath?: string;
  folderLink?: string;
  tasks: TaskItem[];
  clientName: string;
  clientPhone?: string;
  clientPhone2?: string;
  clientWhatsapp?: string;
  clientWhatsapp2?: string;
  clientEmail?: string;
  workStatus: WorkStatus;
  priority: Priority;
  price: number;
  currency: string;
  isPaid: boolean;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkStatus = 'not_started' | 'in_progress' | 'review' | 'completed' | 'on_hold';
export type Priority = 'low' | 'medium' | 'high';

export const WORK_STATUS_LABELS: Record<WorkStatus, string> = {
  not_started: 'לא התחיל',
  in_progress: 'בתהליך',
  review: 'בסקירה',
  completed: 'הושלם',
  on_hold: 'ממתין'
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'נמוכה',
  medium: 'בינונית',
  high: 'גבוהה'
};

export const CURRENCIES = ['USD', 'EUR', 'ILS', 'GBP', 'CAD'];