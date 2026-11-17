import { Conversation } from '../models/index.js';
import { getAIStatus } from '../services/ai/aiService.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const workspaceId = req.user.workspaceId;

    const [
      total,
      unread,
      important,
      awaitingResponse,
      assistantToReply,
      clientToReply,
      noReplyNeeded,
      needsReview,
      archived,
      completed,
      meetingsCount,
      generalCount,
    ] = await Promise.all([
      Conversation.countDocuments({ workspaceId, isArchived: { $ne: true } }),
      Conversation.countDocuments({ workspaceId, isRead: false, isArchived: { $ne: true } }),
      Conversation.countDocuments({ workspaceId, isImportant: true, isArchived: { $ne: true } }),
      Conversation.countDocuments({ workspaceId, awaitingResponse: true, isArchived: { $ne: true } }),
      Conversation.countDocuments({ workspaceId, 'classification.label': 'Assistant to Reply', isArchived: { $ne: true } }),
      Conversation.countDocuments({ workspaceId, 'classification.label': 'Client to Reply', isArchived: { $ne: true } }),
      Conversation.countDocuments({ workspaceId, 'classification.label': 'No Reply Needed', isArchived: { $ne: true } }),
      Conversation.countDocuments({ workspaceId, 'classification.needsReview': true, isArchived: { $ne: true } }),
      Conversation.countDocuments({ workspaceId, isArchived: true }),
      Conversation.countDocuments({ workspaceId, isCompleted: true }),
      Conversation.countDocuments({
        workspaceId,
        isArchived: { $ne: true },
        $or: [
          { segments: 'Meetings & Appointments' },
          { 'extracted.meetings.0': { $exists: true } },
        ],
      }),
      Conversation.countDocuments({ workspaceId, segments: 'General', isArchived: { $ne: true } }),
    ]);

    // Action Required: threads needing either assistant or client reply
    const actionRequired = assistantToReply + clientToReply;

    // Upcoming meetings extracted from emails
    const meetingConversations = await Conversation.find({
      workspaceId,
      isArchived: { $ne: true },
      'extracted.meetings.0': { $exists: true },
    })
      .sort({ lastMessageAt: -1 })
      .limit(8)
      .lean();

    const upcomingMeetings = [];
    for (const c of meetingConversations) {
      const primaryPerson = c.participants?.[0]?.name || c.participants?.[0]?.email?.split('@')[0] || 'Contact';
      if (c.extracted?.meetings) {
        for (const m of c.extracted.meetings) {
          upcomingMeetings.push({
            conversationId: c._id,
            subject: c.subject,
            title: m.title || 'Meeting',
            date: m.date || 'Upcoming',
            time: m.time || 'TBD',
            person: primaryPerson,
            attendees: m.attendees?.length > 0 ? m.attendees : [primaryPerson],
          });
        }
      }
    }

    // Top 5 Needs Review Shortcut items
    const needsReviewItems = await Conversation.find({
      workspaceId,
      isArchived: { $ne: true },
      $or: [
        { 'classification.needsReview': true },
        { 'classification.confidence': { $lt: 0.65 } },
      ],
    })
      .sort({ lastMessageAt: -1 })
      .limit(5)
      .select('_id subject participants classification lastMessageAt snippet')
      .lean();

    res.status(200).json({
      success: true,
      stats: {
        total,
        unread,
        important,
        actionRequired,
        awaitingResponse,
        assignedToAssistant: assistantToReply,
        needsClient: clientToReply,
        noReplyNeeded,
        needsReview,
        archived,
        completed,
        meetingsCount,
        general: generalCount,
      },
      segments: {
        all: total,
        'assistant-to-reply': assistantToReply,
        'client-to-reply': clientToReply,
        'no-reply-needed': noReplyNeeded,
        'action-required': actionRequired,
        'waiting-for-response': awaitingResponse,
        'meetings-appointments': meetingsCount,
        important,
        general: generalCount,
        'needs-review': needsReview,
        archived,
      },
      upcomingMeetings: upcomingMeetings.slice(0, 5),
      needsReviewItems: needsReviewItems.map((item) => ({
        conversationId: item._id,
        subject: item.subject,
        sender: item.participants?.[0]?.name || item.participants?.[0]?.email || 'Unknown',
        confidence: item.classification?.confidence ?? 0.58,
        reason: item.classification?.reason || 'Confidence below 65%. Please verify responsibility.',
        lastMessageAt: item.lastMessageAt,
      })),
      aiStatus: getAIStatus(),
    });
  } catch (error) {
    next(error);
  }
};
