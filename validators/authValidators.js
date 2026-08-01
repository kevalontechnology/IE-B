const Joi = require('joi');
const { ROLES, USER_STATUS } = require('../constants/roles');

const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  companyName: Joi.string().trim().min(2).max(150).required(),
  email: Joi.string().email().lowercase().trim().required(),
  mobile: Joi.string().pattern(/^[0-9+\-\s]{8,15}$/).required().messages({
    'string.pattern.base': 'Please enter a valid mobile number.',
  }),
  password: Joi.string().min(6).max(100).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Confirm password must match password.',
  }),
  role: Joi.string().valid(ROLES.SUPERVISOR, ROLES.SALES).required().messages({
    'any.only': 'Role must be Supervisor or Sales. Admin cannot be registered from UI.',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(USER_STATUS.APPROVED, USER_STATUS.REJECTED, USER_STATUS.BLOCKED, USER_STATUS.PENDING, USER_STATUS.DEACTIVATED).required(),
  reason: Joi.string().allow('', null),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateStatusSchema,
};
