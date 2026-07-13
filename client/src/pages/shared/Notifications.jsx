import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle, Trash2, Calendar, Shield, Zap } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Button from '../../components/common/Button'
import { formatTimeAgo, formatDateLong } from '../../utils/formatters'
import { NOTIFICATION_CONFIG } from '../../utils/constants'
import { clsx } from 'clsx'

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    isLoading,
  } = useNotifications()

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-400" />
              Notifications
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Stay updated on your appointments and account activity.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        <GlassCard animate padding="none">
          {isLoading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center">
                <Bell className="w-8 h-8 text-slate-500" />
              </div>
              <div className="text-center">
                <p className="text-slate-200 font-medium">No notifications</p>
                <p className="text-sm text-slate-500 mt-1">You're all caught up!</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              <AnimatePresence initial={false}>
                {notifications.map((notification) => {
                  const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.general
                  
                  return (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={clsx(
                        'flex gap-4 p-4 sm:p-6 transition-colors duration-200',
                        !notification.isRead ? 'bg-blue-500/[0.04]' : 'hover:bg-white/[0.02]'
                      )}
                    >
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0 text-xl mt-1">
                        {config.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className={clsx(
                              'text-sm font-semibold mb-1',
                              !notification.isRead ? 'text-slate-100' : 'text-slate-300'
                            )}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                              {formatDateLong(notification.createdAt)} • {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                                title="Mark as read"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </GlassCard>
      </div>
    </PageTransition>
  )
}

export default Notifications
