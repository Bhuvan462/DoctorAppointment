import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { forgotPassword } from '../../services/authServices'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email address')
    
    setLoading(true)
    try {
      await forgotPassword(email)
      setIsSent(true)
      toast.success('Password reset link sent!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/20 rounded-full blur-[100px]" />

        <motion.div
          className="w-full max-w-md z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                MediBook
              </h2>
            </Link>
          </div>

          <GlassCard className="p-8 border border-white/[0.08] shadow-2xl">
            {!isSent ? (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-slate-100 mb-2">Forgot Password</h1>
                  <p className="text-slate-400 text-sm">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail className="w-5 h-5" />}
                    placeholder="john@example.com"
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={loading}
                  >
                    Send Reset Link
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/login" className="text-sm text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <h1 className="text-2xl font-bold text-slate-100 mb-2">Check Your Email</h1>
                <p className="text-slate-400 text-sm mb-6">
                  We've sent a password reset link to <span className="text-slate-200 font-semibold">{email}</span>. The link will expire in 15 minutes.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Return to Login
                  </Button>
                </Link>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </PageTransition>
  )
}

export default ForgotPassword
