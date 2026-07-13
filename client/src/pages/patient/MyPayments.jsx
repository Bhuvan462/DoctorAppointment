import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard, Search, RefreshCw, FileText, Download,
  CheckCircle, AlertCircle, Clock, Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getPaymentHistory } from '../../services/paymentService'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import { CardSkeleton } from '../../components/common/LoadingSpinner'
import {
  formatCurrency, formatDateTime, getDoctorName, getInitials
} from '../../utils/formatters'
import { clsx } from 'clsx'

// ─── Payment Status Config ───────────────────────────────────────────────────
const statusConfig = {
  successful: { label: 'Successful', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: CheckCircle },
  pending:    { label: 'Pending',    bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20',  icon: Clock },
  processing: { label: 'Processing', bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20',   icon: RefreshCw },
  failed:     { label: 'Failed',     bg: 'bg-rose-500/10',   text: 'text-rose-400',   border: 'border-rose-500/20',   icon: AlertCircle },
  refunded:   { label: 'Refunded',   bg: 'bg-slate-500/10',  text: 'text-slate-400',  border: 'border-slate-500/20',  icon: RefreshCw },
  pay_at_hospital: { label: 'Pay at Hospital', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', icon: Check },
}

// ─── Payment Card ────────────────────────────────────────────────────────────
const PaymentCard = ({ payment, index }) => {
  const { doctorId: doctor, amount, tax, total, method, status, referenceNumber, createdAt } = payment
  const conf = statusConfig[status] || statusConfig.pending
  const StatusIcon = conf.icon

  const handleDownloadReceipt = () => {
    // Generate simple text-based receipt or pdf (simulation)
    const receiptContent = `
=================================
       MEDIBOOK RECEIPT
=================================
Receipt No   : ${referenceNumber}
Date         : ${formatDateTime(createdAt)}
Patient      : ${payment.patientId?.firstName} ${payment.patientId?.lastName}
Doctor       : Dr. ${doctor?.firstName} ${doctor?.lastName}
Method       : ${method?.toUpperCase().replace('_', ' ')}
Status       : ${status?.toUpperCase()}
---------------------------------
Consultation : ${formatCurrency(amount)}
Taxes        : ${formatCurrency(tax)}
---------------------------------
TOTAL        : ${formatCurrency(total)}
=================================
    `
    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Receipt_${referenceNumber}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <GlassCard padding="md" className="group">
        <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
          
          {/* Doctor Info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              {doctor?.profilePhoto ? (
                <img src={doctor.profilePhoto} alt="Doctor" className="w-full h-full rounded-xl object-cover" />
              ) : (
                <span className="text-white font-bold">{getInitials(doctor?.firstName, doctor?.lastName)}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">{getDoctorName(doctor?.firstName, doctor?.lastName)}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 font-mono">{referenceNumber}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-xs text-slate-500">{formatDateTime(createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Amount & Method */}
          <div className="flex-1 flex flex-col md:items-center w-full">
            <p className="text-lg font-bold text-slate-100">{formatCurrency(total)}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">{method.replace('_', ' ')}</p>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className={clsx('flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border', conf.bg, conf.text, conf.border)}>
              <StatusIcon className="w-3.5 h-3.5" />
              {conf.label}
            </span>

            {status === 'successful' && (
              <Button variant="ghost" size="sm" onClick={handleDownloadReceipt} icon={<Download className="w-4 h-4" />}>
                Receipt
              </Button>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// ─── My Payments Page ────────────────────────────────────────────────────────
const MyPayments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading]   = useState(true)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getPaymentHistory({ limit: 50 })
      setPayments(response?.data?.data || [])
    } catch {
      toast.error('Failed to load payment history.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <CreditCard className="w-7 h-7 text-blue-400" />
              Payment History
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              View and download your transaction receipts
            </p>
          </div>
          <Button variant="secondary" onClick={fetchPayments} disabled={loading} icon={<RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />}>
            Refresh
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No Payments Found"
            description="You have no transaction history yet."
          />
        ) : (
          <div className="space-y-4">
            {payments.map((p, i) => (
              <PaymentCard key={p._id} payment={p} index={i} />
            ))}
          </div>
        )}

      </div>
    </PageTransition>
  )
}

export default MyPayments
