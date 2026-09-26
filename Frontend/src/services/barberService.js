import api from './api';

export const barberService = {
  getBarbers: async () => {
    const response = await api.get('/barbers');
    return response.data;
  },
  getBarberById: async (id) => {
    const response = await api.get(`/barbers/${id}`);
    return response.data;
  },
  createBarber: async (barberData) => {
    const response = await api.post('/barbers', barberData);
    return response.data;
  },
  updateBarber: async (id, barberData) => {
    const response = await api.put(`/barbers/${id}`, barberData);
    return response.data;
  },
  deleteBarber: async (id) => {
    const response = await api.delete(`/barbers/${id}`);
    return response.data;
  },
};
