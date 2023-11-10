import Joi from 'joi';
import { ROLE } from '../config/global.constants';

export const SIGNUP_SCHEMA = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().valid(...ROLE.all),
});

export const LOGIN_SCHEMA = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
