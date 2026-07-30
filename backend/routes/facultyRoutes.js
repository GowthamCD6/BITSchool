import express from 'express';
import { getFaculties, createFaculty, updateFaculty, deleteFaculty } from '../controllers/facultyController.js';

const router = express.Router();

router.get('/', getFaculties);
router.post('/', createFaculty);
router.put('/:id', updateFaculty);
router.delete('/:id', deleteFaculty);

export default router;
