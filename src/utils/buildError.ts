import HttpStatus from 'http-status-codes';
import { isEmpty } from 'lodash';

/**
 * Build error response for validation errors.
 *
 * @param   {Error} err
 * @returns {Object}
 */

export interface Error {
  isJoi: boolean;
  isBoom: boolean;
  output: { statusCode: number; payload: { message: string; error: string } };
  detail: string;
  message: string;
  details: { message: string; path: string[] }[];
}

export function buildError(err: Error) {
  // Validation errors
  if (err.isJoi) {
    return {
      code: HttpStatus.BAD_REQUEST,
      message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST),
      details:
        err.details &&
        err.details.map((err) => {
          return {
            message: err.message,
            param: err.path.join('.'),
          };
        }),
    };
  }

  // HTTP errors
  if (err.isBoom) {
    return {
      code: err.output.statusCode,
      message: err.output.payload.message || err.output.payload.error,
    };
  }

  const outError = err.detail || err.message;
  const alreadyExistError = outError.match(/(already exists)/gi);

  // Return INTERNAL_SERVER_ERROR for all other cases
  return {
    code: HttpStatus.INTERNAL_SERVER_ERROR,
    message: isEmpty(alreadyExistError) ? 'Invalid request. Please refresh the page and try again.' : outError,
  };
}
