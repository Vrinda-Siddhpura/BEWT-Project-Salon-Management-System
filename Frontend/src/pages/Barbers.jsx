import React, { useEffect, useState } from 'react';
import { barberService } from '../services/barberService';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatters';
import { UserCheck, Mail, Calendar, Percent, Plus, Edit2, Trash2, X, Award } from 'lucide-react';

const Barbers = () => {
  const { isAdmin } = useAuth();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    commissionPercentage: 40,
    status: 'Active',
  });
  const [formError, setFormError] = useState('');

  const fetchBarbers = async () => {
    setLoading(true);
    try {
      const res = await barberService.getBarbers();
      if (res.success) {
        setBarbers(res.data);
      }
    } catch (err) {
      setError('Failed to fetch barbers list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarbers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingBarber(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      specialization: '',
      commissionPercentage: 40,
      status: 'Active',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b) => {
    setEditingBarber(b);
    setFormData({
      name: b.userId?.name || '',
      email: b.userId?.email || '',
      password: '',
      specialization: b.specialization,
      commissionPercentage: b.commissionPercentage,
      status: b.status,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingBarber) {
        await barberService.updateBarber(editingBarber._id, formData);
      } else {
        await barberService.createBarber(formData);
      }
      setIsModalOpen(false);
      fetchBarbers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save barber profile');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this barber account?')) return;
    try {
      await barberService.deleteBarber(id);
      fetchBarbers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete barber');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Barber Staff Directory</h1>
          <p className="text-sm text-gray-500">Manage styling staff, commission structures, and specialization profiles</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Add Barber Staff
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-rose-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.map((barber) => (
            <div
              key={barber._id}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      {barber.userId?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{barber.userId?.name || 'Stylist'}</h3>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {barber.userId?.email}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      barber.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {barber.status}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Award className="w-3.5 h-3.5 text-amber-500" /> Specialization
                    </span>
                    <span className="font-semibold text-gray-900">{barber.specialization}</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Percent className="w-3.5 h-3.5 text-blue-500" /> Commission Rate
                    </span>
                    <span className="font-bold text-emerald-600">{barber.commissionPercentage}%</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" /> Joined Date
                    </span>
                    <span>{formatDate(barber.joiningDate)}</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
                  <button
                    onClick={() => handleOpenEditModal(barber)}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(barber._id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {editingBarber ? 'Edit Barber Staff' : 'Add Barber Staff'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {!editingBarber && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Specialization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haircuts, Styling & Beard Grooming"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Commission (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.commissionPercentage}
                    onChange={(e) => setFormData({ ...formData, commissionPercentage: Number(e.target.value) })}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-amber-600"
                >
                  Save Barber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Barbers;
