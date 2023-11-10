import { NextFunction, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { buildError, Error } from '../utils/buildError';
import { sendFailureRes } from '../utils/formatResponse';

/**
 * Throw error for unknown api endpoints
 * @param req Request
 * @param res Response
 * @returns
 */
export const methodNotAllowed = (req: Request, res: Response) => {
  return sendFailureRes(HttpStatus.METHOD_NOT_ALLOWED)(res, 'Method not allowed')({});
};

/**
 * Generic g
 * @param err Erro
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const genericErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const error = buildError(err);

  return sendFailureRes(error.code)(res, error.message)(error.details || {});
};
