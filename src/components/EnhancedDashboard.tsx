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

  const formatCurrency = (amount: number) => `₪${amount.toLocaleString()}`;

  const statCards = useMemo(() => [
    {
      title: 'סה"כ פרויקטים',
      value: stats.total.toString(),
      icon: BarChart3,
      description: `${stats.inProgress} בביצוע`,
      trend: stats.total > 0 ? 'up' : 'neutral'
    },
    {
      title: 'פרויקטים שהושלמו',
      value: stats.completed.toString(),
      icon: CheckCircle,
      description: `${stats.completionRate.toFixed(1)}% מהפרויקטים`,
      trend: stats.completed > 0 ? 'up' : 'neutral'
    },
    {
      title: 'סה"כ הכנסות',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      description: 'הכנסות ששולמו',
      trend: stats.totalRevenue > 0 ? 'up' : 'neutral'
    },
    {
      title: 'הכנסות ממתינות',
      value: formatCurrency(stats.pendingRevenue),
      icon: CreditCard,
      description: `מ-${stats.unpaid} פרויקטים`,
      trend: stats.pendingRevenue > 0 ? 'down' : 'neutral'
    },
    {
      title: 'אחוז תשלומים',
      value: `${stats.paymentRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: `${stats.paid} מתוך ${stats.total} שולמו`,
      trend: stats.paymentRate > 70 ? 'up' : stats.paymentRate > 30 ? 'neutral' : 'down'
    },
    {
      title: 'לקוחות פעילים',
      value: new Set(projects.map(p => p.clientName)).size.toString(),
      icon: Users,
      description: 'לקוחות ייחודיים',
      trend: 'neutral'
    }
  ], [stats, projects]);

  const recentProjects = useMemo(() => 
    projects
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5),
    [projects]
  );

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'in-review': return 'outline';
      case 'on-hold': return 'destructive';
      case 'waiting': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const statusLabels = {
    'not-started': 'לא התחיל',
    'in-progress': 'בביצוע',
    'in-review': 'בבדיקה',
    'completed': 'הושלם',
    'on-hold': 'בהמתנה',
    'waiting': 'ממתין'
  };

  const priorityLabels = {
    'low': 'נמוכה',
    'medium': 'בינונית',
    'high': 'גבוהה'
  };

  return (
    <div className="space-y-6 p-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </div>
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs ${getTrendColor(stat.trend)}`}>
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Projects */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              פרויקטים אחרונים
            </h3>
            <Badge variant="outline">{recentProjects.length} פרויקטים</Badge>
          </div>
          
          {recentProjects.length > 0 ? (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{project.name}</h4>
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {statusLabels[project.status]}
                      </Badge>
                      <Badge variant={getPriorityBadgeVariant(project.priority)}>
                        {priorityLabels[project.priority]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {project.clientName} • {formatCurrency(project.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.paid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-orange-500" />
                    )}
                    {project.completed && (
                      <Badge variant="default">הושלם</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>אין פרויקטים להצגה</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

EnhancedDashboard.displayName = 'EnhancedDashboard';