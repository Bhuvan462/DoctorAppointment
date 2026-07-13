import { useEffect, useState } from "react";
import GlassCard from "../../components/common/GlassCard";
import StatCard from "../../components/common/StatCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import PageTransition from "../../components/common/PageTransition";
import { useToast } from "../../hooks/useNotifications";
import { getReports } from "../../services/adminService";

const AdminReports = () => {
  const { showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await getReports();
      // res = { success, message, data: { appointmentsByMonth, topDoctors, ... } }
      setReports(res.data || null);
    } catch (err) {
      showError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!reports) {
    return (
      <PageTransition>
        <EmptyState title="No reports available" />
      </PageTransition>
    );
  }

  const latestMonth = reports.appointmentsByMonth?.slice(-1)[0];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard
            title="Appointments This Month"
            value={latestMonth?.total ?? 0}
          />

          <StatCard
            title="Completed This Month"
            value={latestMonth?.completed ?? 0}
          />

          <StatCard
            title="Cancelled This Month"
            value={latestMonth?.cancelled ?? 0}
          />
        </div>

        {/* Top Doctors */}
        {reports.topDoctors?.length > 0 && (
          <GlassCard>
            <h2 className="text-lg font-semibold mb-4">Top Doctors by Completed Appointments</h2>
            <div className="space-y-3">
              {reports.topDoctors.map((doc, i) => (
                <div key={doc.doctorId} className="flex items-center justify-between">
                  <span className="text-sm">
                    #{i + 1} Dr. {doc.firstName} {doc.lastName}
                    <span className="opacity-60 ml-2 text-xs">({doc.specialization})</span>
                  </span>
                  <span className="text-sm font-semibold text-teal-400">
                    {doc.completedAppointments} completed
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        <GlassCard>
          <h2 className="text-lg font-semibold mb-2">Insights</h2>
          <p className="text-sm opacity-70">
            Track platform growth and appointment trends across the last 6 months.
          </p>
        </GlassCard>
      </div>
    </PageTransition>
  );
};

export default AdminReports;