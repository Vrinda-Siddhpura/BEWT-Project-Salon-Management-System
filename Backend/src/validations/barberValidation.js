const Joi = require('joi');

const createBarberSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Barber user name is required',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'any.required': 'Password is required',
  }),
  specialization: Joi.string().trim().required().messages({
    'any.required': 'Specialization is required',
  }),
  commissionPercentage: Joi.number().min(0).max(100).required().messages({
    'number.min': 'Commission cannot be negative',
    'number.max': 'Commission cannot exceed 100%',
    'any.required': 'Commission percentage is required',
  }),
  joiningDate: Joi.date().allow(null, ''),
  status: Joi.string().valid('Active', 'Inactive').default('Active'),
});

const updateBarberSchema = Joi.object({
  specialization: Joi.string().trim(),
  commissionPercentage: Joi.number().min(0).max(100),
  status: Joi.string().valid('Active', 'Inactive'),
  joiningDate: Joi.date().allow(null, ''),
  name: Joi.string().trim(),
  email: Joi.string().email(),
});

module.exports = {
  createBarberSchema,
  updateBarberSchema,
};
