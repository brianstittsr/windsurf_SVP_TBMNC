import { useQuery } from '@tanstack/react-query';
import { Users, FileCheck, Clock, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  qualifiedCustomers: number;
  avgTimePerStage: number;
  conversionRate: number;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/analytics/dashboard'),
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const cards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Customers',
      value: stats?.activeCustomers || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Qualified Suppliers',
      value: stats?.qualifiedCustomers || 0,
      icon: FileCheck,
      color: 'bg-green-500',
    },
    {
      title: 'Conversion Rate',
      value: `${stats?.conversionRate.toFixed(1) || 0}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Overview of TBMNC supplier qualification pipeline
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <p className="text-gray-500">No recent activity to display.</p>
      </div>
    </div>
  );
}
