import { NextFunction, Request, Response } from 'express';
import { getDataOfTableByRowId } from './dbTransaction';
import { catchAsync } from './catchAsync';
import Boom from '@hapi/boom';
import { Schema } from 'joi';
import { validate } from './validate';

export const checkIfResourceExist = (paramName: string, tableName: string, resultingRows: string[]) =>
  catchAsync(async (req: Request, _: Response, next: NextFunction) => {
    const itemId = req.params[paramName];
    const item = await getDataOfTableByRowId(tableName, Number(itemId), resultingRows);
    if (!item) {
      throw Boom.notFound('Resource doesnot exist.');
    }

    return next();
  });

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
