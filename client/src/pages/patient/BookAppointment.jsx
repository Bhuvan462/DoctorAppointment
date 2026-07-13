import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, ChevronLeft, ChevronRight,
  CheckCircle, User, FileText, Stethoscope,
  ArrowRight, AlertCircle, MapPin, DollarSign,
  CreditCard, Smartphone, Banknote
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getDoctorProfile } from '../../services/doctorService'
import { bookAppointment } from '../../services/appointmentService'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Button from '../../components/common/Button'
import { processPayment } from '../../services/paymentService'
import { PageLoading } from '../../components/common/LoadingSpinner'
import {
  getInitials, getDoctorName, formatCurrency,
  formatDateLong, formatDateShort, formatTime12,
  formatTimeRange
} from '../../utils/formatters'
import { APPOINTMENT_TYPES } from '../../utils/constants'
import { clsx } from 'clsx'
import { format, addDays, startOfDay, isSameDay, isPast } from 'date-fns'

// ─── Step Indicator ────────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { label: 'Select Date',  icon: <Calendar className="w-4 h-4" /> },
    { label: 'Pick Time',    icon: <Clock className="w-4 h-4" />    },
    { label: 'Confirm',      icon: <CheckCircle className="w-4 h-4" /> },
    { label: 'Payment',      icon: <CreditCard className="w-4 h-4" /> },
  ]

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <React.Fragment key={step.label}>
          <motion.div
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300',
              i === currentStep
                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                : i < currentStep
                ? 'text-emerald-400'
                : 'text-slate-600',
            )}
            animate={{ scale: i === currentStep ? 1.05 : 1 }}
          >
            <motion.div
              className={clsx(
                'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                i === currentStep
                  ? 'bg-blue-500 text-white'
                  : i < currentStep
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/[0.06] text-slate-500',
              )}
              animate={i < currentStep ? { scale: [1, 1.2, 1] } : {}}
            >
              {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </motion.div>
            <span className="text-sm font-medium hidden sm:block">{step.label}</span>
          </motion.div>

          {i < steps.length - 1 && (
            <div className={clsx(
              'h-px w-8 sm:w-12 transition-all duration-500',
              i < currentStep ? 'bg-emerald-500' : 'bg-white/[0.08]',
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── Date Picker ───────────────────────────────────────────────────────────────
const DatePicker = ({ selectedDate, onSelect, availableDates }) => {
  const [weekOffset, setWeekOffset] = useState(0)
  const today  = startOfDay(new Date())
  const days   = Array.from({ length: 14 }, (_, i) => addDays(today, i + weekOffset * 7))

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-4">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">
          {format(days[0], 'MMMM yyyy')}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
            disabled={weekOffset === 0}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Day name headers */}
        {dayNames.map((d) => (
          <div key={d} className="text-center text-2xs font-semibold text-slate-600 py-1">
            {d}
          </div>
        ))}

        {/* Day buttons */}
        {days.map((day, i) => {
          const dateStr    = format(day, 'yyyy-MM-dd')
          const isSelected = selectedDate && isSameDay(day, new Date(selectedDate))
          const isToday    = isSameDay(day, today)
          const isPastDay  = isPast(day) && !isToday
          const hasSlots   = availableDates.includes(dateStr)

          return (
            <motion.button
              key={dateStr}
              onClick={() => !isPastDay && hasSlots && onSelect(dateStr)}
              disabled={isPastDay || !hasSlots}
              className={clsx(
                'relative flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-medium transition-all duration-200',
                isSelected
                  ? 'bg-blue-600 text-white shadow-glow-blue scale-105'
                  : hasSlots && !isPastDay
                  ? 'bg-white/[0.05] hover:bg-white/[0.10] text-slate-300 hover:text-white cursor-pointer border border-white/[0.08] hover:border-white/[0.20]'
                  : 'text-slate-700 cursor-not-allowed',
                isToday && !isSelected && 'border border-blue-500/30 text-blue-400',
              )}
              whileHover={hasSlots && !isPastDay && !isSelected ? { scale: 1.05 } : {}}
              whileTap={hasSlots && !isPastDay ? { scale: 0.95 } : {}}
            >
              <span>{format(day, 'd')}</span>
              {/* Available dot */}
              {hasSlots && !isPastDay && (
                <span className={clsx(
                  'w-1 h-1 rounded-full mt-0.5',
                  isSelected ? 'bg-white/60' : 'bg-emerald-400',
                )} />
              )}
              {/* Today indicator */}
              {isToday && !isSelected && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Available
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Selected
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          Unavailable
        </div>
      </div>
    </div>
  )
}

// ─── Time Slot Grid ────────────────────────────────────────────────────────────
const TimeSlotGrid = ({ slots, selectedSlot, onSelect }) => {
  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <AlertCircle className="w-8 h-8 text-slate-600" />
        <p className="text-sm text-slate-500">No available slots for this date.</p>
      </div>
    )
  }

  // Group by morning / afternoon / evening
  const morning   = slots.filter((s) => parseInt(s.startTime.split(':')[0]) < 12)
  const afternoon = slots.filter((s) => {
    const h = parseInt(s.startTime.split(':')[0])
    return h >= 12 && h < 17
  })
  const evening   = slots.filter((s) => parseInt(s.startTime.split(':')[0]) >= 17)

  const SlotGroup = ({ title, groupSlots }) => {
    if (groupSlots.length === 0) return null
    return (
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {title}
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {groupSlots.map((slot, i) => {
            const isSelected = selectedSlot?._id === slot._id
            return (
              <motion.button
                key={slot._id}
                onClick={() => onSelect(slot)}
                className={clsx(
                  'py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-200 text-center',
                  isSelected
                    ? 'bg-blue-600 text-white shadow-glow-blue'
                    : 'bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 border border-white/[0.08] hover:border-white/[0.18]',
                )}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: isSelected ? 1 : 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                {formatTime12(slot.startTime)}
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <SlotGroup title="Morning"   groupSlots={morning}   />
      <SlotGroup title="Afternoon" groupSlots={afternoon} />
      <SlotGroup title="Evening"   groupSlots={evening}   />
    </div>
  )
}

// ─── Booking Confirmation ──────────────────────────────────────────────────────
const BookingConfirmation = ({
  doctor, selectedDate, selectedSlot,
  appointmentType, reason, onReasonChange,
  onTypeChange, onConfirm, loading
}) => {
  const profile = doctor?.doctorProfile || {}

  return (
    <div className="space-y-5">
      {/* Summary card */}
      <GlassCard padding="md" glow="blue">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent rounded-t-2xl" />
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-blue-400" />
          Appointment Summary
        </h3>

        <div className="space-y-3">
          {/* Doctor */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04]">
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

          {/* Date and time */}
          {[
            {
              icon:  <Calendar className="w-4 h-4 text-slate-500" />,
              label: 'Date',
              value: formatDateLong(selectedDate),
            },
            {
              icon:  <Clock className="w-4 h-4 text-slate-500" />,
              label: 'Time',
              value: formatTimeRange(selectedSlot?.startTime, selectedSlot?.endTime),
            },
            ...(profile?.clinic?.city ? [{
              icon:  <MapPin className="w-4 h-4 text-slate-500" />,
              label: 'Location',
              value: profile.clinic.city,
            }] : []),
            ...(profile?.consultationFee > 0 ? [{
              icon:  <DollarSign className="w-4 h-4 text-slate-500" />,
              label: 'Fee',
              value: formatCurrency(profile.consultationFee),
            }] : []),
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 text-sm">
              {item.icon}
              <span className="text-slate-500 w-20 flex-shrink-0">{item.label}</span>
              <span className="text-slate-200 font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Appointment type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Appointment Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {APPOINTMENT_TYPES.map((type) => (
            <motion.button
              key={type.value}
              type="button"
              onClick={() => onTypeChange(type.value)}
              className={clsx(
                'py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 border',
                appointmentType === type.value
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                  : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]',
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {type.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Reason */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          Reason for visit
          <span className="text-slate-600 text-xs font-normal">Optional</span>
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Briefly describe your symptoms or reason for booking..."
          className="input-glass resize-none text-sm"
          maxLength={500}
        />
        <p className="text-xs text-slate-600 text-right">{reason.length}/500</p>
      </div>

      {/* Confirm button */}
      <Button
        variant="primary"
        fullWidth
        size="lg"
        loading={loading}
        onClick={onConfirm}
        iconRight={!loading && <ArrowRight className="w-4 h-4" />}
      >
        Confirm Booking
      </Button>

      <p className="text-xs text-slate-600 text-center">
        You can cancel or reschedule your appointment up to 24 hours in advance.
      </p>
    </div>
  )
}

// ─── Payment Step ──────────────────────────────────────────────────────────────
const PaymentStep = ({ doctor, appointmentId, onPaymentComplete }) => {
  const [method, setMethod] = useState('upi')
  const [processing, setProcessing] = useState(false)
  
  const fee = doctor?.doctorProfile?.consultationFee || 0
  const tax = fee * 0.18 // 18% GST simulation
  const total = fee + tax

  const handlePayment = async () => {
    setProcessing(true)
    try {
      const res = await processPayment({
        appointmentId,
        amount: fee,
        tax,
        total,
        method
      })
      toast.success('Payment successful!')
      onPaymentComplete(res.data)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const methods = [
    { id: 'upi', name: 'UPI', icon: <Smartphone className="w-5 h-5 text-blue-400" /> },
    { id: 'credit_card', name: 'Credit Card', icon: <CreditCard className="w-5 h-5 text-purple-400" /> },
    { id: 'debit_card', name: 'Debit Card', icon: <CreditCard className="w-5 h-5 text-teal-400" /> },
    { id: 'net_banking', name: 'Net Banking', icon: <Banknote className="w-5 h-5 text-emerald-400" /> },
    { id: 'pay_at_hospital', name: 'Pay at Hospital', icon: <MapPin className="w-5 h-5 text-amber-400" /> },
  ]

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
        <div className="flex justify-between text-sm text-slate-400">
          <span>Consultation Fee</span>
          <span className="font-medium text-slate-200">{formatCurrency(fee)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-400">
          <span>Taxes (18%)</span>
          <span className="font-medium text-slate-200">{formatCurrency(tax)}</span>
        </div>
        <div className="pt-3 border-t border-white/[0.06] flex justify-between text-base font-bold text-white">
          <span>Total Amount</span>
          <span className="text-emerald-400">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-300">Select Payment Method</p>
        <div className="grid gap-3">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              disabled={processing}
              className={clsx(
                'flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                method === m.id
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] text-slate-300'
              )}
            >
              <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center bg-white/[0.05]', method === m.id ? 'bg-blue-500/20' : '')}>
                {m.icon}
              </div>
              <span className="flex-1 font-medium">{m.name}</span>
              {method === m.id && <CheckCircle className="w-5 h-5 text-blue-400" />}
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="primary"
        fullWidth
        size="lg"
        loading={processing}
        onClick={handlePayment}
      >
        {method === 'pay_at_hospital' ? 'Confirm Appointment' : `Pay ${formatCurrency(total)}`}
      </Button>
    </div>
  )
}

// ─── Success Screen ────────────────────────────────────────────────────────────
const SuccessScreen = ({ onViewAppointments, onBookAnother }) => (
  <motion.div
    className="flex flex-col items-center justify-center text-center py-8 gap-5"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
  >
    {/* Success icon */}
    <motion.div
      className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
      >
        <CheckCircle className="w-10 h-10 text-emerald-400" />
      </motion.div>
    </motion.div>

    {/* Ripple rings */}
    {[1, 2, 3].map((ring) => (
      <motion.div
        key={ring}
        className="absolute rounded-full border border-emerald-500/20"
        style={{ width: 80 + ring * 30, height: 80 + ring * 30 }}
        initial={{ opacity: 0.6, scale: 0.8 }}
        animate={{ opacity: 0, scale: 1.5 }}
        transition={{
          duration: 1.5,
          delay:    0.3 + ring * 0.2,
          repeat:   Infinity,
          repeatDelay: 0.5,
        }}
      />
    ))}

    <div className="space-y-2">
      <h2 className="text-xl font-bold text-slate-100">Appointment Booked!</h2>
      <p className="text-slate-400 text-sm max-w-xs">
        Your appointment request has been sent. You will be notified once the doctor confirms.
      </p>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
      <Button
        variant="primary"
        fullWidth
        onClick={onViewAppointments}
      >
        View Appointments
      </Button>
      <Button
        variant="secondary"
        fullWidth
        onClick={onBookAnother}
      >
        Book Another
      </Button>
    </div>
  </motion.div>
)

// ─── Book Appointment Page ─────────────────────────────────────────────────────
const BookAppointment = () => {
  const { doctorId } = useParams()
  const navigate     = useNavigate()

  const [doctor, setDoctor]           = useState(null)
  const [doctorLoading, setDoctorLoading] = useState(true)

  const [step, setStep]               = useState(0) // 0=date, 1=time, 2=confirm, 3=payment, 4=success
  const [selectedDate, setSelectedDate] = useState(null)
  const [availableDates, setAvailDates] = useState([])
  const [slots, setSlots]             = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [appointmentType, setApptType] = useState('in-person')
  const [reason, setReason]           = useState('')
  const [booking, setBooking]         = useState(false)
  const [createdAppointmentId, setCreatedAppointmentId] = useState(null)

  // Load doctor
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDoctorProfile(doctorId)
        setDoctor(res.data)

        // Fetch next 30 days availability to know which dates have slots
        // Uses the available slots endpoint with no date filter to get all future slots
        const { getAvailableSlots } = await import('../../services/appointmentService')
        const allRes = await getAvailableSlots(doctorId)
        const dates  = (allRes.data || [])
          .filter((s) => !s.isBooked && !s.isBlocked)
          .map((s) => format(new Date(s.date), 'yyyy-MM-dd'))
        setAvailDates([...new Set(dates)])
      } catch {
        toast.error('Failed to load doctor information.')
        navigate('/patient/find-doctors')
      } finally {
        setDoctorLoading(false)
      }
    }
    fetch()
  }, [doctorId, navigate])

  // Load slots for selected date
  useEffect(() => {
    if (!selectedDate) return
    const fetch = async () => {
      setSlotsLoading(true)
      try {
        const { getAvailableSlots } = await import('../../services/appointmentService')
        const res = await getAvailableSlots(doctorId, selectedDate)
        const available = (res.data || []).filter((s) => !s.isBooked && !s.isBlocked)
        setSlots(available)
        setSelectedSlot(null)
      } catch {
        toast.error('Failed to load available slots.')
      } finally {
        setSlotsLoading(false)
      }
    }
    fetch()
  }, [selectedDate, doctorId])

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  const handleDateNext = () => {
    if (!selectedDate) {
      toast.error('Please select a date.')
      return
    }
    setStep(1)
  }

  const handleSlotNext = () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot.')
      return
    }
    setStep(2)
  }

  const handleConfirm = async () => {
    setBooking(true)
    try {
      const res = await bookAppointment({
        doctorId,
        slotId:         selectedSlot._id,
        reasonForVisit: reason,
        type:           appointmentType,
      })
      setCreatedAppointmentId(res.data?.appointment?._id || res.data?._id)
      setStep(3) // Go to payment
      toast.success('Appointment reserved. Please complete payment.')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to book appointment.')
      const nextSlot = err?.response?.data?.nextAvailableSlot
      if (nextSlot) {
        toast('Suggested next slot: ' + new Date(nextSlot.date).toDateString() + ' at ' + nextSlot.startTime, {
          icon: '💡',
          duration: 5000
        })
      }
    } finally {
      setBooking(false)
    }
  }

  const handlePaymentComplete = (paymentInfo) => {
    setStep(4) // Go to success
  }

  if (doctorLoading) return <PageLoading message="Loading booking page..." />

  const profile = doctor?.doctorProfile || {}

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back */}
        {step < 3 && (
          <motion.button
            onClick={() => step > 0 ? setStep(step - 1) : navigate(`/patient/doctors/${doctorId}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors text-sm"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -3 }}
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? 'Back to profile' : 'Previous step'}
          </motion.button>
        )}

        {/* Doctor mini card */}
        {step < 3 && (
          <GlassCard animate padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                {doctor?.profilePhoto ? (
                  <img
                    src={doctor.profilePhoto}
                    alt="Doctor"
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <span className="text-white font-bold">
                    {getInitials(doctor?.firstName, doctor?.lastName)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-100">
                  {getDoctorName(doctor?.firstName, doctor?.lastName)}
                </p>
                <p className="text-xs text-blue-400">{profile?.specialization}</p>
              </div>
              {profile?.consultationFee > 0 && (
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-emerald-400">
                    {formatCurrency(profile.consultationFee)}
                  </p>
                  <p className="text-2xs text-slate-500">per visit</p>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* Step indicator */}
        {step < 3 && <StepIndicator currentStep={step} />}

        {/* Step content */}
        <AnimatePresence mode="wait">

          {/* Step 0: Date selection */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard padding="lg">
                <h2 className="text-base font-semibold text-slate-200 mb-5 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Select a Date
                </h2>
                <DatePicker
                  selectedDate={selectedDate}
                  onSelect={handleDateSelect}
                  availableDates={availableDates}
                />
                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    disabled={!selectedDate}
                    onClick={handleDateNext}
                    iconRight={<ChevronRight className="w-4 h-4" />}
                  >
                    {selectedDate
                      ? `Continue — ${formatDateShort(selectedDate)}`
                      : 'Select a date to continue'}
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 1: Time slot selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard padding="lg">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Select a Time
                  </h2>
                  <span className="text-xs text-slate-500 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
                    {formatDateShort(selectedDate)}
                  </span>
                </div>

                {slotsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <TimeSlotGrid
                    slots={slots}
                    selectedSlot={selectedSlot}
                    onSelect={setSelectedSlot}
                  />
                )}

                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    disabled={!selectedSlot}
                    onClick={handleSlotNext}
                    iconRight={<ChevronRight className="w-4 h-4" />}
                  >
                    {selectedSlot
                      ? `Continue — ${formatTime12(selectedSlot.startTime)}`
                      : 'Select a time to continue'}
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard padding="lg">
                <h2 className="text-base font-semibold text-slate-200 mb-5 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  Confirm Booking
                </h2>
                <BookingConfirmation
                  doctor={doctor}
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  appointmentType={appointmentType}
                  reason={reason}
                  onReasonChange={setReason}
                  onTypeChange={setApptType}
                  onConfirm={handleConfirm}
                  loading={booking}
                />
              </GlassCard>
            </motion.div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard padding="lg">
                <h2 className="text-base font-semibold text-slate-200 mb-5 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Payment Details
                </h2>
                <PaymentStep
                  doctor={doctor}
                  appointmentId={createdAppointmentId}
                  onPaymentComplete={handlePaymentComplete}
                />
              </GlassCard>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <GlassCard padding="lg" glow="teal">
                <div className="relative">
                  <SuccessScreen
                    onViewAppointments={() => navigate('/patient/appointments')}
                    onBookAnother={() => {
                      setStep(0)
                      setSelectedDate(null)
                      setSelectedSlot(null)
                      setReason('')
                    }}
                  />
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

export default BookAppointment