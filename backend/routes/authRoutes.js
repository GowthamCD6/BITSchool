import express from 'express';
import { loginUser, googleLogin, getMe } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', getMe);

export default router;
