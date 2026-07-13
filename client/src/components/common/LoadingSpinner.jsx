import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

// ─── Inline Spinner ────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', color = 'blue', className = '' }) => {
  const sizeConfig = {
    xs:  'w-3 h-3 border',
    sm:  'w-4 h-4 border-2',
    md:  'w-6 h-6 border-2',
    lg:  'w-8 h-8 border-2',
    xl:  'w-12 h-12 border-3',
  }

  const colorConfig = {
    blue:    'border-blue-500/30 border-t-blue-500',
    teal:    'border-teal-500/30 border-t-teal-500',
    purple:  'border-purple-500/30 border-t-purple-500',
    white:   'border-white/30 border-t-white',
    emerald: 'border-emerald-500/30 border-t-emerald-500',
  }

  return (
    <div
      className={clsx(
        'rounded-full animate-spin',
        sizeConfig[size] || sizeConfig.md,
        colorConfig[color] || colorConfig.blue,
        className,
      )}
    />
  )
}

// ─── Full Page Loading ─────────────────────────────────────────────────────────
export const PageLoading = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-2 border-white/5" />
      <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
      <div
        className="absolute inset-1 w-10 h-10 rounded-full border-2 border-transparent border-t-teal-500 animate-spin"
        style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
      />
    </div>
    <motion.p
      className="text-slate-400 text-sm"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {message}
    </motion.p>
  </div>
)

// ─── Skeleton Block ────────────────────────────────────────────────────────────
export const Skeleton = ({ className = '', lines = 1, circle = false }) => {
  if (circle) {
    return (
      <div
        className={clsx(
          'rounded-full animate-pulse',
          'bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04]',
          className,
        )}
        style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite',
        }}
      />
    )
  }

  if (lines > 1) {
    return (
      <div className={clsx('flex flex-col gap-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded-lg"
            style={{
              width: i === lines - 1 ? '70%' : '100%',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s linear infinite',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={clsx('rounded-xl', className)}
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s linear infinite',
      }}
    />
  )
}

// ─── Card Skeleton ─────────────────────────────────────────────────────────────
export const CardSkeleton = ({ count = 1 }) => (
  <div className="grid gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="glass-card p-6 flex flex-col gap-4"
      >
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 flex-shrink-0" circle />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton lines={3} />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
)

// ─── Table Skeleton ────────────────────────────────────────────────────────────
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="flex flex-col gap-3">
    {/* Header */}
    <div className="flex gap-4 px-4 pb-3">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-3 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="flex gap-4 px-4 py-3 rounded-xl bg-white/[0.02]"
      >
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton
            key={j}
            className="h-4 flex-1"
            style={{ animationDelay: `${(i * cols + j) * 0.05}s` }}
          />
        ))}
      </div>
    ))}
  </div>
)

export default Spinner