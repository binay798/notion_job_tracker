import { Request, Response, NextFunction } from 'express';
import HttpStatus from 'http-status-codes';
import * as userServices from '../users/user.services';
import { sendFailureRes } from '../utils/formatResponse';

export const hasRole = (role: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.decoded) {
        return sendFailureRes(HttpStatus.UNAUTHORIZED)(res, 'Permission denied.')({});
      }
      const user = await userServices.getUserById(req.decoded.id);
      const giveAccess = [user.role].includes(role);
      if (!giveAccess) {
        return sendFailureRes(HttpStatus.UNAUTHORIZED)(res, 'Permission denied.')({});
      }
      next();
    } catch (err) {
      return next(err);
    }
  };
};
