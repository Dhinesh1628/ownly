import { ActivityLog } from '../models/index.js';

export const getActivityLogs = async (req, res, next) => {
  try {
    const { limit = 30 } = req.query;
    const logs = await ActivityLog.find({ workspaceId: req.user.workspaceId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('userId', 'name role avatar')
      .populate('conversationId', 'subject');

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
