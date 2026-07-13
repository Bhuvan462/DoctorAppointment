import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import {
  LayoutDashboard, Search, Calendar,
  Pill, User, Clock, Users, UserCheck,
  BarChart3, Stethoscope, ChevronRight, X, Bot, CreditCard, Activity
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../utils/constants'
import { getInitials } from '../../utils/formatters'

// ─── Nav config per role ───────────────────────────────────────────────────────
const getNavConfig = (t) => ({
  [ROLES.PATIENT]: [
    {
      group: 'Main',
      items: [
        { label: t('nav.dashboard', 'Dashboard'),    icon: <LayoutDashboard className="w-4 h-4" />, path: '/patient/dashboard' },
        { label: t('nav.healthDashboard', 'Health Dashboard'), icon: <Activity className="w-4 h-4" />, path: '/patient/health' },
        { label: t('nav.findDoctors', 'Find Doctors'), icon: <Search className="w-4 h-4" />,          path: '/patient/find-doctors' },
        { label: t('nav.aiTriage', 'AI Triage'),     icon: <Bot className="w-4 h-4" />,             path: '/triage' },
      ],
    },
    {
      group: 'Appointments',
      items: [
        { label: t('nav.appointments', 'My Appointments'),    icon: <Calendar className="w-4 h-4" />,  path: '/patient/appointments' },
        { label: t('nav.prescriptions', 'Prescriptions'),      icon: <Pill className="w-4 h-4" />,      path: '/patient/prescriptions' },
        { label: t('nav.payments', 'Payments'),               icon: <CreditCard className="w-4 h-4" />, path: '/patient/payments' },
      ],
    },
    {
      group: 'Account',
      items: [
        { label: t('nav.profile', 'My Profile'), icon: <User className="w-4 h-4" />, path: '/patient/profile' },
      ],
    },
  ],

  [ROLES.DOCTOR]: [
    {
      group: 'Main',
      items: [
        { label: t('nav.dashboard', 'Dashboard'),    icon: <LayoutDashboard className="w-4 h-4" />, path: '/doctor/dashboard' },
        { label: t('nav.manageAvailability', 'Availability'), icon: <Clock className="w-4 h-4" />,           path: '/doctor/availability' },
      ],
    },
    {
      group: 'Appointments',
      items: [
        { label: t('nav.appointments', 'Appointments'), icon: <Calendar className="w-4 h-4" />, path: '/doctor/appointments' },
      ],
    },
    {
      group: 'Account',
      items: [
        { label: t('nav.profile', 'My Profile'), icon: <User className="w-4 h-4" />, path: '/doctor/profile' },
      ],
    },
  ],

  [ROLES.ADMIN]: [
    {
      group: 'Overview',
      items: [
        { label: t('nav.dashboard', 'Dashboard'), icon: <LayoutDashboard className="w-4 h-4" />, path: '/admin/dashboard' },
        { label: t('nav.reports', 'Reports'),   icon: <BarChart3 className="w-4 h-4" />,      path: '/admin/reports' },
      ],
    },
    {
      group: 'Management',
      items: [
        { label: t('nav.users', 'Users'),        icon: <Users className="w-4 h-4" />,       path: '/admin/users' },
        { label: t('nav.doctors', 'Doctors'),      icon: <Stethoscope className="w-4 h-4" />, path: '/admin/doctors' },
        { label: t('nav.appointments', 'Appointments'), icon: <Calendar className="w-4 h-4" />,    path: '/admin/appointments' },
        { label: t('nav.payments', 'Payments'),    icon: <CreditCard className="w-4 h-4" />,  path: '/admin/payments' },
      ],
    },
  ],
})

// ─── Single Nav Item ───────────────────────────────────────────────────────────
const NavItem = ({ item, onClose }) => {
  const location = useLocation()
  const isActive = location.pathname === item.path ||
    (item.path !== '/' && location.pathname.startsWith(item.path))

  return (
    <NavLink
      to={item.path}
      onClick={onClose}
      className="block"
    >
      <motion.div
        className={clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
          'transition-all duration-200 group relative',
          isActive
            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
            : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]',
        )}
        whileHover={{ x: isActive ? 0 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {/* Active indicator bar */}
        {isActive && (
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-full"
            layoutId="activeBar"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}

        <span className={clsx(
          'flex-shrink-0 transition-colors duration-200',
          isActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400',
        )}>
          {item.icon}
        </span>

        <span className="flex-1 truncate">{item.label}</span>

        {isActive && (
          <ChevronRight className="w-3 h-3 text-blue-400/60 flex-shrink-0" />
        )}
      </motion.div>
    </NavLink>
  )
}

// ─── Sidebar Component ─────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const groups   = getNavConfig(t)[user?.role] || []

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/[0.06]">
        <Logo size="sm" showText={true} />
        {/* Close button — mobile only */}
        <motion.button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Navigation groups */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-3 py-4 space-y-6">
        {groups.map((group) => (
          <div key={group.group}>
            {/* Group label */}
            <p className="px-3 mb-1.5 text-2xs font-semibold uppercase tracking-widest text-slate-600">
              {group.group}
            </p>
            {/* Group items */}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  onClose={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User info at bottom */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03]">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0">
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt="Avatar"
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <span className="text-white text-xs font-bold">
                {getInitials(user?.firstName, user?.lastName)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-2xs text-slate-600 truncate capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-56 bg-[#06122b]/80 backdrop-blur-2xl border-r border-white/[0.06] z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar — overlay drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-64 bg-[#06122b] border-r border-white/[0.06] z-50 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar