import React from 'react';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Project } from '@/types';
import { AlertCircle, ArrowUp, Minus } from 'lucide-react';

interface AppSidebarProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  selectedProjectId?: string;
}

export function AppSidebar({ projects, onProjectSelect, selectedProjectId }: AppSidebarProps) {
  const { open } = useSidebar();

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <ArrowUp className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Minus className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-r-2 border-red-500 bg-red-50/50';
      case 'medium':
        return 'border-r-2 border-yellow-500 bg-yellow-50/50';
      case 'low':
        return 'border-r-2 border-green-500 bg-green-50/50';
      default:
        return 'border-r-2 border-gray-300 bg-gray-50/50';
    }
  };

  return (
    <Sidebar
      className="w-48 border-l border-gray-200 bg-white/95 backdrop-blur fixed right-0 top-0 h-screen z-40"
      collapsible="none"
    >
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold text-gray-600 text-center mb-2">
            פרויקטים ({projects.length})
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    onClick={() => onProjectSelect(project)}
                    className={`
                      ${getPriorityColor(project.priority)}
                      ${selectedProjectId === project.id ? 'bg-blue-100 border-blue-500' : ''}
                      hover:bg-blue-50 transition-all duration-200 p-2 h-auto rounded-lg w-full text-right
                    `}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {getPriorityIcon(project.priority)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs text-gray-900 truncate leading-tight">
                          {project.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {project.clientName}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {project.completed && (
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          )}
                          {project.paid && (
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          )}
                          <span className="text-xs text-gray-400">
                            {project.tasks?.length || 0} משימות
                          </span>
                        </div>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {projects.length === 0 && (
          <div className="p-2 text-center text-gray-500">
            <div className="text-xs">אין פרויקטים</div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}