import express from 'express';
import {
  getTimetables,
  getTimetableByWeek,
  saveTimetableForWeek,
  deleteWeekTimetable
} from '../controllers/timetableController.js';

const router = express.Router();

router.get('/', getTimetables);
router.get('/:weekKey', getTimetableByWeek);
router.post('/save', saveTimetableForWeek);
router.delete('/:weekKey', deleteWeekTimetable);

export default router;
