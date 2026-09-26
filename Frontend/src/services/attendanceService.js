import api from './api';

export const attendanceService = {
  getAttendance: async (params = {}) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },
  checkIn: async (barberId) => {
    const response = await api.post('/attendance/checkin', { barberId });
    return response.data;
  },
  checkOut: async (barberId) => {
    const response = await api.post('/attendance/checkout', { barberId });
    return response.data;
  },
};
