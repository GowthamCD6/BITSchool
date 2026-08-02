import express from 'express';
import {
  getTimetables,
  getTimetableByWeek,
  saveTimetableForWeek,
  updateTimetableSlot,
  deleteWeekTimetable
} from '../controllers/timetableController.js';

const router = express.Router();

router.get('/', getTimetables);
router.get('/:weekKey', getTimetableByWeek);
router.post('/', saveTimetableForWeek);
router.post('/save', saveTimetableForWeek);
router.put('/slot/:id', updateTimetableSlot);
router.delete('/:weekKey', deleteWeekTimetable);

export default router;
