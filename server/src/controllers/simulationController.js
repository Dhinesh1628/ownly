import { Conversation, Message, ActivityLog } from '../models/index.js';
import { classifyEmailThread } from '../services/ai/aiService.js';

export const simulateIncomingEmail = async (req, res, next) => {
  try {
    const {
      conversationId,
      senderName = 'Emily Chen (VP Partnerships)',
      senderEmail = 'echen@stripe.com',
      subject,
      body,
      isHighPriority = false,
    } = req.body;

    let conversation;

    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        workspaceId: req.user.workspaceId,
      });
    }

    // Default simulated sample content if not provided
    const sampleBodies = [
      'Hi team, following up on our integration agreement. Our legal team reviewed the contract and needs founder countersignature by 5 PM today.',
      'Can we reschedule our check-in call from Thursday to Friday 11 AM? Please let me know if that slot works for your calendar.',
      'FYI: We have finalized the monthly transaction reconciliation. No further action needed.',
      'Urgent: The board term sheet needs your personal authorization before we can wire the initial tranche.',
    ];

    const messageBody = body || sampleBodies[Math.floor(Math.random() * sampleBodies.length)];
    const messageSubject = subject || (conversation ? `Re: ${conversation.subject}` : 'New Inbound Partnership Request');

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        workspaceId: req.user.workspaceId,
        accountId: req.body.accountId || (await Conversation.findOne({ workspaceId: req.user.workspaceId }))?.accountId,
        subject: messageSubject,
        snippet: messageBody.slice(0, 140),
        participants: [{ name: senderName, email: senderEmail }],
        lastMessageAt: new Date(),
        isRead: false,
        isImportant: isHighPriority,
        isArchived: false,
        isCompleted: false,
        segments: ['General'],
        classification: {
          label: 'Assistant to Reply',
          confidence: 0.8,
          reason: 'Evaluating initial incoming thread...',
        },
      });
    }

    // Add new inbound message to thread
    const newMsg = await Message.create({
      conversationId: conversation._id,
      from: { name: senderName, email: senderEmail },
      to: [{ name: req.user.name, email: req.user.email }],
      subject: messageSubject,
      body: messageBody,
      sentAt: new Date(),
      direction: 'inbound',
    });

    // Reclassify with full thread history!
    const allMessages = await Message.find({ conversationId: conversation._id }).sort({ sentAt: 1 });
    const aiResult = await classifyEmailThread({
      subject: conversation.subject,
      messages: allMessages,
      latestBody: messageBody,
    });

    // If previously manual override existed, user prompt specifies:
    // "Assistant can manually override (stored as overriddenBy/overriddenAt, so AI will not overwrite a manual override unless the assistant clicks 'Re-run AI')."
    // However, when a new message arrives, reclassify if it was AI or respect override if manual, but update reason/summary:
    if (conversation.classification?.source !== 'manual') {
      conversation.classification = {
        label: aiResult.label,
        confidence: aiResult.confidence,
        reason: aiResult.reason,
        needsReview: aiResult.needsReview,
        source: 'ai',
        updatedAt: new Date(),
      };
      conversation.assignedTo = aiResult.label === 'Client to Reply' ? 'client' : 'assistant';
    }

    conversation.summary = aiResult.summary || conversation.summary;
    conversation.extracted = aiResult.extracted || conversation.extracted;
    conversation.lastMessageAt = new Date();
    conversation.isRead = false;
    conversation.snippet = messageBody.slice(0, 160).replace(/[\r\n]+/g, ' ');
    // When incoming message arrives, we are no longer awaiting response
    conversation.awaitingResponse = false;

    await conversation.save();

    await ActivityLog.create({
      workspaceId: req.user.workspaceId,
      conversationId: conversation._id,
      userId: req.user._id,
      actorRole: 'system',
      action: 'INCOMING_EMAIL_SIMULATED',
      description: `Simulated inbound email from ${senderName} received. Reclassified as "${conversation.classification.label}".`,
      metadata: {
        subject: conversation.subject,
        label: conversation.classification.label,
        confidence: conversation.classification.confidence,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Simulated email received and thread reclassified',
      data: {
        message: newMsg,
        conversation,
      },
    });
  } catch (error) {
    next(error);
  }
};
