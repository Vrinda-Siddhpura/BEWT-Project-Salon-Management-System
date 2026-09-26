const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseHandler');

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Authentication token missing or invalid', 'UNAUTHORIZED');
    }

    const secret = process.env.JWT_SECRET || 'salon_jwt_secret_key_2026';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return errorResponse(res, 401, 'User account no longer exists', 'USER_NOT_FOUND');
    }

    if (user.status !== 'Active') {
      return errorResponse(res, 403, 'Your user account is inactive', 'ACCOUNT_INACTIVE');
    }

    req.user = {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Invalid or expired token', 'TOKEN_EXPIRED');
    }
    return errorResponse(res, 500, error.message, 'AUTH_ERROR');
  }
};

module.exports = authMiddleware;
