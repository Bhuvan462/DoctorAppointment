import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Clock, Calendar, ChevronLeft,
  ChevronRight, CheckCircle, AlertCircle,
  Lock, Unlock, RefreshCw, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getDoctorAvailability,
  createAvailabilitySlots,
  createBulkAvailabilitySlots,
  deleteAvailabilitySlot,
  updateAvailabilitySlot,
  blockAvailabilitySlot,
  unblockAvailabilitySlot,
} from "../../services/doctorService"
import { useAuth } from '../../context/AuthContext'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
import { Spinner } from '../../components/common/LoadingSpinner'
import {
  formatDateLong, formatDateShort, formatTime12
} from '../../utils/formatters'
import { clsx } from 'clsx'
import { format, addDays, startOfDay, isSameDay } from 'date-fns'

// ─── Slot Card ─────────────────────────────────────────────────────────────────
const SlotCard = React.forwardRef(({ slot, onDelete, onToggleBlock }, ref) => {
  const [deleting, setDeleting]   = useState(false)
  const [blocking, setBlocking]   = useState(false)

  const statusConfig = slot.isBooked
    ? { color: 'blue',    label: 'Booked',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20'    }
    : slot.isBlocked
    ? { color: 'red',     label: 'Blocked',   bg: 'bg-red-500/10',     border: 'border-red-500/20'     }
    : { color: 'emerald', label: 'Available', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(slot._id)
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleBlock = async () => {
    setBlocking(true)
    try {
      await onToggleBlock(slot._id, !slot.isBlocked)
    } finally {
      setBlocking(false)
    }
  }

  return (
    <motion.div
      ref={ref}
      className={`flex items-center gap-3 p-3 rounded-xl border ${statusConfig.bg} ${statusConfig.border} group`}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Time */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200">
          {formatTime12(slot.startTime)} — {formatTime12(slot.endTime)}
        </p>
        <span className={`text-xs font-medium ${
          slot.isBooked ? 'text-blue-400' : slot.isBlocked ? 'text-red-400' : 'text-emerald-400'
        }`}>
          {statusConfig.label}
        </span>
      </div>

      {/* Actions */}
      {!slot.isBooked && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            onClick={handleToggleBlock}
            disabled={blocking}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              slot.isBlocked
                ? 'text-emerald-400 hover:bg-emerald-500/10'
                : 'text-amber-400 hover:bg-amber-500/10'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={slot.isBlocked ? 'Unblock slot' : 'Block slot'}
          >
            {blocking
              ? <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
              : slot.isBlocked
              ? <Unlock className="w-3.5 h-3.5" />
              : <Lock className="w-3.5 h-3.5" />
            }
          </motion.button>

          <motion.button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Delete slot"
          >
            {deleting
              ? <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
              : <Trash2 className="w-3.5 h-3.5" />
            }
          </motion.button>
        </div>
      )}
    </motion.div>
  )
})

SlotCard.displayName = 'SlotCard'

// ─── Add Slot Modal ────────────────────────────────────────────────────────────
const AddSlotModal = ({ isOpen, onClose, onAdd, selectedDate }) => {
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime]     = useState('09:30')
  const [adding, setAdding]       = useState(false)

  const commonSlots = [
    { label: '9:00 AM',  start: '09:00', end: '09:30' },
    { label: '9:30 AM',  start: '09:30', end: '10:00' },
    { label: '10:00 AM', start: '10:00', end: '10:30' },
    { label: '10:30 AM', start: '10:30', end: '11:00' },
    { label: '11:00 AM', start: '11:00', end: '11:30' },
    { label: '2:00 PM',  start: '14:00', end: '14:30' },
    { label: '2:30 PM',  start: '14:30', end: '15:00' },
    { label: '3:00 PM',  start: '15:00', end: '15:30' },
    { label: '4:00 PM',  start: '16:00', end: '16:30' },
    { label: '4:30 PM',  start: '16:30', end: '17:00' },
  ]

  const handleAdd = async () => {
    if (!startTime || !endTime) {
      toast.error('Please enter start and end times.')
      return
    }
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    if (eh * 60 + em <= sh * 60 + sm) {
      toast.error('End time must be after start time.')
      return
    }
    setAdding(true)
    try {
      await onAdd({ date: selectedDate, startTime, endTime })
      onClose()
      setStartTime('09:00')
      setEndTime('09:30')
    } finally {
      setAdding(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Availability Slot"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={adding} onClick={handleAdd}>
            Add Slot
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <p className="text-sm text-slate-400">
          Adding slot for: <span className="text-slate-200 font-medium">
            {selectedDate ? formatDateLong(selectedDate) : '—'}
          </span>
        </p>

        {/* Quick select */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Quick Select
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {commonSlots.map((slot) => (
              <button
                key={slot.label}
                onClick={() => { setStartTime(slot.start); setEndTime(slot.end) }}
                className={clsx(
                  'py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200 text-left',
                  startTime === slot.start
                    ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
                    : 'bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.07]',
                )}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom time */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Custom Time
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-glass text-sm py-2 w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-glass text-sm py-2 w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Bulk Generate Modal ───────────────────────────────────────────────────────
const BulkGenerateModal = ({ isOpen, onClose, onGenerate }) => {
  const [config, setConfig] = useState({
    startDate:    format(new Date(), 'yyyy-MM-dd'),
    endDate:      format(addDays(new Date(), 6), 'yyyy-MM-dd'),
    startTime:    '09:00',
    endTime:      '17:00',
    slotDuration: 30,
    days:         [1, 2, 3, 4, 5], // Mon-Fri
  })
  const [generating, setGenerating] = useState(false)

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const toggleDay = (day) => {
    setConfig((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }))
  }

  const handleGenerate = async () => {
    if (config.days.length === 0) {
      toast.error('Please select at least one day.')
      return
    }
    setGenerating(true)
    try {
      await onGenerate(config)
      onClose()
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Generate Slots"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="teal"
            loading={generating}
            icon={<Zap className="w-4 h-4" />}
            onClick={handleGenerate}
          >
            Generate Slots
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="p-3 rounded-xl bg-teal-500/[0.08] border border-teal-500/20">
          <p className="text-xs text-teal-400">
            This will automatically generate time slots for the selected date range and days.
          </p>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Start Date</label>
            <input
              type="date"
              value={config.startDate}
              min={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
              className="input-glass text-sm py-2 w-full"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">End Date</label>
            <input
              type="date"
              value={config.endDate}
              min={config.startDate}
              onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
              className="input-glass text-sm py-2 w-full"
            />
          </div>
        </div>

        {/* Working hours */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Start Time</label>
            <input
              type="time"
              value={config.startTime}
              onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
              className="input-glass text-sm py-2 w-full"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">End Time</label>
            <input
              type="time"
              value={config.endTime}
              onChange={(e) => setConfig({ ...config, endTime: e.target.value })}
              className="input-glass text-sm py-2 w-full"
            />
          </div>
        </div>

        {/* Slot duration */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">
            Slot Duration: <span className="text-slate-200">{config.slotDuration} minutes</span>
          </label>
          <div className="flex gap-2">
            {[15, 20, 30, 45, 60].map((d) => (
              <button
                key={d}
                onClick={() => setConfig({ ...config, slotDuration: d })}
                className={clsx(
                  'flex-1 py-2 rounded-xl text-xs font-semibold transition-all',
                  config.slotDuration === d
                    ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
                    : 'bg-white/[0.04] border border-white/[0.08] text-slate-500 hover:text-slate-300',
                )}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        {/* Days of week */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Working Days</label>
          <div className="flex gap-2">
            {dayLabels.map((day, i) => (
              <button
                key={day}
                onClick={() => toggleDay(i)}
                className={clsx(
                  'flex-1 py-2.5 rounded-xl text-xs font-bold transition-all',
                  config.days.includes(i)
                    ? 'bg-blue-600 text-white shadow-button'
                    : 'bg-white/[0.04] border border-white/[0.08] text-slate-500 hover:text-slate-300',
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Manage Availability Page ──────────────────────────────────────────────────
const ManageAvailability = () => {
  const { user }  = useAuth()
  const [selectedDate, setSelectedDate]   = useState(format(new Date(), 'yyyy-MM-dd'))
  const [slots, setSlots]                 = useState([])
  const [loading, setLoading]             = useState(false)
  const [showAddModal, setShowAddModal]   = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [weekOffset, setWeekOffset]       = useState(0)

  const today = startOfDay(new Date())
  const days  = Array.from({ length: 14 }, (_, i) => addDays(today, i + weekOffset * 7))

  const fetchSlots = useCallback(async (date) => {
  setLoading(true)

  try {
    const response = await getDoctorAvailability({ date })

    const allSlots = Array.isArray(response?.data?.slots)
      ? response.data.slots
      : []

    setSlots(allSlots)
  } catch (err) {
    toast.error("Failed to load slots.")
  } finally {
    setLoading(false)
  }
}, [])

  useEffect(() => {
    fetchSlots(selectedDate)
  }, [selectedDate, fetchSlots])

  const handleAddSlot = async (slotData) => {
    try {
      await createAvailabilitySlots(slotData)
      toast.success('Slot added successfully.')
      fetchSlots(selectedDate)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add slot.')
      throw err
    }
  }

  const handleBulkGenerate = async (config) => {
    try {
      // Generate slots array from config
      const slots = []
      const start = new Date(config.startDate)
      const end   = new Date(config.endDate)

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (!config.days.includes(d.getDay())) continue
        const dateStr = format(new Date(d), 'yyyy-MM-dd')

        const [startH, startM] = config.startTime.split(':').map(Number)
        const [endH, endM]     = config.endTime.split(':').map(Number)
        let currentMins        = startH * 60 + startM
        const endMins          = endH * 60 + endM

        while (currentMins + config.slotDuration <= endMins) {
          const sh = Math.floor(currentMins / 60).toString().padStart(2, '0')
          const sm = (currentMins % 60).toString().padStart(2, '0')
          const eh = Math.floor((currentMins + config.slotDuration) / 60).toString().padStart(2, '0')
          const em = ((currentMins + config.slotDuration) % 60).toString().padStart(2, '0')
          slots.push({ date: dateStr, startTime: `${sh}:${sm}`, endTime: `${eh}:${em}` })
          currentMins += config.slotDuration
        }
      }

      if (slots.length === 0) {
        toast.error('No slots generated. Check your configuration.')
        return
      }

      await createBulkAvailabilitySlots({ slots })
      toast.success(`${slots.length} slots generated successfully.`)
      fetchSlots(selectedDate)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate slots.')
      throw err
    }
  }

  const handleDelete = async (slotId) => {
    try {
      await deleteAvailabilitySlot(slotId)
      toast.success('Slot removed.')
      setSlots((prev) => prev.filter((s) => s._id !== slotId))
    } catch {
      toast.error('Failed to remove slot.')
    }
  }

  const handleToggleBlock = async (slotId, shouldBlock) => {
    try {
      if (shouldBlock) {
        await blockAvailabilitySlot(slotId)
        toast.success('Slot blocked.')
      } else {
        await unblockAvailabilitySlot(slotId)
        toast.success('Slot unblocked.')
      }
      setSlots((prev) =>
        prev.map((s) => s._id === slotId ? { ...s, isBlocked: shouldBlock } : s)
      )
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update slot.')
    }
  }

  const available = slots.filter((s) => !s.isBooked && !s.isBlocked)
  const booked    = slots.filter((s) => s.isBooked)
  const blocked   = slots.filter((s) => s.isBlocked && !s.isBooked)

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
            <h1 className="text-2xl font-bold text-slate-100">Manage Availability</h1>
            <p className="text-slate-400 text-sm mt-1">
              Set your available time slots for patient bookings.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Zap className="w-4 h-4" />}
              onClick={() => setShowBulkModal(true)}
            >
              Bulk Generate
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Add Slot
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: Calendar */}
          <div className="lg:col-span-1">
            <GlassCard animate padding="md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-200">
                  {format(days[0], 'MMMM yyyy')}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                    disabled={weekOffset === 0}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] disabled:opacity-30 transition-all"
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

              {/* Day name headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-center text-2xs font-semibold text-slate-600 py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const dateStr    = format(day, 'yyyy-MM-dd')
                  const isSelected = dateStr === selectedDate
                  const isToday    = isSameDay(day, today)
                  const isPastDay  = day < today

                  return (
                    <motion.button
                      key={dateStr}
                      onClick={() => !isPastDay && setSelectedDate(dateStr)}
                      disabled={isPastDay}
                      className={clsx(
                        'relative flex flex-col items-center justify-center py-2 rounded-xl text-xs font-medium transition-all duration-200',
                        isSelected
                          ? 'bg-blue-600 text-white shadow-glow-blue'
                          : isToday
                          ? 'border border-blue-500/30 text-blue-400 hover:bg-blue-500/10'
                          : isPastDay
                          ? 'text-slate-700 cursor-not-allowed'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]',
                      )}
                      whileHover={!isPastDay && !isSelected ? { scale: 1.08 } : {}}
                      whileTap={!isPastDay ? { scale: 0.95 } : {}}
                    >
                      {format(day, 'd')}
                    </motion.button>
                  )
                })}
              </div>

              {/* Selected date summary */}
              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2">
                <p className="text-xs font-semibold text-slate-400">
                  {formatDateShort(selectedDate)}
                </p>
                <div className="flex gap-3 text-xs">
                  <span className="text-emerald-400">{available.length} available</span>
                  <span className="text-blue-400">{booked.length} booked</span>
                  <span className="text-red-400">{blocked.length} blocked</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right: Slots */}
          <div className="lg:col-span-2">
            <GlassCard animate delay={0.1} padding="md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Slots for {formatDateShort(selectedDate)}
                </h3>
                <div className="flex items-center gap-2">
                  {loading && <Spinner size="sm" />}
                  <Button
                    variant="ghost"
                    size="xs"
                    icon={<RefreshCw className="w-3.5 h-3.5" />}
                    onClick={() => fetchSlots(selectedDate)}
                  >
                    Refresh
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : slots.length === 0 ? (
                <EmptyState
                  icon={<Clock className="w-8 h-8" />}
                  title="No slots for this date"
                  description="Add individual slots or use bulk generate to set your schedule."
                  action={
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => setShowAddModal(true)}
                      >
                        Add Slot
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Zap className="w-4 h-4" />}
                        onClick={() => setShowBulkModal(true)}
                      >
                        Bulk Generate
                      </Button>
                    </div>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {/* Legend */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 pb-2 border-b border-white/[0.06]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Available ({available.length})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      Booked ({booked.length})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      Blocked ({blocked.length})
                    </span>
                  </div>

                  <AnimatePresence mode="popLayout">
                    {slots
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((slot) => (
                        <SlotCard
                          key={slot._id}
                          slot={slot}
                          onDelete={handleDelete}
                          onToggleBlock={handleToggleBlock}
                        />
                      ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Add more button */}
              {slots.length > 0 && (
                <motion.div
                  className="mt-4 pt-4 border-t border-white/[0.06]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowAddModal(true)}
                  >
                    Add Another Slot
                  </Button>
                </motion.div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddSlotModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSlot}
        selectedDate={selectedDate}
      />
      <BulkGenerateModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onGenerate={handleBulkGenerate}
      />
    </PageTransition>
  )
}

export default ManageAvailability