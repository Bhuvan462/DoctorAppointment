import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  User, Mail, Phone, MapPin, Calendar,
  Camera, Save, Lock, CheckCircle,
  Edit3, Shield, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { updatePatientProfile, uploadProfilePhoto } from '../../services/patientService'
import * as authService from '../../services/authServices'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { getInitials, formatDateForInput } from '../../utils/formatters'
import { GENDER_OPTIONS } from '../../utils/constants'

// ─── Avatar Upload ─────────────────────────────────────────────────────────────
const AvatarUpload = ({ user, onUpload }) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview]     = useState(user?.profilePhoto || null)
  const fileRef                   = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('profilePhoto', file)
      const response = await uploadProfilePhoto(formData)
      onUpload(response.data?.profilePhoto || response.data)
      toast.success('Profile photo updated successfully.')
    } catch (err) {
      toast.error('Failed to upload photo. Please try again.')
      setPreview(user?.profilePhoto || null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        {/* Avatar */}
        <motion.div
          className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center overflow-hidden shadow-glow-blue"
          whileHover={{ scale: 1.05 }}
        >
          {preview ? (
            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-2xl font-bold">
              {getInitials(user?.firstName, user?.lastName)}
            </span>
          )}
        </motion.div>

        {/* Upload overlay */}
        <motion.button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow-lg transition-colors duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={uploading}
        >
          {uploading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Camera className="w-3.5 h-3.5" />
          )}
        </motion.button>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-slate-200">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
      </div>
    </div>
  )
}

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
)

