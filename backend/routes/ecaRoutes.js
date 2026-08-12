import express from 'express';
import { getEcaData, updateEcaCell, addEcaVertical, updateEcaVerticalGrades, deleteEcaVertical } from '../controllers/ecaController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getEcaData);
router.post('/cell', verifyToken, requireRole('Principal Administrator', 'Admin'), updateEcaCell);
router.post('/vertical', verifyToken, requireRole('Principal Administrator', 'Admin'), addEcaVertical);
router.put('/vertical/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), updateEcaVerticalGrades);
router.delete('/vertical/:name', verifyToken, requireRole('Principal Administrator', 'Admin'), deleteEcaVertical);

export default router;
