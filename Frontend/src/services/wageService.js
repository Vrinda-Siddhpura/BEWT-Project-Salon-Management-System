import api from './api';

export const wageService = {
  getWages: async (params = {}) => {
    const response = await api.get('/wages', { params });
    return response.data;
  },
  generateWageRecord: async (wageData) => {
    const response = await api.post('/wages', wageData);
    return response.data;
  },
};
