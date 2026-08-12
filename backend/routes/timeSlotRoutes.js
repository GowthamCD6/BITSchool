import express from 'express';
import {
  getTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getBellConfig,
  updateBellConfig
} from '../controllers/timeSlotController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/bell-config', getBellConfig);
router.post('/bell-config', verifyToken, requireRole('Principal Administrator', 'Admin'), updateBellConfig);
router.put('/bell-config', verifyToken, requireRole('Principal Administrator', 'Admin'), updateBellConfig);

router.get('/', getTimeSlots);
router.post('/', verifyToken, requireRole('Principal Administrator', 'Admin'), createTimeSlot);
router.put('/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), updateTimeSlot);
router.delete('/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), deleteTimeSlot);

export default router;
