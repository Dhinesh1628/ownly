import express from 'express';
import { queryInboxChat } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/query', queryInboxChat);

export default router;
