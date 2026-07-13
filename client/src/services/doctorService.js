import api from './api'
import { SPECIALIZATIONS } from '../utils/constants'

/**
 * Get all approved doctors with optional filters
 */
export const getAllDoctors = async (params = {}) => {
  const response = await api.get('/doctors', { params })
  return response.data
}

/**
 * Get a single doctor's public profile
 */
export const getDoctorProfile = async (doctorId) => {
  const response = await api.get(`/doctors/${doctorId}`)
  return response.data
}

/**
 * Get logged-in doctor's own profile
 */
export const getMyDoctorProfile = async () => {
  const response = await api.get('/doctors/profile')
  return response.data
}

/**
 * Get all specializations list (served from local constants — no backend endpoint needed)
 */
export const getSpecializations = async () => {
  return { success: true, data: SPECIALIZATIONS }
}

/**
 * Update doctor's own profile (doctor role)
 */
export const updateDoctorProfile = async (data) => {
  const response = await api.put('/doctors/profile', data)
  return response.data
}

/**
 * Get doctor dashboard statistics
 */
export const getDoctorDashboardStats = async () => {
  const response = await api.get('/doctors/stats')
  return response.data
}

/**
 * Get all appointments for logged-in doctor
 */
export const getDoctorAppointments = async (params = {}) => {
  const response = await api.get('/appointments/doctor', { params })
  return response.data
}

/**
 * Confirm an appointment (doctor)
 */
export const confirmAppointment = async (appointmentId) => {
  const response = await api.put(`/appointments/${appointmentId}/confirm`)
  return response.data
}

/**
 * Reject an appointment (doctor)
 */
export const rejectAppointment = async (appointmentId, data = {}) => {
  const response = await api.put(`/appointments/${appointmentId}/reject`, data)
  return response.data
}

/**
 * Mark appointment as completed (doctor)
 */
export const completeAppointment = async (appointmentId) => {
  const response = await api.put(`/appointments/${appointmentId}/complete`)
  return response.data
}

/**
 * Get reviews for a doctor
 */
export const getDoctorReviews = async (doctorId, params = {}) => {
  const response = await api.get(`/reviews/doctor/${doctorId}`, { params })
  return response.data
}

/**
 * Get availability slots for a doctor
 */
export const getDoctorAvailability = async (params = {}) => {
  const response = await api.get("/availability/doctor", { params })
  return response.data
}

/**
 * Get availability slots for a specific date
 */
export const getDoctorAvailabilityByDate = async (doctorId, date) => {
  const response = await api.get(`/availability/${doctorId}/${date}`)
  return response.data
}

/**
 * Create availability slots (doctor)
 */
export const createAvailabilitySlots = async (data) => {
  const response = await api.post('/availability', data)
  return response.data
}

/**
 * Create bulk availability slots (doctor)
 */
export const createBulkAvailabilitySlots = async (data) => {
  const response = await api.post('/availability/bulk', data)
  return response.data
}

/**
 * Update a slot (block/unblock)
 */
export const updateAvailabilitySlot = async (slotId, data) => {
  const response = await api.put(`/availability/${slotId}`, data)
  return response.data
}

/**
 * Delete a slot
 */
export const deleteAvailabilitySlot = async (slotId) => {
  const response = await api.delete(`/availability/${slotId}`)
  return response.data
}

/**
 * Block a slot
 */
export const blockAvailabilitySlot = async (slotId) => {
  const response = await api.put(`/availability/${slotId}/block`)
  return response.data
}

/**
 * Unblock a slot
 */
export const unblockAvailabilitySlot = async (slotId) => {
  const response = await api.put(`/availability/${slotId}/unblock`)
  return response.data
}

/**
 * Issue prescription
 */
export const issuePrescription = async (data) => {
  const response = await api.post('/prescriptions', data)
  return response.data
}

/**
 * Create a review
 */
export const createReview = async (data) => {
  const response = await api.post('/reviews', data)
  return response.data
}