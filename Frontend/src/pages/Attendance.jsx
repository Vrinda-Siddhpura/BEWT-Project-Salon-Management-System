import React, { useEffect, useState } from 'react';
import { attendanceService } from '../services/attendanceService';
import { barberService } from '../services/barberService';
import { useAuth } from '../hooks/useAuth';
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

const Attendance = () => {
  const { user, isBarber, isAdmin } = useAuth();
  const [attendanceList, setAttendanceList] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (selectedBarberId) params.barberId = selectedBarberId;

      const res = await attendanceService.getAttendance(params);
      if (res.success) {
        setAttendanceList(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance history', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBarbers = async () => {
    if (isAdmin) {
      try {
        const res = await barberService.getBarbers();
        if (res.success) setBarbers(res.data);
      } catch (err) {
        console.error('Failed to fetch barbers', err);
      }
    }
  };

  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [filterDate, selectedBarberId]);

  const handleCheckIn = async (targetBarberId) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await attendanceService.checkIn(targetBarberId);
      if (res.success) {
        setActionSuccess('Check-in recorded successfully!');
        fetchAttendance();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async (targetBarberId) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await attendanceService.checkOut(targetBarberId);
      if (res.success) {
        setActionSuccess('Check-out recorded successfully!');
        fetchAttendance();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to check out');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Attendance Log</h1>
          <p className="text-sm text-gray-500">Track check-in, check-out sessions, and daily barber presence</p>
        </div>
      </div>

      {/* Alert Messages */}
      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Barber Check In/Out Quick Card */}
      {isBarber && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Today's Attendance Panel</h3>
              <p className="text-xs text-slate-400">Mark your check-in when starting work and check-out when leaving</p>
            </div>
            <Clock className="w-6 h-6 text-amber-400" />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => handleCheckIn()}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
            >
              <LogIn className="w-5 h-5" /> Check In
            </button>

            <button
              onClick={() => handleCheckOut()}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              <LogOut className="w-5 h-5" /> Check Out
            </button>
          </div>
        </div>
      )}

      {/* Admin Quick Action Bar & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:border-amber-500"
            />
          </div>

          {isAdmin && (
            <select
              value={selectedBarberId}
              onChange={(e) => setSelectedBarberId(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Barbers</option>
              {barbers.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.userId?.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : attendanceList.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No attendance records logged for the selected date.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Barber Staff</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Check-In Time</th>
                  <th className="px-6 py-4">Check-Out Time</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {attendanceList.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {record.barberId?.userId?.name || 'Stylist'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record.date}</td>
                    <td className="px-6 py-4 font-medium text-emerald-600">
                      {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {record.checkOut ? (
                        <span className="font-medium text-rose-600">
                          {new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-semibold italic">Session Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {record.checkOut ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          Shift Completed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          On Duty
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
