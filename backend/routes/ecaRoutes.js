import express from 'express';
import { getEcaData, updateEcaCell, addEcaVertical, updateEcaVerticalGrades, deleteEcaVertical } from '../controllers/ecaController.js';

const router = express.Router();

router.get('/', getEcaData);
router.post('/cell', updateEcaCell);
router.post('/vertical', addEcaVertical);
router.put('/vertical/:id', updateEcaVerticalGrades);
router.delete('/vertical/:name', deleteEcaVertical);

export default router;
