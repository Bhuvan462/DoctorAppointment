import React, { useState, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

const Input = forwardRef(({
  label,
  error,
  success,
  hint,
  type       = 'text',
  icon       = null,
  iconRight  = null,
  className  = '',
  inputClass = '',
  disabled   = false,
  required   = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused]       = useState(false)

  const isPassword  = type === 'password'
  const inputType   = isPassword ? (showPassword ? 'text' : 'password') : type
  const hasError    = !!error
  const hasSuccess  = !!success && !hasError

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {/* Label */}
      {label && (
        <label className="flex items-center gap-1 text-sm font-medium text-slate-300">
          {label}
          {required && (
            <span className="text-red-400 text-xs">*</span>
          )}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10">
            {icon}
          </div>
        )}

        {/* Input field */}
        <motion.input
          ref={ref}
          type={inputType}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          animate={hasError ? {
            x: [0, -6, 6, -4, 4, -2, 2, 0],
            transition: { duration: 0.4 }
          } : {}}
          className={clsx(
            // Base
            'w-full bg-white/[0.05] backdrop-blur-xl',
            'text-slate-100 placeholder-slate-600',
            'rounded-xl transition-all duration-200',
            'outline-none ring-0',
            'text-sm',
            // Padding based on icons
            icon        ? 'pl-10 pr-4 py-3'       : 'px-4 py-3',
            (iconRight || isPassword || hasError || hasSuccess)
                        ? 'pr-10'                  : '',
            // Border states
            hasError
              ? 'border border-red-500/50 bg-red-500/[0.04]'
              : hasSuccess
              ? 'border border-emerald-500/50 bg-emerald-500/[0.03]'
              : isFocused
              ? 'border border-blue-500/50 bg-white/[0.07]'
              : 'border border-white/[0.08] hover:border-white/[0.15]',
            // Focus ring
            hasError
              ? 'focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15),0_4px_16px_rgba(0,0,0,0.2)]'
              : 'focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15),0_4px_16px_rgba(0,0,0,0.2)]',
            // Disabled
            disabled && 'opacity-50 cursor-not-allowed',
            inputClass,
          )}
          {...props}
        />

        {/* Right side icons */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-slate-300 transition-colors duration-200 p-0.5"
              tabIndex={-1}
            >
              {showPassword
                ? <EyeOff className="w-4 h-4" />
                : <Eye className="w-4 h-4" />
              }
            </button>
          )}

          {/* Status icons */}
          {hasError && !isPassword && (
            <AnimatePresence>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <AlertCircle className="w-4 h-4 text-red-400" />
              </motion.div>
            </AnimatePresence>
          )}

          {hasSuccess && !isPassword && (
            <AnimatePresence>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </motion.div>
            </AnimatePresence>
          )}

          {/* Custom right icon */}
          {iconRight && !hasError && !hasSuccess && !isPassword && (
            <div className="text-slate-500">{iconRight}</div>
          )}
        </div>
      </div>

      {/* Error / Success / Hint messages */}
      <AnimatePresence mode="wait">
        {hasError && (
          <motion.p
            key="error"
            className="flex items-center gap-1.5 text-red-400 text-xs"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {error}
          </motion.p>
        )}

        {hasSuccess && (
          <motion.p
            key="success"
            className="flex items-center gap-1.5 text-emerald-400 text-xs"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCircle className="w-3 h-3 flex-shrink-0" />
            {success}
          </motion.p>
        )}

        {hint && !hasError && !hasSuccess && (
          <motion.p
            key="hint"
            className="text-slate-500 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
})

Input.displayName = 'Input'

export default Input