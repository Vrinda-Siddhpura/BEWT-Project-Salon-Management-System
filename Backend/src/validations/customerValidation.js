const Joi = require('joi');

const customerSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Customer name is required',
  }),
  phone: Joi.string().trim().required().messages({
    'any.required': 'Phone number is required',
  }),
  email: Joi.string().email().allow('', null).trim(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required().messages({
    'any.only': 'Gender must be Male, Female, or Other',
    'any.required': 'Gender is required',
  }),
});

module.exports = {
  customerSchema,
};
