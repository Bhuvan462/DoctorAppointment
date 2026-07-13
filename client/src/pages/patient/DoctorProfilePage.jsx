import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, MapPin, Clock, Award, Users,
  Calendar, ChevronLeft, CheckCircle,
  Stethoscope, Globe, DollarSign,
  MessageSquare, ThumbsUp, ArrowRight
} from 'lucide-react'
import { getDoctorProfile, getDoctorReviews } from '../../services/doctorService'
import { getAvailableSlots } from '../../services/appointmentService'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { PageLoading, Skeleton } from '../../components/common/LoadingSpinner'
import {
  getInitials, getDoctorName, formatRating,
  formatExperience, formatCurrency, formatTimeAgo,
  formatDateShort, formatTime12
} from '../../utils/formatters'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import SpecializationAnimation from '../../components/animations/SpecializationAnimation'

// ─── Star Rating Display ───────────────────────────────────────────────────────
const StarRating = ({ rating, size = 'sm' }) => {
  const sizeMap = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={clsx(
            sizeMap[size],
            star <= Math.round(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-700',
          )}
        />
      ))}
    </div>
  )
}

// ─── Review Card ──────────────────────────────────────────────────────────────
const ReviewCard = ({ review, index }) => (
  <motion.div
    className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.07, duration: 0.4 }}
  >
    <div className="flex items-start justify-between gap-3 mb-2">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">
            {getInitials(review.patientId?.firstName, review.patientId?.lastName)}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">
            {review.patientId?.firstName} {review.patientId?.lastName}
          </p>
          <p className="text-xs text-slate-600">{formatTimeAgo(review.createdAt)}</p>
        </div>
      </div>
      <StarRating rating={review.rating} size="sm" />
    </div>
    {review.comment && (
      <p className="text-sm text-slate-400 leading-relaxed mt-2">
        {review.comment}
      </p>
    )}
  </motion.div>
)

