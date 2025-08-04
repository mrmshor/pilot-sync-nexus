import { Project, ProjectTask } from '@/types';
import { TauriService } from './TauriService';

export class ProjectService {
  private static instance: ProjectService;
  private projects: Project[] = [];

  static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  async loadProjects(): Promise<Project[]> {
    try {
      const data = await TauriService.loadData('projects.json');
      if (data) {
        this.projects = JSON.parse(data, this.dateReviver);
        return this.projects;
      }
      return this.getDefaultProjects();
    } catch (error) {
      console.log('Loading default projects (first time)');
      return this.getDefaultProjects();
    }
  }

  async saveProjects(projects: Project[]): Promise<void> {
    this.projects = projects;
    try {
      await TauriService.saveData('projects.json', JSON.stringify(projects, null, 2));
    } catch (error) {
      console.error('Failed to save projects:', error);
      // Fallback to localStorage
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }

  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>): Promise<Project> {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [],
      subtasks: []
    };
    
    const updatedProjects = [newProject, ...this.projects];
    await this.saveProjects(updatedProjects);
    return newProject;
  }

  async updateProject(updatedProject: Project): Promise<void> {
    const projectIndex = this.projects.findIndex(p => p.id === updatedProject.id);
    if (projectIndex === -1) return;

    this.projects[projectIndex] = { ...updatedProject, updatedAt: new Date() };
    await this.saveProjects(this.projects);
  }

  async deleteProject(id: string): Promise<void> {
    const filteredProjects = this.projects.filter(p => p.id !== id);
    await this.saveProjects(filteredProjects);
  }

  async addProjectTask(projectId: string, title: string): Promise<void> {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;

    const newTask: ProjectTask = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date()
    };

    project.tasks.push(newTask);
    project.updatedAt = new Date();
    await this.saveProjects(this.projects);
  }

  async toggleProjectTask(projectId: string, taskId: string): Promise<void> {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : undefined;
    project.updatedAt = new Date();
    
    await this.saveProjects(this.projects);
  }

  async deleteProjectTask(projectId: string, taskId: string): Promise<void> {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;

    project.tasks = project.tasks.filter(t => t.id !== taskId);
    project.updatedAt = new Date();
    await this.saveProjects(this.projects);
  }

  getProjects(): Project[] {
    return this.projects;
  }

  private dateReviver(key: string, value: string | unknown): string | Date | unknown {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value);
    }
    return value;
  }

  private getDefaultProjects(): Project[] {
    return [
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
          { id: '4', title: 'לעדכן מחיר', completed: false, createdAt: new Date('2024-01-21') },
          { id: '5', title: 'לתקן קבצים לשליחה לאישור סופי', completed: false, createdAt: new Date('2024-01-21') }
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
      {
        id: '3',
        name: 'פאציים עור לבגדים',
        description: 'תיקון והוספת פאציים עור איכותיים לפריטי ביגוד שונים',
        clientName: 'שלמה קויץ',
        phone1: '+972-52-877-3801',
        phone2: '+972-53-340-8665',
        whatsapp1: '+972-52-877-3801',
        whatsapp2: '+972-53-340-8665',
        email: 'shlomo@leather.co.il',
        folderPath: '',
        icloudLink: 'https://icloud.com/leather-project',
        status: 'in-progress',
        priority: 'high',
        price: 4030,
        currency: 'ILS',
        paid: false,
        completed: false,
        deadline: new Date('2024-02-05'),
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-02-10'),
        tasks: [
          { id: '1', title: 'מדידת הבגדים', completed: true, createdAt: new Date('2024-01-21'), completedAt: new Date('2024-01-25') },
          { id: '2', title: 'הזמנת חומרי גלם', completed: false, createdAt: new Date('2024-01-26') }
        ],
        subtasks: []
      }
    ];
  }
}