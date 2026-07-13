const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const DoctorProfile = require('../models/DoctorProfile');
const Prescription = require('../models/Prescription');
const Review = require('../models/Review');

class AnalyticsService {
  
  // ─── Admin Analytics ────────────────────────────────────────────────────────
  async getAdminAnalytics() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Create an array of the last 6 months for grouping
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleString('default', { month: 'short' })
      });
    }
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      appointmentsStatusAgg,
      totalRevenueAgg,
      monthlyRevenueAgg,
      monthlyAppointmentsAgg,
      departmentAppointmentsAgg,
      topDoctorsAgg,
      paymentMethodAgg,
      newUsersDailyAgg,
      activeUsers,
      averageRatingAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'patient' }),
      Appointment.countDocuments(),
      
      // Appointment Status Breakdown
      Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Total Revenue (Successful payments)
      Payment.aggregate([
        { $match: { status: 'successful' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
      ]),

      // Monthly Revenue (Last 6 months)
      Payment.aggregate([
        { $match: { status: 'successful', createdAt: { $gte: sixMonthsAgo } } },
        { 
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$total' }
          }
        }
      ]),

      // Monthly Appointments (Last 6 months)
      Appointment.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { 
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            appointments: { $sum: 1 }
          }
        }
      ]),

      // Department-wise Appointments
      Appointment.aggregate([
        { $lookup: { from: 'doctorprofiles', localField: 'doctorId', foreignField: 'userId', as: 'docProfile' } },
        { $unwind: '$docProfile' },
        { $group: { _id: '$docProfile.specialization', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Top Performing Doctors (by completed appointments)
      Appointment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$doctorId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'doctor' } },
        { $unwind: '$doctor' },
        { $project: { _id: 1, name: { $concat: ['$doctor.firstName', ' ', '$doctor.lastName'] }, count: 1 } }
      ]),

      // Payment Method Distribution
      Payment.aggregate([
        { $match: { status: 'successful' } },
        { $group: { _id: '$method', count: { $sum: 1 } } }
      ]),

      // Daily New Users (Last 7 days)
      User.aggregate([
        { $match: { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } } },
        { 
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Active Users
      User.countDocuments({ isActive: true }),

      // Average Rating Across Doctors
      Review.aggregate([
        { $group: { _id: null, average: { $avg: '$rating' } } }
      ])
    ]);

    // Format Data
    let completedAppointments = 0, cancelledAppointments = 0, pendingAppointments = 0;
    appointmentsStatusAgg.forEach(s => {
      if (s._id === 'completed') completedAppointments = s.count;
      else if (s._id === 'cancelled' || s._id === 'rejected') cancelledAppointments += s.count;
      else if (s._id === 'pending') pendingAppointments += s.count;
    });

    const totalRevenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].totalRevenue : 0;
    const averageRating = averageRatingAgg.length > 0 ? Number(averageRatingAgg[0].average.toFixed(1)) : 0;

    // Fill missing months for charts
    const monthlyRevenue = last6Months.map(m => {
      const match = monthlyRevenueAgg.find(agg => agg._id.year === m.year && agg._id.month === m.month);
      return { name: m.label, revenue: match ? match.revenue : 0 };
    });

    const monthlyAppointments = last6Months.map(m => {
      const match = monthlyAppointmentsAgg.find(agg => agg._id.year === m.year && agg._id.month === m.month);
      return { name: m.label, appointments: match ? match.appointments : 0 };
    });

    const departmentAppointments = departmentAppointmentsAgg.map(d => ({
      name: d._id || 'General',
      appointments: d.count
    }));

    const topDoctors = topDoctorsAgg.map(d => ({
      name: d.name,
      appointments: d.count
    }));

    const paymentMethods = paymentMethodAgg.map(p => ({
      name: p._id ? p._id.replace('_', ' ').toUpperCase() : 'UNKNOWN',
      count: p.count
    }));
    
    // Ensure 7 days for daily new users
    const dailyNewUsers = [];
    for(let i=6; i>=0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const match = newUsersDailyAgg.find(a => a._id === dateStr);
      dailyNewUsers.push({
        date: d.toLocaleString('default', { month: 'short', day: 'numeric' }),
        users: match ? match.count : 0
      });
    }

    return {
      overview: {
        totalRevenue,
        totalDoctors,
        totalPatients,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        pendingAppointments,
        activeUsers,
        averageRating
      },
      charts: {
        monthlyRevenue,
        monthlyAppointments,
        departmentAppointments,
        topDoctors,
        paymentMethods,
        dailyNewUsers
      }
    };
  }

  // ─── Doctor Analytics ───────────────────────────────────────────────────────
  async getDoctorAnalytics(doctorIdObj) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleString('default', { month: 'short' })
      });
    }

    const [
      totalEarningsAgg,
      todaysAppointments,
      weeklyAppointments,
      monthlyAppointments,
      appointmentsStatusAgg,
      upcomingAppointments,
      patientsTreatedAgg,
      totalReviews,
      monthlyRevenueAgg,
      monthlyAppointmentsAgg,
      doctorProfile
    ] = await Promise.all([
      // Total Earnings
      Payment.aggregate([
        { $match: { doctorId: doctorIdObj, status: 'successful' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),

      // Today's Appointments
      Appointment.countDocuments({ 
        doctorId: doctorIdObj, 
        appointmentDate: { $gte: startOfToday, $lt: new Date(startOfToday.getTime() + 86400000) } 
      }),

      // Weekly Appointments
      Appointment.countDocuments({ 
        doctorId: doctorIdObj, 
        appointmentDate: { $gte: startOfWeek } 
      }),

      // Monthly Appointments
      Appointment.countDocuments({ 
        doctorId: doctorIdObj, 
        appointmentDate: { $gte: startOfMonth } 
      }),

      // Status breakdown
      Appointment.aggregate([
        { $match: { doctorId: doctorIdObj } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Upcoming Appointments
      Appointment.countDocuments({ 
        doctorId: doctorIdObj, 
        status: { $in: ['pending', 'confirmed'] },
        appointmentDate: { $gte: startOfToday }
      }),

      // Patients Treated (Unique completed)
      Appointment.aggregate([
        { $match: { doctorId: doctorIdObj, status: 'completed' } },
        { $group: { _id: '$patientId' } },
        { $count: 'total' }
      ]),

      // Total Reviews
      Review.countDocuments({ doctorId: doctorIdObj }),

      // Monthly Revenue Trend
      Payment.aggregate([
        { $match: { doctorId: doctorIdObj, status: 'successful', createdAt: { $gte: sixMonthsAgo } } },
        { 
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$total' }
          }
        }
      ]),

      // Monthly Appointment Trend
      Appointment.aggregate([
        { $match: { doctorId: doctorIdObj, createdAt: { $gte: sixMonthsAgo } } },
        { 
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            appointments: { $sum: 1 }
          }
        }
      ]),
      
      DoctorProfile.findOne({ userId: doctorIdObj })
    ]);

    const totalEarnings = totalEarningsAgg.length > 0 ? totalEarningsAgg[0].total : 0;
    const patientsTreated = patientsTreatedAgg.length > 0 ? patientsTreatedAgg[0].total : 0;
    
    let completedAppointments = 0, cancelledAppointments = 0;
    appointmentsStatusAgg.forEach(s => {
      if (s._id === 'completed') completedAppointments = s.count;
      else if (s._id === 'cancelled' || s._id === 'rejected') cancelledAppointments += s.count;
    });

    const averageRating = doctorProfile?.rating || 0;

    const revenueTrend = last6Months.map(m => {
      const match = monthlyRevenueAgg.find(agg => agg._id.year === m.year && agg._id.month === m.month);
      return { name: m.label, revenue: match ? match.revenue : 0 };
    });

    const appointmentTrend = last6Months.map(m => {
      const match = monthlyAppointmentsAgg.find(agg => agg._id.year === m.year && agg._id.month === m.month);
      return { name: m.label, appointments: match ? match.appointments : 0 };
    });

    return {
      overview: {
        totalEarnings,
        todaysAppointments,
        weeklyAppointments,
        monthlyAppointments,
        completedAppointments,
        cancelledAppointments,
        upcomingAppointments,
        patientsTreated,
        totalReviews,
        averageRating
      },
      charts: {
        revenueTrend,
        appointmentTrend
      }
    };
  }

  // ─── Patient Analytics ──────────────────────────────────────────────────────
  async getPatientAnalytics(patientIdObj) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      appointmentsStatusAgg,
      upcomingAppointments,
      moneySpentAgg,
      favoriteSpecializationAgg,
      frequentDoctorAgg,
      prescriptionCount,
      reviewCount,
      paymentHistoryAgg
    ] = await Promise.all([
      // Status breakdown
      Appointment.aggregate([
        { $match: { patientId: patientIdObj } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Upcoming Appointments
      Appointment.countDocuments({ 
        patientId: patientIdObj, 
        status: { $in: ['pending', 'confirmed'] },
        appointmentDate: { $gte: startOfToday }
      }),

      // Money Spent
      Payment.aggregate([
        { $match: { patientId: patientIdObj, status: 'successful' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),

      // Favorite Specialization
      Appointment.aggregate([
        { $match: { patientId: patientIdObj, status: 'completed' } },
        { $lookup: { from: 'doctorprofiles', localField: 'doctorId', foreignField: 'userId', as: 'docProfile' } },
        { $unwind: '$docProfile' },
        { $group: { _id: '$docProfile.specialization', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]),

      // Frequently Visited Doctor
      Appointment.aggregate([
        { $match: { patientId: patientIdObj, status: 'completed' } },
        { $group: { _id: '$doctorId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'doctor' } },
        { $unwind: '$doctor' },
        { $project: { _id: 1, name: { $concat: ['$doctor.firstName', ' ', '$doctor.lastName'] }, count: 1 } }
      ]),

      // Prescription Count
      Prescription.countDocuments({ patientId: patientIdObj }),

      // Review Count
      Review.countDocuments({ patientId: patientIdObj }),

      // Monthly Money Spent (Last 6 months) for chart
      Payment.aggregate([
        { $match: { patientId: patientIdObj, status: 'successful', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
        { 
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            spent: { $sum: '$total' }
          }
        }
      ]),
    ]);

    let completedAppointments = 0, cancelledAppointments = 0;
    appointmentsStatusAgg.forEach(s => {
      if (s._id === 'completed') completedAppointments = s.count;
      else if (s._id === 'cancelled' || s._id === 'rejected') cancelledAppointments += s.count;
    });

    const moneySpent = moneySpentAgg.length > 0 ? moneySpentAgg[0].total : 0;
    const favoriteSpecialization = favoriteSpecializationAgg.length > 0 ? favoriteSpecializationAgg[0]._id : 'N/A';
    
    const frequentDoctor = frequentDoctorAgg.length > 0 
      ? { name: frequentDoctorAgg[0].name, visits: frequentDoctorAgg[0].count } 
      : null;

    // Fill missing months for payment history chart
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const match = paymentHistoryAgg.find(agg => agg._id.year === year && agg._id.month === month);
      last6Months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        spent: match ? match.spent : 0
      });
    }

    return {
      overview: {
        upcomingAppointments,
        completedAppointments,
        cancelledAppointments,
        moneySpent,
        favoriteSpecialization,
        frequentDoctor,
        prescriptionCount,
        reviewCount
      },
      charts: {
        paymentHistory: last6Months
      }
    };
  }
}

module.exports = new AnalyticsService();
