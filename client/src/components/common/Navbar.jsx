import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, ChevronDown, LogOut, User, Settings,
  Menu, X, Calendar, Search, Shield
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import Logo from './Logo'
import { getInitials, formatTimeAgo } from '../../utils/formatters'
import { ROLES, NOTIFICATION_CONFIG } from '../../utils/constants'
import { clsx } from 'clsx'
import LanguageSelector from './LanguageSelector'

// ─── Notification Dropdown ─────────────────────────────────────────────────────
const NotificationDropdown = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } =
    useNotifications()
  const { user } = useAuth()
  const navigate = useNavigate()

  const recent = notifications.slice(0, 6)

  return (
    <motion.div
      className="absolute right-0 top-full mt-2 w-80 z-50"
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="bg-[#0d1530]/98 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-glass-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-100">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-2xs font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className="max-h-72 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Bell className="w-8 h-8 text-slate-600" />
              <p className="text-slate-500 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div>
              {recent.map((notification, index) => {
                const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.general
                return (
                  <motion.div
                    key={notification._id}
                    className={clsx(
                      'flex gap-3 px-4 py-3 cursor-pointer transition-colors duration-200',
                      'hover:bg-white/[0.04] border-b border-white/[0.04] last:border-0',
                      !notification.isRead && 'bg-blue-500/[0.04]',
                    )}
                    onClick={() => markAsRead(notification._id)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0 text-base">
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={clsx(
                        'text-xs leading-snug line-clamp-2',
                        notification.isRead ? 'text-slate-400' : 'text-slate-200 font-medium',
                      )}>
                        {notification.message}
                      </p>
                      <p className="text-2xs text-slate-600 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!notification.isRead && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/[0.06]">
            <button
              onClick={() => {
                onClose()
                navigate(`/${user.role}/notifications`)
              }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors w-full text-center"
            >
              View all notifications
            </button>
          </div>
      </div>
    </motion.div>
  )
}

// ─── User Menu Dropdown ────────────────────────────────────────────────────────
const UserMenuDropdown = ({ user, onLogout, onClose }) => {
  const navigate = useNavigate()

  const dashboardPath = {
    [ROLES.PATIENT]: '/patient/dashboard',
    [ROLES.DOCTOR]:  '/doctor/dashboard',
    [ROLES.ADMIN]:   '/admin/dashboard',
  }

  const profilePath = {
    [ROLES.PATIENT]: '/patient/profile',
    [ROLES.DOCTOR]:  '/doctor/profile',
    [ROLES.ADMIN]:   '/admin/dashboard',
  }

  const menuItems = [
    {
      icon:  <User className="w-4 h-4" />,
      label: 'My Profile',
      path:  profilePath[user?.role],
    },
    {
      icon:  <Calendar className="w-4 h-4" />,
      label: 'Dashboard',
      path:  dashboardPath[user?.role],
    },
  ]

  return (
    <motion.div
      className="absolute right-0 top-full mt-2 w-64 z-50"
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="bg-[#0d1530]/98 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-glass-xl overflow-hidden">
        {/* User info header */}
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <span className="text-white text-sm font-bold">
                  {getInitials(user?.firstName, user?.lastName)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          {/* Role badge */}
          <div className="mt-2">
            <span className={clsx(
              'text-2xs font-semibold px-2 py-0.5 rounded-full',
              user?.role === ROLES.ADMIN   && 'bg-purple-500/15 text-purple-400',
              user?.role === ROLES.DOCTOR  && 'bg-blue-500/15 text-blue-400',
              user?.role === ROLES.PATIENT && 'bg-teal-500/15 text-teal-400',
            )}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
          </div>
        </div>

        {/* Menu items */}
        <div className="py-1.5">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.path)
                onClose()
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] transition-colors duration-150"
            >
              <span className="text-slate-500">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="py-1.5 border-t border-white/[0.06]">
          <button
            onClick={() => {
              onLogout()
              onClose()
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-colors duration-150"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Navbar ───────────────────────────────────────────────────────────────
const Navbar = ({ onMenuToggle, sidebarOpen }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const { unreadCount }                   = useNotifications()
  const navigate                          = useNavigate()
  const location                          = useLocation()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu]           = useState(false)
  const [scrolled, setScrolled]                   = useState(false)

  const notifRef    = useRef(null)
  const userMenuRef = useRef(null)

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdowns on route change
  useEffect(() => {
    setShowNotifications(false)
    setShowUserMenu(false)
  }, [location])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <motion.header
      className={clsx(
        'fixed top-0 left-0 right-0 z-40 h-16',
        'flex items-center px-4 lg:px-6',
        'transition-all duration-300',
        scrolled
          ? 'bg-[#06122b]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-glass'
          : 'bg-transparent',
      )}
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto">

        {/* Left: Menu toggle + Logo */}
        <div className="flex items-center gap-3">
          {/* Hamburger — only when authenticated */}
          {isAuthenticated && onMenuToggle && (
            <motion.button
              onClick={onMenuToggle}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-all duration-200 lg:hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {sidebarOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          <Logo size="sm" showText={true} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <LanguageSelector />
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <motion.button
                  onClick={() => {
                    setShowNotifications(!showNotifications)
                    setShowUserMenu(false)
                  }}
                  className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="w-5 h-5" />
                  {/* Unread badge */}
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 text-white text-2xs font-bold flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <AnimatePresence>
                  {showNotifications && (
                    <NotificationDropdown
                      onClose={() => setShowNotifications(false)}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu)
                    setShowNotifications(false)
                  }}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/[0.06] transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    {user?.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt="Avatar"
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-white text-2xs font-bold">
                        {getInitials(user?.firstName, user?.lastName)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-300 hidden sm:block max-w-[100px] truncate">
                    {user?.firstName}
                  </span>
                  <motion.div
                    animate={{ rotate: showUserMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <UserMenuDropdown
                      user={user}
                      onLogout={handleLogout}
                      onClose={() => setShowUserMenu(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Public nav links */
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl shadow-button hover:shadow-glow-blue transition-all duration-200 hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  )
}

export default Navbar