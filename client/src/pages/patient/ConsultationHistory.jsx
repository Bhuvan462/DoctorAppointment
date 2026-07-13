import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, ChevronDown, ChevronRight,
  Calendar, Clock, Stethoscope, User,
  AlertCircle, CheckCircle, Search,
  Activity, RefreshCw, X, ThumbsUp
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getConsultationHistory } from '../../services/patientService'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import { CardSkeleton } from '../../components/common/LoadingSpinner'
import {
  getDoctorName, getInitials, formatDateLong,
  formatDateShort, formatTimeRange, formatTimeAgo
} from '../../utils/formatters'
import { clsx } from 'clsx'

// ─── Vital Sign Badge ──────────────────────────────────────────────────────────
const VitalBadge = ({ label, value }) => {
  if (!value) return null
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
      <span className="text-xs font-bold text-slate-200">{value}</span>
      <span className="text-2xs text-slate-600">{label}</span>
    </div>
  )
}

// ─── Expandable Consultation Card ──────────────────────────────────────────────
const ConsultationCard = React.forwardRef(({ consultation, index }, ref) => {
  const [expanded, setExpanded] = useState(false)
  const navigate                = useNavigate()

  const appointment = consultation.appointmentId
  const doctor      = consultation.doctorId
  const vitals      = consultation.vitalSigns || {}

  const hasVitals = Object.values(vitals).some(Boolean)

  return (
    <motion.div
      ref={ref}
      className="relative glass-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      layout
    >
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />

      {/* Header — always visible */}
      <motion.button
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.03] transition-colors duration-200"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Date block */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex flex-col items-center justify-center">
          <span className="text-teal-400 text-2xs font-semibold uppercase">
            {new Date(appointment?.appointmentDate || consultation.createdAt)
              .toLocaleString('default', { month: 'short' })}
          </span>
          <span className="text-slate-100 text-base font-bold leading-none">
            {new Date(appointment?.appointmentDate || consultation.createdAt).getDate()}
          </span>
        </div>

        {/* Doctor info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0">
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
            <p className="text-xs text-slate-500">
              {formatDateShort(appointment?.appointmentDate || consultation.createdAt)}
              {appointment?.startTime && ` · ${formatTimeRange(appointment.startTime, appointment.endTime)}`}
            </p>
          </div>
        </div>

        {/* Diagnosis preview */}
        {consultation.diagnosis && !expanded && (
          <p className="text-xs text-slate-500 max-w-[160px] truncate hidden md:block">
            {consultation.diagnosis}
          </p>
        )}

        {/* Expand icon */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-500 flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 space-y-5 border-t border-white/[0.06]">

              {/* Symptoms */}
              {consultation.symptoms?.length > 0 && (
                <div className="pt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                    Symptoms
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {consultation.symptoms.map((symptom, i) => (
                      <motion.span
                        key={i}
                        className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        {symptom}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnosis */}
              {consultation.diagnosis && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Diagnosis
                  </p>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {consultation.diagnosis}
                    </p>
                  </div>
                </div>
              )}

              {/* Doctor Notes */}
              {consultation.notes && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Doctor Notes
                  </p>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {consultation.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Vital Signs */}
              {hasVitals && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                    Vital Signs
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <VitalBadge label="Blood Pressure" value={vitals.bloodPressure} />
                    <VitalBadge label="Heart Rate"     value={vitals.heartRate}     />
                    <VitalBadge label="Temperature"    value={vitals.temperature}   />
                    <VitalBadge label="Weight"         value={vitals.weight}        />
                    <VitalBadge label="Height"         value={vitals.height}        />
                  </div>
                </div>
              )}

              {/* Follow-up */}
              {consultation.followUpRequired && (
                <motion.div
                  className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/[0.08] border border-blue-500/20"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-blue-400">Follow-up Required</p>
                    {consultation.followUpDate && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Suggested date: {formatDateLong(consultation.followUpDate)}
                      </p>
                    )}
                    {consultation.followUpNotes && (
                      <p className="text-xs text-slate-400 mt-1">
                        {consultation.followUpNotes}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<FileText className="w-3.5 h-3.5" />}
                  onClick={() => navigate('/patient/prescriptions')}
                >
                  View Prescription
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronRight className="w-3.5 h-3.5" />}
                  onClick={() => navigate(`/patient/appointments/${appointment?._id}`)}
                >
                  Appointment Details
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

ConsultationCard.displayName = 'ConsultationCard'

// ─── Consultation History Page ─────────────────────────────────────────────────
const ConsultationHistory = () => {
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading]             = useState(true)
  const [searchQuery, setSearch]          = useState('')

  const fetchConsultations = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getConsultationHistory({ limit: 100 })
      setConsultations(response?.data || [])
    } catch {
      toast.error('Failed to load consultation history.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConsultations()
  }, [fetchConsultations])

  // Filter by search
  const filtered = consultations.filter((c) => {
    if (!searchQuery) return true
    const q      = searchQuery.toLowerCase()
    const doctor = c.doctorId
    const name   = `${doctor?.firstName} ${doctor?.lastName}`.toLowerCase()
    const diag   = (c.diagnosis || '').toLowerCase()
    return name.includes(q) || diag.includes(q)
  })

  // Sort newest first
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Consultation History</h1>
            <p className="text-slate-400 text-sm mt-1">
              {loading
                ? 'Loading...'
                : `${consultations.length} consultation${consultations.length !== 1 ? 's' : ''} recorded`}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchConsultations}
            loading={loading}
          >
            Refresh
          </Button>
        </motion.div>

        {/* Summary stats */}
        {!loading && consultations.length > 0 && (
          <motion.div
            className="grid grid-cols-3 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {[
              {
                label: 'Total',
                value: consultations.length,
                icon:  <FileText className="w-4 h-4" />,
                color: 'text-blue-400',
                bg:    'bg-blue-500/10',
              },
              {
                label: 'With Follow-up',
                value: consultations.filter((c) => c.followUpRequired).length,
                icon:  <AlertCircle className="w-4 h-4" />,
                color: 'text-amber-400',
                bg:    'bg-amber-500/10',
              },
              {
                label: 'Doctors Seen',
                value: [...new Set(consultations.map((c) => c.doctorId?._id))].length,
                icon:  <Stethoscope className="w-4 h-4" />,
                color: 'text-teal-400',
                bg:    'bg-teal-500/10',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="glass-card p-4 flex items-center gap-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <div className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-2xs text-slate-500">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Search */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor name or diagnosis..."
            className="input-glass pl-11 pr-10 py-3 text-sm w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {/* Consultation list */}
        {loading ? (
          <CardSkeleton count={4} />
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={<Activity className="w-10 h-10" />}
            title={searchQuery ? 'No results found' : 'No consultations yet'}
            description={
              searchQuery
                ? 'Try adjusting your search query.'
                : 'Your consultation history will appear here after completed appointments.'
            }
            action={
              searchQuery && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSearch('')}
                >
                  Clear search
                </Button>
              )
            }
          />
        ) : (
          <motion.div className="space-y-3" layout>
            <AnimatePresence mode="popLayout">
              {sorted.map((consultation, i) => (
                <ConsultationCard
                  key={consultation._id}
                  consultation={consultation}
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

export default ConsultationHistory