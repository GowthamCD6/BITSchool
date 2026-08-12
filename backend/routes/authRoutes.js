import express from 'express';
import {
  loginUser,
  googleLogin,
  refreshToken,
  logoutUser,
  getMe
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/refresh', refreshToken);
router.post('/logout', verifyToken, logoutUser);
router.get('/me', verifyToken, getMe);

export default router;
