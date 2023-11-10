import { Request, Response, NextFunction } from 'express';
import HttpStatus from 'http-status-codes';
import { ResponseError } from '../types/error.types';
import { sendFailureRes } from '../utils/formatResponse';
import { buildError } from '../utils/buildError';

/**
 * Throw an error if there is an unknown api endpoints
 * @param err Error
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns
 */
export const methodNotAllowed = (
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
    error: {
      code: HttpStatus.METHOD_NOT_ALLOWED,
      message: HttpStatus.getStatusText(HttpStatus.METHOD_NOT_ALLOWED),
    },
  });
};

/**
 * Global error handler.
 * This handler is executed if error is occured from joi, boom or
 * other programming errors from express
 * @param err ResponseError
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns
 */
export const genericErrorHandler = (
  err: ResponseError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const error = buildError(err);

  return sendFailureRes(error.code)(res, error.message)(error.details || {});
};

/**
 * It handles the error created by incoming request, request body (body parser)
 * https://github.com/expressjs/body-parser#errors.
 * @param err Error
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const bodyParserError = (
  err: ResponseError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  res.status(err.status).json({
    error: {
      status: 'error',
      code: err.status,
      message: HttpStatus.getStatusText(err.status),
    },
  });
};
