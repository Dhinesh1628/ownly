import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  { _id: false }
);

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    date: { type: String, default: '' },
    time: { type: String, default: '' },
    attendees: [{ type: String }],
  },
  { _id: false }
);

const classificationSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      enum: ['Assistant to Reply', 'Client to Reply', 'No Reply Needed'],
      required: true,
      default: 'No Reply Needed',
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.9,
    },
    reason: {
      type: String,
      default: '',
    },
    needsReview: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ['ai', 'manual'],
      default: 'ai',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    overriddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    overriddenAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const extractedSchema = new mongoose.Schema(
  {
    dates: [{ type: String }],
    deadlines: [{ type: String }],
    meetings: [meetingSchema],
    amounts: [{ type: String }],
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmailAccount',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    snippet: {
      type: String,
      default: '',
    },
    participants: [participantSchema],
    lastMessageAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    segments: [
      {
        type: String,
        trim: true,
      },
    ],
    classification: {
      type: classificationSchema,
      required: true,
      default: () => ({}),
    },
    summary: {
      type: String,
      default: '',
    },
    extracted: {
      type: extractedSchema,
      default: () => ({ dates: [], deadlines: [], meetings: [], amounts: [] }),
    },
    awaitingResponse: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: String,
      enum: ['assistant', 'client', 'none'],
      default: 'assistant',
    },
  },
  {
    timestamps: true,
  }
);

// High-performance compound indexes for search, segment queries, and sorting
conversationSchema.index({ workspaceId: 1, lastMessageAt: -1 });
conversationSchema.index({ workspaceId: 1, isArchived: 1, 'classification.label': 1 });
conversationSchema.index({ workspaceId: 1, isArchived: 1, awaitingResponse: 1 });
conversationSchema.index({ workspaceId: 1, isArchived: 1, isImportant: 1 });
conversationSchema.index({ workspaceId: 1, 'classification.needsReview': 1 });
conversationSchema.index({ subject: 'text', snippet: 'text', summary: 'text' });

export const Conversation = mongoose.model('Conversation', conversationSchema);
