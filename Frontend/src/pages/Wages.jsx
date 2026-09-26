import React, { useEffect, useState } from 'react';
import { wageService } from '../services/wageService';
import { barberService } from '../services/barberService';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatters';
import { IndianRupee, Calculator, Plus, X, Award, CheckCircle2 } from 'lucide-react';

const Wages = () => {
  const { isAdmin, isBarber } = useAuth();
  const [wages, setWages] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    barberId: '',
    month: new Date().toISOString().substring(0, 7),
    baseSalary: 15000,
  });
  const [modalError, setModalError] = useState('');
  const [payrollSummary, setPayrollSummary] = useState(null);

  const fetchWages = async () => {
    setLoading(true);
    try {
      const res = await wageService.getWages();
      if (res.success) {
        setWages(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch wage records', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBarbers = async () => {
    if (isAdmin) {
      try {
        const res = await barberService.getBarbers();
        if (res.success) {
          setBarbers(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, barberId: res.data[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch barbers', err);
      }
    }
  };

  useEffect(() => {
    fetchBarbers();
    fetchWages();
  }, []);

  const handleOpenModal = () => {
    setModalError('');
    setPayrollSummary(null);
    setIsModalOpen(true);
  };

  const handleCalculatePayroll = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      const res = await wageService.generateWageRecord(formData);
      if (res.success) {
        setPayrollSummary(res.data);
        fetchWages();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to calculate payroll');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Wages & Commission Payroll</h1>
          <p className="text-sm text-gray-500">Automated commission processing based on completed service jobs</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all"
          >
            <Calculator className="w-4 h-4" /> Calculate Monthly Payroll
          </button>
        )}
      </div>

      {/* Wage Records Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : wages.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No wage payroll records generated yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Barber Stylist</th>
                  <th className="px-6 py-4">Payroll Month</th>
                  <th className="px-6 py-4">Base Salary</th>
                  <th className="px-6 py-4">Earned Commission</th>
                  <th className="px-6 py-4">Total Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {wages.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {record.barberId?.userId?.name || 'Stylist'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-600">{record.month}</td>
                    <td className="px-6 py-4 text-gray-700">{formatCurrency(record.salary)}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      {formatCurrency(record.commission)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg border border-amber-200">
                        {formatCurrency(record.totalAmount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Calculate Payroll Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Process Barber Payroll</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCalculatePayroll} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Select Barber</label>
                <select
                  required
                  value={formData.barberId}
                  onChange={(e) => setFormData({ ...formData, barberId: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-white"
                >
                  {barbers.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.userId?.name} (Commission: {b.commissionPercentage}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Month (YYYY-MM)</label>
                <input
                  type="month"
                  required
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Base Monthly Salary (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {payrollSummary && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs text-emerald-900">
                  <div className="flex items-center gap-1 font-bold text-sm text-emerald-800">
                    <CheckCircle2 className="w-4 h-4" /> Payroll Finalized!
                  </div>
                  <p>Completed Jobs Count: {payrollSummary.completedAppointmentsCount}</p>
                  <p>Commission Percentage: {payrollSummary.commissionPercentage}%</p>
                  <p className="font-bold text-base pt-1">
                    Total Payout: {formatCurrency(payrollSummary.wageRecord?.totalAmount)}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-amber-600"
                >
                  Calculate & Finalize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wages;
