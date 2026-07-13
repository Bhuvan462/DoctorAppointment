import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, ChevronRight, Search,
  Filter, RefreshCw, Stethoscope, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getPatientAppointments } from '../../services/appointmentService'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { CardSkeleton } from '../../components/common/LoadingSpinner'
import {
  getDoctorName, getInitials, formatDateRelative,
  formatTime12, formatDateShort
} from '../../utils/formatters'
import { APPOINTMENT_STATUS } from '../../utils/constants'
import { clsx } from 'clsx'

// ─── Status Tabs ───────────────────────────────────────────────────────────────
const StatusTabs = ({ activeTab, onChange, counts }) => {
  const tabs = [
    { key: 'all',       label: 'All'        },
    { key: 'upcoming',    label: 'Upcoming'   },
    { key: 'completed',   label: 'Completed'  },
    { key: 'cancelled',   label: 'Cancelled'  },
    { key: 'rescheduled', label: 'Rescheduled'},
  ]

  return (
    <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto scrollbar-none">
      {tabs.map((tab) => (
        <motion.button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0',
            activeTab === tab.key
              ? 'bg-blue-600 text-white shadow-button'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]',
          )}
          whileHover={{ scale: activeTab === tab.key ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {tab.label}
          {counts[tab.key] > 0 && (
            <span className={clsx(
              'text-xs px-1.5 py-0.5 rounded-full font-bold',
              activeTab === tab.key
                ? 'bg-white/20 text-white'
                : 'bg-white/[0.06] text-slate-400',
            )}>
              {counts[tab.key]}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  )
}

// ─── Appointment Row ───────────────────────────────────────────────────────────
const AppointmentRow = React.forwardRef(({ appointment, index }, ref) => {
  const navigate = useNavigate()
  const doctor   = appointment.doctorId

  return (
    <motion.div
      ref={ref}
      className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] cursor-pointer transition-all duration-300"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      onClick={() => navigate(`/patient/appointments/${appointment._id}`)}
      whileHover={{ x: 3 }}
      layout
    >
      {/* Date block */}
      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 border border-blue-500/20 flex flex-col items-center justify-center">
        <span className="text-blue-400 text-xs font-semibold uppercase">
          {new Date(appointment.appointmentDate).toLocaleString('default', { month: 'short' })}
        </span>
        <span className="text-slate-100 text-lg font-bold leading-none">
          {new Date(appointment.appointmentDate).getDate()}
        </span>
      </div>

      {/* Doctor info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
          {doctor?.profilePhoto ? (
            <img
              src={doctor.profilePhoto}
              alt="Doctor"
              className="w-full h-full rounded-xl object-cover"
            />
          ) : (
            <span className="text-white text-xs font-bold">
              {getInitials(doctor?.firstName, doctor?.lastName)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-200 truncate">
            {getDoctorName(doctor?.firstName, doctor?.lastName)}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {appointment.doctorProfile?.specialization ||
              appointment.doctorId?.doctorProfile?.specialization ||
              'Doctor'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3 h-3 text-slate-600" />
            <span className="text-xs text-slate-500">
              {formatTime12(appointment.startTime)} — {formatTime12(appointment.endTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
        <div className="flex gap-2 items-center">
          <Badge status={appointment.status} />
          {appointment.paymentStatus && (
            <span className={clsx(
              "text-xs px-2 py-1 rounded font-medium",
              appointment.paymentStatus === 'successful' ? "bg-emerald-500/10 text-emerald-400" :
              appointment.paymentStatus === 'pending' ? "bg-amber-500/10 text-amber-400" :
              "bg-red-500/10 text-red-400"
            )}>
              {appointment.paymentStatus}
            </span>
          )}
        </div>
        {appointment.tokenNumber && (
          <div className="text-xs text-slate-400 font-mono bg-white/[0.03] px-2 py-1 rounded">
            {appointment.tokenNumber}
          </div>
        )}
        <div className="flex items-center gap-1 text-slate-600 group-hover:text-slate-400 transition-colors">
          <span className="text-xs hidden sm:block">View details</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  )
})

AppointmentRow.displayName = 'AppointmentRow'

// ─── My Appointments Page ──────────────────────────────────────────────────────
const MyAppointments = () => {
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState('all')
  const [searchQuery, setSearch]        = useState('')
  const [dateRange, setDateRange]       = useState({ start: '', end: '' })
  const [sortOrder, setSortOrder]       = useState('newest')

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getPatientAppointments({ limit: 100 })

      const appointments = Array.isArray(response?.data?.appointments)
      ? response.data.appointments
      : []

      setAppointments(appointments)
    } catch {
      toast.error('Failed to load appointments.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Filter appointments
  const filtered = appointments.filter((appt) => {
    // Tab filter
    if (activeTab === 'upcoming') {
      if (!['pending', 'confirmed'].includes(appt.status)) return false
    } else if (activeTab === 'completed') {
      if (appt.status !== APPOINTMENT_STATUS.COMPLETED) return false
    } else if (activeTab === 'cancelled') {
      if (!['cancelled', 'rejected'].includes(appt.status)) return false
    } else if (activeTab === 'rescheduled') {
      if (!appt.rescheduledFrom && appt.status !== 'rescheduled') return false
    }

    // Search filter
    if (searchQuery) {
      const q      = searchQuery.toLowerCase()
      const doctor = appt.doctorId
      const name   = `${doctor?.firstName} ${doctor?.lastName}`.toLowerCase()
      const spec   = (appt.doctorProfile?.specialization || doctor?.doctorProfile?.specialization || '').toLowerCase()
      if (!name.includes(q) && !spec.includes(q)) return false
    }

    // Date range filter
    if (dateRange.start) {
      if (new Date(appt.appointmentDate) < new Date(dateRange.start)) return false
    }
    if (dateRange.end) {
      if (new Date(appt.appointmentDate) > new Date(dateRange.end)) return false
    }

    return true
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.appointmentDate) - new Date(a.appointmentDate)
    } else {
      return new Date(a.appointmentDate) - new Date(b.appointmentDate)
    }
  })

  // Counts for tabs
  const counts = {
    all:         appointments.length,
    upcoming:    appointments.filter((a) => ['pending', 'confirmed'].includes(a.status)).length,
    completed:   appointments.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED).length,
    cancelled:   appointments.filter((a) => ['cancelled', 'rejected'].includes(a.status)).length,
    rescheduled: appointments.filter((a) => a.rescheduledFrom || a.status === 'rescheduled').length,
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-100">My Appointments</h1>
            <p className="text-slate-400 text-sm mt-1">
              {loading ? 'Loading...' : `${appointments.length} total appointment${appointments.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={fetchAppointments}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Calendar className="w-4 h-4" />}
              onClick={() => navigate('/patient/find-doctors')}
            >
              Book New
            </Button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by doctor name or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-glass pl-9 w-full text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              {/* Date Filters & Sorting */}
              <div className="flex flex-wrap items-center gap-2">
                <input 
                  type="date" 
                  className="input-glass text-sm h-[38px] w-auto text-slate-300"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  title="Start Date"
                />
                <span className="text-slate-500">-</span>
                <input 
                  type="date" 
                  className="input-glass text-sm h-[38px] w-auto text-slate-300"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  title="End Date"
                />
                <select 
                  className="input-glass text-sm h-[38px] w-auto"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
        </motion.div>

        {/* Status tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StatusTabs
            activeTab={activeTab}
            onChange={(tab) => { setActiveTab(tab); setSearch('') }}
            counts={counts}
          />
        </motion.div>

        {/* Appointments list */}
        {loading ? (
          <CardSkeleton count={4} />
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-10 h-10" />}
            title={
              activeTab === 'all'
                ? 'No appointments yet'
                : `No ${activeTab} appointments`
            }
            description={
              activeTab === 'all'
                ? 'Book your first appointment with a verified doctor.'
                : `You have no ${activeTab} appointments at the moment.`
            }
            action={
              activeTab === 'all' && (
                <Button
                  variant="primary"
                  icon={<Stethoscope className="w-4 h-4" />}
                  onClick={() => navigate('/patient/find-doctors')}
                >
                  Find a Doctor
                </Button>
              )
            }
          />
        ) : (
          <motion.div
            className="space-y-3"
            layout
          >
            <AnimatePresence mode="popLayout">
              {sorted.map((appt, i) => (
                <AppointmentRow
                  key={appt._id}
                  appointment={appt}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </PageTransition>
  )
}

export default MyAppointments