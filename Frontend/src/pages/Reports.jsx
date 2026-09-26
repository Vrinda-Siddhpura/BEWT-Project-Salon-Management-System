import React, { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import { formatCurrency } from '../utils/formatters';
import { BarChart3, TrendingUp, Scissors, UserCheck, Users, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [barberPerf, setBarberPerf] = useState([]);
  const [customerVisits, setCustomerVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [dRes, mRes, sRes, bRes, cRes] = await Promise.all([
        reportService.getDailyRevenue(),
        reportService.getMonthlyRevenue(),
        reportService.getTopServices(),
        reportService.getBarberPerformance(),
        reportService.getCustomerVisits(),
      ]);

      if (dRes.success) setDailyData(dRes.data);
      if (mRes.success) setMonthlyData(mRes.data);
      if (sRes.success) setTopServices(sRes.data);
      if (bRes.success) setBarberPerf(bRes.data);
      if (cRes.success) setCustomerVisits(cRes.data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const tabs = [
    { id: 'daily', name: 'Daily Revenue', icon: Calendar },
    { id: 'monthly', name: 'Monthly Revenue', icon: TrendingUp },
    { id: 'services', name: 'Top Services', icon: Scissors },
    { id: 'barbers', name: 'Barber Performance', icon: UserCheck },
    { id: 'customers', name: 'Customer Retention', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">MongoDB Analytics & Business Reports</h1>
        <p className="text-sm text-gray-500">Corporate intelligence powered by native MongoDB aggregation pipelines</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          {/* Daily Revenue Tab */}
          {activeTab === 'daily' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Daily Revenue Analysis</h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip formatter={(val) => [formatCurrency(val), 'Total Revenue']} />
                    <Bar dataKey="totalRevenue" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-xs uppercase font-semibold text-gray-500">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Completed Appointments</th>
                      <th className="px-6 py-3">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {dailyData.map((row) => (
                      <tr key={row._id}>
                        <td className="px-6 py-3 font-semibold">{row._id}</td>
                        <td className="px-6 py-3">{row.totalAppointments}</td>
                        <td className="px-6 py-3 font-bold text-emerald-600">{formatCurrency(row.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Monthly Revenue Tab */}
          {activeTab === 'monthly' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Monthly Growth & Revenue Breakdown</h2>
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-xs uppercase font-semibold text-gray-500">
                    <tr>
                      <th className="px-6 py-3">Month (YYYY-MM)</th>
                      <th className="px-6 py-3">Completed Jobs</th>
                      <th className="px-6 py-3">Monthly Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {monthlyData.map((row) => (
                      <tr key={row._id}>
                        <td className="px-6 py-3 font-semibold">{row._id}</td>
                        <td className="px-6 py-3">{row.totalAppointments}</td>
                        <td className="px-6 py-3 font-bold text-emerald-600">{formatCurrency(row.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Top Performing Services Menu</h2>
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-xs uppercase font-semibold text-gray-500">
                    <tr>
                      <th className="px-6 py-3">Service Name</th>
                      <th className="px-6 py-3">Price</th>
                      <th className="px-6 py-3">Total Bookings</th>
                      <th className="px-6 py-3">Total Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {topServices.map((srv) => (
                      <tr key={srv._id}>
                        <td className="px-6 py-3 font-bold text-gray-900">{srv.serviceName}</td>
                        <td className="px-6 py-3">{formatCurrency(srv.price)}</td>
                        <td className="px-6 py-3 font-semibold text-amber-600">{srv.totalBookings}</td>
                        <td className="px-6 py-3 font-bold text-emerald-600">{formatCurrency(srv.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Barber Performance Tab */}
          {activeTab === 'barbers' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Barber Staff Performance & Commission Report</h2>
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-xs uppercase font-semibold text-gray-500">
                    <tr>
                      <th className="px-6 py-3">Barber Stylist</th>
                      <th className="px-6 py-3">Specialization</th>
                      <th className="px-6 py-3">Jobs Done</th>
                      <th className="px-6 py-3">Revenue Generated</th>
                      <th className="px-6 py-3">Commission Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {barberPerf.map((b) => (
                      <tr key={b._id}>
                        <td className="px-6 py-3 font-bold text-gray-900">{b.barberName}</td>
                        <td className="px-6 py-3 text-gray-500">{b.specialization}</td>
                        <td className="px-6 py-3 font-semibold text-blue-600">{b.totalAppointments}</td>
                        <td className="px-6 py-3 font-semibold">{formatCurrency(b.totalRevenueGenerated)}</td>
                        <td className="px-6 py-3 font-bold text-emerald-600">
                          {formatCurrency(b.estimatedCommission)} ({b.commissionPercentage}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Customer Retention Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Top Loyal Customer Visit Analysis</h2>
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-xs uppercase font-semibold text-gray-500">
                    <tr>
                      <th className="px-6 py-3">Customer Name</th>
                      <th className="px-6 py-3">Phone</th>
                      <th className="px-6 py-3">Total Visits</th>
                      <th className="px-6 py-3">Completed Visits</th>
                      <th className="px-6 py-3">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customerVisits.map((c) => (
                      <tr key={c._id}>
                        <td className="px-6 py-3 font-bold text-gray-900">{c.customerName}</td>
                        <td className="px-6 py-3 text-gray-500">{c.phone}</td>
                        <td className="px-6 py-3 font-semibold text-amber-600">{c.totalVisits}</td>
                        <td className="px-6 py-3 font-semibold text-blue-600">{c.completedVisits}</td>
                        <td className="px-6 py-3 font-bold text-emerald-600">{formatCurrency(c.totalSpent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
