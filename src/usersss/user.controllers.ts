import { Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import mkdirp from 'mkdirp';
import { sendFailureRes, sendSuccessRes } from '../utils/formatResponse';
import * as userServices from './user.services';
import { moveUploadedFiles } from '../utils/moveFiles';
import { catchAsync, catchAsyncFile } from '../utils/catchAsync';
import { PUBLIC_PATH } from '../config/global.constants';

export const userContGetAllUser = catchAsync((req: Request, res: Response) => {
  const { fields, page, limit } = req.query;

  return userServices.getAllUsers(fields as string, Number(page), Number(limit)).then((users) => {
    return sendSuccessRes(HttpStatus.OK)(res, 'Successfully fetched all users.')(users);
  });
});

export const userContUpdateUser = catchAsync((req: Request, res: Response) => {
  const { id } = req.params;

  return userServices.updateUser(parseInt(id), req.body).then(() => {
    return sendSuccessRes(HttpStatus.OK)(res, 'User details sucessfully updated.')({});
  });
});

export const userContDeleteUser = catchAsync((req: Request, res: Response) => {
  if (!req.params.id) {
    return sendFailureRes(HttpStatus.UNAUTHORIZED)(res, 'Permission denied.')({});
  }

  return userServices.deleteUserById(Number(req.params.id)).then(() => {
    return sendSuccessRes(HttpStatus.NO_CONTENT)(res, 'Account successfully deleted')({});
  });
});

export const userContChangeProfilePic = catchAsyncFile(async (req: Request, res: Response) => {
  const user = req.decoded;
  if (!user) {
    return sendFailureRes(HttpStatus.NOT_FOUND)(res, 'User not found')({});
  }
  const fileSysDir = `${PUBLIC_PATH}/${process.env.USER_PATH}/${user.id}`;
  mkdirp.sync(fileSysDir);
  const imageFiles = await moveUploadedFiles(req.images, fileSysDir, `${user.id}/`);

  await userServices.updateUser(user.id, {
    image: imageFiles[0],
  });

  return sendSuccessRes(HttpStatus.OK)(res, 'Successfully changed profile pic')({});
});
