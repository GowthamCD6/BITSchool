import express from 'express';
import { getClasses, createClass, updateClass, deleteClass, getGrades } from '../controllers/classController.js';

const router = express.Router();

router.get('/grades', getGrades);
router.get('/', getClasses);
router.post('/', createClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

export default router;
