import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { resetPassword as resetPasswordService } from '../../services/authServices'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = (pass) => {
    let score = 0
    if (!pass) return score
    if (pass.length > 8) score += 1
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) score += 1
    if (pass.match(/\d/)) score += 1
    if (pass.match(/[^a-zA-Z\d]/)) score += 1
    return score
  }

  const score = getStrength(password)
  
  const getLabel = () => {
    if (!password) return 'None'
    if (score <= 1) return 'Weak'
    if (score === 2) return 'Fair'
    if (score === 3) return 'Good'
    return 'Strong'
  }
  
  const getColor = () => {
    if (score <= 1) return 'bg-red-500'
    if (score === 2) return 'bg-amber-500'
    if (score === 3) return 'bg-blue-500'
    return 'bg-emerald-500'
  }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">Password Strength</span>
        <span className={clsx("text-xs font-bold", getColor().replace('bg-', 'text-'))}>{getLabel()}</span>
      </div>
      <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden flex gap-1">
        {[1, 2, 3, 4].map((step) => (
          <div 
            key={step} 
            className={clsx(
              "h-full flex-1 rounded-full transition-all duration-300", 
              score >= step ? getColor() : 'bg-transparent'
            )} 
          />
        ))}
      </div>
    </div>
  )
}

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <GlassCard className="p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Invalid Request</h1>
          <p className="text-slate-400 mb-6">No reset token provided. Please request a new password reset link.</p>
          <Link to="/forgot-password">
            <Button variant="primary">Go to Forgot Password</Button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password || !confirmPassword) return toast.error('Please fill all fields')
    if (password !== confirmPassword) return toast.error('Passwords do not match')
    if (password.length < 8) return toast.error('Password must be at least 8 characters')
    
    setLoading(true)
    try {
      await resetPasswordService({ token, newPassword: password })
      setIsSuccess(true)
      toast.success('Password reset successfully')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reset password. The link might be expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/20 rounded-full blur-[100px]" />

        <motion.div className="w-full max-w-md z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">MediBook</h2>
            </Link>
          </div>

          <GlassCard className="p-8 border border-white/[0.08] shadow-2xl">
            {!isSuccess ? (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-slate-100 mb-2">Create New Password</h1>
                  <p className="text-slate-400 text-sm">Please enter your new password below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <div className="relative">
                      <Input
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon={<Lock className="w-5 h-5" />}
                        placeholder="••••••••"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-slate-400 hover:text-slate-200 focus:outline-none">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <PasswordStrengthMeter password={password} />
                  </div>

                  <div className="relative">
                    <Input
                      label="Confirm Password"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      icon={<Lock className="w-5 h-5" />}
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-9 text-slate-400 hover:text-slate-200 focus:outline-none">
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <Button type="submit" variant="primary" className="w-full mt-4" loading={loading}>
                    Reset Password
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <h1 className="text-2xl font-bold text-slate-100 mb-2">Password Reset Successful</h1>
                <p className="text-slate-400 text-sm mb-6">Your password has been changed successfully. You can now log in with your new password.</p>
                <Link to="/login">
                  <Button variant="primary" className="w-full">Go to Login</Button>
                </Link>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </PageTransition>
  )
}

export default ResetPassword
