import { Conversation, Message, ActivityLog } from '../models/index.js';
import { generateDraftReply } from '../services/ai/aiService.js';

export const draftReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tone = 'formal' } = req.body;

    const conversation = await Conversation.findOne({ _id: id, workspaceId: req.user.workspaceId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId: conversation._id }).sort({ sentAt: 1 });
    const draft = await generateDraftReply({
      conversation,
      messages,
      tone,
    });

    res.status(200).json({
      success: true,
      data: draft,
    });
  } catch (error) {
    next(error);
  }
};

export const sendReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, subject, tone } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ success: false, message: 'Reply body cannot be empty' });
    }

    const conversation = await Conversation.findOne({ _id: id, workspaceId: req.user.workspaceId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Determine sender based on role
    const senderName = req.user.role === 'client' ? req.user.name : `${req.user.name} on behalf of Client`;
    const senderEmail = req.user.role === 'client' ? 'alex.hastings@gmail.com' : 'assistant@executive.ai';

    const outboundMessage = await Message.create({
      conversationId: conversation._id,
      from: { name: senderName, email: senderEmail },
      to: conversation.participants,
      subject: subject || (conversation.subject.startsWith('Re:') ? conversation.subject : `Re: ${conversation.subject}`),
      body: body.trim(),
      direction: 'outbound',
      sentAt: new Date(),
    });

    // Update conversation state:
    // When reply is sent, user is now awaiting response from the external party
    conversation.awaitingResponse = true;
    conversation.lastMessageAt = new Date();
    conversation.snippet = body.trim().slice(0, 160).replace(/[\r\n]+/g, ' ');

    // Add "Waiting for Response" segment if not present
    if (!conversation.segments.includes('Waiting for Response')) {
      conversation.segments.push('Waiting for Response');
    }

    await conversation.save();

    await ActivityLog.create({
      workspaceId: req.user.workspaceId,
      conversationId: conversation._id,
      userId: req.user._id,
      actorRole: req.user.role,
      action: 'REPLY_SENT',
      description: `Outbound response sent to ${conversation.participants?.[0]?.name || 'recipient'}. Thread marked "Waiting for Response".`,
      metadata: { messageId: outboundMessage._id, subject: conversation.subject, tone },
    });

    res.status(201).json({
      success: true,
      message: 'Reply sent successfully. Conversation updated to Waiting for Response.',
      data: {
        message: outboundMessage,
        conversation,
      },
    });
  } catch (error) {
    next(error);
  }
};
