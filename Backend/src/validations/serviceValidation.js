const Joi = require('joi');

const serviceSchema = Joi.object({
  serviceName: Joi.string().trim().required().messages({
    'any.required': 'Service name is required',
  }),
  duration: Joi.number().integer().min(1).required().messages({
    'number.min': 'Duration must be at least 1 minute',
    'any.required': 'Duration in minutes is required',
  }),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Price cannot be negative',
    'any.required': 'Price is required',
  }),
  description: Joi.string().allow('', null).trim(),
});

module.exports = {
  serviceSchema,
};
