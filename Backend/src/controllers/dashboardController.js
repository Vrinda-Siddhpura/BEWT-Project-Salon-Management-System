const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const Barber = require('../models/Barber');
const Service = require('../models/Service');
const { successResponse } = require('../utils/responseHandler');

// GET /api/dashboard/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7);

    // 1. Total Customers
    const totalCustomers = await Customer.countDocuments();

    // 2. Active Barbers
    const activeBarbers = await Barber.countDocuments({ status: 'Active' });

    // 3. Today's Appointments
    const todayAppointmentsCount = await Appointment.countDocuments({ appointmentDate: todayStr });

    // 4. Total Appointments
    const totalAppointments = await Appointment.countDocuments();

    // 5. Completed Appointments
    const completedAppointmentsCount = await Appointment.countDocuments({ status: 'Completed' });

    // 6. Today's Revenue (Completed appointments today)
    const todayRevenueAgg = await Appointment.aggregate([
      { $match: { appointmentDate: todayStr, status: 'Completed' } },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      { $unwind: '$service' },
      { $group: { _id: null, total: { $sum: '$service.price' } } },
    ]);
    const todayRevenue = todayRevenueAgg.length > 0 ? todayRevenueAgg[0].total : 0;

    // 7. Monthly Revenue (Completed appointments this month)
    const monthlyRevenueAgg = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $regex: new RegExp(`^${currentMonthStr}`) },
          status: 'Completed',
        },
      },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      { $unwind: '$service' },
      { $group: { _id: null, total: { $sum: '$service.price' } } },
    ]);
    const monthlyRevenue = monthlyRevenueAgg.length > 0 ? monthlyRevenueAgg[0].total : 0;

    // 8. Appointment Status Breakdown (For Status Chart)
    const statusDistribution = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // 9. Last 7 Days Revenue Trend
    const revenueTrend = await Appointment.aggregate([
      { $match: { status: 'Completed' } },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      { $unwind: '$service' },
      {
        $group: {
          _id: '$appointmentDate',
          revenue: { $sum: '$service.price' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 7 },
    ]);

    return successResponse(res, 200, 'Dashboard statistics fetched successfully', {
      cards: {
        todayRevenue,
        monthlyRevenue,
        totalCustomers,
        totalAppointments,
        completedAppointmentsCount,
        activeBarbers,
        todayAppointmentsCount,
      },
      charts: {
        statusDistribution,
        revenueTrend: revenueTrend.reverse(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
