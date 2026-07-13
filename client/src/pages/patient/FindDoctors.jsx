import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Star, MapPin, Clock,
  Stethoscope, ChevronRight, X, SlidersHorizontal,
  Award, Users, RefreshCw
} from 'lucide-react'
import { getAllDoctors } from '../../services/doctorService'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Button from '../../components/common/Button'
import { CardSkeleton } from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import useDebounce from '../../hooks/useDebounce'
import {
  getInitials, getDoctorName,
  formatCurrency, formatExperience, formatRating
} from '../../utils/formatters'
import { SPECIALIZATIONS } from '../../utils/constants'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'
import SpecializationAnimation from '../../components/animations/SpecializationAnimation'

// ─── Doctor Card ───────────────────────────────────────────────────────────────
const DoctorCard = React.forwardRef(({ doctor, index }, ref) => {
  const navigate   = useNavigate()
  const profile    = doctor.doctorProfile || {}
  const user       = doctor

  const gradients = [
    'from-blue-500 to-blue-600',
    'from-teal-500 to-teal-600',
    'from-purple-500 to-purple-600',
    'from-indigo-500 to-indigo-600',
    'from-cyan-500 to-cyan-600',
  ]
  const gradient = gradients[index % gradients.length]

  return (
    <motion.div
      ref={ref}
      className="group relative glass-card overflow-hidden cursor-pointer hover:bg-white/[0.07] hover:border-white/[0.14] hover:shadow-glass-lg hover:-translate-y-2 transition-all duration-300"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay:    index * 0.06,
        ease:     [0.4, 0, 0.2, 1],
      }}
      onClick={() => navigate(`/patient/doctors/${doctor._id}`)}
      layout
    >
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Card header */}
      <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />

      <div className="p-5">
        {/* Doctor info */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <motion.div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
            whileHover={{ scale: 1.05, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={getDoctorName(user.firstName, user.lastName)}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              <span className="text-white text-lg font-bold">
                {getInitials(user?.firstName, user?.lastName)}
              </span>
            )}
          </motion.div>

          {/* Name and specialty */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-100 truncate group-hover:text-white transition-colors">
                {getDoctorName(user?.firstName, user?.lastName)}
              </h3>
              <SpecializationAnimation specialization={profile?.specialization} size={20} className="text-blue-400 opacity-80 group-hover:opacity-100" />
            </div>
            <p className="text-xs text-blue-400 font-medium mt-0.5 truncate">
              {profile?.specialization || 'Specialist'}
            </p>
            {/* Clinic */}
            {profile?.clinic?.city && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-slate-600 flex-shrink-0" />
                <span className="text-xs text-slate-500 truncate">
                  {profile.clinic.city}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Rating */}
          <div className="flex flex-col items-center gap-0.5 p-2 rounded-xl bg-white/[0.04]">
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-amber-400">
                {formatRating(profile?.rating)}
              </span>
            </div>
            <span className="text-2xs text-slate-600">Rating</span>
          </div>

          {/* Experience */}
          <div className="flex flex-col items-center gap-0.5 p-2 rounded-xl bg-white/[0.04]">
            <span className="text-xs font-bold text-teal-400">
              {profile?.experience || 0}yr
            </span>
            <span className="text-2xs text-slate-600">Experience</span>
          </div>

          {/* Fee */}
          <div className="flex flex-col items-center gap-0.5 p-2 rounded-xl bg-white/[0.04]">
            <span className="text-xs font-bold text-purple-400">
              {profile?.consultationFee
                ? `$${profile.consultationFee}`
                : 'Free'}
            </span>
            <span className="text-2xs text-slate-600">Fee</span>
          </div>
        </div>

        {/* Bio preview */}
        {profile?.bio && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
            {profile.bio}
          </p>
        )}

        {/* CTA */}
        <motion.div
          className="flex items-center justify-between pt-3 border-t border-white/[0.06]"
          whileHover={{ x: 0 }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-400 font-semibold group-hover:gap-2 transition-all duration-200">
            Book Now
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
})

DoctorCard.displayName = 'DoctorCard'

