import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Calendar, Clock, MapPin,
  User, FileText, AlertCircle, CheckCircle,
  XCircle, RefreshCw, Stethoscope, DollarSign,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getAppointmentById, cancelAppointment } from '../../services/appointmentService'
import { createReview } from '../../services/doctorService'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import { PageLoading } from '../../components/common/LoadingSpinner'
import {
  getDoctorName, getInitials, formatDateLong,
  formatTimeRange, formatDateTime, formatCurrency
} from '../../utils/formatters'
import { APPOINTMENT_STATUS } from '../../utils/constants'

// ─── Info Row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, highlight }) => (
  <div className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0">
    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0 text-slate-500 mt-0.5">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-600 mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${highlight ? 'text-blue-400' : 'text-slate-200'} break-words`}>
        {value || 'N/A'}
      </p>
    </div>
  </div>
)

// ─── Timeline ──────────────────────────────────────────────────────────────────
const AppointmentTimeline = ({ appointment }) => {
  const events = [
    {
      label:     'Appointment Requested',
      time:      appointment.createdAt,
      done:      true,
      color:     'blue',
    },
    {
      label:     appointment.status === 'rejected' ? 'Appointment Rejected' : 'Appointment Confirmed',
      time:      appointment.status === 'confirmed' || appointment.status === 'completed' ? appointment.updatedAt : null,
      done:      ['confirmed', 'completed', 'cancelled'].includes(appointment.status),
      color:     appointment.status === 'rejected' ? 'red' : 'teal',
      skip:      appointment.status === 'rejected',
    },
    {
      label:     'Appointment Completed',
      time:      appointment.status === 'completed' ? appointment.updatedAt : null,
      done:      appointment.status === 'completed',
      color:     'emerald',
    },
  ].filter((e) => !e.skip || e.done)

  const colorMap = {
    blue:    { dot: 'bg-blue-400',    line: 'bg-blue-400/30',    text: 'text-blue-400'    },
    teal:    { dot: 'bg-teal-400',    line: 'bg-teal-400/30',    text: 'text-teal-400'    },
    emerald: { dot: 'bg-emerald-400', line: 'bg-emerald-400/30', text: 'text-emerald-400' },
    red:     { dot: 'bg-red-400',     line: 'bg-red-400/30',     text: 'text-red-400'     },
    slate:   { dot: 'bg-slate-600',   line: 'bg-slate-600/30',   text: 'text-slate-500'   },
  }

  return (
    <div className="space-y-0">
      {events.map((event, i) => {
        const c = colorMap[event.done ? event.color : 'slate']
        return (
          <motion.div
            key={event.label}
            className="flex gap-4"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${event.done ? c.dot : 'bg-slate-700'} ring-2 ring-offset-2 ring-offset-[#0d1530] ${event.done ? 'ring-' + event.color + '-400/30' : 'ring-slate-700/30'}`} />
              {i < events.length - 1 && (
                <div className={`w-px flex-1 min-h-[32px] my-1 ${event.done ? c.line : 'bg-slate-700/30'}`} />
              )}
            </div>
            {/* Content */}
            <div className="pb-4 flex-1">
              <p className={`text-sm font-medium ${event.done ? c.text : 'text-slate-600'}`}>
                {event.label}
              </p>
              {event.time && (
                <p className="text-xs text-slate-600 mt-0.5">
                  {formatDateTime(event.time)}
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Cancel Modal ──────────────────────────────────────────────────────────────
const CancelModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Appointment"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Keep appointment
          </Button>
          <Button
            variant="danger"
            loading={loading}
            onClick={() => onConfirm(reason)}
          >
            Cancel appointment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/[0.08] border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">
            Reason for cancellation
            <span className="text-slate-600 text-xs ml-1">Optional</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Let the doctor know why you're cancelling..."
            className="input-glass resize-none text-sm"
            maxLength={500}
          />
        </div>
      </div>
    </Modal>
  )
}

// ─── Appointment Detail Page ───────────────────────────────────────────────────
const AppointmentDetail = () => {
  const { id }        = useParams()
  const navigate      = useNavigate()

  const [appointment, setAppointment]       = useState(null)
  const [loading, setLoading]               = useState(true)
  const [showCancel, setShowCancel]         = useState(false)
  const [cancelling, setCancelling]         = useState(false)
  const [showReview, setShowReview]         = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewForm, setReviewForm]         = useState({ rating: 5, comment: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAppointmentById(id)
      // res = { success, message, data: { appointment: {...} } }
      setAppointment(res.data?.appointment ?? res.data)
    } catch {
      toast.error('Failed to load appointment details.')
      navigate('/patient/appointments')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCancel = async (reason) => {
    setCancelling(true)
    try {
      await cancelAppointment(id, { cancellationReason: reason })
      toast.success('Appointment cancelled successfully.')
      setShowCancel(false)
      fetchData()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel appointment.')
    } finally {
      setCancelling(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewForm.rating) {
      toast.error('Please provide a rating.')
      return
    }
    setSubmittingReview(true)
    try {
      await createReview({
        appointmentId: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      })
      toast.success('Review submitted successfully!')
      setShowReview(false)
      fetchData()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit review.')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) return <PageLoading message="Loading appointment..." />
  if (!appointment) return null

  const doctor    = appointment.doctorId
  const profile   = doctor?.doctorProfile || {}
  const canCancel = ['pending', 'confirmed'].includes(appointment.status)
  const canReschedule = appointment.status === 'confirmed'

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back */}
        <motion.button
          onClick={() => navigate('/patient/appointments')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors text-sm"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to appointments
        </motion.button>

        {/* Header card */}
        <GlassCard animate padding="lg">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent rounded-t-2xl" />
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Doctor avatar */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                {doctor?.profilePhoto ? (
                  <img
                    src={doctor.profilePhoto}
                    alt="Doctor"
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-white text-lg font-bold">
                    {getInitials(doctor?.firstName, doctor?.lastName)}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">
                  {getDoctorName(doctor?.firstName, doctor?.lastName)}
                </h1>
                <p className="text-blue-400 text-sm">{profile?.specialization || 'Doctor'}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge status={appointment.status} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {canReschedule && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={() => navigate(`/patient/book/${doctor?._id}`)}
                >
                  Reschedule
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="danger"
                  size="sm"
                  icon={<XCircle className="w-4 h-4" />}
                  onClick={() => setShowCancel(true)}
                >
                  Cancel
                </Button>
              )}
              {appointment.status === 'completed' && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<MessageSquare className="w-4 h-4" />}
                  onClick={() => setShowReview(true)}
                >
                  Write Review
                </Button>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-4">

            {/* Appointment info */}
            <GlassCard animate delay={0.1} padding="md">
              <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Appointment Details
              </h3>
              <div>
                <InfoRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Date"
                  value={formatDateLong(appointment.appointmentDate)}
                />
                <InfoRow
                  icon={<Clock className="w-4 h-4" />}
                  label="Time"
                  value={formatTimeRange(appointment.startTime, appointment.endTime)}
                />
                {appointment.tokenNumber && (
                  <InfoRow
                    icon={<span className="font-bold font-mono">#</span>}
                    label="Token Number"
                    value={<span className="font-mono">{appointment.tokenNumber}</span>}
                  />
                )}
                <InfoRow
                  icon={<Stethoscope className="w-4 h-4" />}
                  label="Type"
                  value={appointment.type === 'in-person' ? 'In-Person Visit' : 'Online Consultation'}
                />
                {profile?.clinic?.city && (
                  <InfoRow
                    icon={<MapPin className="w-4 h-4" />}
                    label="Location"
                    value={[profile.clinic.name, profile.clinic.city].filter(Boolean).join(' — ')}
                  />
                )}
                {profile?.consultationFee > 0 && (
                  <InfoRow
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Consultation Fee"
                    value={formatCurrency(profile.consultationFee)}
                  />
                )}
                {appointment.reasonForVisit && (
                  <InfoRow
                    icon={<FileText className="w-4 h-4" />}
                    label="Reason for Visit"
                    value={appointment.reasonForVisit}
                  />
                )}
                {appointment.cancellationReason && (
                  <InfoRow
                    icon={<XCircle className="w-4 h-4" />}
                    label="Cancellation Reason"
                    value={appointment.cancellationReason}
                  />
                )}
              </div>
            </GlassCard>

          </div>

          {/* Right: Timeline + Doctor card */}
          <div className="space-y-4">
            {/* Timeline */}
            <GlassCard animate delay={0.2} padding="md">
              <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Status Timeline
              </h3>
              <AppointmentTimeline appointment={appointment} />
            </GlassCard>

            {/* Doctor card */}
            <GlassCard animate delay={0.3} padding="md">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Doctor Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {getInitials(doctor?.firstName, doctor?.lastName)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      {getDoctorName(doctor?.firstName, doctor?.lastName)}
                    </p>
                    <p className="text-xs text-blue-400">{profile?.specialization}</p>
                  </div>
                </div>
                {profile?.experience > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Experience</span>
                    <span className="text-slate-300 font-medium">{profile.experience} years</span>
                  </div>
                )}
                {profile?.languages?.length > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Languages</span>
                    <span className="text-slate-300 font-medium">
                      {profile.languages.join(', ')}
                    </span>
                  </div>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/patient/doctors/${doctor?._id}`)}
                >
                  View Profile
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Cancel Modal */}
        <CancelModal
          isOpen={showCancel}
          onClose={() => setShowCancel(false)}
          onConfirm={handleCancel}
          loading={cancelling}
        />

        {/* Review Modal */}
        <Modal
          isOpen={showReview}
          onClose={() => setShowReview(false)}
          title="Write a Review"
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowReview(false)} disabled={submittingReview}>
                Cancel
              </Button>
              <Button variant="primary" loading={submittingReview} onClick={handleSubmitReview}>
                Submit Review
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Rating</label>
              <select
                className="input-glass w-full text-sm"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very Good</option>
                <option value={3}>3 - Good</option>
                <option value={2}>2 - Fair</option>
                <option value={1}>1 - Poor</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Comment <span className="text-slate-600 text-xs ml-1">Optional</span>
              </label>
              <textarea
                rows={3}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Share your experience..."
                className="input-glass resize-none text-sm"
                maxLength={500}
              />
            </div>
          </div>
        </Modal>

      </div>
    </PageTransition>
  )
}

export default AppointmentDetail