import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications]     = useState([])
  const [unreadCount, setUnreadCount]         = useState(0)
  const [isLoading, setIsLoading]             = useState(false)

  // ── Fetch notifications ────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const response = await api.get('/notifications')
      const data = response.data?.data || []
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.isRead).length)
    } catch (error) {
      // Silently fail — notifications are not critical
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // ── Mark single notification as read ──────────────────────────────────────

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      // Silently fail
    }
  }, [])

  // ── Mark all as read ──────────────────────────────────────────────────────

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      // Silently fail
    }
  }, [])

  // ── Delete notification ───────────────────────────────────────────────────

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      setNotifications((prev) => {
        const removed = prev.find((n) => n._id === notificationId)
        if (removed && !removed.isRead) {
          setUnreadCount((c) => Math.max(0, c - 1))
        }
        return prev.filter((n) => n._id !== notificationId)
      })
    } catch (error) {
      // Silently fail
    }
  }, [])

  // ── Fetch on auth change ───────────────────────────────────────────────────

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
      // Poll every 60 seconds for new notifications
      const interval = setInterval(fetchNotifications, 60000)
      return () => clearInterval(interval)
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [isAuthenticated, fetchNotifications])

  const value = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export default NotificationContext