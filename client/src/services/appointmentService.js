import api from './api'

/**
 * Get available (not booked, not blocked) slots for a specific doctor
 * @param {string} doctorId
 * @param {string} [date] - Optional date filter (YYYY-MM-DD)
 */
export const getAvailableSlots = async (doctorId, date) => {
  const params = date ? { date } : {}
  const response = await api.get(`/availability/available/${doctorId}`, { params })
  return response.data
}

/**
 * Book a new appointment
 */
export const bookAppointment = async (data) => {
  const response = await api.post('/appointments', data)
  return response.data
}

/**
 * Get all appointments for patient
 */
export const getPatientAppointments = async (params = {}) => {
  const response = await api.get('/appointments/patient', { params })
  return response.data
}

/**
 * Get all appointments for doctor
 */
export const getDoctorAppointments = async (params = {}) => {
  const response = await api.get('/appointments/doctor', { params })
  return response.data
}

/**
 * Get single appointment by ID
 */
export const getAppointmentById = async (appointmentId) => {
  const response = await api.get(`/appointments/${appointmentId}`)
  return response.data
}


/**
 * Cancel appointment
 */
export const cancelAppointment = async (appointmentId, data = {}) => {
  const response = await api.put(`/appointments/${appointmentId}/cancel`, data)
  return response.data
}

/**
 * Reschedule appointment
 */
export const rescheduleAppointment = async (appointmentId, data) => {
  const response = await api.put(`/appointments/${appointmentId}/reschedule`, data)
  return response.data
}

/**
 * Confirm appointment (doctor)
 */
export const confirmAppointment = async (appointmentId) => {
  const response = await api.put(`/appointments/${appointmentId}/confirm`)
  return response.data
}

/**
 * Reject appointment (doctor)
 */
export const rejectAppointment = async (appointmentId, data = {}) => {
  const response = await api.put(`/appointments/${appointmentId}/reject`, data)
  return response.data
}

/**
 * Complete appointment (doctor)
 */
export const completeAppointment = async (appointmentId) => {
  const response = await api.put(`/appointments/${appointmentId}/complete`)
  return response.data
}

/**
 * Upload Prescription
 */
export const uploadPrescription = async (appointmentId, formData) => {
  const response = await api.post(`/prescriptions/upload/${appointmentId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/**
 * Get Prescription by Appointment ID
 */
export const getPrescriptionByAppointmentId = async (appointmentId) => {
  const response = await api.get(`/prescriptions/appointment/${appointmentId}`)
  return response.data
}