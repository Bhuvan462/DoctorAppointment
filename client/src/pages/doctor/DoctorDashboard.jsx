import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, CheckCircle, XCircle,
  AlertCircle, ChevronRight, Users, Star,
  Activity, Plus, Stethoscope, TrendingUp,
  Bell, IndianRupee
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { getDoctorAppointments, confirmAppointment, rejectAppointment, getDoctorDashboardStats } from '../../services/doctorService'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import StatCard from '../../components/common/StatCard'
import EmptyState from '../../components/common/EmptyState'
import { CardSkeleton } from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import AnalyticsChart from '../../components/analytics/AnalyticsChart'
import {
  getInitials, formatDateRelative, formatTime12,
  formatDateShort, formatTimeRange
} from '../../utils/formatters'
import { APPOINTMENT_STATUS } from '../../utils/constants'
import { clsx } from 'clsx'

// ─── Welcome Banner ────────────────────────────────────────────────────────────
const DoctorWelcomeBanner = ({ user, stats }) => {
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <motion.div
      className="relative glass-card p-6 sm:p-8 overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-blue-500/10 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />
      <div className="absolute right-6 top-6 w-28 h-28 rounded-full bg-teal-500/5 border border-teal-500/10" />
      <div className="absolute right-20 top-14 w-14 h-14 rounded-full bg-blue-500/5 border border-blue-500/10" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <motion.p
            className="text-slate-400 text-sm mb-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {greeting}, Doctor 👨‍⚕️
          </motion.p>
          <motion.h1
            className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Dr. {user?.firstName} {user?.lastName}
          </motion.h1>
        </div>

        <motion.div
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-glow-teal"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        >
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
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

// ─── Pending Request Card ──────────────────────────────────────────────────────
const PendingRequestCard = ({ appointment, onConfirm, onReject, index }) => {
  const navigate = useNavigate()
  const patient  = appointment.patientId

  return (
    <motion.div
      className="group p-4 rounded-2xl bg-white/[0.03] border border-amber-500/20 hover:border-amber-500/30 hover:bg-white/[0.05] transition-all duration-300"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <div className="flex items-start gap-3">
        {/* Patient avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
          {patient?.profilePhoto ? (
            <img src={patient.profilePhoto} alt="Patient" className="w-full h-full rounded-xl object-cover" />
          ) : (
            <span className="text-white text-sm font-bold">
              {getInitials(patient?.firstName, patient?.lastName)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200 truncate">
            {patient?.firstName} {patient?.lastName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3 h-3 text-slate-600" />
            <span className="text-xs text-slate-500">
              {formatDateRelative(appointment.appointmentDate)} · {formatTime12(appointment.startTime)}
            </span>
          </div>
          {appointment.reasonForVisit && (
            <p className="text-xs text-slate-600 mt-1 truncate italic">
              "{appointment.reasonForVisit}"
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3">
        <Button
          variant="success"
          size="xs"
          icon={<CheckCircle className="w-3.5 h-3.5" />}
          onClick={() => onConfirm(appointment._id)}
          className="flex-1"
        >
          Confirm
        </Button>
        <Button
          variant="danger"
          size="xs"
          icon={<XCircle className="w-3.5 h-3.5" />}
          onClick={() => onReject(appointment._id)}
          className="flex-1"
        >
          Decline
        </Button>
        <button
          onClick={() => navigate(`/doctor/appointments/${appointment._id}`)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Today Appointment Card ────────────────────────────────────────────────────
const TodayCard = ({ appointment, index }) => {
  const navigate = useNavigate()
  const patient  = appointment.patientId

  return (
    <motion.div
      className="group flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-pointer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      onClick={() => navigate(`/doctor/appointments/${appointment._id}`)}
      whileHover={{ x: 3 }}
    >
      {/* Time */}
      <div className="flex-shrink-0 text-center w-14">
        <p className="text-xs font-bold text-blue-400">{formatTime12(appointment.startTime)}</p>
        <p className="text-2xs text-slate-600">{formatTime12(appointment.endTime)}</p>
      </div>

      <div className="w-px h-8 bg-white/[0.08] flex-shrink-0" />

      {/* Patient info */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">
            {getInitials(patient?.firstName, patient?.lastName)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">
            {patient?.firstName} {patient?.lastName}
          </p>
          <p className="text-xs text-slate-500 capitalize">{appointment.type}</p>
        </div>
      </div>

      {/* Status */}
      <Badge status={appointment.status} size="sm" />
    </motion.div>
  )
}

// ─── Reject Modal ──────────────────────────────────────────────────────────────
const RejectModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    onConfirm(reason)
    setReason('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Decline Appointment"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Keep</Button>
          <Button variant="danger" loading={loading} onClick={handleConfirm}>
            Decline
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/[0.08] border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">
            The patient will be notified that their appointment has been declined.
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">
            Reason <span className="text-slate-600 text-xs font-normal">Optional</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Let the patient know why you are declining..."
            className="input-glass resize-none text-sm"
          />
        </div>
      </div>
    </Modal>
  )
}

// ─── Doctor Dashboard ──────────────────────────────────────────────────────────
const DoctorDashboard = () => {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [rejectModal, setRejectModal]   = useState({ open: false, id: null })
  const [actionLoading, setActionLoading] = useState(false)
  const [stats, setStats] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [listRes, statsRes] = await Promise.all([
        getDoctorAppointments({ limit: 100 }),
        getDoctorDashboardStats()
      ]);

      setAppointments(Array.isArray(listRes?.data?.appointments) ? listRes.data.appointments : [])
      setStats(statsRes?.data || null)
    } catch (err) {
      toast.error('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleConfirm = async (appointmentId) => {
    setActionLoading(true)
    try {
      await confirmAppointment(appointmentId)
      toast.success('Appointment confirmed successfully.')
      fetchData()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to confirm appointment.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (reason) => {
    setActionLoading(true)
    try {
      await rejectAppointment(rejectModal.id, { cancellationReason: reason })
      toast.success('Appointment declined.')
      setRejectModal({ open: false, id: null })
      fetchData()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to decline appointment.')
    } finally {
      setActionLoading(false)
    }
  }

  // Pending Requests & Today's Appointments
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const todayAppointments = appointments
    .filter((a) => {
      const d = new Date(a.appointmentDate)
      return d >= today && d < tomorrow
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const pendingRequests = appointments
    .filter((a) => a.status === 'pending')
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 5)

  return (
    <PageTransition>
      <div className="space-y-6 max-w-6xl mx-auto">

        {/* Welcome */}
        <DoctorWelcomeBanner user={user} stats={stats?.overview || {}} />

        {/* Quick actions */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {[
            {
              label:  'Manage Availability',
              icon:   <Clock className="w-5 h-5" />,
              color:  'from-teal-600 to-teal-700',
              glow:   'hover:shadow-glow-teal',
              action: () => navigate('/doctor/availability'),
            },
            {
              label:  'All Appointments',
              icon:   <Calendar className="w-5 h-5" />,
              color:  'from-blue-600 to-blue-700',
              glow:   'hover:shadow-glow-blue',
              action: () => navigate('/doctor/appointments'),
            },
            {
              label:  'My Profile',
              icon:   <Stethoscope className="w-5 h-5" />,
              color:  'from-purple-600 to-purple-700',
              glow:   'hover:shadow-glow-purple',
              action: () => navigate('/doctor/profile'),
            },
          ].map((action, i) => (
            <motion.button
              key={action.label}
              onClick={action.action}
              className={`relative group flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${action.color} ${action.glow} border border-white/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="relative z-10 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                {action.icon}
              </div>
              <span className="relative z-10 text-white text-xs font-semibold text-center leading-tight">
                {action.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Earnings" prefix="₹" value={stats?.overview?.totalEarnings || 0} icon={<IndianRupee className="w-5 h-5" />} color="emerald" animate={!loading} />
          <StatCard title="Today's Appts" value={stats?.overview?.todaysAppointments || 0} icon={<Calendar className="w-5 h-5" />} color="blue" animate={!loading} />
          <StatCard title="Upcoming" value={stats?.overview?.upcomingAppointments || 0} icon={<Clock className="w-5 h-5" />} color="amber" animate={!loading} />
          <StatCard title="Patients Treated" value={stats?.overview?.patientsTreated || 0} icon={<Users className="w-5 h-5" />} color="purple" animate={!loading} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AnalyticsChart 
            title="Revenue Trend (6 Months)" 
            description="Your total earnings over time"
            data={stats?.charts?.revenueTrend || []} 
            type="area" 
            dataKey="revenue" 
            emptyMessage="No revenue recorded yet"
          />
          <AnalyticsChart 
            title="Appointments Trend" 
            description="Your appointments over time"
            data={stats?.charts?.appointmentTrend || []} 
            type="line" 
            dataKey="appointments" 
            emptyMessage="No appointments booked yet"
          />
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: Pending requests + Today */}
          <div className="lg:col-span-2 space-y-6">

            {/* Pending requests */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Pending Requests
                </h2>
                <button
                  onClick={() => navigate('/doctor/appointments')}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <GlassCard padding="sm">
                {loading ? (
                  <CardSkeleton count={2} />
                ) : pendingRequests.length === 0 ? (
                  <EmptyState
                    icon={<Bell className="w-7 h-7" />}
                    title="No pending requests"
                    description="New appointment requests will appear here."
                    size="sm"
                  />
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((appt, i) => (
                      <PendingRequestCard
                        key={appt._id}
                        appointment={appt}
                        index={i}
                        onConfirm={handleConfirm}
                        onReject={(id) => setRejectModal({ open: true, id })}
                      />
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Today's schedule */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Today's Schedule
                </h2>
                <span className="text-xs text-slate-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>

              <GlassCard padding="sm">
                {loading ? (
                  <CardSkeleton count={3} />
                ) : todayAppointments.length === 0 ? (
                  <EmptyState
                    icon={<Calendar className="w-7 h-7" />}
                    title="No appointments today"
                    description="Your schedule is clear for today."
                    size="sm"
                    action={
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => navigate('/doctor/availability')}
                      >
                        Manage Availability
                      </Button>
                    }
                  />
                ) : (
                  <div className="space-y-2">
                    {todayAppointments.map((appt, i) => (
                      <TodayCard key={appt._id} appointment={appt} index={i} />
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          </div>

          {/* Right: Stats Overview */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Overview
            </h2>
            <GlassCard padding="md">
              <div className="space-y-4">
                {[
                  {
                    label: 'Total Patients',
                    value: stats?.overview?.patientsTreated || 0,
                    icon:  <Users className="w-4 h-4" />,
                    color: 'text-blue-400',
                    bg:    'bg-blue-500/10',
                  },
                  {
                    label: 'Average Rating',
                    value: stats?.overview?.averageRating || 0,
                    icon:  <Star className="w-4 h-4" />,
                    color: 'text-amber-400',
                    bg:    'bg-amber-500/10',
                  },
                  {
                    label: 'Completed Appts',
                    value: stats?.overview?.completedAppointments || 0,
                    icon:  <Activity className="w-4 h-4" />,
                    color: 'text-emerald-400',
                    bg:    'bg-emerald-500/10',
                  },
                  {
                    label: 'Cancelled Appts',
                    value: stats?.overview?.cancelledAppointments || 0,
                    icon:  <XCircle className="w-4 h-4" />,
                    color: 'text-red-400',
                    bg:    'bg-red-500/10',
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
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className={`text-lg font-bold ${item.color}`}>
                        {loading ? '—' : item.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Reject modal */}
      <RejectModal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, id: null })}
        onConfirm={handleReject}
        loading={actionLoading}
      />
    </PageTransition>
  )
}

export default DoctorDashboard