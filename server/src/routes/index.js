import express from 'express';
import authRoutes from './authRoutes.js';
import accountRoutes from './accountRoutes.js';
import conversationRoutes from './conversationRoutes.js';
import chatRoutes from './chatRoutes.js';
import simulationRoutes from './simulationRoutes.js';
import statsRoutes from './statsRoutes.js';
import activityRoutes from './activityRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/conversations', conversationRoutes);
router.use('/chat', chatRoutes);
router.use('/simulate', simulationRoutes);
router.use('/stats', statsRoutes);
router.use('/activity', activityRoutes);

export default router;
