import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      default: 'Primary Executive Workspace',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    settings: {
      aiModel: {
        type: String,
        default: 'claude-3-5-sonnet-20241022',
      },
      confidenceThreshold: {
        type: Number,
        default: 0.65,
      },
      autoSyncIntervalMinutes: {
        type: Number,
        default: 15,
      },
      notifyOnClientAction: {
        type: Boolean,
        default: true,
      },
      timezone: {
        type: String,
        default: 'America/Los_Angeles',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Workspace = mongoose.model('Workspace', workspaceSchema);
