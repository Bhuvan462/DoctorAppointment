import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Logo = ({ size = 'md', showText = true, linkTo = '/', animate = true }) => {
  const sizeConfig = {
    sm: {
      container: 'w-8 h-8',
      icon:      'w-4 h-4',
      text:      'text-lg',
      rounded:   'rounded-xl',
    },
    md: {
      container: 'w-10 h-10',
      icon:      'w-5 h-5',
      text:      'text-xl',
      rounded:   'rounded-xl',
    },
    lg: {
      container: 'w-14 h-14',
      icon:      'w-7 h-7',
      text:      'text-2xl',
      rounded:   'rounded-2xl',
    },
    xl: {
      container: 'w-20 h-20',
      icon:      'w-10 h-10',
      text:      'text-4xl',
      rounded:   'rounded-3xl',
    },
  }

  const config = sizeConfig[size] || sizeConfig.md

  const LogoIcon = () => (
    <motion.div
      className={`
        ${config.container} ${config.rounded}
        bg-gradient-to-br from-blue-500 via-blue-600 to-teal-500
        flex items-center justify-center
        shadow-glow-blue flex-shrink-0
      `}
      whileHover={animate ? { scale: 1.05, rotate: -5 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <svg
        className={`${config.icon} text-white`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    </motion.div>
  )

  const LogoText = () => (
    <span
      className={`
        ${config.text} font-bold tracking-tight
        bg-gradient-to-r from-white via-slate-100 to-slate-300
        bg-clip-text text-transparent
        select-none
      `}
    >
      Medi
      <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
        Book
      </span>
    </span>
  )

  if (linkTo) {
    return (
      <Link to={linkTo} className="flex items-center gap-3 group">
        <LogoIcon />
        {showText && <LogoText />}
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <LogoIcon />
      {showText && <LogoText />}
    </div>
  )
}

export default Logo