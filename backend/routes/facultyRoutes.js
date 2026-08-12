import express from 'express';
import { getFaculties, createFaculty, updateFaculty, deleteFaculty } from '../controllers/facultyController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getFaculties);
router.post('/', verifyToken, requireRole('Principal Administrator', 'Admin'), createFaculty);
router.put('/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), updateFaculty);
router.delete('/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), deleteFaculty);

export default router;
