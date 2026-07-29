import express from 'express';
import { getEcaData, updateEcaCell, addEcaVertical, deleteEcaVertical } from '../controllers/ecaController.js';

const router = express.Router();

router.get('/', getEcaData);
router.post('/cell', updateEcaCell);
router.post('/vertical', addEcaVertical);
router.delete('/vertical/:name', deleteEcaVertical);

export default router;
