import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import AuroraBackground from '../../components/common/AuroraBackground'
import Button from '../../components/common/Button'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#06122b] flex items-center justify-center relative overflow-hidden">
      <AuroraBackground intensity="normal" />

      <div className="relative z-10 text-center px-4 max-w-lg mx-auto">
        {/* 404 number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
        >
          <div className="text-[10rem] font-black leading-none tracking-tighter">
            <span className="bg-gradient-to-r from-blue-500 via-teal-400 to-purple-500 bg-clip-text text-transparent">
              404
            </span>
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-4 space-y-3"
        >
          <h1 className="text-2xl font-bold text-slate-100">
            Page not found
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            The page you are looking for does not exist or has been moved.
            Let us get you back on track.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Button
            variant="secondary"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
          <Button
            variant="primary"
            icon={<Home className="w-4 h-4" />}
            onClick={() => navigate('/')}
          >
            Home
          </Button>
        </motion.div>

        {/* Floating decoration */}
        <motion.div
          className="absolute -z-10 w-64 h-64 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #2563eb, transparent)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}

export default NotFoundPage