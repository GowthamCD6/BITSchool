import express from 'express';
import { getVenues, createVenue, updateVenue, deleteVenue } from '../controllers/venueController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getVenues);
router.post('/', verifyToken, requireRole('Principal Administrator', 'Admin'), createVenue);
router.put('/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), updateVenue);
router.delete('/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), deleteVenue);

export default router;
