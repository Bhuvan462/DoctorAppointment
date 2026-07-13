import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

const Button = ({
  children,
  variant    = 'primary',
  size       = 'md',
  loading    = false,
  disabled   = false,
  icon       = null,
  iconRight  = null,
  fullWidth  = false,
  onClick,
  type       = 'button',
  className  = '',
  ripple     = true,
  ...props
}) => {
  const [ripples, setRipples]   = useState([])
  const buttonRef               = useRef(null)

  // ── Size config ────────────────────────────────────────────────────────────
  const sizeConfig = {
    xs:  'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    sm:  'px-4 py-2 text-sm rounded-xl gap-2',
    md:  'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg:  'px-6 py-3 text-base rounded-xl gap-2.5',
    xl:  'px-8 py-4 text-base rounded-2xl gap-3',
  }

  // ── Variant config ─────────────────────────────────────────────────────────
  const variantConfig = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700
      hover:from-blue-500 hover:to-blue-600
      text-white font-semibold
      shadow-button hover:shadow-glow-blue
      border border-blue-500/30
    `,
    secondary: `
      bg-white/[0.06] hover:bg-white/[0.10]
      border border-white/10 hover:border-white/20
      text-slate-200 font-semibold
      backdrop-blur-xl
    `,
    teal: `
      bg-gradient-to-r from-teal-600 to-teal-700
      hover:from-teal-500 hover:to-teal-600
      text-white font-semibold
      hover:shadow-glow-teal
      border border-teal-500/30
    `,
    purple: `
      bg-gradient-to-r from-purple-600 to-purple-700
      hover:from-purple-500 hover:to-purple-600
      text-white font-semibold
      hover:shadow-glow-purple
      border border-purple-500/30
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700
      hover:from-red-500 hover:to-red-600
      text-white font-semibold
      border border-red-500/30
    `,
    success: `
      bg-gradient-to-r from-emerald-600 to-emerald-700
      hover:from-emerald-500 hover:to-emerald-600
      text-white font-semibold
      border border-emerald-500/30
    `,
    ghost: `
      text-slate-400 hover:text-slate-100
      hover:bg-white/[0.06]
      font-medium
    `,
    outline: `
      bg-transparent
      border border-white/20 hover:border-white/40
      text-slate-200 font-semibold
      hover:bg-white/[0.04]
    `,
    link: `
      text-blue-400 hover:text-blue-300
      font-medium underline-offset-4
      hover:underline
      p-0
    `,
  }

  // ── Ripple effect ──────────────────────────────────────────────────────────
  const handleRipple = (e) => {
    if (!ripple || disabled || loading) return

    const button   = buttonRef.current
    const rect     = button.getBoundingClientRect()
    const x        = e.clientX - rect.left
    const y        = e.clientY - rect.top
    const id       = Date.now()

    setRipples((prev) => [...prev, { x, y, id }])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 700)
  }

  const handleClick = (e) => {
    handleRipple(e)
    if (onClick) onClick(e)
  }

  const isDisabled = disabled || loading

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className={clsx(
        // Base styles
        'relative inline-flex items-center justify-center',
        'font-sans transition-all duration-200 overflow-hidden',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        'select-none no-select',
        // Size
        sizeConfig[size] || sizeConfig.md,
        // Variant
        variantConfig[variant] || variantConfig.primary,
        // States
        isDisabled
          ? 'opacity-50 cursor-not-allowed pointer-events-none'
          : 'cursor-pointer',
        // Full width
        fullWidth && 'w-full',
        // Custom
        className,
      )}
      whileHover={!isDisabled ? { y: -1, scale: 1.005 } : {}}
      whileTap={!isDisabled ? { y: 0, scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/20 pointer-events-none"
            style={{
              left:   ripple.x - 10,
              top:    ripple.y - 10,
              width:  20,
              height: 20,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 15, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Loading spinner */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Content */}
      <span
        className={clsx(
          'flex items-center justify-center gap-2 transition-opacity duration-200',
          loading && 'opacity-0',
        )}
      >
        {icon && (
          <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            {icon}
          </span>
        )}
        {children}
        {iconRight && (
          <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            {iconRight}
          </span>
        )}
      </span>
    </motion.button>
  )
}

export default Button