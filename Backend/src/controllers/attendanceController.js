const Attendance = require('../models/Attendance');
const Barber = require('../models/Barber');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// GET /api/attendance
const getAttendance = async (req, res, next) => {
  try {
    const { date, barberId } = req.query;
    const filter = {};

    if (date) filter.date = date;
    if (barberId) filter.barberId = barberId;

    // Barber role sees only their own attendance
    if (req.user.role === 'Barber') {
      const barber = await Barber.findOne({ userId: req.user.userId });
      if (barber) {
        filter.barberId = barber._id;
      }
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ date: -1, checkIn: -1 });

    return successResponse(res, 200, 'Attendance records fetched successfully', attendanceRecords);
  } catch (error) {
    next(error);
  }
};

// POST /api/attendance/checkin
const checkIn = async (req, res, next) => {
  try {
    let barberId = req.body.barberId;

    // If Barber role, auto use logged in barber's ID
    if (req.user.role === 'Barber') {
      const barber = await Barber.findOne({ userId: req.user.userId });
      if (!barber) {
        return errorResponse(res, 404, 'Barber profile not found', 'BARBER_NOT_FOUND');
      }
      barberId = barber._id;
    }

    if (!barberId) {
      return errorResponse(res, 400, 'Barber ID is required', 'BARBER_ID_REQUIRED');
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Prevent duplicate active checkin without checkout or duplicate checkin on same day
    const existingActive = await Attendance.findOne({
      barberId,
      date: todayStr,
    });

    if (existingActive) {
      return errorResponse(
        res,
        400,
        `Barber has already checked in today (${todayStr}) at ${new Date(existingActive.checkIn).toLocaleTimeString()}`,
        'ALREADY_CHECKED_IN'
      );
    }

    const attendance = await Attendance.create({
      barberId,
      checkIn: new Date(),
      date: todayStr,
    });

    const populated = await Attendance.findById(attendance._id).populate({
      path: 'barberId',
      populate: { path: 'userId', select: 'name' },
    });

    return successResponse(res, 201, 'Check-in recorded successfully', populated);
  } catch (error) {
    next(error);
  }
};

// POST /api/attendance/checkout
const checkOut = async (req, res, next) => {
  try {
    let barberId = req.body.barberId;

    if (req.user.role === 'Barber') {
      const barber = await Barber.findOne({ userId: req.user.userId });
      if (!barber) {
        return errorResponse(res, 404, 'Barber profile not found', 'BARBER_NOT_FOUND');
      }
      barberId = barber._id;
    }

    if (!barberId) {
      return errorResponse(res, 400, 'Barber ID is required', 'BARBER_ID_REQUIRED');
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const activeAttendance = await Attendance.findOne({
      barberId,
      date: todayStr,
      checkOut: { $exists: false },
    });

    if (!activeAttendance) {
      return errorResponse(res, 400, 'No active check-in session found for today to check-out', 'NO_ACTIVE_CHECKIN');
    }

    activeAttendance.checkOut = new Date();
    await activeAttendance.save();

    const populated = await Attendance.findById(activeAttendance._id).populate({
      path: 'barberId',
      populate: { path: 'userId', select: 'name' },
    });

    return successResponse(res, 200, 'Check-out recorded successfully', populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  checkIn,
  checkOut,
};
