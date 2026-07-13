import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import { AuthProvider }         from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute, { GuestRoute, PageLoader } from './routes/ProtectedRoute'
import { ROLES }                from './utils/constants'

// ─── Lazy Page Imports ─────────────────────────────────────────────────────────

// Public pages
const LandingPage    = lazy(() => import('./pages/public/LandingPage'))
const LoginPage      = lazy(() => import('./pages/public/LoginPage'))
const RegisterPage   = lazy(() => import('./pages/public/RegisterPage'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword  = lazy(() => import('./pages/auth/ResetPassword'))
const NotFoundPage   = lazy(() => import('./pages/public/NotFoundPage'))
const AITriage       = lazy(() => import('./pages/public/AITriage'))

// Patient pages
const PatientDashboard      = lazy(() => import('./pages/patient/PatientDashboard'))
const FindDoctors           = lazy(() => import('./pages/patient/FindDoctors'))
const DoctorProfilePage     = lazy(() => import('./pages/patient/DoctorProfilePage'))
const BookAppointment       = lazy(() => import('./pages/patient/BookAppointment'))
const MyAppointments        = lazy(() => import('./pages/patient/MyAppointments'))
const AppointmentDetail     = lazy(() => import('./pages/patient/AppointmentDetail'))
const MyPrescriptions       = lazy(() => import('./pages/patient/MyPrescriptions'))
const MyPayments            = lazy(() => import('./pages/patient/MyPayments'))
const PatientProfile        = lazy(() => import('./pages/patient/PatientProfile'))
const PatientHealthDashboard = lazy(() => import('./pages/patient/PatientHealthDashboard'))

// Doctor pages
const DoctorDashboard       = lazy(() => import('./pages/doctor/DoctorDashboard'))
const ManageAvailability    = lazy(() => import('./pages/doctor/ManageAvailability'))
const DoctorAppointments    = lazy(() => import('./pages/doctor/DoctorAppointments'))
const DoctorAppointmentDetail = lazy(() => import('./pages/doctor/DoctorAppointmentDetail'))
const DoctorProfile         = lazy(() => import('./pages/doctor/DoctorProfile'))
const DoctorHealthView      = lazy(() => import('./pages/doctor/DoctorHealthView'))


// Admin pages
const AdminDashboard        = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers            = lazy(() => import('./pages/admin/AdminUsers'))
const AdminDoctors          = lazy(() => import('./pages/admin/AdminDoctors'))
const AdminAppointments     = lazy(() => import('./pages/admin/AdminAppointments'))
const AdminPayments         = lazy(() => import('./pages/admin/AdminPayments'))
const AdminReports          = lazy(() => import('./pages/admin/AdminReports'))

// Shared pages
const Notifications         = lazy(() => import('./pages/shared/Notifications'))

// ─── Layouts ──────────────────────────────────────────────────────────────────

const PatientLayout = lazy(() => import('./layouts/PatientLayout'))
const DoctorLayout  = lazy(() => import('./layouts/DoctorLayout'))
const AdminLayout   = lazy(() => import('./layouts/AdminLayout'))

// ─── App Component ────────────────────────────────────────────────────────────

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes>

              {/* ── Public Routes ── */}
              <Route
                path="/"
                element={<LandingPage />}
              />
              <Route
                path="/triage"
                element={<AITriage />}
              />
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <RegisterPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <GuestRoute>
                    <ForgotPassword />
                  </GuestRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <GuestRoute>
                    <ResetPassword />
                  </GuestRoute>
                }
              />

              {/* ── Patient Routes ── */}
              <Route
                path="/patient"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
                    <PatientLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard"               element={<PatientDashboard />} />
                <Route path="find-doctors"            element={<FindDoctors />} />
                <Route path="doctors/:doctorId"       element={<DoctorProfilePage />} />
                <Route path="book/:doctorId"          element={<BookAppointment />} />
                <Route path="appointments"            element={<MyAppointments />} />
                <Route path="appointments/:id"        element={<AppointmentDetail />} />
                <Route path="prescriptions"           element={<MyPrescriptions />} />
                <Route path="payments"                element={<MyPayments />} />
                <Route path="health"                  element={<PatientHealthDashboard />} />
                <Route path="notifications"           element={<Notifications />} />
                <Route path="profile"                 element={<PatientProfile />} />
              </Route>

              {/* ── Doctor Routes ── */}
              <Route
                path="/doctor"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}>
                    <DoctorLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard"               element={<DoctorDashboard />} />
                <Route path="availability"            element={<ManageAvailability />} />
                <Route path="appointments"            element={<DoctorAppointments />} />
                <Route path="appointments/:id"        element={<DoctorAppointmentDetail />} />
                <Route path="patient-health/:patientId" element={<DoctorHealthView />} />
                <Route path="notifications"           element={<Notifications />} />
                <Route path="profile"                 element={<DoctorProfile />} />
               
              </Route>

              {/* ── Admin Routes ── */}
              <Route
                path="/admin"
                 element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="doctors" element={<AdminDoctors />} />
                <Route path="appointments" element={<AdminAppointments />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="reports" element={<AdminReports />} />
            </Route>
              {/* ── Catch All ── */}
              <Route path="*" element={<NotFoundPage />} />

            </Routes>
          </AnimatePresence>
        </Suspense>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App

