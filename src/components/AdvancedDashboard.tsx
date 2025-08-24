import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useProjectStore } from '@/store/useProjectStore';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { he } from 'date-fns/locale';

const chartConfig = {
  completed: {
    label: "הושלמו",
    color: "hsl(var(--primary))",
  },
  active: {
    label: "פעילים", 
    color: "hsl(var(--secondary))",
  },
  planned: {
    label: "בתכנון",
    color: "hsl(var(--muted))",
  },
};

const priorityColors = {
  'גבוהה': '#ef4444',
  'בינונית': '#f59e0b', 
  'נמוכה': '#10b981'
};

export function AdvancedDashboard() {
  const { projects, tasks } = useProjectStore();

  const weeklyData = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map(day => {
      const dayStr = format(day, 'dd/MM', { locale: he });
      const tasksForDay = tasks.filter(task => 
        task.dueDate && format(new Date(task.dueDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );

      return {
        date: dayStr,
        completed: tasksForDay.filter(task => task.status === 'הושלם').length,
        active: tasksForDay.filter(task => task.status === 'בעבודה').length,
        planned: tasksForDay.filter(task => task.status === 'ממתין').length,
      };
    });
  }, [tasks]);

  const statusData = useMemo(() => {
    const statuses = ['תכנון', 'פעיל', 'הושלם', 'בהמתנה'] as const;
    return statuses.map(status => ({
      name: status,
      value: projects.filter(p => p.status === status).length,
      fill: status === 'הושלם' ? '#10b981' : 
            status === 'פעיל' ? '#3b82f6' :
            status === 'תכנון' ? '#f59e0b' : '#6b7280'
    }));
  }, [projects]);

  const priorityData = useMemo(() => {
    const priorities = ['גבוהה', 'בינונית', 'נמוכה'] as const;
    return priorities.map(priority => ({
      name: priority,
      tasks: tasks.filter(t => t.priority === priority).length,
      projects: projects.filter(p => p.priority === priority).length,
      fill: priorityColors[priority]
    }));
  }, [tasks, projects]);

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      {/* כותרת אזור הגרפים */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent story-link">
          ניתוח נתונים מתקדם
        </h2>
        <p className="text-muted-foreground">תובנות ומגמות מהנתונים שלך</p>
      </div>

      {/* שורה ראשונה - גרפים יומיים ושבועיים */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* סטטוס פרויקטים */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30 hover-scale animate-slide-in-right">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center hover-scale">
                <span className="text-white text-lg">📊</span>
              </div>
              <div>
                <CardTitle className="text-xl font-bold story-link">סטטוס פרויקטים</CardTitle>
                <p className="text-sm text-muted-foreground">התפלגות לפי מצב</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={3}
                    strokeWidth={2}
                    stroke="#ffffff"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity duration-200" />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            {/* מקרא מעוצב */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white/60 backdrop-blur-sm rounded-lg hover-scale">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm" 
                    style={{ backgroundColor: entry.fill }}
                  ></div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">{entry.name}</span>
                    <div className="text-xs text-muted-foreground">{entry.value} פרויקטים</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* התקדמות שבועית */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 hover-scale animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center hover-scale">
                <span className="text-white text-lg">📈</span>
              </div>
              <div>
                <CardTitle className="text-xl font-bold story-link">התקדמות שבועית</CardTitle>
                <p className="text-sm text-muted-foreground">משימות לפי יום השבוע</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    domain={[0, 'dataMax + 1']}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    dataKey="completed" 
                    stroke="#10b981" 
                    strokeWidth={4}
                    dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 3, fill: '#ffffff', className: 'animate-pulse' }}
                    name="הושלמו"
                  />
                  <Line 
                    dataKey="active" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 3, fill: '#ffffff', className: 'animate-pulse' }}
                    name="פעילים"
                  />
                  <Line 
                    dataKey="planned" 
                    stroke="#f59e0b" 
                    strokeWidth={4}
                    dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 8, stroke: '#f59e0b', strokeWidth: 3, fill: '#ffffff', className: 'animate-pulse' }}
                    name="בתכנון"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* שורה שנייה - התפלגות עדיפויות */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30 hover-scale animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center hover-scale">
                <span className="text-white text-xl">⚡</span>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold story-link">התפלגות עדיפויות</CardTitle>
                <p className="text-muted-foreground">משימות ופרויקטים לפי רמת עדיפות</p>
              </div>
            </div>
            <div className="text-sm font-medium text-muted-foreground bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              {priorityData.reduce((sum, item) => sum + item.tasks + item.projects, 0)} פריטים סה"כ
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* גרף עמודות אופקי */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold text-foreground mb-6">פילוח לפי סוג</h4>
              <ChartContainer config={chartConfig} className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData} layout="horizontal" margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
                    <XAxis 
                      type="number" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      domain={[0, 'dataMax + 1']}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 14, fill: '#374151', fontWeight: 500 }}
                      width={70}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="tasks" 
                      name="משימות"
                      radius={[0, 6, 6, 0]}
                      fill="#8884d8"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-tasks-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity duration-200" />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="projects" 
                      name="פרויקטים"
                      radius={[0, 6, 6, 0]}
                      fill="#82ca9d"
                      opacity={0.7}
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-projects-${index}`} fill={entry.fill} opacity={0.7} className="hover:opacity-90 transition-opacity duration-200" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* תצוגת נתונים מעוצבת */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground mb-6">סיכום עדיפויות</h4>
              {priorityData.map((priority, index) => (
                <div 
                  key={index} 
                  className="group p-5 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl hover:shadow-lg transition-all duration-200 hover-scale animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-5 h-5 rounded-full shadow-md" 
                        style={{ backgroundColor: priority.fill }}
                      ></div>
                      <span className="font-bold text-lg text-foreground story-link">{priority.name}</span>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      {priority.tasks + priority.projects}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span className="text-muted-foreground font-medium">משימות:</span>
                      <span className="font-bold text-foreground text-lg">{priority.tasks}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span className="text-muted-foreground font-medium">פרויקטים:</span>
                      <span className="font-bold text-foreground text-lg">{priority.projects}</span>
                    </div>
                  </div>
                  
                  {/* פרוגרס בר מעוצב */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                      <div 
                        className="h-2 rounded-full transition-all duration-500 shadow-sm"
                        style={{ 
                          background: `linear-gradient(90deg, ${priority.fill}, ${priority.fill}dd)`,
                          width: `${((priority.tasks + priority.projects) / Math.max(...priorityData.map(p => p.tasks + p.projects)) || 1) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}