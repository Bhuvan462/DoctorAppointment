import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { clsx } from 'clsx'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// ─── Animated counter hook ─────────────────────────────────────────────────────
const useCountUp = (target, duration = 1500, start = false) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3) // ease out cubic
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(target)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])

  return count
}

// ─── Stat Card Component ───────────────────────────────────────────────────────
const StatCard = ({
  title,
  value,
  icon,
  color      = 'blue',
  trend      = null,
  trendValue = null,
  suffix     = '',
  prefix     = '',
  delay      = 0,
  animate    = true,
  description,
}) => {
  const ref     = useRef(null)
  const inView  = useInView(ref, { once: true, margin: '-50px' })
  const count   = useCountUp(
    typeof value === 'number' ? value : 0,
    1500,
    inView && animate && typeof value === 'number',
  )

  const colorConfig = {
    blue: {
      bg:     'bg-blue-500/10',
      text:   'text-blue-400',
      border: 'border-blue-500/20',
      glow:   'group-hover:shadow-glow-blue',
      iconBg: 'bg-blue-500/15',
    },
    teal: {
      bg:     'bg-teal-500/10',
      text:   'text-teal-400',
      border: 'border-teal-500/20',
      glow:   'group-hover:shadow-glow-teal',
      iconBg: 'bg-teal-500/15',
    },
    purple: {
      bg:     'bg-purple-500/10',
      text:   'text-purple-400',
      border: 'border-purple-500/20',
      glow:   'group-hover:shadow-glow-purple',
      iconBg: 'bg-purple-500/15',
    },
    amber: {
      bg:     'bg-amber-500/10',
      text:   'text-amber-400',
      border: 'border-amber-500/20',
      glow:   '',
      iconBg: 'bg-amber-500/15',
    },
    emerald: {
      bg:     'bg-emerald-500/10',
      text:   'text-emerald-400',
      border: 'border-emerald-500/20',
      glow:   '',
      iconBg: 'bg-emerald-500/15',
    },
    red: {
      bg:     'bg-red-500/10',
      text:   'text-red-400',
      border: 'border-red-500/20',
      glow:   '',
      iconBg: 'bg-red-500/15',
    },
  }

  const c = colorConfig[color] || colorConfig.blue

  const TrendIcon = trend === 'up'
    ? TrendingUp
    : trend === 'down'
    ? TrendingDown
    : Minus

  const trendColor = trend === 'up'
    ? 'text-emerald-400'
    : trend === 'down'
    ? 'text-red-400'
    : 'text-slate-500'

  const displayValue = typeof value === 'number'
    ? (animate && inView ? count : value)
    : value

  return (
    <motion.div
      ref={ref}
      className={clsx(
        'group relative glass-card p-6 cursor-default',
        'hover:bg-white/[0.07] hover:border-white/[0.14]',
        'hover:shadow-glass-lg hover:-translate-y-1',
        'transition-all duration-300',
        c.glow,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-2xl" />

      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className={clsx(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          c.iconBg,
          c.text,
          'transition-transform duration-300 group-hover:scale-110',
        )}>
          {icon}
        </div>

        {/* Trend indicator */}
        {trend && trendValue && (
          <div className={clsx(
            'flex items-center gap-1 text-xs font-semibold',
            trendColor,
          )}>
            <TrendIcon className="w-3.5 h-3.5" />
            {trendValue}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-4">
        <div className={clsx('text-3xl font-bold tracking-tight', c.text)}>
          {prefix}{displayValue}{suffix}
        </div>

        {/* Title */}
        <div className="mt-1 text-sm font-medium text-slate-400">
          {title}
        </div>

        {/* Description */}
        {description && (
          <div className="mt-0.5 text-xs text-slate-600">
            {description}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StatCard