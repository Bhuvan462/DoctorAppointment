import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'

// ─── Date Formatters ──────────────────────────────────────────────────────────

/**
 * Format a date to a readable long format
 * Example: Monday, January 15, 2024
 */
export const formatDateLong = (date) => {
  if (!date) return 'N/A'
  try {
    return format(new Date(date), 'EEEE, MMMM d, yyyy')
  } catch {
    return 'Invalid date'
  }
}

/**
 * Format a date to a short format
 * Example: Jan 15, 2024
 */
export const formatDateShort = (date) => {
  if (!date) return 'N/A'
  try {
    return format(new Date(date), 'MMM d, yyyy')
  } catch {
    return 'Invalid date'
  }
}

/**
 * Format a date for input fields (YYYY-MM-DD)
 */
export const formatDateForInput = (date) => {
  if (!date) return ''
  try {
    return format(new Date(date), 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

/**
 * Format date with context (Today, Tomorrow, Yesterday, or full date)
 */
export const formatDateRelative = (date) => {
  if (!date) return 'N/A'
  try {
    const d = new Date(date)
    if (isToday(d))     return 'Today'
    if (isTomorrow(d))  return 'Tomorrow'
    if (isYesterday(d)) return 'Yesterday'
    return formatDateShort(d)
  } catch {
    return 'Invalid date'
  }
}

/**
 * Format a date to relative time
 * Example: 2 hours ago, 3 days ago
 */
export const formatTimeAgo = (date) => {
  if (!date) return 'N/A'
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return 'Invalid date'
  }
}

/**
 * Format a full datetime
 * Example: Jan 15, 2024 at 10:30 AM
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A'
  try {
    return format(new Date(date), "MMM d, yyyy 'at' h:mm a")
  } catch {
    return 'Invalid date'
  }
}

// ─── Time Formatters ──────────────────────────────────────────────────────────

/**
 * Convert 24-hour time string to 12-hour format
 * Example: "14:30" → "2:30 PM"
 */
export const formatTime12 = (time24) => {
  if (!time24) return 'N/A'
  try {
    const [hour, minute] = time24.split(':').map(Number)
    const period  = hour >= 12 ? 'PM' : 'AM'
    const hour12  = hour % 12 || 12
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`
  } catch {
    return time24
  }
}

/**
 * Format time range
 * Example: "09:00" - "09:30" → "9:00 AM - 9:30 AM"
 */
export const formatTimeRange = (startTime, endTime) => {
  return `${formatTime12(startTime)} - ${formatTime12(endTime)}`
}

// ─── Name Formatters ──────────────────────────────────────────────────────────

/**
 * Get initials from a name
 * Example: "John Doe" → "JD"
 */
export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last  = lastName?.charAt(0)?.toUpperCase()  || ''
  return `${first}${last}` || '??'
}

/**
 * Get full name from first and last name
 */
export const getFullName = (firstName, lastName) => {
  return `${firstName || ''} ${lastName || ''}`.trim() || 'Unknown User'
}

/**
 * Get doctor display name with prefix
 */
export const getDoctorName = (firstName, lastName) => {
  return `Dr. ${getFullName(firstName, lastName)}`
}

// ─── Number Formatters ────────────────────────────────────────────────────────

/**
 * Format currency
 * Example: 150 → "$150.00"
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return 'N/A'
  try {
    return new Intl.NumberFormat('en-US', {
      style:    'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `$${amount}`
  }
}

/**
 * Format number with commas
 * Example: 1500 → "1,500"
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Format experience years
 * Example: 1 → "1 year", 5 → "5 years"
 */
export const formatExperience = (years) => {
  if (!years && years !== 0) return 'N/A'
  return years === 1 ? '1 year' : `${years} years`
}

/**
 * Format consultation duration
 * Example: 30 → "30 min", 60 → "1 hour"
 */
export const formatDuration = (minutes) => {
  if (!minutes) return 'N/A'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins  = minutes % 60
  if (mins === 0) return `${hours} hr`
  return `${hours} hr ${mins} min`
}

// ─── Status Formatters ────────────────────────────────────────────────────────

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Truncate long text
 */
export const truncate = (str, maxLength = 100) => {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trim() + '...'
}

/**
 * Format rating to display format
 * Example: 4.567 → "4.6"
 */
export const formatRating = (rating) => {
  if (!rating && rating !== 0) return '0.0'
  return parseFloat(rating).toFixed(1)
}