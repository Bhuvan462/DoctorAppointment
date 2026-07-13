import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { getMyDoctorProfile, updateDoctorProfile } from '../../services/doctorService'
import SpecializationAnimation from '../../components/animations/SpecializationAnimation'

const DoctorProfile = () => {
  const { updateUser } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    specialization: '',
    experience: '',
    consultationFee: '',
    qualifications: '',
    languages: '',
    clinicName: '',
    clinicAddress: '',
    bio: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const response = await getMyDoctorProfile()
        const data = response?.data || {}
        const profile = data.doctorProfile || {}

        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          specialization: profile.specialization || '',
          experience: profile.experience ?? '',
          consultationFee: profile.consultationFee ?? '',
          qualifications: profile.qualifications ? profile.qualifications.join(', ') : '',
          languages: profile.languages ? profile.languages.join(', ') : '',
          clinicName: profile.clinic?.name || '',
          clinicAddress: profile.clinic?.address || '',
          bio: profile.bio || '',
        })
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load doctor profile.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        specialization: form.specialization.trim(),
        experience: form.experience === '' ? 0 : Number(form.experience),
        consultationFee: form.consultationFee === '' ? 0 : Number(form.consultationFee),
        qualifications: form.qualifications.split(',').map(s => s.trim()).filter(Boolean),
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
        clinic: {
          name: form.clinicName.trim(),
          address: form.clinicAddress.trim()
        },
        bio: form.bio,
      }

      const response = await updateDoctorProfile(payload)
      const updated = response?.data || {}

      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
        profilePhoto: updated.profilePhoto,
      })

      toast.success('Profile updated successfully.')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-3xl mx-auto">
          <GlassCard>
            <p className="text-sm text-slate-400">Loading profile...</p>
          </GlassCard>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-100">My Profile</h1>
              {form.specialization && (
                <SpecializationAnimation specialization={form.specialization} size={28} className="text-blue-400 opacity-90" />
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">Update your account and practice details.</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/doctor/appointments'}
          >
            View My Appointments
          </Button>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
              <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
            </div>

            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Specialization" name="specialization" value={form.specialization} onChange={handleChange} />
              <Input label="Experience (years)" type="number" min="0" name="experience" value={form.experience} onChange={handleChange} />
            </div>

            <Input
              label="Consultation Fee (₹)"
              type="number"
              min="0"
              name="consultationFee"
              value={form.consultationFee}
              onChange={handleChange}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Qualifications (comma separated)" name="qualifications" value={form.qualifications} onChange={handleChange} placeholder="e.g. MBBS, MD" />
              <Input label="Languages (comma separated)" name="languages" value={form.languages} onChange={handleChange} placeholder="e.g. English, Hindi" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Hospital/Clinic Name" name="clinicName" value={form.clinicName} onChange={handleChange} />
              <Input label="Hospital Address" name="clinicAddress" value={form.clinicAddress} onChange={handleChange} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Bio</label>
              <textarea
                name="bio"
                rows={4}
                value={form.bio}
                onChange={handleChange}
                className="input-glass resize-none text-sm"
                placeholder="Write a short bio about your practice"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" loading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </PageTransition>
  )
}

export default DoctorProfile
