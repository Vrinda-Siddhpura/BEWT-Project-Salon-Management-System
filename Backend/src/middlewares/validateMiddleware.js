const { errorResponse } = require('../utils/responseHandler');

const validateMiddleware = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join('; ');
      return errorResponse(res, 422, errorMessage, 'VALIDATION_ERROR');
    }
    next();
  };
};

module.exports = validateMiddleware;
