import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    from: {
      type: contactSchema,
      required: true,
    },
    to: [
      {
        type: contactSchema,
      },
    ],
    cc: [
      {
        type: contactSchema,
      },
    ],
    subject: {
      type: String,
      default: '',
    },
    body: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true,
      default: 'inbound',
    },
    messageId: {
      type: String,
      default: () => `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversationId: 1, sentAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
