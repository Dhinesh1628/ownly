import { Conversation, Message } from '../models/index.js';
import { answerInboxChat } from '../services/ai/aiService.js';

export const queryInboxChat = async (req, res, next) => {
  try {
    const { query, activeConversationId } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Query cannot be empty' });
    }

    // Server-side retrieval of relevant conversations
    let conversations = [];

    if (activeConversationId) {
      const activeConv = await Conversation.findOne({
        _id: activeConversationId,
        workspaceId: req.user.workspaceId,
      });
      if (activeConv) {
        conversations.push(activeConv);
      }
    }

    // Retrieve other relevant conversations based on user intent
    const q = query.toLowerCase();
    let filter = { workspaceId: req.user.workspaceId, isArchived: { $ne: true } };

    if (q.includes('client') || q.includes('attention')) {
      filter['classification.label'] = 'Client to Reply';
    } else if (q.includes('waiting') || q.includes('awaiting')) {
      filter.awaitingResponse = true;
    } else if (q.includes('assistant')) {
      filter['classification.label'] = 'Assistant to Reply';
    }

    const fetched = await Conversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .limit(10)
      .lean();

    // Merge without duplicates
    for (const item of fetched) {
      if (!conversations.some((c) => c._id.toString() === item._id.toString())) {
        conversations.push(item);
      }
    }

    // Grounded answer generation via Anthropic Claude (or fallback deterministic engine)
    const result = await answerInboxChat({
      query,
      conversations,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
