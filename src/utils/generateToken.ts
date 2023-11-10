import { Response } from 'express';
import jwt from 'jsonwebtoken';

// eslint-disable-next-line @typescript-eslint/ban-types
export const generateToken = (res: Response, data: {}) => {
  const token = jwt.sign(data, process.env.JWT_SECRET || '', {
    expiresIn: process.env.TOKEN_EXPIRES,
  });
  res.cookie('token', token, {
    maxAge: Number(process.env.TOKEN_EXPIRES),
    secure: false, // if SSL is implemented than true
    httpOnly: true,
  });

  return token;
};
