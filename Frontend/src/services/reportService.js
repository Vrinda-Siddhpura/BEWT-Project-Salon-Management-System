import api from './api';

export const reportService = {
  getDailyRevenue: async () => {
    const response = await api.get('/reports/daily-revenue');
    return response.data;
  },
  getMonthlyRevenue: async () => {
    const response = await api.get('/reports/monthly-revenue');
    return response.data;
  },
  getTopServices: async () => {
    const response = await api.get('/reports/top-services');
    return response.data;
  },
  getBarberPerformance: async () => {
    const response = await api.get('/reports/barber-performance');
    return response.data;
  },
  getCustomerVisits: async () => {
    const response = await api.get('/reports/customer-visits');
    return response.data;
  },
};
