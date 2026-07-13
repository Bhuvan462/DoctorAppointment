import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

const GlassCard = ({
  children,
  className    = '',
  hover        = false,
  animate      = false,
  delay        = 0,
  onClick,
  padding      = 'md',
  glow         = null,
  border       = true,
  ...props
}) => {
  const paddingConfig = {
    none: 'p-0',
    sm:   'p-4',
    md:   'p-6',
    lg:   'p-8',
    xl:   'p-10',
  }

  const glowConfig = {
    blue:   'shadow-glow-blue border-blue-500/20',
    teal:   'shadow-glow-teal border-teal-500/20',
    purple: 'shadow-glow-purple border-purple-500/20',
  }

  const baseClass = clsx(
    // Glass base
    'relative bg-white/[0.05] backdrop-blur-xl',
    'rounded-2xl',
    border && 'border border-white/10',
    'shadow-sm',
    // Padding
    paddingConfig[padding] || paddingConfig.md,
    // Glow
    glow && glowConfig[glow],
    // Hover state
    hover && [
      'cursor-pointer',
      'hover:bg-white/[0.08]',
      'hover:border-white/20',
      'hover:shadow-md',
      'hover:-translate-y-1',
      'transition-all duration-300',
    ],
    // Override transition if not hover
    !hover && 'transition-colors duration-300',
    className,
  )

  if (animate) {
    return (
      <motion.div
        className={baseClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay,
          ease: [0.4, 0, 0.2, 1],
        }}
        onClick={onClick}
        {...props}
      >
        {/* Inner highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />
        {children}
      </motion.div>
    )
  }

  return (
    <div className={baseClass} onClick={onClick} {...props}>
      {/* Inner highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />
      {children}
    </div>
  )
}

export default GlassCard