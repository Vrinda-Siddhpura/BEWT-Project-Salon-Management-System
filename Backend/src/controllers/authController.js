const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Barber = require('../models/Barber');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email and explicitly include password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Check status
    if (user.status !== 'Active') {
      return errorResponse(res, 403, 'Your account is inactive. Please contact administrator.', 'ACCOUNT_INACTIVE');
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // If role is Barber, get Barber document ID
    let barberId = null;
    if (user.role === 'Barber') {
      const barber = await Barber.findOne({ userId: user._id });
      if (barber) barberId = barber._id;
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET || 'salon_jwt_secret_key_2026';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        barberId,
      },
      secret,
      { expiresIn }
    );

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      barberId,
    };

    return successResponse(res, 200, 'Login successful', {
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  return successResponse(res, 200, 'Logged out successfully');
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return errorResponse(res, 404, 'User not found', 'USER_NOT_FOUND');
    }

    let barberId = null;
    if (user.role === 'Barber') {
      const barber = await Barber.findOne({ userId: user._id });
      if (barber) barberId = barber._id;
    }

    return successResponse(res, 200, 'User profile fetched', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        barberId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId).select('+password');

    if (!user) {
      return errorResponse(res, 404, 'User not found', 'USER_NOT_FOUND');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 400, 'Incorrect current password', 'INVALID_CURRENT_PASSWORD');
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getMe,
  changePassword,
};
