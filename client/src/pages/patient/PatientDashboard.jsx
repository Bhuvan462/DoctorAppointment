import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Search, FileText, Pill,
  Clock, ChevronRight, Star, Activity,
  CheckCircle, XCircle, AlertCircle, Plus,
  Stethoscope, TrendingUp, Bell, IndianRupee, Users
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getPatientAppointments, getPatientDashboardStats } from '../../services/patientService'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import StatCard from '../../components/common/StatCard'
import { CardSkeleton } from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import AnalyticsChart from '../../components/analytics/AnalyticsChart'
import {
  formatDateShort, formatDateRelative,
  formatTime12, getDoctorName, getInitials
} from '../../utils/formatters'
import { APPOINTMENT_STATUS } from '../../utils/constants'
import toast from 'react-hot-toast'

// ─── Welcome Banner ────────────────────────────────────────────────────────────
const WelcomeBanner = ({ user }) => {
  const hour    = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening'

  return (
    <motion.div
      className="relative glass-card p-6 sm:p-8 overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-teal-500/10 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      {/* Floating circles decoration */}
      <div className="absolute right-6 top-6 w-24 h-24 rounded-full bg-blue-500/5 border border-blue-500/10" />
      <div className="absolute right-16 top-12 w-12 h-12 rounded-full bg-teal-500/5 border border-teal-500/10" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <motion.p
            className="text-slate-400 text-sm mb-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {greeting} 👋
          </motion.p>
          <motion.h1
            className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {user?.firstName} {user?.lastName}
          </motion.h1>
          <motion.p
            className="text-slate-400 text-sm max-w-md"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            Manage your health journey from your personal dashboard.
          </motion.p>
        </div>

        {/* Avatar */}
        <motion.div
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-glow-blue"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        >
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt="Profile"
              className="w-full h-full rounded-2xl object-cover"
            />
          ) : (
            <span className="text-white text-lg font-bold">
              {getInitials(user?.firstName, user?.lastName)}
            </span>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Quick Actions ─────────────────────────────────────────────────────────────
const QuickActions = () => {
  const navigate = useNavigate()

  const actions = [
    {
      label:   'Find a Doctor',
      icon:    <Search className="w-5 h-5" />,
      color:   'from-blue-600 to-blue-700',
      glow:    'hover:shadow-glow-blue',
      action:  () => navigate('/patient/find-doctors'),
    },
    {
      label:   'My Appointments',
      icon:    <Calendar className="w-5 h-5" />,
      color:   'from-teal-600 to-teal-700',
      glow:    'hover:shadow-glow-teal',
      action:  () => navigate('/patient/appointments'),
    },
    {
      label:   'Prescriptions',
      icon:    <Pill className="w-5 h-5" />,
      color:   'from-purple-600 to-purple-700',
      glow:    'hover:shadow-glow-purple',
      action:  () => navigate('/patient/prescriptions'),
    },
    {
      label:   'My Profile',
      icon:    <FileText className="w-5 h-5" />,
      color:   'from-amber-600 to-amber-700',
      glow:    '',
      action:  () => navigate('/patient/profile'),
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action, i) => (
        <motion.button
          key={action.label}
          onClick={action.action}
          className={`
            relative group flex flex-col items-center gap-3 p-5 rounded-2xl
            bg-gradient-to-br ${action.color}
            ${action.glow}
            border border-white/10
            transition-all duration-300
            hover:-translate-y-1
            overflow-hidden
          `}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Shimmer */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="relative z-10 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
            {action.icon}
          </div>
          <span className="relative z-10 text-white text-xs font-semibold text-center leading-tight">
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  )
}

// ─── Appointment Card ──────────────────────────────────────────────────────────
const AppointmentCard = ({ appointment, index }) => {
  const navigate = useNavigate()

  const doctor    = appointment.doctorId
  const isUpcoming = ['pending', 'confirmed'].includes(appointment.status)

  return (
    <motion.div
      className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-pointer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onClick={() => navigate(`/patient/appointments/${appointment._id}`)}
      whileHover={{ x: 4 }}
    >
      {/* Doctor avatar */}
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
        {doctor?.profilePhoto ? (
          <img
            src={doctor.profilePhoto}
            alt="Doctor"
            className="w-full h-full rounded-xl object-cover"
          />
        ) : (
          <span className="text-white text-sm font-bold">
            {getInitials(doctor?.firstName, doctor?.lastName)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200 truncate">
          {getDoctorName(doctor?.firstName, doctor?.lastName)}
        </p>
        <p className="text-xs text-slate-500 truncate">
          {appointment.doctorId?.doctorProfile?.specialization || 'Doctor'}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Clock className="w-3 h-3 text-slate-600 flex-shrink-0" />
          <span className="text-xs text-slate-500">
            {formatDateRelative(appointment.appointmentDate)} · {formatTime12(appointment.startTime)}
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <Badge status={appointment.status} />
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>
    </motion.div>
  )
}

// ─── Patient Dashboard ─────────────────────────────────────────────────────────
const PatientDashboard = () => {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [stats, setStats]               = useState(null)
  const [loading, setLoading]           = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [listRes, statsRes] = await Promise.all([
        getPatientAppointments({ limit: 100 }),
        getPatientDashboardStats()
      ]);

      setAppointments(Array.isArray(listRes?.data?.appointments) ? listRes.data.appointments : [])
      setStats(statsRes?.data || null)
    } catch (err) {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Split appointments
  const upcoming  = appointments
    .filter((a) => ['pending', 'confirmed'].includes(a.status))
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 5)

  const recent = appointments
    .filter((a) => ['completed', 'cancelled', 'rejected'].includes(a.status))
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
    .slice(0, 3)

  return (
    <PageTransition>
      <div className="space-y-6 max-w-6xl mx-auto">

        {/* Welcome banner */}
        <WelcomeBanner user={user} />

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <QuickActions />
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Upcoming Appts" value={stats?.overview?.upcomingAppointments || 0} icon={<Calendar className="w-5 h-5" />} color="blue" animate={!loading} />
          <StatCard title="Completed Appts" value={stats?.overview?.completedAppointments || 0} icon={<CheckCircle className="w-5 h-5" />} color="emerald" animate={!loading} />
          <StatCard title="Money Spent" prefix="₹" value={stats?.overview?.moneySpent || 0} icon={<IndianRupee className="w-5 h-5" />} color="amber" animate={!loading} />
          <StatCard title="Prescriptions" value={stats?.overview?.prescriptionCount || 0} icon={<Pill className="w-5 h-5" />} color="purple" animate={!loading} />
        </div>

        {/* Payment History Chart */}
        <div className="h-96">
          <AnalyticsChart 
            title="Money Spent (6 Months)" 
            description="Your expenses on completed appointments"
            data={stats?.charts?.paymentHistory || []} 
            type="area" 
            dataKey="spent" 
            emptyMessage="No payments made yet"
          />
        </div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Upcoming appointments */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Upcoming Appointments
              </h2>
              <button
                onClick={() => navigate('/patient/appointments')}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <GlassCard padding="sm">
              {loading ? (
                <CardSkeleton count={3} />
              ) : upcoming.length === 0 ? (
                <EmptyState
                  icon={<Calendar className="w-8 h-8" />}
                  title="No upcoming appointments"
                  description="Book your first appointment with a doctor to get started."
                  size="sm"
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={() => navigate('/patient/find-doctors')}
                    >
                      Find a Doctor
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {upcoming.map((appt, i) => (
                    <AppointmentCard key={appt._id} appointment={appt} index={i} />
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Health summary */}
            <div>
              <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-teal-400" />
                Health Summary
              </h2>
              <GlassCard padding="md">
                <div className="space-y-4">
                  {[
                    {
                      label: 'Reviews given',
                      value: stats?.overview?.reviewCount || 0,
                      icon:  <Star className="w-4 h-4" />,
                      color: 'text-emerald-400',
                      bg:    'bg-emerald-500/10',
                    },
                    {
                      label: 'Favorite Specialty',
                      value: stats?.overview?.favoriteSpecialization || 'None',
                      icon:  <Stethoscope className="w-4 h-4" />,
                      color: 'text-blue-400',
                      bg:    'bg-blue-500/10',
                    },
                    {
                      label: 'Frequent Doctor',
                      value: stats?.overview?.frequentDoctor ? stats.overview.frequentDoctor.name : 'None',
                      icon:  <Users className="w-4 h-4" />,
                      color: 'text-amber-400',
                      bg:    'bg-amber-500/10',
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500">{item.label}</p>
                        <p className={`text-lg font-bold truncate ${item.color}`}>
                          {loading ? '—' : item.value}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Recent activity */}
            <div>
              <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Recent Activity
              </h2>
              <GlassCard padding="sm">
                {loading ? (
                  <CardSkeleton count={2} />
                ) : recent.length === 0 ? (
                  <EmptyState
                    icon={<FileText className="w-6 h-6" />}
                    title="No recent activity"
                    size="sm"
                  />
                ) : (
                  <div className="space-y-2">
                    {recent.map((appt, i) => (
                      <AppointmentCard key={appt._id} appointment={appt} index={i} />
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>

          </div>
        </div>

      </div>
    </PageTransition>
  )
}

export default PatientDashboard