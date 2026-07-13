import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTransition from '../../components/common/PageTransition';
import Modal from '../../components/common/Modal';
import * as appointmentService from '../../services/appointmentService';
import toast from 'react-hot-toast';
import {
  formatDateLong, formatDateShort, formatTime12,
  formatTimeRange, formatDateTime, getDoctorName, getInitials
} from '../../utils/formatters';
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';

const statusConfig = {
  pending:   { label: 'Pending',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-400',   dot: 'bg-amber-400'   },
  confirmed: { label: 'Confirmed', bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    text: 'text-blue-400',    dot: 'bg-blue-400'    },
  completed: { label: 'Completed', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'text-red-400',     dot: 'bg-red-400'     },
  rejected:  { label: 'Rejected',  bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'text-red-400',     dot: 'bg-red-400'     },
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0">
    <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-blue-400" />
    </div>
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm text-white font-medium">{value || '—'}</p>
    </div>
  </div>
);

const CancelModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('');
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel Appointment"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Keep Appointment</Button>
          <Button variant="danger" onClick={() => onConfirm(reason)} loading={loading}>Cancel Appointment</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">This action will notify the patient and cannot be undone.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Cancellation Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason for cancellation..."
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500/50 resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};

export default function DoctorAppointmentDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [appointment, setAppointment]         = useState(null);
  const [prescription, setPrescription]       = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [updating, setUpdating]               = useState(false);
  const [uploading, setUploading]             = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => { fetchAppointment(); }, [id]);

  const fetchAppointment = async () => {
    setLoading(true);
    try {
      const response = await appointmentService.getAppointmentById(id);
      // response = { success, message, data: { appointment: {...} } }
      setAppointment(response.data?.appointment ?? response.data);

      try {
        const pRes = await appointmentService.getPrescriptionByAppointmentId(id);
        setPrescription(pRes.data);
      } catch (err) {
        // 404 is expected if no prescription exists
      }
    } catch {
      toast.error('Failed to load appointment details.');
      navigate('/doctor/appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setUpdating(true);
    try {
      await appointmentService.confirmAppointment(id);
      toast.success('Appointment confirmed.');
      fetchAppointment();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to confirm appointment.');
    } finally {
      setUpdating(false);
    }
  };

  const handleComplete = async () => {
    setUpdating(true);
    try {
      await appointmentService.completeAppointment(id);
      toast.success('Appointment marked as completed.');
      fetchAppointment();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to complete appointment.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async (reason) => {
    setUpdating(true);
    try {
      await appointmentService.rejectAppointment(id, { cancellationReason: reason });
      toast.success('Appointment cancelled.');
      setShowCancelModal(false);
      fetchAppointment();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setUpdating(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return toast.error('File size exceeds 10MB limit.');
    }

    const formData = new FormData();
    formData.append('prescriptionFile', file);

    setUploading(true);
    try {
      const res = await appointmentService.uploadPrescription(id, formData);
      toast.success('Prescription uploaded successfully.');
      setPrescription(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload prescription.');
    } finally {
      setUploading(false);
      e.target.value = null; // reset input
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">Appointment not found.</p>
        <Button onClick={() => navigate('/doctor/appointments')} className="mt-4">Back to Appointments</Button>
      </div>
    );
  }

  const status  = statusConfig[appointment.status] || statusConfig.pending;
  const patient = appointment.patientId || {};

  return (
    <PageTransition>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">

        {/* Back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.button
            whileHover={{ x: -3 }}
            onClick={() => navigate('/doctor/appointments')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Appointments
          </motion.button>
          
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/doctor/patient-health/${patient?._id || patient}`)}
          >
            View Patient Health Record
          </Button>
        </div>

        {/* Hero card */}
        <GlassCard className="p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Patient avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                {patient.profilePhoto ? (
                  <img src={patient.profilePhoto} alt="Patient" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-8 h-8 text-blue-400" />
                )}
              </div>
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${status.dot}`} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-white">
                  {patient.firstName} {patient.lastName}
                </h1>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border ${status.bg} ${status.border} ${status.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap mb-1 mt-2">
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                  appointment.paymentStatus === 'successful' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  appointment.paymentStatus === 'failed' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                  appointment.paymentStatus === 'pay_at_hospital' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {appointment.paymentStatus === 'successful' ? 'Paid' : appointment.paymentStatus?.replace('_', ' ') || 'Unpaid'}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mt-2">
                {patient.phone && (
                  <span className="flex items-center gap-1.5">
                    <PhoneIcon className="w-3.5 h-3.5" />
                    {patient.phone}
                  </span>
                )}
                {patient.email && (
                  <span className="flex items-center gap-1.5">
                    <EnvelopeIcon className="w-3.5 h-3.5" />
                    {patient.email}
                  </span>
                )}
                {patient.gender && (
                  <span className="capitalize">{patient.gender}</span>
                )}
              </div>
            </div>

            {/* Meta info */}
            <div className="flex gap-3 flex-wrap">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <CalendarDaysIcon className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Date</p>
                <p className="text-sm font-semibold text-white">{formatDateShort(appointment.appointmentDate)}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <ClockIcon className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Time</p>
                <p className="text-sm font-semibold text-white">
                  {formatTime12(appointment.startTime)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <DocumentTextIcon className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Type</p>
                <p className="text-sm font-semibold text-white capitalize">{appointment.type || 'In-person'}</p>
              </div>
              {appointment.tokenNumber && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="w-4 h-4 text-purple-400 mx-auto mb-1 font-bold flex items-center justify-center">#</span>
                  <p className="text-xs text-gray-400">Token</p>
                  <p className="text-sm font-semibold text-white font-mono">{appointment.tokenNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="relative mt-6 flex flex-wrap gap-3 pt-5 border-t border-white/10">
            {appointment.status === 'pending' && (
              <>
                <Button onClick={handleConfirm} loading={updating} className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" /> Confirm
                </Button>
                <Button variant="danger" onClick={() => setShowCancelModal(true)} className="flex items-center gap-2">
                  <XCircleIcon className="w-4 h-4" /> Reject
                </Button>
              </>
            )}
            {appointment.status === 'confirmed' && (
              <>
                <Button onClick={handleComplete} loading={updating} className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" /> Mark Completed
                </Button>
                <Button variant="ghost" onClick={() => setShowCancelModal(true)}>
                  <XCircleIcon className="w-4 h-4 mr-1" /> Cancel
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={() => window.print()} className="ml-auto flex items-center gap-2">
              <PrinterIcon className="w-4 h-4" /> Print
            </Button>
          </div>
        </GlassCard>

        {/* Details card */}
        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-5 h-5 text-blue-400" />
              Appointment Details
            </h2>
            <InfoRow icon={CalendarDaysIcon} label="Date" value={formatDateLong(appointment.appointmentDate)} />
            <InfoRow icon={ClockIcon} label="Time" value={formatTimeRange(appointment.startTime, appointment.endTime)} />
            <InfoRow icon={DocumentTextIcon} label="Type" value={appointment.type === 'in-person' ? 'In-Person Visit' : 'Online Consultation'} />
            {appointment.reasonForVisit && (
              <InfoRow icon={DocumentTextIcon} label="Reason for Visit" value={appointment.reasonForVisit} />
            )}
            {appointment.cancellationReason && (
              <InfoRow icon={ExclamationTriangleIcon} label="Cancellation Reason" value={appointment.cancellationReason} />
            )}
            <InfoRow icon={ClockIcon} label="Booked At" value={formatDateTime(appointment.createdAt)} />
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-teal-400" />
              Patient Details
            </h2>
            <InfoRow icon={UserIcon}     label="Full Name"  value={`${patient.firstName || ''} ${patient.lastName || ''}`} />
            <InfoRow icon={EnvelopeIcon} label="Email"      value={patient.email}  />
            <InfoRow icon={PhoneIcon}    label="Phone"      value={patient.phone}  />
            <InfoRow icon={UserIcon}     label="Gender"     value={patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : null} />
            {patient.dateOfBirth && (
              <InfoRow icon={CalendarDaysIcon} label="Date of Birth" value={formatDateShort(patient.dateOfBirth)} />
            )}
          </GlassCard>
        </div>

        {/* Prescription Section */}
        {appointment.status === 'completed' && (
          <GlassCard className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-purple-400" />
                Prescription
              </h2>
              
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="prescription-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <Button
                  onClick={() => document.getElementById('prescription-upload').click()}
                  loading={uploading}
                  className="flex items-center gap-2"
                >
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  {prescription ? 'Replace File' : 'Upload File'}
                </Button>
              </div>
            </div>

            {prescription ? (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                    <DocumentTextIcon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{prescription.fileName || 'prescription'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Uploaded on {formatDateTime(prescription.issuedAt)} • {prescription.fileType?.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => window.open(prescription.fileUrl, '_blank')}
                    className="flex items-center gap-2"
                  >
                    View
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = prescription.fileUrl;
                      link.download = prescription.fileName || 'prescription.pdf';
                      link.target = '_blank';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-2"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-white/10 rounded-xl text-center">
                <p className="text-sm text-gray-400">No prescription uploaded yet.</p>
                <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
              </div>
            )}
          </GlassCard>
        )}
      </div>

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        loading={updating}
      />
    </PageTransition>
  );
}
