const Barber = require('../models/Barber');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// GET /api/barbers
const getBarbers = async (req, res, next) => {
  try {
    const barbers = await Barber.find()
      .populate('userId', 'name email role status')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Barbers fetched successfully', barbers);
  } catch (error) {
    next(error);
  }
};

// GET /api/barbers/:id
const getBarberById = async (req, res, next) => {
  try {
    const barber = await Barber.findById(req.params.id).populate('userId', 'name email role status');
    if (!barber) {
      return errorResponse(res, 404, 'Barber not found', 'BARBER_NOT_FOUND');
    }
    return successResponse(res, 200, 'Barber details fetched', barber);
  } catch (error) {
    next(error);
  }
};

// POST /api/barbers (Admin Only)
// Creates User with role Barber + Barber profile document
const createBarber = async (req, res, next) => {
  try {
    const { name, email, password, specialization, commissionPercentage, joiningDate, status } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 409, 'User with this email already exists', 'DUPLICATE_EMAIL');
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'Barber',
      status: status || 'Active',
    });

    const barber = await Barber.create({
      userId: user._id,
      specialization,
      commissionPercentage,
      joiningDate: joiningDate || Date.now(),
      status: status || 'Active',
    });

    const populatedBarber = await Barber.findById(barber._id).populate('userId', 'name email role status');

    return successResponse(res, 201, 'Barber created successfully', populatedBarber);
  } catch (error) {
    next(error);
  }
};

// PUT /api/barbers/:id (Admin Only)
const updateBarber = async (req, res, next) => {
  try {
    const { specialization, commissionPercentage, status, joiningDate, name, email } = req.body;
    const barber = await Barber.findById(req.params.id);

    if (!barber) {
      return errorResponse(res, 404, 'Barber not found', 'BARBER_NOT_FOUND');
    }

    const user = await User.findById(barber.userId);
    if (user) {
      if (name) user.name = name;
      if (email && email.toLowerCase() !== user.email) {
        const existingEmail = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
        if (existingEmail) {
          return errorResponse(res, 409, 'Email already in use', 'DUPLICATE_EMAIL');
        }
        user.email = email.toLowerCase();
      }
      if (status) user.status = status;
      await user.save();
    }

    barber.specialization = specialization || barber.specialization;
    if (commissionPercentage !== undefined) barber.commissionPercentage = commissionPercentage;
    if (status) barber.status = status;
    if (joiningDate) barber.joiningDate = joiningDate;

    await barber.save();

    const updated = await Barber.findById(barber._id).populate('userId', 'name email role status');
    return successResponse(res, 200, 'Barber updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/barbers/:id (Admin Only)
const deleteBarber = async (req, res, next) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (!barber) {
      return errorResponse(res, 404, 'Barber not found', 'BARBER_NOT_FOUND');
    }

    await User.findByIdAndDelete(barber.userId);
    await Barber.findByIdAndDelete(barber._id);

    return successResponse(res, 200, 'Barber and user account deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBarbers,
  getBarberById,
  createBarber,
  updateBarber,
  deleteBarber,
};
