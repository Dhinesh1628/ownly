import express from 'express';
import { getAccounts, getAuthUrl, connectAccount, resyncAccount, disconnectAccount } from '../controllers/accountController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAccounts);
router.get('/auth-url', getAuthUrl);
router.post('/connect', connectAccount);
router.post('/:id/resync', resyncAccount);
router.delete('/:id', disconnectAccount);

export default router;
