import { useEffect, useState } from "react";
import GlassCard from "../../components/common/GlassCard";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import PageTransition from "../../components/common/PageTransition";
import { useToast } from "../../hooks/useNotifications";
import {
  getAllDoctors,
  approveDoctor,
  rejectDoctor,
} from "../../services/adminService";

const AdminDoctors = () => {
  const { showError, showSuccess } = useToast();

  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDoctors = async () => {
    try {
      const res = await getAllDoctors();
      // res = { success, message, data: [...doctors], pagination }
      setDoctors(res.data || []);
    } catch (err) {
      console.error(err);
      showError("Failed to load doctors list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleApprove = async (doctorProfileId) => {
    setActionLoading(doctorProfileId);

    try {
      await approveDoctor(doctorProfileId);
      showSuccess("Doctor approved successfully");
      fetchDoctors();
    } catch (err) {
      console.error(err);
      showError("Failed to approve doctor");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (doctorProfileId) => {
    setActionLoading(doctorProfileId);

    try {
      await rejectDoctor(doctorProfileId, {
        reason: "Verification failed",
      });

      showSuccess("Doctor rejected successfully");
      fetchDoctors();
    } catch (err) {
      console.error(err);
      showError("Failed to reject doctor");
    } finally {
      setActionLoading(null);
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
        {doctors.length === 0 ? (
          <EmptyState title="No doctors found" />
        ) : (
          doctors.map((doctor) => (
            <GlassCard
              key={doctor._id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">
                    {doctor.firstName} {doctor.lastName}
                  </h3>

                  <Badge
                    variant={
                      doctor.doctorProfile?.isApproved
                        ? "success"
                        : "warning"
                    }
                  >
                    {doctor.doctorProfile?.isApproved
                      ? "Approved"
                      : "Pending"}
                  </Badge>
                </div>

                <p className="text-sm opacity-80">
                  <strong>Specialization:</strong>{" "}
                  {doctor.doctorProfile?.specialization || "N/A"}
                </p>

                <p className="text-sm opacity-80">
                  <strong>Experience:</strong>{" "}
                  {doctor.doctorProfile?.experience || 0} years
                </p>

                <p className="text-sm opacity-80">
                  <strong>Consultation Fee:</strong> ₹
                  {doctor.doctorProfile?.consultationFee || 0}
                </p>

                <p className="text-sm opacity-80">
                  <strong>Email:</strong> {doctor.email}
                </p>
              </div>

              {!doctor.doctorProfile?.isApproved && (
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    disabled={actionLoading === doctor.doctorProfile._id}
                    onClick={() =>
                      handleApprove(doctor.doctorProfile._id)
                    }
                  >
                    {actionLoading === doctor.doctorProfile._id
                      ? "Processing..."
                      : "Approve"}
                  </Button>

                  <Button
                    variant="danger"
                    disabled={actionLoading === doctor.doctorProfile._id}
                    onClick={() =>
                      handleReject(doctor.doctorProfile._id)
                    }
                  >
                    Reject
                  </Button>
                </div>
              )}
            </GlassCard>
          ))
        )}
      </div>
    </PageTransition>
  );
};

export default AdminDoctors;