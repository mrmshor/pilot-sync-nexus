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
  const formatCurrency = (amount: number) => `₪${amount.toLocaleString()}`;

  const statCards = useMemo(() => [
    {
      title: 'סה"כ פרויקטים',
      value: stats.total.toString(),
      icon: BarChart3,
      description: `${stats.inProgress} בביצוע`,
      trend: stats.total > 0 ? 'up' : 'neutral',
      bgGradient: 'from-blue-500 to-blue-600',
      iconColor: 'text-blue-100'
    },
    {
      title: 'פרויקטים שהושלמו',
      value: stats.completed.toString(),
      icon: CheckCircle,
      description: `${stats.completionRate.toFixed(1)}% מהפרויקטים`,
      trend: stats.completed > 0 ? 'up' : 'neutral',
      bgGradient: 'from-green-500 to-green-600',
      iconColor: 'text-green-100'
    },
    {
      title: 'סה"כ הכנסות',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      description: 'הכנסות ששולמו',
      trend: stats.totalRevenue > 0 ? 'up' : 'neutral',
      bgGradient: 'from-emerald-500 to-emerald-600',
      iconColor: 'text-emerald-100'
    },
    {
      title: 'הכנסות ממתינות',
      value: formatCurrency(stats.pendingRevenue),
      icon: CreditCard,
      description: `מ-${stats.unpaid} פרויקטים`,
      trend: stats.pendingRevenue > 0 ? 'down' : 'neutral',
      bgGradient: 'from-orange-500 to-orange-600',
      iconColor: 'text-orange-100'
    },
    {
      title: 'אחוז תשלומים',
      value: `${stats.paymentRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: `${stats.paid} מתוך ${stats.total} שולמו`,
      trend: stats.paymentRate > 70 ? 'up' : stats.paymentRate > 30 ? 'neutral' : 'down',
      bgGradient: stats.paymentRate > 70 ? 'from-green-500 to-green-600' : stats.paymentRate > 30 ? 'from-yellow-500 to-yellow-600' : 'from-red-500 to-red-600',
      iconColor: stats.paymentRate > 70 ? 'text-green-100' : stats.paymentRate > 30 ? 'text-yellow-100' : 'text-red-100'
    },
    {
      title: 'לקוחות פעילים',
      value: new Set(projects.map(p => p.clientName)).size.toString(),
      icon: Users,
      description: 'לקוחות ייחודיים',
      trend: 'neutral',
      bgGradient: 'from-purple-500 to-purple-600',
      iconColor: 'text-purple-100'
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
      case 'up': return 'text-white';
      case 'down': return 'text-white';
      default: return 'text-white';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'in-review': return 'outline';
      case 'on-hold': return 'destructive';
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
    'on-hold': 'בהמתנה'
  };

  const priorityLabels = {
    'low': 'נמוכה',
    'medium': 'בינונית',
    'high': 'גבוהה'
  };

  return (
    <div className="space-y-6 p-6">
      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border-0">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient}`} />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between space-y-0 pb-3">
                  <div className="text-sm font-medium text-white/90">
                    {stat.title}
                  </div>
                  <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <p className="text-sm text-white/80 font-medium">
                    {stat.description}
                  </p>
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Projects */}
      <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-3 text-gray-800">
              <Calendar className="h-6 w-6 text-blue-600" />
              פרויקטים אחרונים
            </h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              {recentProjects.length} פרויקטים
            </Badge>
          </div>
          
          {recentProjects.length > 0 ? (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-5 rounded-xl border-2 border-gray-200 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xl text-gray-900">{project.name}</h4>
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {statusLabels[project.status]}
                      </Badge>
                      <Badge variant={getPriorityBadgeVariant(project.priority)}>
                        {priorityLabels[project.priority]}
                      </Badge>
                    </div>
                     <p className="text-xs text-gray-500">
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