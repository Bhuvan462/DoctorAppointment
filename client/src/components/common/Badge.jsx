import React from 'react'
import { clsx } from 'clsx'
import { STATUS_CONFIG } from '../../utils/constants'

const Badge = ({
  status,
  label,
  color,
  size   = 'md',
  dot    = true,
  className = '',
}) => {
  // Use status config if status prop provided
  const config = status ? STATUS_CONFIG[status] : null
  const displayLabel = label || config?.label || status || 'Unknown'

  const sizeConfig = {
    sm: 'px-2 py-0.5 text-2xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  }

  // Color variants
  const colorVariants = {
    blue:    'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    teal:    'bg-teal-500/15 text-teal-400 border border-teal-500/20',
    purple:  'bg-purple-500/15 text-purple-400 border border-purple-500/20',
    amber:   'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    red:     'bg-red-500/15 text-red-400 border border-red-500/20',
    slate:   'bg-slate-500/15 text-slate-400 border border-slate-500/20',
    pink:    'bg-pink-500/15 text-pink-400 border border-pink-500/20',
  }

  const dotColors = {
    blue:    'bg-blue-400',
    teal:    'bg-teal-400',
    purple:  'bg-purple-400',
    amber:   'bg-amber-400',
    emerald: 'bg-emerald-400',
    red:     'bg-red-400',
    slate:   'bg-slate-400',
    pink:    'bg-pink-400',
  }

  const resolvedColor = color || config?.color || 'slate'

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        sizeConfig[size] || sizeConfig.md,
        colorVariants[resolvedColor] || colorVariants.slate,
        className,
      )}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            dotColors[resolvedColor] || dotColors.slate,
          )}
        />
      )}
      {displayLabel}
    </span>
  )
}

export default Badge