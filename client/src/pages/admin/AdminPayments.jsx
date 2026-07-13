import React, { useState, useEffect, useCallback } from 'react'
import {
  CreditCard, Search, RefreshCw, AlertCircle, TrendingUp, CheckCircle, Clock
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getAdminPayments } from '../../services/paymentService'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Button from '../../components/common/Button'
import { CardSkeleton } from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import { clsx } from 'clsx'

const AdminPayments = () => {
  const [payments, setPayments] = useState([])
  const [aggregates, setAggregates] = useState([])
  const [loading, setLoading]   = useState(true)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getAdminPayments({ limit: 100 })
      setPayments(response?.data?.payments || [])
      setAggregates(response?.data?.aggregates || [])
    } catch {
      toast.error('Failed to load payments.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const getTotalRevenue = () => {
    const successAgg = aggregates.find(a => a._id === 'successful')
    return successAgg ? successAgg.totalAmount : 0
  }

  const getPendingRevenue = () => {
    const pendingAgg = aggregates.find(a => a._id === 'processing' || a._id === 'pending')
    return pendingAgg ? pendingAgg.totalAmount : 0
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <CreditCard className="w-7 h-7 text-blue-400" />
              Payments Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Monitor platform revenue and all transactions
            </p>
          </div>
          <Button variant="secondary" onClick={fetchPayments} disabled={loading} icon={<RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />}>
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard padding="lg" className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(getTotalRevenue())}</p>
            </div>
          </GlassCard>
          <GlassCard padding="lg" className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Transactions</p>
              <p className="text-2xl font-bold text-white">{payments.length}</p>
            </div>
          </GlassCard>
          <GlassCard padding="lg" className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Pending Processing</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(getPendingRevenue())}</p>
            </div>
          </GlassCard>
        </div>

        {/* Payments Table */}
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/[0.02]">
                  <th className="p-4 rounded-tl-xl">Ref ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Total</th>
                  <th className="p-4 rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/[0.06]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-4 text-center">
                      <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-4">
                      <EmptyState icon={CreditCard} title="No Payments" description="No transactions found." />
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-400">{p.referenceNumber}</td>
                      <td className="p-4 text-slate-300">{formatDateTime(p.createdAt)}</td>
                      <td className="p-4 text-slate-200">{p.patientId?.firstName} {p.patientId?.lastName}</td>
                      <td className="p-4 text-slate-200">Dr. {p.doctorId?.firstName} {p.doctorId?.lastName}</td>
                      <td className="p-4 text-slate-400 uppercase text-xs">{p.method?.replace('_', ' ')}</td>
                      <td className="p-4 font-bold text-emerald-400">{formatCurrency(p.total)}</td>
                      <td className="p-4">
                        <span className={clsx(
                          'px-2.5 py-1 text-xs font-medium rounded-full border',
                          p.status === 'successful' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          p.status === 'failed' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        )}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

      </div>
    </PageTransition>
  )
}

export default AdminPayments
