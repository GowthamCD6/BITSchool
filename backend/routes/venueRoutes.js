import express from 'express';
import { getVenues, createVenue, updateVenue, deleteVenue } from '../controllers/venueController.js';

const router = express.Router();

router.get('/', getVenues);
router.post('/', createVenue);
router.put('/:id', updateVenue);
router.delete('/:id', deleteVenue);

export default router;
