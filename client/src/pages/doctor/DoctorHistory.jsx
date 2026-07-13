import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../../components/common/GlassCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import PageTransition from "../../components/common/PageTransition";
import { formatDateShort } from "../../utils/formatters";
import { getDoctorConsultations } from "../../services/doctorService";
import toast from "react-hot-toast";

const DoctorHistory = () => {
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getDoctorConsultations();
        // res = { success, message, data: [...consultations], pagination }
        setRecords(res.data || []);
      } catch (err) {
        toast.error("Failed to load consultation history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">Consultation History</h1>

        {records.length === 0 ? (
          <EmptyState title="No consultation records yet" />
        ) : (
          records.map((record) => {
            const patient = record.patientId;
            const appt    = record.appointmentId;
            return (
              <GlassCard key={record._id}>
                <div className="space-y-2">
                  <h3 className="font-semibold">
                    {patient?.firstName} {patient?.lastName}
                  </h3>

                  <p className="text-sm opacity-70">
                    {formatDateShort(appt?.appointmentDate || record.createdAt)}
                    {appt?.startTime ? ` · ${appt.startTime}` : ""}
                  </p>

                  {record.diagnosis && (
                    <p className="text-sm">
                      <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                    </p>
                  )}

                  {record.notes && (
                    <p className="text-sm opacity-80">{record.notes}</p>
                  )}
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </PageTransition>
  );
};

export default DoctorHistory;
