import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../utils/constants'

// ─── Full Page Loading Spinner ─────────────────────────────────────────────────

const PageLoader = () => (
  <div className="fixed inset-0 bg-[#06122b] flex items-center justify-center z-50">
    {/* Aurora background */}
    <div className="aurora-bg">
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
    </div>

    <div className="relative z-10 flex flex-col items-center gap-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-glow-blue">
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <span className="text-2xl font-bold text-white tracking-tight">MediBook</span>
      </div>

      {/* Spinner */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
      </div>

      <p className="text-slate-400 text-sm animate-pulse">Loading your experience...</p>
    </div>
  </div>
)

// ─── Protected Route ───────────────────────────────────────────────────────────

/**
 * ProtectedRoute — Blocks access to routes based on:
 * 1. Authentication status
 * 2. Required role(s)
 *
 * Props:
 * - allowedRoles: string[] — which roles are allowed (empty = any authenticated user)
 * - redirectPath: string  — where to redirect if blocked (default: /login)
 */
const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectPath = '/login',
}) => {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuth()
  const location = useLocation()

  // Still initializing — show loader
  if (!isInitialized || isLoading) {
    return <PageLoader />
  }

  // Not authenticated — redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectPath}
        state={{ from: location }}
        replace
      />
    )
  }

  // Role check — if allowedRoles specified, verify user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to their own dashboard based on role
    const roleDashboard = {
      [ROLES.PATIENT]: '/patient/dashboard',
      [ROLES.DOCTOR]:  '/doctor/dashboard',
      [ROLES.ADMIN]:   '/admin/dashboard',
    }
    const fallback = roleDashboard[user?.role] || '/login'
    return <Navigate to={fallback} replace />
  }

  return children
}

// ─── Guest Route (Redirect if already logged in) ───────────────────────────────

/**
 * GuestRoute — Redirects already authenticated users away from auth pages
 */
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuth()
  const location = useLocation()

  if (!isInitialized || isLoading) {
    return <PageLoader />
  }

  if (isAuthenticated && user) {
    // Redirect to role-specific dashboard
    const roleDashboard = {
      [ROLES.PATIENT]: '/patient/dashboard',
      [ROLES.DOCTOR]:  '/doctor/dashboard',
      [ROLES.ADMIN]:   '/admin/dashboard',
    }
    const from = location.state?.from?.pathname || roleDashboard[user.role] || '/'
    return <Navigate to={from} replace />
  }

  return children
}

export { PageLoader }
export default ProtectedRoute