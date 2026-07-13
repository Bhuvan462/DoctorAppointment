import toast from 'react-hot-toast'
export { useNotifications } from '../context/NotificationContext'

/**
 * Convenience toast helpers used by legacy admin components.
 * Returns showSuccess and showError backed by react-hot-toast.
 */
export const useToast = () => ({
  showSuccess: (msg) => toast.success(msg),
  showError:   (msg) => toast.error(msg),
})
