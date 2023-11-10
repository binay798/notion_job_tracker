import { Router } from 'express';
import * as userControllers from './user.controllers';
import { hasRole } from '../middlewares/hasRole';
import { uploadFile } from '../middlewares/uploadFile';
import { verifyImageUpload } from '../middlewares/verifyImageUpload';
import { ROLE } from '../config/global.constants';
export const router = Router();

router.route('/').get(userControllers.userContGetAllUser);
router.patch('/change-pic', uploadFile('image', true), verifyImageUpload, userControllers.userContChangeProfilePic);
router
  .route('/:id')
  .patch(userControllers.userContUpdateUser)
  .delete(hasRole(ROLE.admin), userControllers.userContDeleteUser);
