import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  Mail, Lock, User, Phone, Stethoscope,
  ArrowRight, ArrowLeft, CheckCircle, Users
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import AuroraBackground from '../../components/common/AuroraBackground'
import Logo from '../../components/common/Logo'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { ROLES, SPECIALIZATIONS } from '../../utils/constants'

// ─── Role Selector ─────────────────────────────────────────────────────────────
const RoleSelector = ({ selected, onSelect }) => {
  const roles = [
    {
      value:       ROLES.PATIENT,
      label:       'Patient',
      description: 'Book appointments and manage your health',
      icon:        <Users className="w-6 h-6" />,
      color:       'teal',
    },
    {
      value:       ROLES.DOCTOR,
      label:       'Doctor',
      description: 'Manage your schedule and consultations',
      icon:        <Stethoscope className="w-6 h-6" />,
      color:       'blue',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {roles.map((role) => {
        const isSelected = selected === role.value
        const colorMap   = {
          teal: {
            active:   'border-teal-500/50 bg-teal-500/10',
            icon:     'bg-teal-500/15 text-teal-400',
            dot:      'bg-teal-400',
          },
          blue: {
            active:   'border-blue-500/50 bg-blue-500/10',
            icon:     'bg-blue-500/15 text-blue-400',
            dot:      'bg-blue-400',
          },
        }
        const c = colorMap[role.color]

        return (
          <motion.button
            key={role.value}
            type="button"
            onClick={() => onSelect(role.value)}
            className={`
              relative p-4 rounded-xl border text-left transition-all duration-200
              ${isSelected
                ? c.active
                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Selected indicator */}
            {isSelected && (
              <motion.div
                className="absolute top-2.5 right-2.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <CheckCircle className={`w-4 h-4 ${role.color === 'teal' ? 'text-teal-400' : 'text-blue-400'}`} />
              </motion.div>
            )}

            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.icon}`}>
              {role.icon}
            </div>
            <p className="text-sm font-semibold text-slate-100 mb-0.5">{role.label}</p>
            <p className="text-xs text-slate-500 leading-snug">{role.description}</p>
          </motion.button>
        )
      })}
    </div>
  )
}

// ─── Step Progress ─────────────────────────────────────────────────────────────
const StepProgress = ({ currentStep, totalSteps }) => (
  <div className="flex items-center gap-2 mb-6">
    {Array.from({ length: totalSteps }).map((_, i) => (
      <React.Fragment key={i}>
        <motion.div
          className={`h-1 rounded-full transition-all duration-500 ${
            i < currentStep
              ? 'bg-gradient-to-r from-blue-500 to-teal-500'
              : i === currentStep
              ? 'bg-blue-500/50'
              : 'bg-white/[0.08]'
          }`}
          animate={{ flex: i === currentStep ? 2 : 1 }}
          transition={{ duration: 0.4 }}
        />
      </React.Fragment>
    ))}
  </div>
)

// ─── Register Page ─────────────────────────────────────────────────────────────
const RegisterPage = () => {
  const { registerPatient, registerDoctor } = useAuth()
  const navigate                             = useNavigate()

  const [role, setRole]         = useState(ROLES.PATIENT)
  const [step, setStep]         = useState(0) // 0 = role select, 1 = personal info, 2 = extra info
  const [loading, setLoading]   = useState(false)
  const [formData, setFormData] = useState({})

  const totalSteps = role === ROLES.DOCTOR ? 3 : 2

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
    watch,
  } = useForm({ mode: 'onBlur' })

  const password = watch('password')

  // ── Step 0: Role Selection ─────────────────────────────────────────────────
  const handleRoleNext = () => {
    setStep(1)
  }

  // ── Step 1: Personal Info ──────────────────────────────────────────────────
  const handlePersonalInfo = (data) => {
    setFormData((prev) => ({ ...prev, ...data }))
    if (role === ROLES.DOCTOR) {
      setStep(2)
    } else {
      handleFinalSubmit({ ...formData, ...data })
    }
  }

  // ── Step 2: Doctor extra info ──────────────────────────────────────────────
  const handleDoctorInfo = (data) => {
    handleFinalSubmit({ ...formData, ...data })
  }

  // ── Final submit ───────────────────────────────────────────────────────────
  const handleFinalSubmit = async (allData) => {
    setLoading(true)
    try {
      let result
      if (role === ROLES.PATIENT) {
        result = await registerPatient(allData)
      } else {
        result = await registerDoctor(allData)
      }

      if (result.success) {
        if (role === ROLES.DOCTOR) {
          toast.success('Account created! Your profile is pending admin approval.')
          navigate('/doctor/dashboard')
        } else {
          toast.success(`Welcome to MediBook, ${result.user.firstName}!`)
          navigate('/patient/dashboard')
        }
      } else {
        toast.error(result.message || 'Registration failed.')
        setStep(1) // Go back to form step
      }
    } catch (err) {
      toast.error('An unexpected error occurred.')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  const slideVariants = {
    enter: (direction) => ({
      x:       direction > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x:       0,
      opacity: 1,
    },
    exit: (direction) => ({
      x:       direction < 0 ? 40 : -40,
      opacity: 0,
    }),
  }

  return (
    <div className="min-h-screen bg-[#06122b] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <AuroraBackground intensity="normal" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="md" showText={true} linkTo="/" />
        </motion.div>

        {/* Card */}
        <motion.div
          className="glass-card relative overflow-hidden"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
        >
          {/* Top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          <div className="p-7 sm:p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                {step > 0 && (
                  <motion.button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </motion.button>
                )}
                <h2 className="text-xl font-bold text-slate-100">
                  {step === 0 && 'Create your account'}
                  {step === 1 && 'Your information'}
                  {step === 2 && 'Professional details'}
                </h2>
              </div>
              <p className="text-slate-400 text-sm ml-0.5">
                {step === 0 && 'Choose how you want to use MediBook'}
                {step === 1 && 'Fill in your personal details'}
                {step === 2 && 'Tell us about your practice'}
              </p>
            </div>

            {/* Progress */}
            <StepProgress currentStep={step} totalSteps={totalSteps} />

            {/* ── Step 0: Role selection ── */}
            <AnimatePresence mode="wait" custom={1}>
              {step === 0 && (
                <motion.div
                  key="step0"
                  variants={slideVariants}
                  custom={1}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <RoleSelector selected={role} onSelect={setRole} />
                  <Button
                    type="button"
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={handleRoleNext}
                    iconRight={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue as {role === ROLES.PATIENT ? 'Patient' : 'Doctor'}
                  </Button>
                </motion.div>
              )}

              {/* ── Step 1: Personal info ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={slideVariants}
                  custom={1}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleSubmit(handlePersonalInfo)} className="space-y-4">
                    {/* Name row */}
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="First name"
                        placeholder="John"
                        icon={<User className="w-4 h-4" />}
                        error={errors.firstName?.message}
                        required
                        {...register('firstName', {
                          required: 'First name is required.',
                          minLength: { value: 2, message: 'Min 2 characters.' },
                          maxLength: { value: 50, message: 'Max 50 characters.' },
                        })}
                      />
                      <Input
                        label="Last name"
                        placeholder="Doe"
                        error={errors.lastName?.message}
                        required
                        {...register('lastName', {
                          required: 'Last name is required.',
                          minLength: { value: 2, message: 'Min 2 characters.' },
                          maxLength: { value: 50, message: 'Max 50 characters.' },
                        })}
                      />
                    </div>

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
                          message: 'Please enter a valid email.',
                        },
                      })}
                    />

                    {/* Phone */}
                    <Input
                      label="Phone number"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      icon={<Phone className="w-4 h-4" />}
                      error={errors.phone?.message}
                      hint="Optional"
                      {...register('phone', {
                        pattern: {
                          value:   /^[+]?[\d\s\-()]{7,15}$/,
                          message: 'Please enter a valid phone number.',
                        },
                      })}
                    />

                    {/* Password */}
                    <Input
                      label="Password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      icon={<Lock className="w-4 h-4" />}
                      error={errors.password?.message}
                      required
                      {...register('password', {
                        required: 'Password is required.',
                        minLength: { value: 8, message: 'Min 8 characters.' },
                        pattern: {
                          value:   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Must include uppercase, lowercase, and a number.',
                        },
                      })}
                    />

                    {/* Confirm password */}
                    <Input
                      label="Confirm password"
                      type="password"
                      placeholder="Repeat your password"
                      icon={<Lock className="w-4 h-4" />}
                      error={errors.confirmPassword?.message}
                      required
                      {...register('confirmPassword', {
                        required: 'Please confirm your password.',
                        validate: (value) =>
                          value === password || 'Passwords do not match.',
                      })}
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      size="lg"
                      loading={loading && role === ROLES.PATIENT}
                      iconRight={!loading && <ArrowRight className="w-4 h-4" />}
                    >
                      {role === ROLES.DOCTOR ? 'Continue' : 'Create account'}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ── Step 2: Doctor extra info ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={slideVariants}
                  custom={1}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleSubmit(handleDoctorInfo)} className="space-y-4">
                    {/* Specialization */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-300">
                        Specialization <span className="text-red-400 text-xs">*</span>
                      </label>
                      <select
                        className="input-glass"
                        {...register('specialization', {
                          required: 'Please select your specialization.',
                        })}
                      >
                        <option value="" className="bg-[#0d1530]">Select specialization...</option>
                        {SPECIALIZATIONS.map((spec) => (
                          <option key={spec} value={spec} className="bg-[#0d1530]">
                            {spec}
                          </option>
                        ))}
                      </select>
                      {errors.specialization && (
                        <p className="text-red-400 text-xs">{errors.specialization.message}</p>
                      )}
                    </div>

                    {/* Experience */}
                    <Input
                      label="Years of experience"
                      type="number"
                      placeholder="e.g. 5"
                      hint="Optional"
                      error={errors.experience?.message}
                      {...register('experience', {
                        min: { value: 0,  message: 'Cannot be negative.'    },
                        max: { value: 70, message: 'Please enter a valid number.' },
                      })}
                    />

                    {/* Consultation fee */}
                    <Input
                      label="Consultation fee (USD)"
                      type="number"
                      placeholder="e.g. 100"
                      hint="Optional — you can set this later"
                      error={errors.consultationFee?.message}
                      {...register('consultationFee', {
                        min: { value: 0, message: 'Fee cannot be negative.' },
                      })}
                    />

                    {/* Bio */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-300">
                        Professional bio
                        <span className="text-slate-600 text-xs ml-1">Optional</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Brief description of your expertise and approach..."
                        className="input-glass resize-none"
                        {...register('bio', {
                          maxLength: { value: 1000, message: 'Max 1000 characters.' },
                        })}
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      size="lg"
                      loading={loading}
                      iconRight={!loading && <CheckCircle className="w-4 h-4" />}
                    >
                      Complete registration
                    </Button>

                    {/* Doctor note */}
                    <p className="text-xs text-slate-600 text-center leading-relaxed">
                      Your account will be reviewed by our admin team before going live to patients.
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Login link */}
        <motion.p
          className="text-center text-sm text-slate-500 mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </motion.p>
      </div>
    </div>
  )
}

export default RegisterPage