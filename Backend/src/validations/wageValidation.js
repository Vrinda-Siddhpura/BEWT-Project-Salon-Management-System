const Joi = require('joi');

const generateWageSchema = Joi.object({
  barberId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Barber ID is required',
  }),
  month: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Month must be in YYYY-MM format',
      'any.required': 'Month is required',
    }),
  baseSalary: Joi.number().min(0).default(0),
});

module.exports = {
  generateWageSchema,
};
