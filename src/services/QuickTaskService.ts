import { QuickTask } from '@/types';
import { TauriService } from './TauriService';

export class QuickTaskService {
  private static instance: QuickTaskService;
  private quickTasks: QuickTask[] = [];

  static getInstance(): QuickTaskService {
    if (!QuickTaskService.instance) {
      QuickTaskService.instance = new QuickTaskService();
    }
    return QuickTaskService.instance;
  }

  async loadQuickTasks(): Promise<QuickTask[]> {
    try {
      const data = await TauriService.loadData('quick-tasks.json');
      if (data) {
        this.quickTasks = JSON.parse(data, this.dateReviver);
        return this.quickTasks;
      }
      return [];
    } catch (error) {
      console.log('No quick tasks found (first time)');
      return [];
    }
  }

  async saveQuickTasks(tasks: QuickTask[]): Promise<void> {
    this.quickTasks = tasks;
    try {
      await TauriService.saveData('quick-tasks.json', JSON.stringify(tasks, null, 2));
    } catch (error) {
      console.error('Failed to save quick tasks:', error);
      localStorage.setItem('quickTasks', JSON.stringify(tasks));
    }
  }

  async addQuickTask(title: string): Promise<QuickTask> {
    const newTask: QuickTask = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date()
    };
    
    const updatedTasks = [newTask, ...this.quickTasks];
    await this.saveQuickTasks(updatedTasks);
    return newTask;
  }

  async toggleQuickTask(taskId: string): Promise<void> {
    const task = this.quickTasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : undefined;
    
    await this.saveQuickTasks(this.quickTasks);
  }

  async deleteQuickTask(taskId: string): Promise<void> {
    const filteredTasks = this.quickTasks.filter(t => t.id !== taskId);
    await this.saveQuickTasks(filteredTasks);
  }

  getQuickTasks(): QuickTask[] {
    return this.quickTasks;
  }

  private dateReviver(key: string, value: any): any {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value);
    }
    return value;
  }
}