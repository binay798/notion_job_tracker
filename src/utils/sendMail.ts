import nodemailer from 'nodemailer';

export const transportConfig = {
  host: 'smtp.mailtrap.io',
  port: 465,
  secure: false,
  auth: {
    user: '51796fa33b8a48',
    pass: 'b9ffcdc0509662',
  },
};

export const mailTransporter = nodemailer.createTransport(transportConfig);
