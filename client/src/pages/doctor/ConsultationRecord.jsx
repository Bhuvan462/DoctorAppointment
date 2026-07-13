import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GlassCard from "../../components/common/GlassCard";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageTransition from "../../components/common/PageTransition";
import toast from "react-hot-toast";
import { formatDateShort } from "../../utils/formatters";
import {
  getAppointmentById,
  saveConsultationRecord,
} from "../../services/appointmentService";

const ConsultationRecord = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [appointment, setAppointment] = useState(null);

  const [formData, setFormData] = useState({
    diagnosis: "",
    symptoms:  [],
    notes:     "",
  });

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await getAppointmentById(id);
        // res = { success, message, data: { appointment: {...} } }
        const appt = res.data?.appointment ?? res.data;
        setAppointment(appt);
      } catch {
        toast.error("Failed to load appointment.");
        navigate("/doctor/appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.diagnosis) {
      toast.error("Diagnosis is required.");
      return;
    }

    setSaving(true);
    try {
      await saveConsultationRecord(id, {
        diagnosis: formData.diagnosis,
        symptoms:  formData.symptoms,
        notes:     formData.notes,
      });
      toast.success("Consultation record saved.");
      navigate("/doctor/appointments");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save consultation.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!appointment) return null;

  const patient = appointment.patientId || {};

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-6">
        <GlassCard>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-100">
              Consultation Record
            </h2>
            <p className="text-sm text-slate-400">
              Patient: {patient.firstName} {patient.lastName}
            </p>
            <p className="text-sm opacity-70">
              {formatDateShort(appointment.appointmentDate)}
              {appointment.startTime ? ` · ${appointment.startTime}` : ""}
            </p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="space-y-4">
            <Input
              label="Diagnosis *"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Enter primary diagnosis"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                Symptoms
                <span className="text-slate-600 text-xs ml-1">Comma-separated</span>
              </label>
              <input
                type="text"
                name="symptoms"
                className="input-glass text-sm"
                placeholder="e.g. headache, fever, fatigue"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    symptoms: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                Notes
              </label>
              <textarea
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Clinical notes, observations, treatment plan..."
                className="input-glass resize-none text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/doctor/appointments")}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={saving}
              >
                Save Record
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
};

export default ConsultationRecord;
