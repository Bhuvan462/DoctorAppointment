import api from './api'

/**
 * Register a new patient
 */
export const registerPatient = async (data) => {
  const response = await api.post('/auth/register/patient', data)
  return response.data
}

/**
 * Register a new doctor
 */
export const registerDoctor = async (data) => {
  const response = await api.post('/auth/register/doctor', data)
  return response.data
}

/**
 * Login any user type
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials)
  return response.data
}

/**
 * Get current authenticated user profile
 */
export const getMe = async () => {
  const response = await api.get('/auth/me')
  return response.data
}

/**
 * Change password
 */
export const changePassword = async (data) => {
  const response = await api.put('/auth/change-password', data)
  return response.data
}

/**
 * Logout
 */
export const logout = async () => {
  const response = await api.post('/auth/logout')
  return response.data
}

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email })
  return response.data
}

export const resetPassword = async (data) => {
  const response = await api.post('/auth/reset-password', data)
  return response.data
}