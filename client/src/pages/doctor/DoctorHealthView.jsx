import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Plus, ChevronLeft, Calendar, User } from 'lucide-react'
import { getPatientHealthRecord, appendMedicalData } from '../../services/healthService'
import PageTransition from '../../components/common/PageTransition'
import GlassCard from '../../components/common/GlassCard'
import { PageLoading } from '../../components/common/LoadingSpinner'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import toast from 'react-hot-toast'
import AnalyticsChart from '../../components/analytics/AnalyticsChart'

const DoctorHealthView = () => {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  // Append form state
  const [appendType, setAppendType] = useState('bloodPressure')
  const [appendValue, setAppendValue] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchRecord = async () => {
    setLoading(true)
    try {
      const res = await getPatientHealthRecord(patientId)
      setRecord(res.data)
    } catch (err) {
      toast.error('Failed to load patient health record')
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (patientId) fetchRecord()
  }, [patientId])

  const handleAppend = async (e) => {
    e.preventDefault()
    if (!appendValue) return toast.error('Value is required')
    
    setSubmitting(true)
    try {
      await appendMedicalData(patientId, {
        type: appendType,
        value: appendValue
      })
      toast.success('Data appended successfully')
      setAppendValue('')
      fetchRecord()
    } catch (err) {
      toast.error('Failed to append data')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoading message="Loading patient records..." />

  return (
    <PageTransition>
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Patient Health Record</h1>
            <p className="text-sm text-slate-400">
              {record?.patientId?.firstName} {record?.patientId?.lastName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add New Data Form */}
          <GlassCard className="p-6 lg:col-span-1 h-fit">
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Append Data
            </h2>
            <form onSubmit={handleAppend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Data Type</label>
                <select
                  value={appendType}
                  onChange={(e) => setAppendType(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="bloodPressure">Blood Pressure (mmHg)</option>
                  <option value="bloodSugar">Blood Sugar (mg/dL)</option>
                  <option value="heartRate">Heart Rate (bpm)</option>
                  <option value="bodyTemperature">Temperature (°F)</option>
                  <option value="oxygenSaturation">Oxygen Saturation (%)</option>
                  <option value="medicalNotes">Clinical Note</option>
                  <option value="diagnoses">Diagnosis</option>
                  <option value="treatmentHistory">Treatment History</option>
                </select>
              </div>
              <Input
                label="Value / Note"
                value={appendValue}
                onChange={(e) => setAppendValue(e.target.value)}
                placeholder="Enter value or note..."
                required
              />
              <Button type="submit" variant="primary" className="w-full" loading={submitting}>
                Save Record
              </Button>
            </form>
          </GlassCard>

          {/* Historical Data view */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-4">Patient Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Blood Group</p>
                  <p className="font-semibold text-slate-200">{record?.bloodGroup || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Height</p>
                  <p className="font-semibold text-slate-200">{record?.height ? `${record.height} cm` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Weight</p>
                  <p className="font-semibold text-slate-200">{record?.weight ? `${record.weight} kg` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">BMI</p>
                  <p className="font-semibold text-slate-200">{record?.bmi || 'N/A'}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                 <p className="text-xs text-slate-400 mb-1">Allergies</p>
                 <p className="text-sm text-slate-200">{record?.allergies?.join(', ') || 'No known allergies'}</p>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-4">Clinical Notes & History</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {record?.medicalNotes?.length > 0 ? record.medicalNotes.slice().reverse().map((note, i) => (
                  <div key={i} className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-blue-400">Clinical Note</span>
                      <span className="text-xs text-slate-500">
                        {new Date(note.date).toLocaleDateString()} {new Date(note.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{note.note}</p>
                    <p className="text-xs text-slate-500 mt-2 flex justify-end">Dr. {note.doctorId?.lastName}</p>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 text-center py-4">No clinical notes recorded yet.</p>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default DoctorHealthView
