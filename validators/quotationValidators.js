const Joi = require('joi');

const quotationItemSchema = Joi.object({
  product: Joi.string().required(),
  productName: Joi.string().required(),
  hsn: Joi.string().required(),
  description: Joi.string().allow('', null),
  unit: Joi.string().default('KGS'),
  weight: Joi.number().default(0),
  packing: Joi.string().default('Carton Box'),
  quantity: Joi.number().positive().required(),
  rate: Joi.number().min(0).required(),
  discount: Joi.number().min(0).default(0),
  amount: Joi.number().min(0).required(),
});

const quotationSchema = Joi.object({
  quotationNumber: Joi.string().trim().required(),
  quotationDate: Joi.date().default(Date.now),
  customer: Joi.string().required(),
  customerName: Joi.string().required(),
  items: Joi.array().items(quotationItemSchema).min(1).required(),
  currency: Joi.string().default('USD'),
  exchangeRate: Joi.number().positive().default(83.5),
  subTotal: Joi.number().min(0).required(),
  discountTotal: Joi.number().min(0).default(0),
  grandTotal: Joi.number().min(0).required(),
  grandTotalINR: Joi.number().min(0).required(),
  status: Joi.string().valid('Draft', 'Pending', 'Approved', 'Rejected', 'Converted').default('Draft'),
  notes: Joi.string().allow('', null),
  termsAndConditions: Joi.string().allow('', null),
});

module.exports = { quotationSchema };
