import React, { memo, useMemo } from 'react';
import { Project } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  AlertCircle,
  Calendar,
  TrendingUp,
  Users,
  CreditCard
} from 'lucide-react';

interface EnhancedDashboardProps {
  projects: Project[];
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    paid: number;
    unpaid: number;
    totalRevenue: number;
    pendingRevenue: number;
    completionRate: number;
    paymentRate: number;
  };
}

export const EnhancedDashboard = memo(({ projects, stats }: EnhancedDashboardProps) => {
  console.log('📊 EnhancedDashboard rendered with:', { projects: projects.length, stats });

  return (
    <div>
      <h1 style={{color: 'red', fontSize: '24px'}}>הדשבורד פועל!</h1>
      <div style={{backgroundColor: 'white', padding: '20px', color: 'black', margin: '20px 0'}}>
        <h2>נתונים:</h2>
        <p>פרויקטים: {stats.total}</p>
        <p>הושלמו: {stats.completed}</p>
        <p>הכנסות: ₪{stats.totalRevenue.toLocaleString()}</p>
        <p>ממתינות: ₪{stats.pendingRevenue.toLocaleString()}</p>
      </div>
      
      <div style={{backgroundColor: 'lightblue', padding: '20px'}}>
        <h3 style={{color: 'darkblue'}}>פרויקטים אחרונים:</h3>
        {projects.slice(0, 3).map(project => (
          <div key={project.id} style={{backgroundColor: 'white', margin: '10px 0', padding: '10px', color: 'black'}}>
            <strong>{project.name}</strong> - {project.clientName} - ₪{project.price.toLocaleString()}
          </div>
        ))}
      </div>
    </div>
  );
});

EnhancedDashboard.displayName = 'EnhancedDashboard';