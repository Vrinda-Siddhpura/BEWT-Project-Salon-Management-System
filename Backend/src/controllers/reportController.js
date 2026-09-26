const Appointment = require('../models/Appointment');
const { successResponse } = require('../utils/responseHandler');

// GET /api/reports/daily-revenue
const getDailyRevenue = async (req, res, next) => {
  try {
    const dailyRevenue = await Appointment.aggregate([
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
          totalRevenue: { $sum: '$service.price' },
          totalAppointments: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    return successResponse(res, 200, 'Daily revenue report generated', dailyRevenue);
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/monthly-revenue
const getMonthlyRevenue = async (req, res, next) => {
  try {
    const monthlyRevenue = await Appointment.aggregate([
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
        $project: {
          month: { $substr: ['$appointmentDate', 0, 7] },
          price: '$service.price',
        },
      },
      {
        $group: {
          _id: '$month',
          totalRevenue: { $sum: '$price' },
          totalAppointments: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return successResponse(res, 200, 'Monthly revenue report generated', monthlyRevenue);
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/top-services
const getTopServices = async (req, res, next) => {
  try {
    const topServices = await Appointment.aggregate([
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
          _id: '$service._id',
          serviceName: { $first: '$service.serviceName' },
          duration: { $first: '$service.duration' },
          price: { $first: '$service.price' },
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$service.price' },
        },
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 },
    ]);

    return successResponse(res, 200, 'Top services report generated', topServices);
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/barber-performance
const getBarberPerformance = async (req, res, next) => {
  try {
    const barberPerformance = await Appointment.aggregate([
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
        $lookup: {
          from: 'barbers',
          localField: 'barberId',
          foreignField: '_id',
          as: 'barber',
        },
      },
      { $unwind: '$barber' },
      {
        $lookup: {
          from: 'users',
          localField: 'barber.userId',
          foreignField: '_id',
          as: 'barberUser',
        },
      },
      { $unwind: '$barberUser' },
      {
        $group: {
          _id: '$barber._id',
          barberName: { $first: '$barberUser.name' },
          specialization: { $first: '$barber.specialization' },
          commissionPercentage: { $first: '$barber.commissionPercentage' },
          totalAppointments: { $sum: 1 },
          totalRevenueGenerated: { $sum: '$service.price' },
        },
      },
      {
        $project: {
          barberName: 1,
          specialization: 1,
          commissionPercentage: 1,
          totalAppointments: 1,
          totalRevenueGenerated: 1,
          estimatedCommission: {
            $multiply: ['$totalRevenueGenerated', { $divide: ['$commissionPercentage', 100] }],
          },
        },
      },
      { $sort: { totalAppointments: -1 } },
    ]);

    return successResponse(res, 200, 'Barber performance report generated', barberPerformance);
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/customer-visits
const getCustomerVisits = async (req, res, next) => {
  try {
    const customerVisits = await Appointment.aggregate([
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
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
          _id: '$customer._id',
          customerName: { $first: '$customer.name' },
          phone: { $first: '$customer.phone' },
          email: { $first: '$customer.email' },
          totalVisits: { $sum: 1 },
          completedVisits: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
          totalSpent: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, '$service.price', 0] },
          },
        },
      },
      { $sort: { totalVisits: -1 } },
      { $limit: 15 },
    ]);

    return successResponse(res, 200, 'Customer visit analysis generated', customerVisits);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailyRevenue,
  getMonthlyRevenue,
  getTopServices,
  getBarberPerformance,
  getCustomerVisits,
};
