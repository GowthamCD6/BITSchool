import express from 'express';
import {
  getTimetables,
  getTimetableByWeek,
  saveTimetableForWeek,
  updateTimetableSlot,
  deleteSingleSlot,
  deleteWeekTimetable
} from '../controllers/timetableController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getTimetables);
router.get('/:weekKey', getTimetableByWeek);
router.post('/', verifyToken, requireRole('Principal Administrator', 'Admin'), saveTimetableForWeek);
router.post('/save', verifyToken, requireRole('Principal Administrator', 'Admin'), saveTimetableForWeek);
router.put('/slot/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), updateTimetableSlot);
router.delete('/slot/:id', verifyToken, requireRole('Principal Administrator', 'Admin'), deleteSingleSlot);
router.delete('/:weekKey', verifyToken, requireRole('Principal Administrator', 'Admin'), deleteWeekTimetable);

export default router;