// ─── Filter Panel ──────────────────────────────────────────────────────────────
const FilterPanel = ({ filters, onChange, onReset, isOpen }) => {
  const experienceOptions = [
    { label: 'Any',       value: ''   },
    { label: '1+ years',  value: '1'  },
    { label: '5+ years',  value: '5'  },
    { label: '10+ years', value: '10' },
    { label: '15+ years', value: '15' },
  ]

  const ratingOptions = [
    { label: 'Any',    value: ''    },
    { label: '3.0+',   value: '3'   },
    { label: '4.0+',   value: '4'   },
    { label: '4.5+',   value: '4.5' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <GlassCard padding="md" className="mb-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Specialization */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Specialization
                </label>
                <select
                  value={filters.specialization}
                  onChange={(e) => onChange({ ...filters, specialization: e.target.value })}
                  className="input-glass text-sm py-2"
                >
                  <option value="" className="bg-[#0d1530]">All specialties</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s} className="bg-[#0d1530]">{s}</option>
                  ))}
                </select>
              </div>

              {/* Experience */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Experience
                </label>
                <select
                  value={filters.minExperience}
                  onChange={(e) => onChange({ ...filters, minExperience: e.target.value })}
                  className="input-glass text-sm py-2"
                >
                  {experienceOptions.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#0d1530]">
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Min Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => onChange({ ...filters, minRating: e.target.value })}
                  className="input-glass text-sm py-2"
                >
                  {ratingOptions.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#0d1530]">
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  City
                </label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => onChange({ ...filters, city: e.target.value })}
                  placeholder="Any city..."
                  className="input-glass text-sm py-2"
                />
              </div>
            </div>

            {/* Reset */}
            <div className="flex justify-end mt-4 pt-3 border-t border-white/[0.06]">
              <Button
                variant="ghost"
                size="sm"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={onReset}
              >
                Reset filters
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Find Doctors Page ─────────────────────────────────────────────────────────
const FindDoctors = () => {
  const [doctors, setDoctors]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [searchQuery, setSearch]    = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [totalCount, setTotalCount]   = useState(0)
  const [page, setPage]               = useState(1)

  const [filters, setFilters] = useState({
    specialization: '',
    minExperience:  '',
    minRating:      '',
    city:           '',
  })

  const debouncedSearch = useDebounce(searchQuery, 400)
  const LIMIT           = 12

  const fetchDoctors = useCallback(async (resetPage = false) => {
    setLoading(true)
    const currentPage = resetPage ? 1 : page
    if (resetPage) setPage(1)

    try {
      const params = {
        page:    currentPage,
        limit:   LIMIT,
        search:  debouncedSearch || undefined,
        specialization: filters.specialization || undefined,
        minExperience:  filters.minExperience  || undefined,
        minRating:      filters.minRating      || undefined,
        city:           filters.city           || undefined,
      }
      // Remove undefined keys
      Object.keys(params).forEach((k) => params[k] === undefined && delete params[k])

      const response = await getAllDoctors(params)
      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.doctors)
        ? response.data.doctors
        : []
      const count = response?.pagination?.totalCount || response?.pagination?.total || data.length

      setDoctors(data)
      setTotalCount(count)
    } catch (err) {
      toast.error('Failed to load doctors. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, filters, page])

  useEffect(() => {
    fetchDoctors(true)
  }, [debouncedSearch, filters])

  useEffect(() => {
    fetchDoctors()
  }, [page])

  const handleResetFilters = () => {
    setFilters({
      specialization: '',
      minExperience:  '',
      minRating:      '',
      city:           '',
    })
    setSearch('')
    setPage(1)
  }

  const hasActiveFilters = Object.values(filters).some(Boolean) || searchQuery

  const totalPages = Math.ceil(totalCount / LIMIT)

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Find a Doctor</h1>
            <p className="text-slate-400 text-sm mt-1">
              {loading
                ? 'Searching...'
                : `${totalCount} verified doctor${totalCount !== 1 ? 's' : ''} available`}
            </p>
          </div>

          {/* Filter toggle */}
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="sm"
            icon={<SlidersHorizontal className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
            {hasActiveFilters && (
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />
            )}
          </Button>
        </motion.div>

        {/* Search bar */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor name or specialization..."
            className="input-glass pl-11 pr-10 py-3.5 text-sm w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {/* Filter panel */}
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          isOpen={showFilters}
        />

        {/* Active filter chips */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              {searchQuery && (
                <FilterChip
                  label={`Search: "${searchQuery}"`}
                  onRemove={() => setSearch('')}
                />
              )}
              {filters.specialization && (
                <FilterChip
                  label={filters.specialization}
                  onRemove={() => setFilters({ ...filters, specialization: '' })}
                />
              )}
              {filters.minExperience && (
                <FilterChip
                  label={`${filters.minExperience}+ yrs experience`}
                  onRemove={() => setFilters({ ...filters, minExperience: '' })}
                />
              )}
              {filters.minRating && (
                <FilterChip
                  label={`${filters.minRating}+ rating`}
                  onRemove={() => setFilters({ ...filters, minRating: '' })}
                />
              )}
              {filters.city && (
                <FilterChip
                  label={`City: ${filters.city}`}
                  onRemove={() => setFilters({ ...filters, city: '' })}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Doctors grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <GlassCard key={i} padding="none" className="overflow-hidden">
                <div className="h-2 w-full bg-white/[0.06]" />
                <div className="p-5 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-2xl skeleton flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4" />
                      <div className="skeleton h-3 w-1/2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="skeleton h-12 rounded-xl" />
                    ))}
                  </div>
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-4/5" />
                </div>
              </GlassCard>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <EmptyState
            icon={<Stethoscope className="w-10 h-10" />}
            title="No doctors found"
            description="Try adjusting your search or filters to find available doctors."
            action={
              <Button
                variant="secondary"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={handleResetFilters}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <motion.div
            className="relative grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            layout
          >
            <AnimatePresence mode="popLayout">
              {doctors.map((doctor, i) => (
                <DoctorCard key={doctor._id} doctor={doctor} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <motion.div
            className="flex items-center justify-center gap-2 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={clsx(
                      'w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200',
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]',
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <Button
              variant="secondary"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </motion.div>
        )}

      </div>
    </PageTransition>
  )
}

// ─── Filter Chip ───────────────────────────────────────────────────────────────
const FilterChip = ({ label, onRemove }) => (
  <motion.div
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.2 }}
  >
    {label}
    <button
      onClick={onRemove}
      className="hover:text-blue-200 transition-colors ml-0.5"
    >
      <X className="w-3 h-3" />
    </button>
  </motion.div>
)

export default FindDoctors