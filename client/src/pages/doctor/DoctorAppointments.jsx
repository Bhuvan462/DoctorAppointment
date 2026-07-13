import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTransition from '../../components/common/PageTransition';
import {
  getDoctorAppointments,
  confirmAppointment,
  rejectAppointment,
  completeAppointment,
} from '../../services/appointmentService';
import { useToast } from '../../hooks/useNotifications';
import {
  formatDateShort,
  formatTime12,
} from '../../utils/formatters';
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const STATUS_TABS = [
  { id: 'all', label: 'All', color: 'default' },
  { id: 'pending', label: 'Pending', color: 'warning' },
  { id: 'confirmed', label: 'Confirmed', color: 'info' },
  { id: 'completed', label: 'Completed', color: 'success' },
  { id: 'cancelled', label: 'Cancelled', color: 'danger' },
];

const DATE_FILTERS = [
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'this_week', label: 'This Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'all', label: 'All Time' },
];

const statusConfig = {
  pending: {
    color: 'warning',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  confirmed: {
    color: 'info',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
  },
  completed: {
    color: 'success',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  cancelled: {
    color: 'danger',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
};

const AppointmentCard = React.forwardRef(({ appointment, onStatusUpdate, onView }, ref) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const config = statusConfig[appointment.status] || statusConfig.pending;
  const { showSuccess, showError } = useToast();

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(appointment._id, newStatus);
      showSuccess(`Appointment ${newStatus} successfully`);
    } catch {
      showError('Failed to update appointment status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="p-5 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Patient Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                {appointment.patientId?.profilePhoto ? (
                  <img
                    src={appointment.patientId.profilePhoto}
                    alt={`${appointment.patientId?.firstName} ${appointment.patientId?.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-6 h-6 text-blue-400" />
                )}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${config.dot}`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white truncate">
                {appointment.patientId?.firstName} {appointment.patientId?.lastName}
              </h3>
              <div className="flex items-center gap-3 mt-0.5">
                {appointment.patientId?.phone && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <PhoneIcon className="w-3 h-3" />
                    {appointment.patientId.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            {/* Date & Time */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <CalendarDaysIcon className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Date</p>
                <p className="text-sm font-medium text-white">
                  {formatDateShort(appointment.appointmentDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
                <ClockIcon className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Time</p>
                <p className="text-sm font-medium text-white">
                  {appointment.timeSlot || formatTime12(appointment.appointmentDate)}
                </p>
              </div>
            </div>

            {/* Token Number */}
            {appointment.tokenNumber && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <span className="w-4 h-4 text-purple-400 font-bold text-xs flex items-center justify-center">#</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Token</p>
                  <p className="text-sm font-medium text-white font-mono">
                    {appointment.tokenNumber}
                  </p>
                </div>
              </div>
            )}

            {/* Reason */}
            {appointment.reasonForVisit && (
              <div className="hidden xl:block max-w-[160px]">
                <p className="text-xs text-gray-400">Reason</p>
                <p className="text-sm text-gray-300 truncate">{appointment.reasonForVisit}</p>
              </div>
            )}

            {/* Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${config.bg} ${config.border} ${config.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
            </div>
            
            {/* Payment Status Badge */}
            <div className={`flex items-center px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
              appointment.paymentStatus === 'successful' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              appointment.paymentStatus === 'failed' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
              appointment.paymentStatus === 'pay_at_hospital' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
              'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {appointment.paymentStatus === 'successful' ? 'Paid' : appointment.paymentStatus?.replace('_', ' ') || 'Unpaid'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onView(appointment._id)}
              className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 text-gray-400 hover:text-blue-400 transition-all duration-200"
              title="View Details"
            >
              <EyeIcon className="w-4 h-4" />
            </motion.button>

            {appointment.status === 'pending' && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={isUpdating}
                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 transition-all duration-200 disabled:opacity-50"
                  title="Confirm"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={isUpdating}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 transition-all duration-200 disabled:opacity-50"
                  title="Cancel"
                >
                  <XCircleIcon className="w-4 h-4" />
                </motion.button>
              </>
            )}

            {appointment.status === 'confirmed' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusUpdate('completed')}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 text-xs font-medium transition-all duration-200 disabled:opacity-50"
              >
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Complete
              </motion.button>
            )}

            {appointment.status === 'completed' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onView(appointment._id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-400 text-xs font-medium transition-all duration-200"
              >
                <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                Consult
              </motion.button>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
});

AppointmentCard.displayName = 'AppointmentCard';

const SkeletonCard = () => (
  <GlassCard className="p-5">
    <div className="flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-2xl bg-white/5" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/5 rounded-lg w-32" />
        <div className="h-3 bg-white/5 rounded-lg w-24" />
      </div>
      <div className="hidden lg:flex gap-6">
        <div className="space-y-1.5">
          <div className="h-3 bg-white/5 rounded w-16" />
          <div className="h-4 bg-white/5 rounded w-24" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 bg-white/5 rounded w-12" />
          <div className="h-4 bg-white/5 rounded w-16" />
        </div>
      </div>
      <div className="h-7 w-20 bg-white/5 rounded-xl" />
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-white/5 rounded-xl" />
        <div className="w-8 h-8 bg-white/5 rounded-xl" />
      </div>
    </div>
  </GlassCard>
);

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const { showError } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeStatus, setActiveStatus] = useState('all');
  const [activeDateFilter, setActiveDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  const fetchAppointments = useCallback(
    async (page = 1, showRefresh = false) => {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const params = {
          page,
          limit: pagination.limit,
          ...(activeStatus !== 'all' && { status: activeStatus }),
          ...(activeDateFilter !== 'all' && { dateFilter: activeDateFilter }),
          ...(searchQuery && { search: searchQuery }),
        };

        const response = await getDoctorAppointments(params);

        // response = { success, message, data: { appointments: [...] }, pagination }
        const appts = Array.isArray(response?.data?.appointments)
          ? response.data.appointments
          : [];
        const resPagination = response?.pagination || {};

        setAppointments(appts);
        setPagination((prev) => ({
          ...prev,
          page:  resPagination.currentPage || page,
          total: resPagination.totalCount  || 0,
          pages: resPagination.totalPages  || Math.ceil((resPagination.totalCount || 0) / prev.limit),
        }));

        // Compute local stats from the full list on page 1
        if (page === 1) {
          setStats({
            total:     pagination.totalCount || appts.length,
            pending:   appts.filter((a) => a.status === 'pending').length,
            confirmed: appts.filter((a) => a.status === 'confirmed').length,
            completed: appts.filter((a) => a.status === 'completed').length,
            cancelled: appts.filter((a) => ['cancelled', 'rejected'].includes(a.status)).length,
          });
        }
      } catch (err) {
        showError('Failed to load appointments');
        console.error(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeStatus, activeDateFilter, searchQuery, pagination.limit, showError]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAppointments(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeStatus, activeDateFilter, searchQuery]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
  if (newStatus === "confirmed") {
    await confirmAppointment(appointmentId);
  } else if (newStatus === "cancelled") {
    await rejectAppointment(appointmentId, {});
  } else if (newStatus === "completed") {
    await completeAppointment(appointmentId);
  }

  fetchAppointments(pagination.page, true);
};

  const handlePageChange = (newPage) => {
    fetchAppointments(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = pagination.pages;

  return (
    <PageTransition>
        <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Appointments</h1>
              <p className="text-gray-400 mt-1">
                Manage and track all your patient appointments
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchAppointments(pagination.page, true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm transition-all duration-200"
            >
              <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-5 gap-3"
          >
            {[
              { label: 'Total', value: stats.total, color: 'from-blue-500 to-blue-600' },
              { label: 'Pending', value: stats.pending, color: 'from-amber-500 to-amber-600' },
              { label: 'Confirmed', value: stats.confirmed, color: 'from-sky-500 to-sky-600' },
              { label: 'Completed', value: stats.completed, color: 'from-emerald-500 to-emerald-600' },
              { label: 'Cancelled', value: stats.cancelled, color: 'from-red-500 to-red-600' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <GlassCard className="p-4 text-center">
                  <div
                    className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Search & Filter Toggle */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all duration-200"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  showFilters
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <FunnelIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </motion.button>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {STATUS_TABS.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveStatus(tab.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeStatus === tab.id
                      ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* Date Filter */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <GlassCard className="p-4">
                    <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">
                      Date Range
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DATE_FILTERS.map((filter) => (
                        <motion.button
                          key={filter.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveDateFilter(filter.id)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            activeDateFilter === filter.id
                              ? 'bg-teal-500/20 border border-teal-500/40 text-teal-400'
                              : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          {filter.label}
                        </motion.button>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Appointments List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <EmptyState
                icon={<CalendarDaysIcon className="w-8 h-8" />}
                title="No appointments found"
                description={
                  searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'No appointments match the selected criteria'
                }
              />
            ) : (
              <AnimatePresence mode="popLayout">
                {appointments.map((appointment, index) => (
                  <motion.div
                    key={appointment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AppointmentCard
                      appointment={appointment}
                      onStatusUpdate={handleStatusUpdate}
                      onView={(id) => navigate(`/doctor/appointments/${id}`)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </motion.div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </motion.button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 4) {
                    pageNum = i + 1;
                    if (i === 6) pageNum = totalPages;
                  } else if (pagination.page >= totalPages - 3) {
                    pageNum = i === 0 ? 1 : totalPages - 6 + i;
                  } else {
                    const map = [1, '...', pagination.page - 1, pagination.page, pagination.page + 1, '...', totalPages];
                    pageNum = map[i];
                  }

                  if (pageNum === '...') {
                    return (
                      <span key={`ellipsis-${i}`} className="px-3 py-2 text-gray-500 text-sm">
                        ...
                      </span>
                    );
                  }

                  return (
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
                        pagination.page === pageNum
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {pageNum}
                    </motion.button>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Results Summary */}
          {!loading && appointments.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-gray-500"
            >
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} appointments
            </motion.p>
          )}
        </div>
      </PageTransition>
  );
}