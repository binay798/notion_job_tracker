import { Request, Response, NextFunction } from 'express';
import { deleteFolder } from './moveFiles';

/**
 * Use this wrapper for any controllers
 *
 **/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const catchAsync = (fn: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);

      return;
    } catch (err) {
      return next(err);
    }
  };
};

/**
 * Use this wrapper for the controller having uploadFile middleware
 *
 **/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const catchAsyncFile = (fn: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);

      return;
    } catch (err) {
      return next(err);
    } finally {
      if (req.uploadDir) {
        await deleteFolder(req.uploadDir || '', false);
      }
    }
  };
};
