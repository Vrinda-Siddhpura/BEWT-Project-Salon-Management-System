import React, { useEffect, useState } from 'react';
import { appointmentService } from '../services/appointmentService';
import { customerService } from '../services/customerService';
import { barberService } from '../services/barberService';
import { serviceService } from '../services/serviceService';
import { useAuth } from '../hooks/useAuth';
import { formatTime, formatCurrency, getStatusBadgeClass } from '../utils/formatters';
import { Calendar as CalendarIcon, Clock, Plus, Filter, AlertTriangle, CheckCircle, XCircle, RefreshCw, X } from 'lucide-react';

const Appointments = () => {
  const { user, isBarber } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterBarber, setFilterBarber] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [formData, setFormData] = useState({
    customerId: '',
    barberId: '',
    serviceId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    remarks: '',
  });

  const [selectedServiceDuration, setSelectedServiceDuration] = useState(0);
  const [calculatedEndTime, setCalculatedEndTime] = useState('10:30');

  // Edit status modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState(null);
  const [newStatus, setNewStatus] = useState('Completed');

  const fetchDependencies = async () => {
    try {
      const [custRes, barbRes, servRes] = await Promise.all([
        customerService.getCustomers({ limit: 100 }),
        barberService.getBarbers(),
        serviceService.getServices(),
      ]);
      if (custRes.success) setCustomers(custRes.data.customers);
      if (barbRes.success) setBarbers(barbRes.data);
      if (servRes.success) setServices(servRes.data);
    } catch (err) {
      console.error('Error loading dropdown dependencies', err);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterBarber) params.barberId = filterBarber;
      if (filterStatus) params.status = filterStatus;

      const res = await appointmentService.getAppointments(params);
      if (res.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [filterDate, filterBarber, filterStatus]);

  // Recalculate end time automatically when start time or service changes
  useEffect(() => {
    if (!formData.serviceId || !formData.startTime) return;
    const selectedSrv = services.find((s) => s._id === formData.serviceId);
    if (selectedSrv) {
      setSelectedServiceDuration(selectedSrv.duration);
      const [h, m] = formData.startTime.split(':').map(Number);
      const totalMins = h * 60 + m + selectedSrv.duration;
      const endH = String(Math.floor(totalMins / 60)).padStart(2, '0');
      const endM = String(totalMins % 60).padStart(2, '0');
      setCalculatedEndTime(`${endH}:${endM}`);
    }
  }, [formData.serviceId, formData.startTime, services]);

  const handleOpenBookingModal = () => {
    setBookingError('');
    setFormData({
      customerId: customers[0]?._id || '',
      barberId: barbers[0]?._id || '',
      serviceId: services[0]?._id || '',
      appointmentDate: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      remarks: '',
    });
    setIsModalOpen(true);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    try {
      const res = await appointmentService.createAppointment(formData);
      if (res.success) {
        setIsModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Conflict detected. Unable to book slot.');
    }
  };

  const handleOpenStatusModal = (apt) => {
    setEditingApt(apt);
    setNewStatus(apt.status);
    setIsStatusModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!editingApt) return;
    try {
      await appointmentService.updateAppointment(editingApt._id, { status: newStatus });
      setIsStatusModalOpen(false);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Appointment Scheduling Engine</h1>
          <p className="text-sm text-gray-500">Real-time slot booking with double-booking & shift overlap validation</p>
        </div>
        {!isBarber && (
          <button
            onClick={handleOpenBookingModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        )}
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:border-amber-500"
            />
          </div>

          {!isBarber && (
            <select
              value={filterBarber}
              onChange={(e) => setFilterBarber(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Barbers</option>
              {barbers.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.userId?.name} ({b.specialization})
                </option>
              ))}
            </select>
          )}

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <button
          onClick={fetchAppointments}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          title="Refresh Schedule"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No appointments scheduled for the selected criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Time Slot</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Barber Stylist</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-500" />
                        {apt.startTime} - {apt.endTime}
                      </div>
                      <span className="text-xs text-gray-400">{apt.appointmentDate}</span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{apt.customerId?.name || 'Customer'}</p>
                      <p className="text-xs text-gray-500">{apt.customerId?.phone}</p>
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-800">
                      {apt.barberId?.userId?.name || 'Assigned Barber'}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{apt.serviceId?.serviceName}</p>
                      <p className="text-xs text-gray-500">
                        {apt.serviceId?.duration} mins • {formatCurrency(apt.serviceId?.price)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenStatusModal(apt)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Book Appointment Slot</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Booking Error / Conflict:</span>
                  {bookingError}
                </div>
              </div>
            )}

            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Customer</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-white"
                >
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Barber Stylist</label>
                <select
                  required
                  value={formData.barberId}
                  onChange={(e) => setFormData({ ...formData, barberId: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-white"
                >
                  {barbers.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.userId?.name} ({b.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Service</label>
                <select
                  required
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-white"
                >
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.serviceName} ({s.duration} mins - ₹{s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Start Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex justify-between items-center">
                <span>Calculated Duration: {selectedServiceDuration} mins</span>
                <span className="font-bold">Calculated End Time: {calculatedEndTime}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="Special requests or instructions..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
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
                  Confirm & Book Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {isStatusModalOpen && editingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Update Status</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">
                Booking for <span className="font-bold text-gray-900">{editingApt.customerId?.name}</span> with{' '}
                <span className="font-bold text-gray-900">{editingApt.barberId?.userId?.name}</span>
              </p>

              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 border rounded-xl text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-amber-600"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
