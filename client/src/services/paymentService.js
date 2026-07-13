import api from './api';

export const processPayment = (paymentData) => {
  return api.post('/payments/process', paymentData);
};

export const getPaymentHistory = (params) => {
  return api.get('/payments/history', { params });
};

export const getAdminPayments = (params) => {
  return api.get('/payments/admin/all', { params });
};

export const getPaymentById = (id) => {
  return api.get(`/payments/${id}`);
};
