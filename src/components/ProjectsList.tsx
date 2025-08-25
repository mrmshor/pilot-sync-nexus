import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Edit, Trash2, User, FolderOpen,
  CheckCircle2, CreditCard, Plus, X, Calendar, Clock, Filter, SortAsc, SortDesc
} from 'lucide-react';
import { Project, ProjectTask } from '../types';
import { FolderService } from '../services';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ContactButtons } from './ContactButtons';
import { StatusDropdown } from './StatusDropdown';
import { PriorityDropdown } from './PriorityDropdown';

interface ProjectsListProps {
  projects: Project[];
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  selectedProjectId?: string;
  onProjectSelect?: (projectId: string) => void;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({ 
  projects, 
  onUpdateProject, 
  onDeleteProject, 
  selectedProjectId, 
  onProjectSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debug projects prop
  useEffect(() => {
    console.log('📋 ProjectsList received projects:', projects.length);
    console.log('📋 Projects data:', projects);
  }, [projects]);

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      
      return matchesSearch && matchesPriority && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Project];
      let bValue: any = b[sortBy as keyof Project];
      
      if (sortBy === 'name' || sortBy === 'clientName') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, searchTerm, priorityFilter, statusFilter, sortBy, sortOrder]);


  const openFolder = async (folderPath: string, icloudLink?: string) => {
    await FolderService.openFolder(folderPath, icloudLink);
  };

  const addTaskToProject = (projectId: string) => {
    const taskTitle = prompt('הכנס כותרת משימה:');
    if (!taskTitle?.trim()) return;

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newTask: ProjectTask = {
      id: Date.now().toString(),
      title: taskTitle.trim(),
      completed: false,
      createdAt: new Date()
    };

    const updatedProject = {
      ...project,
      tasks: [...project.tasks, newTask],
      updatedAt: new Date()
    };

    onUpdateProject(updatedProject);
    alert(`המשימה "${taskTitle}" נוספה בהצלחה!`);
  };

  const toggleTask = (projectId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedTasks = project.tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : undefined
          }
        : task
    );

    const updatedProject = {
      ...project,
      tasks: updatedTasks,
      updatedAt: new Date()
    };

    onUpdateProject(updatedProject);
  };

  const deleteTask = (projectId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedProject = {
      ...project,
      tasks: project.tasks.filter(task => task.id !== taskId),
      updatedAt: new Date()
    };

    onUpdateProject(updatedProject);
  };

  const updateProjectStatus = (projectId: string, status: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedProject = {
      ...project,
      status: status as any,
      updatedAt: new Date()
    };

    onUpdateProject(updatedProject);
  };

  const updateProjectPriority = (projectId: string, priority: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedProject = {
      ...project,
      priority: priority as any,
      updatedAt: new Date()
    };

    onUpdateProject(updatedProject);
  };

  const togglePaid = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedProject = {
      ...project,
      paid: !project.paid,
      updatedAt: new Date()
    };

    onUpdateProject(updatedProject);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-r-red-500 bg-gradient-to-l from-red-50/50 to-transparent';
      case 'medium': return 'border-r-yellow-500 bg-gradient-to-l from-yellow-50/50 to-transparent';
      case 'low': return 'border-r-green-500 bg-gradient-to-l from-green-50/50 to-transparent';
      default: return 'border-r-gray-300 bg-white/90';
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'ILS': return '₪';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'CAD': return 'C$';
      default: return '$';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-slate-50 to-blue-50" elevated>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-blue-500" />
              <Input
                placeholder="🔍 חיפוש מתקדם - שם פרויקט, לקוח, תיאור, אימייל..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 text-base bg-white/80 backdrop-blur border-blue-200"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2 flex-wrap">
                <select
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/80 backdrop-blur"
                >
                  <option value="all">כל העדיפויות</option>
                  <option value="high">🔴 גבוהה</option>
                  <option value="medium">🟡 בינונית</option>
                  <option value="low">🟢 נמוכה</option>
                </select>

                <select
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/80 backdrop-blur"
                >
                  <option value="all">כל הסטטוסים</option>
                  <option value="not-started">לא התחיל</option>
                  <option value="in-progress">בתהליך</option>
                  <option value="completed">הושלם</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/80 backdrop-blur"
                >
                  <option value="updatedAt">תאריך עדכון</option>
                  <option value="createdAt">תאריך יצירה</option>
                  <option value="name">שם פרויקט</option>
                  <option value="clientName">שם לקוח</option>
                  <option value="price">מחיר</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 bg-white/80 backdrop-blur"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm bg-white/60 backdrop-blur px-4 py-3 rounded-lg border border-blue-200/50">
              <span className="font-medium text-gray-700">
                מציג {filteredAndSortedProjects.length} מתוך {projects.length} פרויקטים
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setPriorityFilter('all');
                  setStatusFilter('all');
                }}
                className="text-xs"
              >
                <Filter className="h-3 w-3 mr-1" />
                נקה פילטרים
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {filteredAndSortedProjects.map(project => (
          <Card 
            key={project.id} 
            className={`mobile-card border-r-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ${getPriorityColor(project.priority)} ${
              selectedProjectId === project.id ? 'ring-2 ring-blue-500/50 shadow-2xl scale-[1.02]' : ''
            }`}
            elevated
            onClick={() => onProjectSelect && onProjectSelect(project.id)}
          >
            {/* Header */}
            <div className="p-6 pb-3 bg-gradient-to-r from-white/50 to-transparent backdrop-blur">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2 leading-tight line-clamp-2 tracking-wide hover:from-blue-600 hover:via-purple-500 hover:to-blue-700 transition-colors duration-300">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      {project.clientName}
                    </span>
                  </div>
                </div>
                <div className="tablet-header-actions">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="touch-target mobile-icon-button hover:bg-blue-100 text-blue-600"
                    title="עריכה"
                  >
                    <Edit className="mobile-icon-md" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('האם אתה בטוח שברצונך למחוק את הפרויקט?')) {
                        onDeleteProject(project.id);
                      }
                    }}
                    className="touch-target mobile-icon-button hover:bg-red-100 text-red-500"
                    title="מחיקה"
                  >
                    <Trash2 className="mobile-icon-md" />
                  </Button>
                </div>
              </div>
              
              {/* Interactive Status and Priority */}
              <div className="flex gap-2 mb-3">
                <StatusDropdown
                  value={project.status}
                  onChange={(status) => updateProjectStatus(project.id, status)}
                  className="flex-1"
                />
                <PriorityDropdown
                  value={project.priority}
                  onChange={(priority) => updateProjectPriority(project.id, priority)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="px-6 space-y-4">
              {project.description && (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-lg border border-gray-200/50">
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed italic">
                    "{project.description}"
                  </p>
                </div>
              )}

              {/* Price Section */}
              <div className="tablet-section bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-green-600">
                    {getCurrencySymbol(project.currency)}{project.price.toLocaleString()}
                  </div>
                  {project.completed && (
                    <Badge variant="success" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      הושלם
                    </Badge>
                  )}
                </div>
                <Button
                  variant={project.paid ? "success" : "destructive"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePaid(project.id);
                  }}
                  className="mobile-button"
                >
                  <CreditCard className="mobile-icon-sm ml-1" />
                  {project.paid ? 'שולם ✓' : 'לא שולם'}
                </Button>
              </div>

              {/* Contact Actions */}
              <div className="tablet-section bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50">
                <div 
                  className="space-y-3" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <ContactButtons
                    phone={project.phone1}
                    whatsapp={project.whatsapp1}
                    email={project.email}
                    className="flex flex-col gap-3"
                  />
                  {(project.folderPath || project.icloudLink) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await openFolder(project.folderPath || '', project.icloudLink);
                      }}
                      className="mobile-button hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-all duration-200"
                      title={project.folderPath ? `פתח תיקיה: ${project.folderPath}` : 'פתח קישור ענן'}
                    >
                      <FolderOpen className="mobile-icon-sm ml-1" />
                      {project.folderPath ? 'קבצים' : 'ענן'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Tasks Section */}
              <div className="tablet-section bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="mobile-section-title flex items-center gap-2">
                    <CheckCircle2 className="mobile-icon-md text-indigo-600" />
                    משימות ({project.tasks.filter(t => t.completed).length}/{project.tasks.length})
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      addTaskToProject(project.id);
                    }}
                    className="mobile-icon-button hover:bg-indigo-100 text-indigo-600"
                    title="הוסף משימה"
                  >
                    <Plus className="mobile-icon-md" />
                  </Button>
                </div>
                
                {project.tasks.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {project.tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-2 text-sm bg-white/80 backdrop-blur p-2 rounded border border-white/50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(project.id, task.id);
                          }}
                          className={`w-3 h-3 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                            task.completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {task.completed && <CheckCircle2 className="w-2 h-2" />}
                        </button>
                        <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                          {task.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(project.id, task.id);
                          }}
                          className="touch-target h-6 w-6 p-0 hover:bg-red-100 text-red-500 flex-shrink-0 mobile-icon-button"
                          title="מחק משימה"
                        >
                          <X className="mobile-icon-sm" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {project.tasks.length > 0 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full overflow-hidden h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-blue-600 h-full transition-all duration-500 ease-out" 
                        style={{ width: `${(project.tasks.filter(t => t.completed).length / project.tasks.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-200/50 rounded-b-xl">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    נוצר: {project.createdAt.toLocaleDateString('he-IL')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    עודכן: {project.updatedAt.toLocaleDateString('he-IL')}
                  </span>
                </div>
                {(project.phone2 || project.whatsapp2) && (
                  <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded mt-2">
                    <div className="mb-2">פרטי קשר נוספים:</div>
                    <ContactButtons
                      phone={project.phone2}
                      whatsapp={project.whatsapp2}
                      className="gap-1"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredAndSortedProjects.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-gradient-to-r from-gray-100 to-blue-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-medium mb-4 text-gray-700">לא נמצאו פרויקטים</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            נסה לשנות את מונחי החיפוש או הסינון
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setPriorityFilter('all');
              setStatusFilter('all');
            }}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
          >
            <Filter className="h-4 w-4 mr-2" />
            נקה כל הפילטרים
          </Button>
        </div>
      )}
    </div>
  );
};