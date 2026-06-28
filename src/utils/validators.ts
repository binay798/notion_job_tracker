import { NextFunction, Request, Response } from 'express';
import { Schema } from 'joi';
import { validate } from './validate';

// MARK: Can be extended to get additional Request object data
type ReqObjectAttr = 'body' | 'params' | 'query';
/**
 * Validate Request object data with Joi validator
 * You can validate data present in ReqObjectAttr
 * @param reqAttr Attribute of Request object
 * @param schema Joi.Schema
 * @returns
 */
export const commonJoiSchemaValidator =
  (reqAttr: ReqObjectAttr, schema: Schema) => (req: Request, _: Response, next: NextFunction) => {
    // @ts-ignore
    return validate(req[reqAttr], schema)
      .then(() => next())
      .catch((err) => next(err));
  };
