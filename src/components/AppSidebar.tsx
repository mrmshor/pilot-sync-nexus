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
      className={open ? "w-80" : "w-14"}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-bold text-gray-800">
            {open && `פרויקטים (${projects.length})`}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    onClick={() => onProjectSelect(project)}
                    className={`
                      ${getPriorityColor(project.priority)}
                      ${selectedProjectId === project.id ? 'bg-blue-100 border-blue-500' : ''}
                      hover:bg-blue-50 transition-all duration-200 p-3 h-auto
                    `}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {getPriorityIcon(project.priority)}
                      
                      {open && (
                        <div className="flex-1 min-w-0 text-right">
                          <div className="font-medium text-sm text-gray-900 truncate leading-tight">
                            {project.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {project.clientName}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {project.completed && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                            {project.paid && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <span className="text-xs text-gray-400">
                              {project.tasks?.length || 0} משימות
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {projects.length === 0 && open && (
          <div className="p-4 text-center text-gray-500">
            <div className="text-sm">אין פרויקטים במערכת</div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}