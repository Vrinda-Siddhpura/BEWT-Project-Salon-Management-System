const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Barber = require('../models/Barber');
const Customer = require('../models/Customer');
const Holiday = require('../models/Holiday');
const { calculateEndTime, isTimeOverlapping, timeToMinutes } = require('../utils/timeUtils');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Working shift limits
const SHIFT_START = '09:00';
const SHIFT_END = '19:00';

// GET /api/appointments
const getAppointments = async (req, res, next) => {
  try {
    const { date, barberId, customerId, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (date) filter.appointmentDate = date;
    if (barberId) filter.barberId = barberId;
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;

    // Barber role can only see their own appointments if requested
    if (req.user.role === 'Barber') {
      const barber = await Barber.findOne({ userId: req.user.userId });
      if (barber) {
        filter.barberId = barber._id;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Appointment.countDocuments(filter);

    const appointments = await Appointment.find(filter)
      .populate('customerId', 'name phone email gender')
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('serviceId', 'serviceName duration price description')
      .sort({ appointmentDate: -1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    return successResponse(res, 200, 'Appointments fetched successfully', {
      appointments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/appointments/:id
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customerId')
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('serviceId');

    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found', 'APPOINTMENT_NOT_FOUND');
    }

    return successResponse(res, 200, 'Appointment details fetched', appointment);
  } catch (error) {
    next(error);
  }
};

// POST /api/appointments (Slot Scheduling Engine)
const createAppointment = async (req, res, next) => {
  try {
    const { customerId, barberId, serviceId, appointmentDate, startTime, remarks } = req.body;

    // 1. Verify Customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return errorResponse(res, 404, 'Customer not found', 'CUSTOMER_NOT_FOUND');
    }

    // 2. Verify Barber exists & active
    const barber = await Barber.findById(barberId);
    if (!barber || barber.status !== 'Active') {
      return errorResponse(res, 400, 'Barber is not available or active', 'BARBER_UNAVAILABLE');
    }

    // 3. Verify Service exists & calculate duration/endTime
    const service = await Service.findById(serviceId);
    if (!service) {
      return errorResponse(res, 404, 'Service not found', 'SERVICE_NOT_FOUND');
    }

    const calculatedEndTime = calculateEndTime(startTime, service.duration);

    // 4. Shift Validation (09:00 - 19:00)
    if (timeToMinutes(startTime) < timeToMinutes(SHIFT_START) || timeToMinutes(calculatedEndTime) > timeToMinutes(SHIFT_END)) {
      return errorResponse(
        res,
        400,
        `Appointment must be within barber working shift (${SHIFT_START} to ${SHIFT_END}). Calculated time: ${startTime} - ${calculatedEndTime}`,
        'OUTSIDE_SHIFT_HOURS'
      );
    }

    // 5. Holiday Validation
    const isHoliday = await Holiday.findOne({ date: appointmentDate });
    if (isHoliday) {
      return errorResponse(
        res,
        400,
        `Cannot schedule appointment on holiday (${isHoliday.name} - ${appointmentDate})`,
        'HOLIDAY_CONFLICT'
      );
    }

    // 6. Double Booking Prevention Engine Query
    // Find all existing non-cancelled appointments for this barber on the requested date
    const existingAppointments = await Appointment.find({
      barberId,
      appointmentDate,
      status: { $ne: 'Cancelled' },
    });

    for (const existing of existingAppointments) {
      if (isTimeOverlapping(existing.startTime, existing.endTime, startTime, calculatedEndTime)) {
        return errorResponse(res, 409, 'Barber is already booked during this time.', 'APPOINTMENT_CONFLICT');
      }
    }

    // Create appointment
    const appointment = await Appointment.create({
      customerId,
      barberId,
      serviceId,
      appointmentDate,
      startTime,
      endTime: calculatedEndTime,
      status: 'Confirmed',
      remarks,
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('customerId')
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('serviceId');

    return successResponse(res, 201, 'Appointment booked successfully', populated);
  } catch (error) {
    next(error);
  }
};

// PUT /api/appointments/:id
const updateAppointment = async (req, res, next) => {
  try {
    const { status, remarks, appointmentDate, startTime, serviceId, barberId } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found', 'APPOINTMENT_NOT_FOUND');
    }

    const targetDate = appointmentDate || appointment.appointmentDate;
    const targetBarberId = barberId || appointment.barberId;
    const targetServiceId = serviceId || appointment.serviceId;
    const targetStartTime = startTime || appointment.startTime;

    const service = await Service.findById(targetServiceId);
    if (!service) {
      return errorResponse(res, 404, 'Service not found', 'SERVICE_NOT_FOUND');
    }

    const calculatedEndTime = calculateEndTime(targetStartTime, service.duration);

    // If changing time/date/barber and not cancelling, check conflict
    if ((appointmentDate || startTime || serviceId || barberId) && status !== 'Cancelled') {
      const existingAppointments = await Appointment.find({
        barberId: targetBarberId,
        appointmentDate: targetDate,
        _id: { $ne: appointment._id },
        status: { $ne: 'Cancelled' },
      });

      for (const existing of existingAppointments) {
        if (isTimeOverlapping(existing.startTime, existing.endTime, targetStartTime, calculatedEndTime)) {
          return errorResponse(res, 409, 'Barber is already booked during this time.', 'APPOINTMENT_CONFLICT');
        }
      }
    }

    if (status) appointment.status = status;
    if (remarks !== undefined) appointment.remarks = remarks;
    if (appointmentDate) appointment.appointmentDate = appointmentDate;
    if (startTime) {
      appointment.startTime = startTime;
      appointment.endTime = calculatedEndTime;
    }
    if (serviceId) appointment.serviceId = serviceId;
    if (barberId) appointment.barberId = barberId;

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('customerId')
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('serviceId');

    return successResponse(res, 200, 'Appointment updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/appointments/:id (Cancel)
const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found', 'APPOINTMENT_NOT_FOUND');
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    return successResponse(res, 200, 'Appointment cancelled successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
