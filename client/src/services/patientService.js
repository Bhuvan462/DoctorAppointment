import api from './api'

/**
 * Get patient profile
 */
export const getPatientProfile = async () => {
  const response = await api.get('/users/profile')
  return response.data
}

/**
 * Update patient profile
 */
export const updatePatientProfile = async (data) => {
  const response = await api.put('/users/profile', data)
  return response.data
}

/**
 * Upload profile photo
 */
export const uploadProfilePhoto = async (formData) => {
  const response = await api.put('/users/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

/**
 * Get all appointments for the logged-in patient
 */
export const getPatientAppointments = async (params = {}) => {
  const response = await api.get('/appointments/patient', { params })
  return response.data
}

/**
 * Get single appointment detail
 */
export const getAppointmentDetail = async (appointmentId) => {
  const response = await api.get(`/appointments/${appointmentId}`)
  return response.data
}

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (appointmentId, data = {}) => {
  const response = await api.put(`/appointments/${appointmentId}/cancel`, data)
  return response.data
}

/**
 * Reschedule an appointment
 */
export const rescheduleAppointment = async (appointmentId, data) => {
  const response = await api.put(`/appointments/${appointmentId}/reschedule`, data)
  return response.data
}

/**
 * Get all prescriptions for the patient
 */
export const getPatientPrescriptions = async (params = {}) => {
  const response = await api.get('/prescriptions/patient', { params })
  return response.data
}

/**
 * Get single prescription
 */
export const getPrescriptionDetail = async (prescriptionId) => {
  const response = await api.get(`/prescriptions/${prescriptionId}`)
  return response.data
}

/**
 * Submit a review for a doctor
 */
export const submitReview = async (data) => {
  const response = await api.post('/reviews', data)
  return response.data
}

/**
 * Get patient dashboard stats
 */
export const getPatientDashboardStats = async () => {
  const response = await api.get('/users/stats')
  return response.data
}