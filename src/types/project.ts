export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  folderPath?: string;
  icloudLink?: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  budget?: number;
  progress: number;
}

export interface AppState {
  projects: Project[];
  selectedProjectId?: string;
  isLoading: boolean;
  error?: string;
}