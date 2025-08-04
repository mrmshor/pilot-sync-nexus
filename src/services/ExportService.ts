import { Project, QuickTask } from '@/types';

export class ExportService {
  static exportProjectsCSV(projects: Project[]): void {
    try {
      if (projects.length === 0) {
        throw new Error('No projects to export');
      }

      const headers = [
        'שם פרויקט', 'תיאור', 'שם לקוח', 'טלפון ראשי', 'טלפון נוסף',
        'וואטסאפ ראשי', 'וואטסאפ נוסף', 'אימייל', 'תיקייה מקומית', 'קישור iCloud',
        'סטטוס', 'עדיפות', 'מחיר', 'מטבע', 'שולם', 'הושלם',
        'תאריך יצירה', 'תאריך עדכון', 'סה"כ משימות', 'משימות הושלמו'
      ];

      const csvData = projects.map(project => [
        project.name, project.description, project.clientName,
        project.phone1, project.phone2 || '', project.whatsapp1, project.whatsapp2 || '',
        project.email, project.folderPath || '', project.icloudLink || '',
        project.status, project.priority, project.price, project.currency,
        project.paid ? 'כן' : 'לא', project.completed ? 'כן' : 'לא',
        project.createdAt.toLocaleDateString('he-IL'), project.updatedAt.toLocaleDateString('he-IL'),
        project.tasks.length, project.tasks.filter(t => t.completed).length
      ]);

      const csv = [headers, ...csvData]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      this.downloadFile('\ufeff' + csv, `פרויקטים-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv; charset=utf-8');
    } catch (error) {
      console.error('Error exporting projects:', error);
      throw error;
    }
  }

  static exportQuickTasksTXT(tasks: QuickTask[]): void {
    try {
      const completedTasks = tasks.filter(t => t.completed);
      const pendingTasks = tasks.filter(t => !t.completed);
      
      const content = `📋 רשימת משימות מהירות - מערכת ניהול פרויקטים Pro
📅 תאריך: ${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL')}

📊 סיכום מפורט:
• סה"כ משימות: ${tasks.length}
• הושלמו: ${completedTasks.length}
• בהמתנה: ${pendingTasks.length}

✅ משימות שהושלמו (${completedTasks.length}):
${completedTasks.length > 0 ? completedTasks.map((task, index) => 
  `${index + 1}. ✓ ${task.title}
   📅 הושלם: ${task.completedAt?.toLocaleDateString('he-IL') || 'לא ידוע'}`
).join('\n\n') : 'אין משימות שהושלמו'}

⏳ משימות בהמתנה (${pendingTasks.length}):
${pendingTasks.length > 0 ? pendingTasks.map((task, index) => 
  `${index + 1}. ○ ${task.title}
   🕐 נוצר: ${task.createdAt.toLocaleDateString('he-IL')}`
).join('\n\n') : 'אין משימות בהמתנה'}

---
🚀 מערכת ניהול פרויקטים Pro - מותאם macOS`;

      this.downloadFile('\ufeff' + content, `משימות-${new Date().toISOString().split('T')[0]}.txt`, 'text/plain; charset=utf-8');
    } catch (error) {
      console.error('Error exporting tasks:', error);
      throw error;
    }
  }

  private static downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}