import { Response, NextFunction, Request } from 'express';
import HttpStatus from 'http-status-codes';
import { sendFailureRes } from '../utils/formatResponse';

export const verifyImageUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.images) {
    return sendFailureRes(HttpStatus.BAD_REQUEST)(res, 'Upload atleast one image')({});
  }
  next();
};
