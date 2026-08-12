import express from 'express';
import {
  getGrades,
  createGrade,
  updateGrade,
  deleteGrade
} from '../controllers/gradeController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getGrades);
router.post('/', verifyToken, requireRole('Principal Administrator', 'Admin'), createGrade);
router.put('/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), updateGrade);
router.delete('/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), deleteGrade);

export default router;
