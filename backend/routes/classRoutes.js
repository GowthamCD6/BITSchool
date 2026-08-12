import express from 'express';
import { getClasses, createClass, updateClass, deleteClass, getGrades } from '../controllers/classController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/grades', getGrades);
router.get('/', getClasses);
router.post('/', verifyToken, requireRole('Principal Administrator', 'Admin'), createClass);
router.put('/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), updateClass);
router.delete('/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), deleteClass);

export default router;
