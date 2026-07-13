import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Heart, Droplet, Thermometer, Edit3, Save, X } from 'lucide-react'
import { getMyHealthRecord, updateMyHealthInfo } from '../../services/healthService'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import { PageLoading } from '../../components/common/LoadingSpinner'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import toast from 'react-hot-toast'
import AnalyticsChart from '../../components/analytics/AnalyticsChart'

const VitalsChart = ({ data, dataKey, color, title, unit }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-white/[0.02] rounded-xl border border-white/[0.05]">
        <p className="text-slate-400 text-sm">No {title} data available.</p>
      </div>
    )
  }

  const chartData = data.map(d => ({
    name: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value: parseFloat(d.value)
  }))

  return (
    <div className="h-64 mt-4">
      <AnalyticsChart
        type="line"
        data={chartData}
        xKey="name"
        yKey="value"
        color={color}
        name={title}
      />
    </div>
  )
}

const PatientHealthDashboard = () => {
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  
  // Editable form state
  const [formData, setFormData] = useState({})

  const fetchRecord = async () => {
    setLoading(true)
    try {
      const res = await getMyHealthRecord()
      setRecord(res.data)
      setFormData({
        bloodGroup: res.data?.bloodGroup || '',
        height: res.data?.height || '',
        weight: res.data?.weight || '',
        lifestyleInfo: res.data?.lifestyleInfo || '',
        allergies: res.data?.allergies?.join(', ') || '',
        emergencyName: res.data?.emergencyContact?.name || '',
        emergencyRelation: res.data?.emergencyContact?.relationship || '',
        emergencyPhone: res.data?.emergencyContact?.phone || ''
      })
    } catch (err) {
      toast.error('Failed to load health record')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecord()
  }, [])

  const handleSave = async () => {
    try {
      await updateMyHealthInfo({
        bloodGroup: formData.bloodGroup,
        height: Number(formData.height),
        weight: Number(formData.weight),
        lifestyleInfo: formData.lifestyleInfo,
        allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
        emergencyContact: {
          name: formData.emergencyName,
          relationship: formData.emergencyRelation,
          phone: formData.emergencyPhone
        }
      })
      toast.success('Health info updated!')
      setEditing(false)
      fetchRecord()
    } catch (err) {
      toast.error('Failed to update health info')
    }
  }

  if (loading) return <PageLoading message="Loading Health Dashboard..." />

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Health Dashboard</h1>
            <p className="text-sm text-slate-400">Track your vitals and medical history</p>
          </div>
          <Button
            variant={editing ? "outline" : "primary"}
            icon={editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            onClick={() => editing ? setEditing(false) : setEditing(true)}
          >
            {editing ? 'Cancel' : 'Edit Info'}
          </Button>
        </div>

        {/* Basic Info */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-4">Patient Information</h2>
          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Blood Group" value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} />
              <Input label="Height (cm)" type="number" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} />
              <Input label="Weight (kg)" type="number" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} />
              <Input label="Allergies (comma separated)" value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} />
              <Input label="Lifestyle Info" value={formData.lifestyleInfo} onChange={(e) => setFormData({...formData, lifestyleInfo: e.target.value})} />
              <div className="col-span-full border-t border-white/10 my-2 pt-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Name" value={formData.emergencyName} onChange={(e) => setFormData({...formData, emergencyName: e.target.value})} />
                  <Input label="Relationship" value={formData.emergencyRelation} onChange={(e) => setFormData({...formData, emergencyRelation: e.target.value})} />
                  <Input label="Phone" value={formData.emergencyPhone} onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})} />
                </div>
              </div>
              <div className="col-span-full mt-4 flex justify-end">
                <Button variant="primary" icon={<Save className="w-4 h-4" />} onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-slate-400">Blood Group</p>
                <p className="font-semibold text-red-400">{record?.bloodGroup || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Height / Weight</p>
                <p className="font-semibold text-slate-200">
                  {record?.height ? `${record.height} cm` : '-'} / {record?.weight ? `${record.weight} kg` : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">BMI</p>
                <p className="font-semibold text-blue-400">{record?.bmi || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Allergies</p>
                <p className="font-semibold text-slate-200">{record?.allergies?.join(', ') || 'None'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Emergency Contact</p>
                <p className="font-semibold text-slate-200">
                  {record?.emergencyContact?.name ? `${record.emergencyContact.name} (${record.emergencyContact.relationship}) - ${record.emergencyContact.phone}` : 'Not set'}
                </p>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Vitals Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-bold text-slate-100">Heart Rate Trend</h2>
            </div>
            <VitalsChart data={record?.vitals?.heartRate} dataKey="value" color="#ef4444" title="Heart Rate (bpm)" />
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-slate-100">Blood Pressure Trend</h2>
            </div>
            {/* Split systolic and diastolic if needed, or simple line if single value. In this case value is string "120/80", we might need to parse. For now, assuming single line. */}
            {record?.vitals?.bloodPressure?.length > 0 ? (
              <div className="mt-4 space-y-3">
                {record.vitals.bloodPressure.map((bp, i) => (
                  <div key={i} className="p-3 bg-white/[0.02] rounded border border-white/[0.05] flex justify-between">
                    <span>{new Date(bp.date).toLocaleDateString()}</span>
                    <span className="font-bold text-blue-400">{bp.value} mmHg</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm mt-4 text-center">No Blood Pressure data.</p>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold text-slate-100">Blood Sugar Trend</h2>
            </div>
            <VitalsChart data={record?.vitals?.bloodSugar} dataKey="value" color="#2dd4bf" title="Blood Sugar (mg/dL)" />
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-slate-100">Temperature Trend</h2>
            </div>
            <VitalsChart data={record?.vitals?.bodyTemperature} dataKey="value" color="#fbbf24" title="Temperature (°F)" />
          </GlassCard>
        </div>

        {/* Doctor Info & Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
             <h2 className="text-lg font-bold text-slate-100 mb-4">Current Medications</h2>
             {record?.currentMedications?.length > 0 ? (
               <ul className="list-disc pl-5 space-y-1 text-slate-300">
                 {record.currentMedications.map((med, i) => <li key={i}>{med}</li>)}
               </ul>
             ) : (
               <p className="text-slate-400 text-sm">No medications listed.</p>
             )}
          </GlassCard>
          
          <GlassCard className="p-6">
             <h2 className="text-lg font-bold text-slate-100 mb-4">Treatment History</h2>
             {record?.treatmentHistory?.length > 0 ? (
               <div className="space-y-4">
                 {record.treatmentHistory.map((note, i) => (
                   <div key={i} className="p-3 bg-white/[0.02] rounded border border-white/[0.05]">
                     <p className="text-xs text-slate-400 mb-1">{new Date(note.date).toLocaleDateString()} - Dr. {note.doctorId?.lastName}</p>
                     <p className="text-sm text-slate-200">{note.note}</p>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-slate-400 text-sm">No treatment history listed.</p>
             )}
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  )
}

export default PatientHealthDashboard
