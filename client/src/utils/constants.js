// ─── API Base URL ─────────────────────────────────────────────────────────────
export const API_BASE_URL = 'http://localhost:5000/api/v1'

// ─── Local Storage Keys ───────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  TOKEN:    'medibook_token',
  USER:     'medibook_user',
  THEME:    'medibook_theme',
}

// ─── User Roles ───────────────────────────────────────────────────────────────
export const ROLES = {
  PATIENT: 'patient',
  DOCTOR:  'doctor',
  ADMIN:   'admin',
}

// ─── Appointment Statuses ─────────────────────────────────────────────────────
export const APPOINTMENT_STATUS = {
  PENDING:     'pending',
  CONFIRMED:   'confirmed',
  COMPLETED:   'completed',
  CANCELLED:   'cancelled',
  RESCHEDULED: 'rescheduled',
  REJECTED:    'rejected',
}

// ─── Appointment Status Labels & Colors ──────────────────────────────────────
export const STATUS_CONFIG = {
  pending: {
    label:  'Pending',
    color:  'amber',
    class:  'badge-pending',
    dot:    'bg-amber-400',
  },
  confirmed: {
    label:  'Confirmed',
    color:  'blue',
    class:  'badge-confirmed',
    dot:    'bg-blue-400',
  },
  completed: {
    label:  'Completed',
    color:  'emerald',
    class:  'badge-completed',
    dot:    'bg-emerald-400',
  },
  cancelled: {
    label:  'Cancelled',
    color:  'red',
    class:  'badge-cancelled',
    dot:    'bg-red-400',
  },
  rescheduled: {
    label:  'Rescheduled',
    color:  'purple',
    class:  'badge-rescheduled',
    dot:    'bg-purple-400',
  },
  rejected: {
    label:  'Rejected',
    color:  'red',
    class:  'badge-rejected',
    dot:    'bg-red-400',
  },
}

// ─── Medical Specializations ──────────────────────────────────────────────────
export const SPECIALIZATIONS = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Endocrinologist',
  'Gastroenterologist',
  'Gynecologist',
  'Hematologist',
  'Hepatologist',
  'Immunologist',
  'Infectious Disease Specialist',
  'Internist',
  'Nephrologist',
  'Neurologist',
  'Neurosurgeon',
  'Oncologist',
  'Ophthalmologist',
  'Orthopedic Surgeon',
  'Otolaryngologist (ENT)',
  'Pediatrician',
  'Physiatrist',
  'Plastic Surgeon',
  'Psychiatrist',
  'Pulmonologist',
  'Radiologist',
  'Rheumatologist',
  'Sports Medicine Specialist',
  'Surgeon',
  'Urologist',
  'Vascular Surgeon',
]

// ─── Notification Types ───────────────────────────────────────────────────────
export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED:       'booking_confirmed',
  APPOINTMENT_REMINDER:    'appointment_reminder',
  APPOINTMENT_CANCELLED:   'appointment_cancelled',
  APPOINTMENT_RESCHEDULED: 'appointment_rescheduled',
  APPOINTMENT_REJECTED:    'appointment_rejected',
  APPOINTMENT_COMPLETED:   'appointment_completed',
  PRESCRIPTION_READY:      'prescription_ready',
  DOCTOR_APPROVED:         'doctor_approved',
  DOCTOR_REJECTED:         'doctor_rejected',
  GENERAL:                 'general',
}

// ─── Notification Config ──────────────────────────────────────────────────────
export const NOTIFICATION_CONFIG = {
  booking_confirmed: {
    icon:  '✅',
    color: 'blue',
  },
  appointment_reminder: {
    icon:  '⏰',
    color: 'amber',
  },
  appointment_cancelled: {
    icon:  '❌',
    color: 'red',
  },
  appointment_rescheduled: {
    icon:  '📅',
    color: 'purple',
  },
  appointment_rejected: {
    icon:  '🚫',
    color: 'red',
  },
  appointment_completed: {
    icon:  '🎉',
    color: 'emerald',
  },
  prescription_ready: {
    icon:  '💊',
    color: 'teal',
  },
  doctor_approved: {
    icon:  '🎉',
    color: 'emerald',
  },
  doctor_rejected: {
    icon:  '⚠️',
    color: 'red',
  },
  general: {
    icon:  'ℹ️',
    color: 'blue',
  },
}

// ─── Appointment Types ────────────────────────────────────────────────────────
export const APPOINTMENT_TYPES = [
  { value: 'in-person', label: 'In-Person Visit' },
  { value: 'online',    label: 'Online Consultation' },
]

// ─── Gender Options ───────────────────────────────────────────────────────────
export const GENDER_OPTIONS = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other' },
]

// ─── Pagination Defaults ──────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 10,
  DOCTORS_LIMIT: 12,
}

// ─── Animation Variants (Framer Motion) ──────────────────────────────────────
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial:   { opacity: 0 },
    animate:   { opacity: 1 },
    exit:      { opacity: 0 },
    transition:{ duration: 0.3 },
  },
  slideUp: {
    initial:   { opacity: 0, y: 20 },
    animate:   { opacity: 1, y: 0 },
    exit:      { opacity: 0, y: -20 },
    transition:{ duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
  slideDown: {
    initial:   { opacity: 0, y: -20 },
    animate:   { opacity: 1, y: 0 },
    exit:      { opacity: 0, y: 20 },
    transition:{ duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  scaleIn: {
    initial:   { opacity: 0, scale: 0.95 },
    animate:   { opacity: 1, scale: 1 },
    exit:      { opacity: 0, scale: 0.95 },
    transition:{ duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren:   0.1,
      },
    },
  },
  staggerItem: {
    initial:    { opacity: 0, y: 20 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
}

// ─── Dashboard Quick Stats Colors ─────────────────────────────────────────────
export const STAT_COLORS = {
  blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20',   glow: 'shadow-glow-blue'   },
  teal:   { bg: 'bg-teal-500/10',   text: 'text-teal-400',   border: 'border-teal-500/20',   glow: 'shadow-glow-teal'   },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'shadow-glow-purple' },
  amber:  { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20',  glow: ''                   },
  emerald:{ bg: 'bg-emerald-500/10',text: 'text-emerald-400',border: 'border-emerald-500/20',glow: ''                   },
  red:    { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20',    glow: ''                   },
}