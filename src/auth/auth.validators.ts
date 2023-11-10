import { Request, Response, NextFunction } from 'express';
import { User } from '../types/user.types';
import { validate } from '../utils/validate';
import { SIGNUP_SCHEMA, LOGIN_SCHEMA } from './auth.schema';

/**
 * Validate request body before signup
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Promise
 */
export const signupValidator = (req: Request, res: Response, next: NextFunction) => {
  return validate<User>(req.body, SIGNUP_SCHEMA)
    .then(() => next())
    .catch((err) => next(err));
};

/**
 * Validate request body before login
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Promise
 */
export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  return validate<Partial<User>>(req.body, LOGIN_SCHEMA)
    .then(() => next())
    .catch((err) => next(err));
};
