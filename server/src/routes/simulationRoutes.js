import express from 'express';
import { simulateIncomingEmail } from '../controllers/simulationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/incoming-email', simulateIncomingEmail);

export default router;
