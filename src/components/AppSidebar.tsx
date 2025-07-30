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
      className="w-16 border-l border-gray-200 bg-white/95 backdrop-blur fixed right-0 top-0 h-screen z-40"
      collapsible="none"
    >
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold text-gray-600 text-center mb-2">
            פרויקטים
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
                      hover:bg-blue-50 transition-all duration-200 p-1 h-12 w-12 rounded-lg flex items-center justify-center relative group
                    `}
                    title={`${project.name} - ${project.clientName}`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      {getPriorityIcon(project.priority)}
                      
                      <div className="flex items-center gap-1">
                        {project.completed && (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        )}
                        {project.paid && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute right-full mr-2 bg-gray-800 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      <div className="font-medium">{project.name}</div>
                      <div className="text-gray-300">{project.clientName}</div>
                      <div className="text-gray-400">{project.tasks?.length || 0} משימות</div>
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