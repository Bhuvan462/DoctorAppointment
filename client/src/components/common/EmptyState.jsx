import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
  size = 'md',
}) => {
  const sizeConfig = {
    sm: {
      container: 'py-10',
      iconBox:   'w-14 h-14',
      iconSize:  'w-6 h-6',
      title:     'text-base',
      desc:      'text-sm',
    },
    md: {
      container: 'py-16',
      iconBox:   'w-20 h-20',
      iconSize:  'w-8 h-8',
      title:     'text-lg',
      desc:      'text-sm',
    },
    lg: {
      container: 'py-24',
      iconBox:   'w-24 h-24',
      iconSize:  'w-10 h-10',
      title:     'text-xl',
      desc:      'text-base',
    },
  }

  const s = sizeConfig[size] || sizeConfig.md

  return (
    <motion.div
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        s.container,
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Icon */}
      {icon && (
        <motion.div
          className={clsx(
            s.iconBox,
            'rounded-2xl mb-5 flex items-center justify-center',
            'bg-white/[0.04] border border-white/[0.08]',
            'text-slate-500',
          )}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration:   4,
            repeat:     Infinity,
            ease:       'easeInOut',
          }}
        >
          <span className={clsx(s.iconSize, 'flex items-center justify-center')}>
            {React.isValidElement(icon) ? icon : (
              typeof icon === 'function' || typeof icon === 'object' ? React.createElement(icon, { className: 'w-full h-full' }) : icon
            )}
          </span>
        </motion.div>
      )}

      {/* Title */}
      <h3 className={clsx(
        s.title,
        'font-semibold text-slate-300 mb-2',
      )}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={clsx(
          s.desc,
          'text-slate-500 max-w-sm leading-relaxed mb-6',
        )}>
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}

export default EmptyState