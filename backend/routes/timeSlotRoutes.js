import express from 'express';
import {
  getTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getBellConfig,
  updateBellConfig
} from '../controllers/timeSlotController.js';

const router = express.Router();

router.get('/bell-config', getBellConfig);
router.post('/bell-config', updateBellConfig);
router.put('/bell-config', updateBellConfig);

router.get('/', getTimeSlots);
router.post('/', createTimeSlot);
router.put('/:id', updateTimeSlot);
router.delete('/:id', deleteTimeSlot);

export default router;
