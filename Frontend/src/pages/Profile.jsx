import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { User, Mail, ShieldCheck, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      if (res.success) {
        setSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Profile & Security</h1>
        <p className="text-sm text-gray-500">Manage user credentials and security preferences</p>
      </div>

      {/* User Information Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-amber-500" /> User Profile Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
          <div className="p-4 bg-gray-50 rounded-xl space-y-1">
            <span className="text-xs text-gray-500 font-semibold uppercase">Full Name</span>
            <p className="font-bold text-gray-900">{user?.name}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl space-y-1">
            <span className="text-xs text-gray-500 font-semibold uppercase">Email Address</span>
            <p className="font-bold text-gray-900 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-gray-400" /> {user?.email}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl space-y-1">
            <span className="text-xs text-gray-500 font-semibold uppercase">Assigned Role</span>
            <p className="font-bold text-purple-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> {user?.role}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl space-y-1">
            <span className="text-xs text-gray-500 font-semibold uppercase">Account Status</span>
            <p className="font-bold text-emerald-600">Active</p>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-amber-500" /> Change Security Password
        </h2>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
