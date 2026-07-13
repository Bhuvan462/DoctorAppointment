import React from 'react'
import { motion } from 'framer-motion'

const AuroraBackground = ({ intensity = 'normal' }) => {
  const opacityMap = {
    subtle: 0.06,
    normal: 0.10,
    strong: 0.15,
  }

  const opacity = opacityMap[intensity] || 0.10

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">

      {/* Animated blob 1 — Blue */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width:      '700px',
          height:     '700px',
          background: `radial-gradient(circle, rgba(37, 99, 235, ${opacity}) 0%, transparent 70%)`,
          top:        '-200px',
          left:       '-150px',
          filter:     'blur(60px)',
        }}
        animate={{
          x:     [0, 40, -20, 0],
          y:     [0, -60, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration:   18,
          repeat:     Infinity,
          ease:       'easeInOut',
        }}
      />

      {/* Animated blob 2 — Purple */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width:      '600px',
          height:     '600px',
          background: `radial-gradient(circle, rgba(124, 58, 237, ${opacity * 0.8}) 0%, transparent 70%)`,
          top:        '40%',
          right:      '-200px',
          filter:     'blur(70px)',
        }}
        animate={{
          x:     [0, -50, 30, 0],
          y:     [0, 40, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration:   22,
          repeat:     Infinity,
          ease:       'easeInOut',
          delay:      3,
        }}
      />

      {/* Animated blob 3 — Teal */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width:      '500px',
          height:     '500px',
          background: `radial-gradient(circle, rgba(13, 148, 136, ${opacity * 0.7}) 0%, transparent 70%)`,
          bottom:     '-100px',
          left:       '30%',
          filter:     'blur(80px)',
        }}
        animate={{
          x:     [0, 30, -40, 0],
          y:     [0, -40, 20, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration:   25,
          repeat:     Infinity,
          ease:       'easeInOut',
          delay:      6,
        }}
      />

      {/* Animated blob 4 — Subtle blue center glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width:      '400px',
          height:     '400px',
          background: `radial-gradient(circle, rgba(37, 99, 235, ${opacity * 0.4}) 0%, transparent 70%)`,
          top:        '20%',
          left:       '40%',
          filter:     'blur(100px)',
        }}
        animate={{
          x:     [0, -30, 50, 0],
          y:     [0, 50, -20, 0],
          scale: [1, 1.2, 0.85, 1],
        }}
        transition={{
          duration:   30,
          repeat:     Infinity,
          ease:       'easeInOut',
          delay:      9,
        }}
      />

      {/* Fine noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize:   '128px 128px',
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(15,23,42,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.12) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}

export default AuroraBackground