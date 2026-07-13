import { useEffect, useState } from "react";
import GlassCard from "../../components/common/GlassCard";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import PageTransition from "../../components/common/PageTransition";
import { useToast } from "../../hooks/useNotifications";
import { formatDateShort } from "../../utils/formatters";
import { getAllAppointments } from "../../services/adminService";

const AdminAppointments = () => {
  const { showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await getAllAppointments();
      // res = { success, message, data: { appointments: [...] }, pagination }
      const list = res?.data?.appointments ?? res?.data ?? [];
      setAppointments(Array.isArray(list) ? list : []);
    } catch (err) {
      showError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusVariant = (status) => {
    switch (status) {
      case "completed":  return "success";
      case "confirmed":  return "warning";
      case "cancelled":  return "error";
      case "rejected":   return "error";
      default:           return "default";
    }
  };

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
        {appointments.length === 0 ? (
          <EmptyState title="No appointments found" />
        ) : (
          appointments.map((appt) => {
            const patient = appt.patientId;
            const doctor  = appt.doctorId;
            return (
              <GlassCard
                key={appt._id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold">
                    {patient?.firstName} {patient?.lastName} → Dr.{" "}
                    {doctor?.firstName} {doctor?.lastName}
                  </h3>

                  <p className="text-sm opacity-70">
                    {formatDateShort(appt.appointmentDate)}
                    {appt.startTime ? ` · ${appt.startTime}` : ""}
                  </p>

                  <p className="text-xs opacity-60">
                    Reason: {appt.reasonForVisit || "N/A"}
                  </p>
                </div>

                <Badge variant={getStatusVariant(appt.status)}>
                  {appt.status}
                </Badge>
              </GlassCard>
            );
          })
        )}
      </div>
    </PageTransition>
  );
};

export default AdminAppointments;