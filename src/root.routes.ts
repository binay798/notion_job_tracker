import { Request, Response, Router } from 'express';
// import { router as userRoutes } from './users/user.routes';
// import { router as authRoutes } from './auth/auth.routes';
// import { verifyToken } from './middlewares/verifyToken';

export const router = Router();

// router.use('/auth', authRoutes);
// router.use(verifyToken);
// router.use('/users', userRoutes);

router.get('/', (req: Request, res: Response) => {
  return res.send('success');
});
