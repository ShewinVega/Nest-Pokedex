import * as Joi from 'joi';



export const JoiValidationShema = Joi.object({
  MONGODB: Joi.required().messages({
    'any.required': `Mongo url conection is required!`
  }),
  PORT: Joi.number().default(3005).positive().messages({
    'number.base': `Port must be a number`,
    'number.positive': `Port must be positive number`
  }),
  DEFAULT_LIMIT: Joi.number().default(7).positive().messages({
    'number.base': `Limit must be a number`,
    'number.positive': `Limit must be positive number`
  }),
  DBNAME: Joi.string().required().messages({
    'string.base': `Database name must be valid text`,
    'any.required': `Database name is required!`
  }),
});