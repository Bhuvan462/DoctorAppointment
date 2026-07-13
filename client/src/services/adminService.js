import api from './api'

/**
 * Get admin dashboard statistics
 */
export const getDashboardStats = async () => {
  const response = await api.get('/admin/stats')
  return response.data
}

/**
 * Get all patients
 */
export const getAllPatients = async (params = {}) => {
  const response = await api.get('/admin/users', { params })
  return response.data
}

/**
 * Get single patient details
 */
export const getPatientById = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`)
  return response.data
}

/**
 * Toggle user active status (deactivate if active, activate if inactive)
 */
export const toggleUserStatus = async (userId, isCurrentlyActive) => {
  const endpoint = isCurrentlyActive
    ? `/admin/users/${userId}/deactivate`
    : `/admin/users/${userId}/activate`
  const response = await api.patch(endpoint)
  return response.data
}

/**
 * Get all doctors (approved and pending)
 */
export const getAllDoctors = async (params = {}) => {
  const response = await api.get('/admin/doctors', { params })
  return response.data
}

export const approveDoctor = async (doctorId) => {
  const response = await api.patch(`/admin/doctors/${doctorId}/approve`)
  return response.data
}

export const rejectDoctor = async (doctorId, data = {}) => {
  const response = await api.patch(`/admin/doctors/${doctorId}/reject`, data)
  return response.data
}

/**
 * Get all appointments (admin view)
 */
export const getAllAppointments = async (params = {}) => {
  const response = await api.get('/appointments', { params })
  return response.data
}

/**
 * Get operational reports
 */
export const getReports = async (params = {}) => {
  const response = await api.get('/admin/reports', { params })
  return response.data
}