import axios from 'axios'
import toast from 'react-hot-toast'
import { STORAGE_KEYS } from '../utils/constants'

// ─── Create Axios Instance ────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1'),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    // Attach JWT token to every request if available
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ─── Response Interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => {
    // Return the full response data
    return response
  },
  (error) => {
    const originalRequest = error.config

    // Network error — no response received
    if (!error.response) {
      toast.error('Network error. Please check your internet connection.')
      return Promise.reject(error)
    }

    const { status, data } = error.response

    // 401 Unauthorized — Token expired or invalid
    if (status === 401) {
      // Clear stored auth data
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)

      // Only redirect if not already on auth pages
      const authPaths = ['/login', '/register']
      if (!authPaths.some((path) => window.location.pathname.includes(path))) {
        toast.error('Your session has expired. Please log in again.')
        // Small delay before redirect to allow toast to show
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      }
    }

    // 403 Forbidden
    if (status === 403) {
      toast.error('You do not have permission to perform this action.')
    }

    // 404 Not Found — Only show toast for non-GET requests
    if (status === 404 && originalRequest.method !== 'get') {
      toast.error(data?.message || 'The requested resource was not found.')
    }

    // 429 Too Many Requests
    if (status === 429) {
      toast.error('Too many requests. Please slow down and try again.')
    }

    // 500 Server Error
    if (status >= 500) {
      toast.error('A server error occurred. Please try again later.')
    }

    return Promise.reject(error)
  }
)

// ─── Helper: Extract Error Message ────────────────────────────────────────────

export const getErrorMessage = (error) => {
  if (!error.response) {
    return 'Network error. Please check your connection.'
  }

  const { data } = error.response

  if (data?.errors && data.errors.length > 0) {
    return data.errors.map((e) => e.message).join('. ')
  }

  if (data?.message) {
    return data.message
  }

  return 'An unexpected error occurred.'
}

// ─── Typed API Response Helper ────────────────────────────────────────────────

export const extractData = (response) => response?.data?.data
export const extractMessage = (response) => response?.data?.message
export const extractPagination = (response) => response?.data?.pagination

export default api