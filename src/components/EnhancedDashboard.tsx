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

// Memoized stat card component
const StatCard = memo(({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'text-primary',
  bgGradient = 'gradient-primary'
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color?: string;
  bgGradient?: string;
}) => (
  <Card className={`card-macos ${bgGradient} text-white border-0 overflow-hidden relative`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
          <p className="text-3xl font-bold mb-2">{value}</p>
          <div className="text-sm text-white/70">
            {subtitle}
          </div>
        </div>
        <div className="p-4 rounded-full bg-white/20 backdrop-blur">
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </CardContent>
  </Card>
));

// Memoized recent activity item
const ActivityItem = memo(({ project }: { project: Project }) => (
  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
    <div className="flex-1">
      <div className="font-medium text-sm">{project.name}</div>
      <div className="text-xs text-muted-foreground">{project.clientName}</div>
    </div>
    <div className="flex items-center gap-2">
      <Badge 
        variant={project.completed ? 'success' : project.status === 'in-progress' ? 'default' : 'secondary'} 
        className="text-xs"
      >
        {project.completed ? 'הושלם' : project.status === 'in-progress' ? 'בתהליך' : 'ממתין'}
      </Badge>
    </div>
  </div>
));

// Memoized urgent project item
const UrgentProjectItem = memo(({ project }: { project: Project }) => (
  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <div className="font-medium text-sm">{project.name}</div>
      <Badge variant="destructive" className="text-xs">
        {project.priority === 'high' ? 'דחוף' : 'חשוב'}
      </Badge>
    </div>
    <div className="text-xs text-muted-foreground mb-1">{project.clientName}</div>
    <div className="text-xs font-medium">
      ₪{project.price.toLocaleString()} • {project.paid ? 'שולם' : 'לא שולם'}
    </div>
  </div>
));

export const EnhancedDashboard = memo(({ projects, stats }: EnhancedDashboardProps) => {
  // Memoized calculations for performance
  const recentProjects = useMemo(() => 
    projects
      .slice()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5),
    [projects]
  );

  const urgentProjects = useMemo(() => 
    projects.filter(p => 
      (p.priority === 'high' || p.priority === 'medium') && 
      !p.completed &&
      p.status !== 'on-hold'
    ).slice(0, 3),
    [projects]
  );

  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return projects.filter(p => {
      if (p.completed) return false;
      const projectDate = new Date(p.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000); // Assume 2 week deadline
      return projectDate <= nextWeek && projectDate >= today;
    }).slice(0, 3);
  }, [projects]);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="סה&quot;כ פרויקטים"
          value={stats.total}
          subtitle={`${stats.inProgress} בתהליך`}
          icon={BarChart3}
          bgGradient="gradient-primary"
        />

        <StatCard
          title="פרויקטים הושלמו"
          value={stats.completed}
          subtitle={`${stats.completionRate.toFixed(1)}% השלמה`}
          icon={CheckCircle}
          bgGradient="gradient-success"
        />

        <StatCard
          title="הכנסות שהתקבלו"
          value={`₪${stats.totalRevenue.toLocaleString()}`}
          subtitle={`${stats.paymentRate.toFixed(1)}% נתקבל`}
          icon={CreditCard}
          bgGradient="gradient-warning"
        />

        <StatCard
          title="הכנסות ממתינות"
          value={`₪${stats.pendingRevenue.toLocaleString()}`}
          subtitle={`${stats.unpaid} פרויקטים`}
          icon={Clock}
          bgGradient="gradient-danger"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-macos">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">פעילות אחרונה</h3>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-3">
              {recentProjects.length > 0 ? (
                recentProjects.map(project => (
                  <ActivityItem key={project.id} project={project} />
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  אין פעילות אחרונה
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-macos">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">פרויקטים דחופים</h3>
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div className="space-y-3">
              {urgentProjects.length > 0 ? (
                urgentProjects.map(project => (
                  <UrgentProjectItem key={project.id} project={project} />
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  אין פרויקטים דחופים
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-macos">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">תזכורות השבוע</h3>
              <Calendar className="w-5 h-5 text-warning" />
            </div>
            <div className="space-y-3">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map(project => (
                  <div key={project.id} className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="font-medium text-sm">{project.name}</div>
                    <div className="text-xs text-muted-foreground">{project.clientName}</div>
                    <div className="text-xs text-warning font-medium mt-1">
                      מועד צפוי השבוע
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  אין מועדים השבוע
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card className="card-macos">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">מדדי ביצועים</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {stats.completionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">שיעור השלמה</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1">
                {stats.paymentRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">שיעור תשלומים</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-success h-2 rounded-full transition-all"
                  style={{ width: `${stats.paymentRate}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-warning mb-1">
                {stats.inProgress}
              </div>
              <div className="text-sm text-muted-foreground">פרויקטים פעילים</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-warning h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.inProgress / Math.max(stats.total, 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

EnhancedDashboard.displayName = 'EnhancedDashboard';