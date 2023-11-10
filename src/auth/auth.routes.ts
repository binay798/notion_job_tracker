import { Router } from 'express';
import * as authController from './auth.controllers';
import * as validators from './auth.validators';

export const router = Router();

router.post('/login', validators.loginValidator, authController.authContLogin);
router.post('/signup', validators.signupValidator, authController.authContSignup);
router.post('/forgot-password', authController.authContForgotPassword);
router.patch('/reset-password', authController.authContResetPassword);
router.get('/verify', authController.authContVerifyUser);
