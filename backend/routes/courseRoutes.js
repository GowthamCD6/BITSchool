import express from 'express';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../controllers/courseController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSubjects);
router.post('/', verifyToken, requireRole('Principal Administrator', 'Admin'), createSubject);
router.put('/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), updateSubject);
router.delete('/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), deleteSubject);

export default router;
