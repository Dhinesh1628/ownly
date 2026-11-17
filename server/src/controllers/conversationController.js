import { Conversation, Message, ActivityLog } from '../models/index.js';
import { classifyEmailThread } from '../services/ai/aiService.js';

export const getConversations = async (req, res, next) => {
  try {
    const {
      segment,
      search,
      isRead,
      isImportant,
      isArchived,
      isCompleted,
      label,
      needsReview,
      awaitingResponse,
      accountId,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {
      workspaceId: req.user.workspaceId,
    };

    // Client view constraint: if user has role 'client', default filter strictly to Client to Reply
    if (req.user.role === 'client' && !segment) {
      query['classification.label'] = 'Client to Reply';
      query.isArchived = { $ne: true };
    }

    // Segment Filters
    if (segment) {
      switch (segment.toLowerCase()) {
        case 'assistant-to-reply':
        case 'assistant to reply':
          query['classification.label'] = 'Assistant to Reply';
          query.isArchived = { $ne: true };
          break;
        case 'client-to-reply':
        case 'client to reply':
          query['classification.label'] = 'Client to Reply';
          query.isArchived = { $ne: true };
          break;
        case 'no-reply-needed':
        case 'no reply needed':
          query['classification.label'] = 'No Reply Needed';
          query.isArchived = { $ne: true };
          break;
        case 'action-required':
        case 'action required':
          query.$or = [
            { 'classification.label': { $in: ['Assistant to Reply', 'Client to Reply'] } },
            { segments: 'Action Required' },
          ];
          query.isArchived = { $ne: true };
          break;
        case 'waiting-for-response':
        case 'waiting for response':
          query.awaitingResponse = true;
          query.isArchived = { $ne: true };
          break;
        case 'meetings-appointments':
        case 'meetings & appointments':
        case 'meetings':
          query.$or = [
            { segments: 'Meetings & Appointments' },
            { 'extracted.meetings.0': { $exists: true } },
          ];
          query.isArchived = { $ne: true };
          break;
        case 'important':
          query.isImportant = true;
          query.isArchived = { $ne: true };
          break;
        case 'needs-review':
        case 'needs review':
          query['classification.needsReview'] = true;
          query.isArchived = { $ne: true };
          break;
        case 'archived':
          query.isArchived = true;
          break;
        case 'general':
          query.segments = 'General';
          query.isArchived = { $ne: true };
          break;
        default:
          if (segment !== 'all') {
            query.segments = segment;
          }
      }
    } else if (isArchived === undefined) {
      // Default to non-archived unless specifically looking at archive
      query.isArchived = { $ne: true };
    }

    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (isImportant !== undefined) query.isImportant = isImportant === 'true';
    if (isArchived !== undefined) query.isArchived = isArchived === 'true';
    if (isCompleted !== undefined) query.isCompleted = isCompleted === 'true';
    if (label) query['classification.label'] = label;
    if (needsReview !== undefined) query['classification.needsReview'] = needsReview === 'true';
    if (awaitingResponse !== undefined) query.awaitingResponse = awaitingResponse === 'true';
    if (accountId) query.accountId = accountId;

    // Search filter across subject, snippet, summary, and participant names/emails
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { subject: regex },
        { snippet: regex },
        { summary: regex },
        { 'participants.name': regex },
        { 'participants.email': regex },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Conversation.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findOne({
      _id: id,
      workspaceId: req.user.workspaceId,
    }).populate('accountId', 'address provider displayName');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId: conversation._id }).sort({ sentAt: 1 });

    // Mark as read if opened
    if (!conversation.isRead) {
      conversation.isRead = true;
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      data: {
        ...conversation.toObject(),
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const overrideClassification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, reason } = req.body;

    const validLabels = ['Assistant to Reply', 'Client to Reply', 'No Reply Needed'];
    if (!validLabels.includes(label)) {
      return res.status(400).json({ success: false, message: 'Invalid classification label' });
    }

    const conversation = await Conversation.findOne({ _id: id, workspaceId: req.user.workspaceId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const oldLabel = conversation.classification.label;
    conversation.classification.label = label;
    conversation.classification.source = 'manual';
    conversation.classification.needsReview = false; // Resolved by human override
    conversation.classification.confidence = 1.0;
    conversation.classification.reason = reason || `Manually overridden by ${req.user.name}`;
    conversation.classification.overriddenBy = req.user._id;
    conversation.classification.overriddenAt = new Date();
    conversation.classification.updatedAt = new Date();

    if (label === 'Client to Reply') {
      conversation.assignedTo = 'client';
    } else if (label === 'Assistant to Reply') {
      conversation.assignedTo = 'assistant';
    }

    await conversation.save();

    await ActivityLog.create({
      workspaceId: req.user.workspaceId,
      conversationId: conversation._id,
      userId: req.user._id,
      actorRole: req.user.role,
      action: 'CLASSIFICATION_OVERRIDDEN',
      description: `${req.user.name} changed triage classification from "${oldLabel}" to "${label}"`,
      metadata: { oldLabel, newLabel: label, subject: conversation.subject },
    });

    res.status(200).json({
      success: true,
      message: 'Classification overridden successfully',
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const rerunAIClassification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findOne({ _id: id, workspaceId: req.user.workspaceId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId: conversation._id }).sort({ sentAt: 1 });
    const aiResult = await classifyEmailThread({
      subject: conversation.subject,
      messages,
      latestBody: messages[messages.length - 1]?.body || '',
    });

    conversation.classification = {
      label: aiResult.label,
      confidence: aiResult.confidence,
      reason: aiResult.reason,
      needsReview: aiResult.needsReview,
      source: 'ai',
      updatedAt: new Date(),
      overriddenBy: null,
      overriddenAt: null,
    };
    conversation.summary = aiResult.summary || conversation.summary;
    conversation.extracted = aiResult.extracted || conversation.extracted;

    if (aiResult.label === 'Client to Reply') {
      conversation.assignedTo = 'client';
    } else if (aiResult.label === 'Assistant to Reply') {
      conversation.assignedTo = 'assistant';
    }

    await conversation.save();

    await ActivityLog.create({
      workspaceId: req.user.workspaceId,
      conversationId: conversation._id,
      userId: req.user._id,
      actorRole: req.user.role,
      action: 'AI_RECLASSIFIED',
      description: `Re-ran AI classification on "${conversation.subject}". Result: ${aiResult.label} (${(aiResult.confidence * 100).toFixed(0)}%)`,
      metadata: { label: aiResult.label, confidence: aiResult.confidence },
    });

    res.status(200).json({
      success: true,
      message: 'AI classification re-evaluated',
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleArchive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findOne({ _id: id, workspaceId: req.user.workspaceId });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    conversation.isArchived = !conversation.isArchived;
    await conversation.save();

    await ActivityLog.create({
      workspaceId: req.user.workspaceId,
      conversationId: conversation._id,
      userId: req.user._id,
      actorRole: req.user.role,
      action: conversation.isArchived ? 'ARCHIVED' : 'UNARCHIVED',
      description: `${req.user.name} ${conversation.isArchived ? 'archived' : 'unarchived'} thread "${conversation.subject}"`,
    });

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

export const toggleStar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findOne({ _id: id, workspaceId: req.user.workspaceId });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    conversation.isImportant = !conversation.isImportant;
    await conversation.save();

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

export const toggleRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findOne({ _id: id, workspaceId: req.user.workspaceId });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    conversation.isRead = !conversation.isRead;
    await conversation.save();

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

export const markCompleted = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findOne({ _id: id, workspaceId: req.user.workspaceId });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    conversation.isCompleted = true;
    await conversation.save();

    await ActivityLog.create({
      workspaceId: req.user.workspaceId,
      conversationId: conversation._id,
      userId: req.user._id,
      actorRole: req.user.role,
      action: 'COMPLETED',
      description: `Thread "${conversation.subject}" marked as completed.`,
    });

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

// Client View Action: Mark as handled
export const clientHandle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findOne({ _id: id, workspaceId: req.user.workspaceId });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    conversation.isCompleted = true;
    conversation.classification.label = 'No Reply Needed';
    conversation.classification.reason = 'Client marked as handled directly.';
    conversation.classification.updatedAt = new Date();
    await conversation.save();

    await ActivityLog.create({
      workspaceId: req.user.workspaceId,
      conversationId: conversation._id,
      userId: req.user._id,
      actorRole: 'client',
      action: 'CLIENT_HANDLED',
      description: `Client marked "${conversation.subject}" as handled.`,
      metadata: { subject: conversation.subject },
    });

    res.status(200).json({ success: true, message: 'Marked as handled', data: conversation });
  } catch (error) {
    next(error);
  }
};

// Client View Action: Ask my assistant to take over
export const clientHandOff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findOne({ _id: id, workspaceId: req.user.workspaceId });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const note = req.body.note?.trim();
    conversation.classification.label = 'Assistant to Reply';
    conversation.classification.reason = note
      ? `Client requested assistant take-over: "${note}".`
      : 'Client requested assistant take-over.';
    conversation.classification.source = 'manual';
    conversation.classification.updatedAt = new Date();
    conversation.assignedTo = 'assistant';
    await conversation.save();

    await ActivityLog.create({
      workspaceId: req.user.workspaceId,
      conversationId: conversation._id,
      userId: req.user._id,
      actorRole: 'client',
      action: 'CLIENT_HANDED_OFF',
      description: `Client requested assistant take over "${conversation.subject}"${note ? ` with note: "${note}"` : ''}.`,
      metadata: { subject: conversation.subject, note },
    });

    res.status(200).json({ success: true, message: 'Assigned to assistant', data: conversation });
  } catch (error) {
    next(error);
  }
};

// Client View Action: Undo handled action
export const clientUndoHandle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findOne({ _id: id, workspaceId: req.user.workspaceId });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    conversation.isCompleted = false;
    conversation.classification.label = 'Client to Reply';
    conversation.classification.reason = 'Action undone by client.';
    conversation.classification.updatedAt = new Date();
    conversation.assignedTo = 'client';
    await conversation.save();

    await ActivityLog.create({
      workspaceId: req.user.workspaceId,
      conversationId: conversation._id,
      userId: req.user._id,
      actorRole: 'client',
      action: 'CLIENT_HANDLE_UNDONE',
      description: `Client restored "${conversation.subject}" to their action queue.`,
      metadata: { subject: conversation.subject },
    });

    res.status(200).json({ success: true, message: 'Handled action undone', data: conversation });
  } catch (error) {
    next(error);
  }
};
