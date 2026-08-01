const Joi = require('joi');

const productSchema = Joi.object({
  productName: Joi.string().trim().min(2).max(150).required(),
  hsn: Joi.string().trim().min(4).max(12).required(),
  category: Joi.string().allow('', null).default('General'),
  description: Joi.string().allow('', null),
  unit: Joi.string().required().default('KGS'),
  weight: Joi.number().min(0).default(0),
  grossWeight: Joi.number().min(0).default(0),
  packing: Joi.string().default('Carton Box'),
  defaultRate: Joi.number().min(0).required(),
  currency: Joi.string().default('USD'),
});

module.exports = { productSchema };
