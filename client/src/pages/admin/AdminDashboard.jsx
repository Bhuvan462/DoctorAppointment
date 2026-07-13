import { useEffect, useState } from "react";
import StatCard from "../../components/common/StatCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageTransition from "../../components/common/PageTransition";
import AnalyticsChart from "../../components/analytics/AnalyticsChart";
import { useToast } from "../../hooks/useNotifications";
import { getDashboardStats } from "../../services/adminService";
import { Users, UserPlus, Stethoscope, CalendarCheck, IndianRupee, Activity, Star } from "lucide-react";

const AdminDashboard = () => {
  const { showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setData(res.data);
      } catch (err) {
        showError("Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) return null;

  const { overview, charts } = data;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Platform overview and analytics</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={overview.totalRevenue} 
            prefix="₹" 
            icon={<IndianRupee className="w-6 h-6" />} 
            color="emerald" 
          />
          <StatCard 
            title="Active Users" 
            value={overview.activeUsers} 
            icon={<Activity className="w-6 h-6" />} 
            color="blue" 
          />
          <StatCard 
            title="Total Appointments" 
            value={overview.totalAppointments} 
            icon={<CalendarCheck className="w-6 h-6" />} 
            color="purple" 
          />
          <StatCard 
            title="Avg Doctor Rating" 
            value={overview.averageRating} 
            icon={<Star className="w-6 h-6" />} 
            color="amber" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Doctors" 
            value={overview.totalDoctors} 
            icon={<Stethoscope className="w-6 h-6" />} 
            color="teal" 
          />
          <StatCard 
            title="Total Patients" 
            value={overview.totalPatients} 
            icon={<Users className="w-6 h-6" />} 
            color="blue" 
          />
          <StatCard 
            title="Completed Appts" 
            value={overview.completedAppointments} 
            icon={<CalendarCheck className="w-6 h-6" />} 
            color="emerald" 
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
          <AnalyticsChart 
            title="Monthly Revenue (6 Months)" 
            description="Revenue trend over the last 6 months"
            data={charts.monthlyRevenue} 
            type="area" 
            dataKey="revenue" 
            emptyMessage="No revenue recorded yet"
          />
          <AnalyticsChart 
            title="Appointments Trend" 
            description="Total appointments booked per month"
            data={charts.monthlyAppointments} 
            type="line" 
            dataKey="appointments" 
            emptyMessage="No appointments booked yet"
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
          <div className="lg:col-span-2">
            <AnalyticsChart 
              title="Daily New Users (7 Days)" 
              description="User registration trend"
              data={charts.dailyNewUsers} 
              type="bar" 
              dataKey="users" 
              nameKey="date"
              emptyMessage="No new users in the last 7 days"
            />
          </div>
          <AnalyticsChart 
            title="Payment Methods" 
            description="Distribution of successful payments"
            data={charts.paymentMethods} 
            type="pie" 
            dataKey="count" 
            emptyMessage="No successful payments yet"
          />
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
          <AnalyticsChart 
            title="Department Distribution" 
            description="Appointments by doctor specialization"
            data={charts.departmentAppointments} 
            type="bar" 
            dataKey="appointments" 
            emptyMessage="No department data available"
          />
          <AnalyticsChart 
            title="Top Performing Doctors" 
            description="Based on completed appointments"
            data={charts.topDoctors} 
            type="bar" 
            dataKey="appointments" 
            emptyMessage="No completed appointments yet"
          />
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;