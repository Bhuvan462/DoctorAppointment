import React from 'react'
import { motion } from 'framer-motion'

const pageVariants = {
  initial: {
    opacity:   0,
    y:         16,
    scale:     0.99,
  },
  enter: {
    opacity:   1,
    y:         0,
    scale:     1,
    transition: {
      duration:   0.4,
      ease:       [0.4, 0, 0.2, 1],
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity:   0,
    y:         -10,
    scale:     0.99,
    transition: {
      duration: 0.25,
      ease:     [0.4, 0, 1, 1],
    },
  },
}

const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      className={`relative ${className}`.trim()}
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

export default PageTransition