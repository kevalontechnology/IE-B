const Joi = require('joi');

const customerSchema = Joi.object({
  customerName: Joi.string().trim().min(2).max(150).required(),
  company: Joi.string().trim().min(2).max(150).required(),
  country: Joi.string().trim().required(),
  gst: Joi.string().allow('', null).trim(),
  email: Joi.string().email().lowercase().trim().required(),
  phone: Joi.string().trim().required(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().allow('', null),
    country: Joi.string().required(),
    postalCode: Joi.string().allow('', null),
  }).required(),
  notifyParty: Joi.string().allow('', null),
  paymentTerms: Joi.string().required(),
  currency: Joi.string().default('USD'),
});

module.exports = { customerSchema };
