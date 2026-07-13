import { useEffect, useState } from "react";
import GlassCard from "../../components/common/GlassCard";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import PageTransition from "../../components/common/PageTransition";
import { useToast } from "../../hooks/useNotifications";
import {
  getAllPatients,
  toggleUserStatus,
} from "../../services/adminService";

const AdminUsers = () => {
  const { showError, showSuccess } = useToast();

  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await getAllPatients();
      // res = { success, message, data: [...users], pagination }
      setPatients(res.data || []);
    } catch (err) {
      showError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentlyActive) => {
    setActionLoading(userId);

    try {
      await toggleUserStatus(userId, currentlyActive);
      showSuccess("User status updated");
      fetchUsers();
    } catch (err) {
      showError("Failed to update user");
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
        {patients.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          patients.map((user) => (
            <GlassCard
              key={user._id}
              className="flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>

                <p className="text-sm opacity-70">
                  {user.email}
                </p>

                <p className="text-xs opacity-60">
                  Status: {user.isActive ? "Active" : "Inactive"}
                </p>
              </div>

              <Button
                onClick={() => handleToggleStatus(user._id, user.isActive)}
                disabled={actionLoading === user._id}
              >
                {actionLoading === user._id
                  ? "Updating..."
                  : user.isActive
                  ? "Deactivate"
                  : "Activate"}
              </Button>
            </GlassCard>
          ))
        )}
      </div>
    </PageTransition>
  );
};

export default AdminUsers;