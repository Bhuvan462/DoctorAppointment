import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Mail, Lock, ArrowRight, Stethoscope, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import AuroraBackground from '../../components/common/AuroraBackground'
import Logo from '../../components/common/Logo'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { ROLES } from '../../utils/constants'

const LoginPage = () => {
  const { login }      = useAuth()
  const navigate       = useNavigate()
  const location       = useLocation()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await login(data)
      if (result.success) {
        toast.success(`Welcome back, ${result.user.firstName}!`)
        // Redirect based on role
        const dashboardMap = {
          [ROLES.PATIENT]: '/patient/dashboard',
          [ROLES.DOCTOR]:  '/doctor/dashboard',
          [ROLES.ADMIN]:   '/admin/dashboard',
        }
        const from = location.state?.from?.pathname || dashboardMap[result.user.role] || '/'
        navigate(from, { replace: true })
      } else {
        toast.error(result.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      toast.error('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#06122b] flex relative overflow-hidden">
      <AuroraBackground intensity="normal" />

      {/* ─── Left panel — Branding ────────────────────────────────────────── */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        <Logo size="md" showText={true} linkTo="/" />

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <h1 className="text-4xl font-bold text-slate-100 mb-4 leading-tight">
              Your health,
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                simplified.
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Access your appointments, prescriptions, and health records — all from one intelligent platform.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {[
              { icon: <Stethoscope className="w-4 h-4" />, text: '500+ verified healthcare professionals' },
              { icon: <Shield className="w-4 h-4" />,      text: 'Secure and private health records'       },
              { icon: <ArrowRight className="w-4 h-4" />,  text: 'Instant appointment confirmation'        },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-sm text-slate-400">
                <span className="text-blue-400 flex-shrink-0">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom quote */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <p className="text-slate-400 text-sm italic leading-relaxed mb-3">
            "MediBook has transformed how I manage my patient appointments. The experience is seamless and my patients love it."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">DR</span>
            </div>
            <div>
              <p className="text-slate-200 text-xs font-semibold">Dr. Rachel Kim</p>
              <p className="text-slate-500 text-2xs">Cardiologist, New York</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ─── Right panel — Form ───────────────────────────────────────────── */}
      <motion.div
        className="flex-1 flex items-center justify-center p-6 relative z-10"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size="md" showText={true} linkTo="/" />
          </div>

          {/* Form card */}
          <motion.div
            className="glass-card p-8 relative"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: 'spring', stiffness: 200 }}
          >
            {/* Top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent rounded-t-2xl" />

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-1.5">
                Welcome back
              </h2>
              <p className="text-slate-400 text-sm">
                Sign in to your MediBook account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                icon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                required
                {...register('email', {
                  required: 'Email is required.',
                  pattern: {
                    value:   /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Please enter a valid email address.',
                  },
                })}
              />

              {/* Password */}
              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  required
                  {...register('password', {
                    required: 'Password is required.',
                  })}
                />
                <div className="flex justify-end mt-1.5">
                  <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                size="lg"
                iconRight={!loading && <ArrowRight className="w-4 h-4" />}
              >
                Sign in
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-slate-600 text-xs">or</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Create one free
              </Link>
            </p>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="mt-6 flex items-center justify-center gap-6 text-slate-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {['256-bit SSL', 'HIPAA Compliant', 'SOC 2 Certified'].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 text-xs">
                <Shield className="w-3 h-3 text-slate-600" />
                {badge}
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage