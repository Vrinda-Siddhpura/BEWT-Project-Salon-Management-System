const Joi = require('joi');

const appointmentSchema = Joi.object({
  customerId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Customer ID is required',
    'string.length': 'Invalid Customer ID',
  }),
  barberId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Barber ID is required',
    'string.length': 'Invalid Barber ID',
  }),
  serviceId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Service ID is required',
    'string.length': 'Invalid Service ID',
  }),
  appointmentDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Appointment date must be in YYYY-MM-DD format',
      'any.required': 'Appointment date is required',
    }),
  startTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
    .required()
    .messages({
      'string.pattern.base': 'Start time must be in HH:mm format (24-hour)',
      'any.required': 'Start time is required',
    }),
  status: Joi.string()
    .valid('Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled')
    .default('Pending'),
  remarks: Joi.string().allow('', null).trim(),
});

module.exports = {
  appointmentSchema,
};
