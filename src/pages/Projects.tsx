import { useEffect } from 'react';
import { ProjectManagementApp } from '@/components/ProjectManagementApp';

const Projects = () => {
  useEffect(() => {
    document.title = 'פרויקטים | מערכת ניהול פרויקטים';
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <main>
        <ProjectManagementApp />
      </main>
    </div>
  );
};

export default Projects;
