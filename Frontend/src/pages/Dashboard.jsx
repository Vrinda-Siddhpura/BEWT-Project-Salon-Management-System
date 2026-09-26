import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency } from '../utils/formatters';
import {
  IndianRupee,
  Users,
  Calendar,
  CheckCircle2,
  UserCheck,
  TrendingUp,
  PieChart as PieIcon,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const STATUS_COLORS = {
  Completed: '#10b981',
  Confirmed: '#3b82f6',
  'In Progress': '#8b5cf6',
  Pending: '#f59e0b',
  Cancelled: '#ef4444',
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardService.getStats();
      if (res.success) {
        setStats(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl flex items-center justify-between">
        <span>{error}</span>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-xl"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const { cards, charts } = stats || {};

  const cardItems = [
    {
      title: "Today's Revenue",
      value: formatCurrency(cards?.todayRevenue),
      icon: IndianRupee,
      bgColor: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(cards?.monthlyRevenue),
      icon: TrendingUp,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Customers',
      value: cards?.totalCustomers || 0,
      icon: Users,
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Total Appointments',
      value: cards?.totalAppointments || 0,
      icon: Calendar,
      bgColor: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Completed Appointments',
      value: cards?.completedAppointmentsCount || 0,
      icon: CheckCircle2,
      bgColor: 'bg-teal-500/10',
      iconColor: 'text-teal-600',
    },
    {
      title: 'Active Barbers',
      value: cards?.activeBarbers || 0,
      icon: UserCheck,
      bgColor: 'bg-indigo-500/10',
      iconColor: 'text-indigo-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-gray-500">Real-time salon performance metrics & revenue analytics</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 shadow-sm transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{item.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{item.value}</h3>
              </div>
              <div className={`p-3.5 rounded-2xl ${item.bgColor} ${item.iconColor}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
              <p className="text-xs text-gray-500">Daily earnings from completed appointments</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.revenueTrend || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Appointment Status</h2>
              <p className="text-xs text-gray-500">Breakdown of all bookings</p>
            </div>
            <PieIcon className="w-5 h-5 text-amber-500" />
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.statusDistribution || []}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(charts?.statusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry._id] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
