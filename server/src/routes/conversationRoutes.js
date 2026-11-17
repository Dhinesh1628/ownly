import express from 'express';
import {
  getConversations,
  getConversationById,
  overrideClassification,
  rerunAIClassification,
  toggleArchive,
  toggleStar,
  toggleRead,
  markCompleted,
  clientHandle,
  clientHandOff,
  clientUndoHandle,
} from '../controllers/conversationController.js';
import { draftReply, sendReply } from '../controllers/replyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getConversations);
router.get('/:id', getConversationById);

// Classification overrides & AI rerun
router.patch('/:id/classification', overrideClassification);
router.post('/:id/rerun-ai', rerunAIClassification);

// Status toggles
router.patch('/:id/archive', toggleArchive);
router.patch('/:id/star', toggleStar);
router.patch('/:id/read', toggleRead);
router.patch('/:id/complete', markCompleted);

// Client View Specific Endpoints (instant two-way sync)
router.post('/:id/client-handle', clientHandle);
router.post('/:id/client-handoff', clientHandOff);
router.post('/:id/client-undo-handle', clientUndoHandle);

// Drafting & Sending Replies
router.post('/:id/draft-reply', draftReply);
router.post('/:id/send-reply', sendReply);

export default router;
