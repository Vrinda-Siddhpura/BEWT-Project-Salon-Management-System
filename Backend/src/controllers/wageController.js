const WageRecord = require('../models/WageRecord');
const Barber = require('../models/Barber');
const Appointment = require('../models/Appointment');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// GET /api/wages
const getWages = async (req, res, next) => {
  try {
    const { month, barberId } = req.query;
    const filter = {};

    if (month) filter.month = month;
    if (barberId) filter.barberId = barberId;

    // Barber role sees only their own wage records
    if (req.user.role === 'Barber') {
      const barber = await Barber.findOne({ userId: req.user.userId });
      if (barber) {
        filter.barberId = barber._id;
      }
    }

    const wages = await WageRecord.find(filter)
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ month: -1, createdAt: -1 });

    return successResponse(res, 200, 'Wage records fetched successfully', wages);
  } catch (error) {
    next(error);
  }
};

// POST /api/wages (Admin Only - Calculate & Finalize Payroll)
const generateWageRecord = async (req, res, next) => {
  try {
    const { barberId, month, baseSalary = 0 } = req.body; // month format: YYYY-MM

    const barber = await Barber.findById(barberId);
    if (!barber) {
      return errorResponse(res, 404, 'Barber not found', 'BARBER_NOT_FOUND');
    }

    // Find all Completed appointments for this barber in the specified month
    // appointmentDate is YYYY-MM-DD
    const regexMonth = new RegExp(`^${month}`);
    const completedAppointments = await Appointment.find({
      barberId,
      appointmentDate: { $regex: regexMonth },
      status: 'Completed',
    }).populate('serviceId');

    let totalCommission = 0;
    completedAppointments.forEach((apt) => {
      if (apt.serviceId && apt.serviceId.price) {
        const itemCommission = (apt.serviceId.price * barber.commissionPercentage) / 100;
        totalCommission += itemCommission;
      }
    });

    const totalAmount = Number(baseSalary) + totalCommission;

    // Upsert wage record for (barberId, month)
    let wageRecord = await WageRecord.findOne({ barberId, month });
    if (wageRecord) {
      wageRecord.salary = Number(baseSalary);
      wageRecord.commission = totalCommission;
      wageRecord.totalAmount = totalAmount;
      await wageRecord.save();
    } else {
      wageRecord = await WageRecord.create({
        barberId,
        month,
        salary: Number(baseSalary),
        commission: totalCommission,
        totalAmount,
      });
    }

    const populated = await WageRecord.findById(wageRecord._id).populate({
      path: 'barberId',
      populate: { path: 'userId', select: 'name email' },
    });

    return successResponse(res, 201, 'Payroll finalized successfully', {
      wageRecord: populated,
      completedAppointmentsCount: completedAppointments.length,
      commissionPercentage: barber.commissionPercentage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWages,
  generateWageRecord,
};
