import { AdvancedDashboard } from '@/components/AdvancedDashboard';

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" dir="rtl">
      <main className="p-6">
        <AdvancedDashboard />
      </main>
    </div>
  );
};

export default App;