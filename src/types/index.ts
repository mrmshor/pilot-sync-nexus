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
  status: 'not-started' | 'in-progress' | 'in-review' | 'completed' | 'on-hold' | 'waiting';
  priority: 'low' | 'medium' | 'high';
  price: number;
  currency: 'USD' | 'EUR' | 'ILS' | 'GBP' | 'CAD';
  paid: boolean;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  tasks: ProjectTask[];
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