// ─── Patient Profile Page ──────────────────────────────────────────────────────
const PatientProfile = () => {
  const { user, updateUser }    = useAuth()
  const [activeTab, setTab]     = useState('profile')
  const [saving, setSaving]     = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  // Profile form
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      firstName:  user?.firstName  || '',
      lastName:   user?.lastName   || '',
      phone:      user?.phone      || '',
      dateOfBirth: user?.dateOfBirth ? formatDateForInput(user.dateOfBirth) : '',
      gender:     user?.gender     || '',
      address: {
        street:  user?.address?.street  || '',
        city:    user?.address?.city    || '',
        state:   user?.address?.state   || '',
        country: user?.address?.country || '',
        zipCode: user?.address?.zipCode || '',
      },
    },
  })

  // Password form
  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    formState: { errors: pwdErrors },
    reset: resetPwd,
    watch: watchPwd,
  } = useForm()

  const newPwd = watchPwd('newPassword')

  // Save profile
  const onSaveProfile = async (data) => {
    setSaving(true)
    try {
      const response = await updatePatientProfile(data)
      updateUser(response.data || data)
      toast.success('Profile updated successfully.')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  // Change password
  const onChangePassword = async (data) => {
    setSavingPwd(true)
    try {
      await authService.changePassword(data)
      toast.success('Password changed successfully.')
      resetPwd()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password.')
    } finally {
      setSavingPwd(false)
    }
  }

  const tabs = [
    { key: 'profile',  label: 'Profile',   icon: <User className="w-4 h-4" />   },
    { key: 'security', label: 'Security',  icon: <Shield className="w-4 h-4" /> },
  ]

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-slate-100">My Profile</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your personal information and account security.
          </p>
        </motion.div>

        {/* Avatar card */}
        <GlassCard animate delay={0.1} padding="lg">
          <AvatarUpload
            user={user}
            onUpload={(photoUrl) => updateUser({ profilePhoto: photoUrl })}
          />
        </GlassCard>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => setTab(tab.key)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200
                ${activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-button'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }
              `}
              whileHover={{ scale: activeTab === tab.key ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">

          {/* ── Profile tab ── */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <form onSubmit={handleSubmit(onSaveProfile)}>
                <GlassCard padding="lg">
                  <SectionHeader
                    icon={<User className="w-4 h-4" />}
                    title="Personal Information"
                    subtitle="Update your name, contact details, and basic information."
                  />

                  <div className="space-y-5">
                    {/* Name */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="First name"
                        placeholder="John"
                        error={errors.firstName?.message}
                        required
                        {...register('firstName', {
                          required: 'First name is required.',
                          minLength: { value: 2, message: 'Min 2 characters.' },
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
                        })}
                      />
                    </div>

                    {/* Email — read only */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-300">
                        Email address
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 text-sm">
                        <Mail className="w-4 h-4 text-slate-600 flex-shrink-0" />
                        {user?.email}
                        <span className="ml-auto text-xs text-slate-600">Read only</span>
                      </div>
                    </div>

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

                    {/* Date of birth + Gender */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Date of birth"
                        type="date"
                        icon={<Calendar className="w-4 h-4" />}
                        error={errors.dateOfBirth?.message}
                        hint="Optional"
                        {...register('dateOfBirth')}
                      />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-300">Gender</label>
                        <select
                          className="input-glass"
                          {...register('gender')}
                        >
                          <option value="" className="bg-[#0d1530]">Select gender...</option>
                          {GENDER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-[#0d1530]">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <p className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        Address
                        <span className="text-slate-600 text-xs font-normal">Optional</span>
                      </p>
                      <div className="space-y-3">
                        <Input
                          placeholder="Street address"
                          {...register('address.street')}
                        />
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Input placeholder="City"    {...register('address.city')}    />
                          <Input placeholder="State"   {...register('address.state')}   />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Input placeholder="Country" {...register('address.country')} />
                          <Input placeholder="ZIP code" {...register('address.zipCode')} />
                        </div>
                      </div>
                    </div>

                    {/* Save button */}
                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={saving}
                        icon={!saving && <Save className="w-4 h-4" />}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </form>
            </motion.div>
          )}

          {/* ── Security tab ── */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <form onSubmit={handlePwdSubmit(onChangePassword)}>
                <GlassCard padding="lg">
                  <SectionHeader
                    icon={<Shield className="w-4 h-4" />}
                    title="Change Password"
                    subtitle="Update your password to keep your account secure."
                  />

                  <div className="space-y-5">
                    <Input
                      label="Current password"
                      type="password"
                      placeholder="Enter current password"
                      icon={<Lock className="w-4 h-4" />}
                      error={pwdErrors.currentPassword?.message}
                      required
                      {...registerPwd('currentPassword', {
                        required: 'Current password is required.',
                      })}
                    />

                    <Input
                      label="New password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      icon={<Lock className="w-4 h-4" />}
                      error={pwdErrors.newPassword?.message}
                      required
                      {...registerPwd('newPassword', {
                        required: 'New password is required.',
                        minLength: { value: 8, message: 'Min 8 characters.' },
                        pattern: {
                          value:   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Must include uppercase, lowercase, and a number.',
                        },
                      })}
                    />

                    <Input
                      label="Confirm new password"
                      type="password"
                      placeholder="Repeat new password"
                      icon={<Lock className="w-4 h-4" />}
                      error={pwdErrors.confirmPassword?.message}
                      required
                      {...registerPwd('confirmPassword', {
                        required: 'Please confirm your new password.',
                        validate: (v) => v === newPwd || 'Passwords do not match.',
                      })}
                    />

                    {/* Password requirements */}
                    <div className="p-4 rounded-xl bg-blue-500/[0.06] border border-blue-500/20">
                      <p className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        Password requirements
                      </p>
                      {[
                        'At least 8 characters long',
                        'Contains an uppercase letter',
                        'Contains a lowercase letter',
                        'Contains a number',
                      ].map((req) => (
                        <p key={req} className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <CheckCircle className="w-3 h-3 text-slate-600 flex-shrink-0" />
                          {req}
                        </p>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={savingPwd}
                        icon={!savingPwd && <Save className="w-4 h-4" />}
                      >
                        Update Password
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageTransition>
  )
}

export default PatientProfile   