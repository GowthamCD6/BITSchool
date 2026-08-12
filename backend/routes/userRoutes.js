import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/', verifyToken, requireRole('Principal Administrator', 'Admin'), createUser);
router.put('/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), updateUser);
router.delete('/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), deleteUser);

export default router;
