import api from './api';

export const getMyHealthRecord = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const updateMyHealthInfo = async (data) => {
  const response = await api.put('/health', data);
  return response.data;
};

export const getPatientHealthRecord = async (patientId) => {
  const response = await api.get(`/health/patient/${patientId}`);
  return response.data;
};

export const appendMedicalData = async (patientId, data) => {
  const response = await api.post(`/health/patient/${patientId}/data`, data);
  return response.data;
};
