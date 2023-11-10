import { Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { hashPassword, comparePassword } from '../utils/hashPassword';
import * as userServices from '../users/user.services';
import { sendFailureRes, sendSuccessRes } from '../utils/formatResponse';
import * as tokenServices from '../tokens/token.services';
import { mailTransporter } from '../utils/sendMail';
import { generateToken } from '../utils/generateToken';
import { bookshelf } from '../db';
import { catchAsync } from '../utils/catchAsync';
import { Transaction } from 'knex';

/**
 * This function is used to create user
 *
 */
export const authContSignup = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const doesUserExist = await userServices.doesUserExist(email);
  if (doesUserExist) {
    return sendFailureRes(HttpStatus.CONFLICT)(res, 'User with this email already exist.')({});
  }
  const hashedPass = await hashPassword(password);

  return bookshelf.transaction(async (transx: Transaction) => {
    const user = await userServices.createUser(
      {
        ...req.body,
        password: hashedPass,
      },
      transx
    );
    // CREATE TOKEN BASED ON USER ID
    await tokenServices.createToken(user.id, transx);
    // TODO: Send email

    return sendSuccessRes(HttpStatus.OK)(res, 'Account successfully created.')({ user });
  });
});

/**
 * This function is used to login user
 *
 */
export const authContLogin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const doesUserExist = await userServices.doesUserExist(email);
  if (!doesUserExist) {
    return sendFailureRes(HttpStatus.CONFLICT)(res, 'User doesnot exist')({});
  }
  const user = await userServices.getUserByEmail(email);
  const isPasswordCorrect = await comparePassword(password, user.password);
  if (!isPasswordCorrect) {
    return sendFailureRes(HttpStatus.NOT_ACCEPTABLE)(res, 'Email or password incorrect.')({});
  }

  const token = generateToken(res, { id: user.id });

  return sendSuccessRes(HttpStatus.OK)(res, 'Successfully logged in.')({
    user,
    token,
  });
});

/**
 * If user forgets password this function is used
 *
 */
export const authContForgotPassword = catchAsync(async (req: Request, res: Response) => {
  // GET EMAIL AND VALIDATE IN DB IF IT EXIST
  const { email } = req.body;
  const user = await userServices.doesUserExist(email);
  if (!user) {
    return sendFailureRes(HttpStatus.NOT_FOUND)(res, 'User with this email not found.')({});
  }
  // CREATE TOKEN BASED ON USER ID
  const token = await tokenServices.createToken(user.id);
  // SEND PASSWORD RESET URL IN THROUGH EMAIL
  const emailConfig = {
    from: process.env.FROM_MAIL,
    to: user.email,
    subject: 'Reset your password',
    html: `http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/auth/reset-password?token=${token.value}`,
  };
  await mailTransporter.sendMail(emailConfig);

  return sendSuccessRes(HttpStatus.OK)(res, 'Reset link has been sent to your email.')({});
});

/**
 * Reset password
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Promise
 */
export const authContResetPassword = catchAsync((req: Request, res: Response) => {
  const { password } = req.body;
  const { token } = req.query;
  if (!token) {
    return sendFailureRes(HttpStatus.FORBIDDEN)(res, 'Token invalid.')({});
  }
  if (!password) {
    return sendFailureRes(HttpStatus.BAD_REQUEST)(res, 'Please provide valid password.')({});
  }

  return bookshelf.transaction(async (transx: Transaction) => {
    const myTokenRes = await tokenServices.findByToken(token as string);
    const myToken = myTokenRes.toJSON();
    await tokenServices.deleteTokenById(myToken.id, transx);

    await userServices.changeUserPassword(myToken.user_id, password, transx);

    return sendSuccessRes(HttpStatus.OK)(res, 'Password has been successfully changed.')({});
  });
});

/**
 * Verify user
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Promise
 */
export const authContVerifyUser = catchAsync((req: Request, res: Response) => {
  const { token } = req.query;
  if (!token) {
    return sendFailureRes(HttpStatus.FORBIDDEN)(res, 'Token invalid')({});
  }

  return bookshelf.transaction(async (transx: Transaction) => {
    const myTokenRes = await tokenServices.findByToken(token as string);
    const myToken = myTokenRes.toJSON();
    await tokenServices.deleteTokenById(myToken.id, transx);

    await userServices.updateUser(myToken.user_id, { verified: true }, transx);

    return sendSuccessRes(HttpStatus.OK)(res, 'Your account has been successfully verified.')({});
  });
});
