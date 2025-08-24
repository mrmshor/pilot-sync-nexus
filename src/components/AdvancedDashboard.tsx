import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProjectStore } from '@/store/useProjectStore';
import { usePersonalTasksStore } from '@/store/usePersonalTasksStore';

export function AdvancedDashboard() {
  const projects = useProjectStore((state) => state.projects);
  const tasks = useProjectStore((state) => state.tasks);
  const { tasks: personalTasks } = usePersonalTasksStore();

  const completedProjects = projects.filter(p => p.status === 'הושלם').length;
  const activeProjects = projects.filter(p => p.status === 'פעיל').length;
  const totalTasks = tasks.length + personalTasks.length;
  const completedTasks = tasks.filter(t => t.status === 'הושלם').length + personalTasks.filter(t => t.completed).length;

  const chartData = [
    {
      title: 'ביצועים שבועיים',
      value: completedTasks,
      total: totalTasks,
      color: 'from-blue-500 to-cyan-500',
      icon: BarChart3,
    },
    {
      title: 'פרויקטים פעילים',
      value: activeProjects,
      total: projects.length,
      color: 'from-green-500 to-emerald-500',
      icon: TrendingUp,
    },
    {
      title: 'שיעור הצלחה',
      value: projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0,
      total: 100,
      color: 'from-purple-500 to-indigo-500',
      icon: Users,
    },
  ];

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">דשבורד מתקדם</CardTitle>
              <p className="text-sm text-muted-foreground">ניתוח ביצועים ונתונים</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {chartData.map((item, index) => (
            <div key={index} className="relative group">
              <div className="p-4 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 bg-gradient-to-br ${item.color} rounded-lg`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-foreground">
                    {item.title === 'שיעור הצלחה' ? `${item.value}%` : item.value}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {item.title}
                </h4>
                <Progress 
                  value={item.title === 'שיעור הצלחה' ? item.value : (item.value / item.total) * 100} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {item.title === 'שיעור הצלחה' ? 
                    `${completedProjects} מתוך ${projects.length} פרויקטים` :
                    `${item.value} מתוך ${item.total}`
                  }
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* תרשים התקדמות נוסף */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-foreground">סיכום כללי</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">סה"כ משימות</span>
              </div>
              <p className="text-2xl font-bold text-blue-800">{totalTasks}</p>
              <p className="text-xs text-blue-600">{completedTasks} הושלמו</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">שיעור השלמה</span>
              </div>
              <p className="text-2xl font-bold text-green-800">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </p>
              <p className="text-xs text-green-600">ממוצע שבועי</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}