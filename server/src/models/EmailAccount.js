import mongoose from 'mongoose';

const emailAccountSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['gmail', 'outlook'],
      required: true,
    },
    address: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['connected', 'syncing', 'error'],
      default: 'connected',
    },
    syncError: {
      type: String,
      default: null,
    },
    emailCount: {
      type: Number,
      default: 0,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    isSimulated: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

emailAccountSchema.index({ workspaceId: 1, address: 1 }, { unique: true });

export const EmailAccount = mongoose.model('EmailAccount', emailAccountSchema);
