import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pill, ChevronDown, Search, RefreshCw,
  Calendar, User, Clock, FileText,
  Download, PrinterIcon, X, CheckCircle,
  AlertCircle, Package
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getPatientPrescriptions } from '../../services/patientService'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import { CardSkeleton } from '../../components/common/LoadingSpinner'
import {
  getDoctorName, getInitials, formatDateLong,
  formatDateShort, formatTimeAgo, formatDateTime
} from '../../utils/formatters'
import { clsx } from 'clsx'

// ─── Medication Item ───────────────────────────────────────────────────────────
const MedicationItem = ({ medication, index }) => (
  <motion.div
    className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors"
    initial={{ opacity: 0, x: -15 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.07, duration: 0.4 }}
  >
    {/* Pill icon */}
    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">
      <Pill className="w-5 h-5" />
    </div>

    {/* Medication info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <p className="text-sm font-bold text-slate-100">{medication.name}</p>
        <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold flex-shrink-0">
          {medication.dosage}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <p className="text-2xs text-slate-600 uppercase tracking-wider">Frequency</p>
          <p className="text-xs text-slate-300 font-medium mt-0.5">{medication.frequency}</p>
        </div>
        <div>
          <p className="text-2xs text-slate-600 uppercase tracking-wider">Duration</p>
          <p className="text-xs text-slate-300 font-medium mt-0.5">{medication.duration}</p>
        </div>
      </div>

      {medication.instructions && (
        <div className="mt-2 flex items-start gap-1.5">
          <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400/80 italic leading-snug">
            {medication.instructions}
          </p>
        </div>
      )}
    </div>
  </motion.div>
)

// ─── Prescription Card ─────────────────────────────────────────────────────────
const PrescriptionCard = React.forwardRef(({ prescription, index }, ref) => {
  const [expanded, setExpanded] = useState(index === 0)
  const doctor                  = prescription.doctorId

  const handlePrint = () => {
    toast.success('Preparing prescription for print...')
    window.print()
  }

  return (
    <motion.div
      ref={ref}
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.09, duration: 0.5 }}
      layout
    >
      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500" />

      {/* Header */}
      <motion.button
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Rx icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-purple-400 font-black text-lg italic">Rx</span>
        </div>

        {/* Doctor & date info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-100">
              {getDoctorName(doctor?.firstName, doctor?.lastName)}
            </p>
            {prescription.fileUrl ? (
              <span className="text-2xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold uppercase tracking-wider">
                {prescription.fileType || 'DOCUMENT'}
              </span>
            ) : (
              <span className="text-2xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                {prescription.medications?.length} medication{prescription.medications?.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              {formatDateShort(prescription.issuedAt)}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(prescription.issuedAt)}
            </div>
          </div>
        </div>

        {/* Expand */}
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
            <div className="px-5 pb-5 pt-1 space-y-4 border-t border-white/[0.06]">

              {/* Prescription header */}
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Issued: {formatDateTime(prescription.issuedAt)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  icon={<PrinterIcon className="w-3.5 h-3.5" />}
                  onClick={handlePrint}
                >
                  Print
                </Button>
              </div>

              {/* Doctor info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
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
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {getDoctorName(doctor?.firstName, doctor?.lastName)}
                  </p>
                  <p className="text-xs text-blue-400">
                    {doctor?.doctorProfile?.specialization || 'Specialist'}
                  </p>
                </div>
              </div>

              {/* Medications list or File Upload */}
              {prescription.fileUrl ? (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Prescription Document
                  </p>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400 flex-shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{prescription.fileName || 'Prescription Document'}</p>
                        <p className="text-xs text-gray-400 mt-0.5 uppercase">{prescription.fileType || 'PDF'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(prescription.fileUrl, '_blank')}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = prescription.fileUrl;
                          link.download = prescription.fileName || 'prescription';
                          link.target = '_blank';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        icon={<Download className="w-4 h-4" />}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" />
                    Prescribed Medications
                  </p>
                  <div className="space-y-2">
                    {prescription.medications?.map((med, i) => (
                      <MedicationItem key={med._id || i} medication={med} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Additional notes */}
              {prescription.additionalNotes && (
                <div className="p-3 rounded-xl bg-blue-500/[0.06] border border-blue-500/20">
                  <p className="text-xs font-semibold text-blue-400 mb-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Additional Instructions
                  </p>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {prescription.additionalNotes}
                  </p>
                </div>
              )}

              {/* Important note */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400/80 leading-relaxed">
                  Take medications as prescribed. Do not alter dosage without consulting your doctor.
                  If you experience adverse effects, contact your doctor immediately.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

PrescriptionCard.displayName = 'PrescriptionCard'

// ─── My Prescriptions Page ─────────────────────────────────────────────────────
const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading]             = useState(true)
  const [searchQuery, setSearch]          = useState('')

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getPatientPrescriptions({ limit: 100 })
      setPrescriptions(response?.data || [])
    } catch {
      toast.error('Failed to load prescriptions.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrescriptions()
  }, [fetchPrescriptions])

  // Filter
  const filtered = prescriptions.filter((p) => {
    if (!searchQuery) return true
    const q      = searchQuery.toLowerCase()
    const doctor = p.doctorId
    const name   = `${doctor?.firstName} ${doctor?.lastName}`.toLowerCase()
    const meds   = p.medications?.map((m) => m.name.toLowerCase()).join(' ') || ''
    return name.includes(q) || meds.includes(q)
  })

  // Sort newest first
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.issuedAt) - new Date(a.issuedAt)
  )

  // Stats
  const totalMedications = prescriptions.reduce(
    (sum, p) => sum + (p.medications?.length || 0), 0
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
            <h1 className="text-2xl font-bold text-slate-100">My Prescriptions</h1>
            <p className="text-slate-400 text-sm mt-1">
              {loading
                ? 'Loading...'
                : `${prescriptions.length} prescription${prescriptions.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchPrescriptions}
            loading={loading}
          >
            Refresh
          </Button>
        </motion.div>

        {/* Stats */}
        {!loading && prescriptions.length > 0 && (
          <motion.div
            className="grid grid-cols-3 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {[
              {
                label: 'Total Prescriptions',
                value: prescriptions.length,
                icon:  <FileText className="w-4 h-4" />,
                color: 'text-purple-400',
                bg:    'bg-purple-500/10',
              },
              {
                label: 'Total Medications',
                value: totalMedications,
                icon:  <Pill className="w-4 h-4" />,
                color: 'text-blue-400',
                bg:    'bg-blue-500/10',
              },
              {
                label: 'Prescribing Doctors',
                value: [...new Set(prescriptions.map((p) => p.doctorId?._id))].length,
                icon:  <User className="w-4 h-4" />,
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
                  <p className="text-2xs text-slate-500 leading-tight">{stat.label}</p>
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
            placeholder="Search by doctor name or medication..."
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

        {/* Prescriptions list */}
        {loading ? (
          <CardSkeleton count={3} />
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={<Pill className="w-10 h-10" />}
            title={searchQuery ? 'No results found' : 'No prescriptions yet'}
            description={
              searchQuery
                ? 'Try adjusting your search.'
                : 'Prescriptions issued by your doctors will appear here after completed consultations.'
            }
            action={
              searchQuery && (
                <Button variant="secondary" size="sm" onClick={() => setSearch('')}>
                  Clear search
                </Button>
              )
            }
          />
        ) : (
          <motion.div className="space-y-4" layout>
            <AnimatePresence mode="popLayout">
              {sorted.map((prescription, i) => (
                <PrescriptionCard
                  key={prescription._id}
                  prescription={prescription}
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

export default MyPrescriptions