// ─── Availability Preview ─────────────────────────────────────────────────────
const AvailabilityPreview = ({ doctorId }) => {
  const [slots, setSlots]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await getAvailableSlots(doctorId)
        // response = { success, message, data: [...slots], pagination }
        const data = response?.data || []
        const future = data
          .filter((s) => !s.isBooked && !s.isBlocked && new Date(s.date) >= new Date())
          .slice(0, 6)
        setSlots(future)
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    if (doctorId) fetch()
  }, [doctorId])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-12 rounded-xl" />
        ))}
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm text-slate-500 text-center py-4">
        No available slots visible. Check booking page for all slots.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {slots.map((slot, i) => (
        <motion.div
          key={slot._id}
          className="p-2.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.06 }}
        >
          <p className="text-xs font-semibold text-emerald-400">
            {formatDateShort(slot.date)}
          </p>
          <p className="text-2xs text-slate-500 mt-0.5">
            {formatTime12(slot.startTime)}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Doctor Profile Page ───────────────────────────────────────────────────────
const DoctorProfilePage = () => {
  const { doctorId }    = useParams()
  const navigate        = useNavigate()

  const [doctor, setDoctor]     = useState(null)
  const [reviews, setReviews]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeTab, setTab]     = useState('about')
  const [reviewPage, setReviewPage] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)

  const fetchDoctor = useCallback(async () => {
    setLoading(true)
    try {
      const [doctorRes, reviewsRes] = await Promise.all([
        getDoctorProfile(doctorId),
        getDoctorReviews(doctorId, { page: 1, limit: 5 }),
      ])
      setDoctor(doctorRes.data)
      setReviews(reviewsRes.data?.reviews || [])
      setTotalReviews(reviewsRes.pagination?.totalCount || reviewsRes.data?.summary?.totalReviews || 0)
    } catch (err) {
      toast.error('Failed to load doctor profile.')
      navigate('/patient/find-doctors')
    } finally {
      setLoading(false)
    }
  }, [doctorId, navigate])

  useEffect(() => {
    fetchDoctor()
  }, [fetchDoctor])

  const loadMoreReviews = async () => {
    try {
      const nextPage = reviewPage + 1
      const res = await getDoctorReviews(doctorId, { page: nextPage, limit: 5 })
      setReviews((prev) => [...prev, ...(res.data?.reviews || [])])
      setReviewPage(nextPage)
    } catch {
      toast.error('Failed to load more reviews.')
    }
  }

  if (loading) return <PageLoading message="Loading doctor profile..." />

  if (!doctor) return null

  const profile = doctor.doctorProfile || {}

  const tabs = [
    { key: 'about',        label: 'About'        },
    { key: 'availability', label: 'Availability' },
    { key: 'reviews',      label: `Reviews (${totalReviews})` },
  ]

  const gradients = ['from-blue-500 to-teal-500', 'from-purple-500 to-blue-500']
  const gradient  = gradients[Math.floor(Math.random() * gradients.length)]

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back button */}
        <motion.button
          onClick={() => navigate('/patient/find-doctors')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors text-sm"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to doctors
        </motion.button>

        {/* Hero card */}
        <motion.div
          className="glass-card overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Banner */}
          <div className={`h-24 sm:h-32 w-full bg-gradient-to-br ${gradient} relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.10) 0%, transparent 50%)',
              }}
            />
          </div>

          <div className="px-6 sm:px-8 pb-6">
            {/* Avatar + actions */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-6">
              <motion.div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center border-4 border-[#06122b] shadow-glass-lg flex-shrink-0`}
                whileHover={{ scale: 1.05 }}
              >
                {doctor?.profilePhoto ? (
                  <img
                    src={doctor.profilePhoto}
                    alt={getDoctorName(doctor.firstName, doctor.lastName)}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {getInitials(doctor?.firstName, doctor?.lastName)}
                  </span>
                )}
              </motion.div>

              {/* Book CTA */}
              <Button
                variant="primary"
                size="lg"
                icon={<Calendar className="w-4 h-4" />}
                iconRight={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate(`/patient/book/${doctorId}`)}
              >
                Book Appointment
              </Button>
            </div>

            {/* Doctor info */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-100">
                    {getDoctorName(doctor?.firstName, doctor?.lastName)}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-blue-400 font-semibold text-lg">
                    {profile?.specialization}
                  </p>
                  <SpecializationAnimation specialization={profile?.specialization} size={28} className="text-blue-400 opacity-90" />
                </div>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                {profile?.experience > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-slate-600" />
                    {formatExperience(profile.experience)} experience
                  </div>
                )}
                {profile?.clinic?.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-600" />
                    {profile.clinic.city}
                  </div>
                )}
                {profile?.consultationDuration && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-600" />
                    {profile.consultationDuration} min sessions
                  </div>
                )}
                {profile?.languages?.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-slate-600" />
                    {profile.languages.join(', ')}
                  </div>
                )}
                {doctor?.stats?.completedAppointments > 0 && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-slate-600" />
                    {doctor.stats.completedAppointments} consultations
                  </div>
                )}
                {doctor?.stats?.patientsTreated > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-600" />
                    {doctor.stats.patientsTreated} patients
                  </div>
                )}
              </div>

              {/* Stats chips */}
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-amber-400 text-sm font-bold">
                    {formatRating(profile?.rating)}
                  </span>
                  <span className="text-slate-500 text-xs">
                    ({totalReviews} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <DollarSign className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 text-sm font-bold">
                    {profile?.consultationFee
                      ? formatCurrency(profile.consultationFee)
                      : 'Free'}
                  </span>
                  <span className="text-slate-500 text-xs">per visit</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: Main content with tabs */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTab(tab.key)}
                  className={clsx(
                    'flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200',
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-button'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab panels */}
            <AnimatePresence mode="wait">

              {/* About */}
              {activeTab === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Bio */}
                  {profile?.bio && (
                    <GlassCard padding="md">
                      <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                        About
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {profile.bio}
                      </p>
                    </GlassCard>
                  )}

                  {/* Qualifications */}
                  {profile?.qualifications?.length > 0 && (
                    <GlassCard padding="md">
                      <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-teal-400" />
                        Qualifications
                      </h3>
                      <div className="space-y-2">
                        {profile.qualifications.map((q, i) => (
                          <motion.div
                            key={i}
                            className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03]"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                          >
                            <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                            <span className="text-sm text-slate-300">{q}</span>
                          </motion.div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  {/* Clinic info */}
                  {(profile?.clinic?.name || profile?.clinic?.address) && (
                    <GlassCard padding="md">
                      <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        Clinic Information
                      </h3>
                      <div className="space-y-2 text-sm text-slate-400">
                        {profile.clinic.name && (
                          <p className="font-medium text-slate-200">{profile.clinic.name}</p>
                        )}
                        {profile.clinic.address && <p>{profile.clinic.address}</p>}
                        {profile.clinic.city && (
                          <p className="text-slate-500">{profile.clinic.city}</p>
                        )}
                      </div>
                    </GlassCard>
                  )}
                </motion.div>
              )}

              {/* Availability */}
              {activeTab === 'availability' && (
                <motion.div
                  key="availability"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <GlassCard padding="md">
                    <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      Available Slots
                    </h3>
                    <AvailabilityPreview doctorId={doctorId} />
                    <div className="mt-4 pt-4 border-t border-white/[0.06]">
                      <Button
                        variant="primary"
                        fullWidth
                        icon={<Calendar className="w-4 h-4" />}
                        onClick={() => navigate(`/patient/book/${doctorId}`)}
                      >
                        View All & Book
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Reviews */}
              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <GlassCard padding="md">
                    {/* Rating summary */}
                    <div className="flex items-center gap-5 mb-5 p-4 rounded-xl bg-white/[0.03]">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-amber-400">
                          {formatRating(profile?.rating)}
                        </p>
                        <StarRating rating={profile?.rating} size="md" />
                        <p className="text-xs text-slate-500 mt-1">
                          {totalReviews} reviews
                        </p>
                      </div>
                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviews.filter((r) => Math.round(r.rating) === star).length
                          const pct   = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                          return (
                            <div key={star} className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-slate-500 w-4">{star}</span>
                              <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full bg-amber-400"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, delay: (5 - star) * 0.1 }}
                                />
                              </div>
                              <span className="text-xs text-slate-600 w-4">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Review list */}
                    {reviews.length === 0 ? (
                      <p className="text-center text-sm text-slate-500 py-6">
                        No reviews yet. Be the first to review!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {reviews.map((review, i) => (
                          <ReviewCard key={review._id} review={review} index={i} />
                        ))}
                      </div>
                    )}

                    {/* Load more */}
                    {reviews.length < totalReviews && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={loadMoreReviews}
                        >
                          Load more reviews
                        </Button>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            {/* Quick book */}
            <GlassCard padding="md" animate delay={0.2} glow="blue">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200 mb-1">
                    Ready to book?
                  </p>
                  <p className="text-xs text-slate-500">
                    {profile?.consultationDuration || 30}-minute consultation
                  </p>
                </div>
                {profile?.consultationFee > 0 && (
                  <div className="flex items-center justify-center gap-1 text-green-400 font-bold text-xl">
                    <DollarSign className="w-5 h-5" />
                    {profile.consultationFee}
                  </div>
                )}
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={() => navigate(`/patient/book/${doctorId}`)}
                >
                  Book Now
                </Button>
              </div>
            </GlassCard>

            {/* Quick info */}
            <GlassCard padding="md" animate delay={0.3}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Quick Info
              </h3>
              <div className="space-y-3">
                {[
                  {
                    icon:  <Stethoscope className="w-4 h-4" />,
                    label: 'Specialty',
                    value: profile?.specialization || 'N/A',
                    color: 'text-blue-400',
                  },
                  {
                    icon:  <Award className="w-4 h-4" />,
                    label: 'Experience',
                    value: formatExperience(profile?.experience),
                    color: 'text-teal-400',
                  },
                  {
                    icon:  <Clock className="w-4 h-4" />,
                    label: 'Duration',
                    value: `${profile?.consultationDuration || 30} min`,
                    color: 'text-purple-400',
                  },
                  {
                    icon:  <Globe className="w-4 h-4" />,
                    label: 'Languages',
                    value: profile?.languages?.join(', ') || 'English',
                    color: 'text-amber-400',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600">{item.label}</p>
                      <p className="text-sm font-medium text-slate-300 truncate">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default DoctorProfilePage