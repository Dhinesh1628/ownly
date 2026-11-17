import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import { User, Workspace, EmailAccount, Conversation, Message, ActivityLog } from '../models/index.js';
import { rawSeedEmails } from './seedData.js';

export const runSeed = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Cleaning up previous collections...');
    await Promise.all([
      User.deleteMany({}),
      Workspace.deleteMany({}),
      EmailAccount.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);

    console.log('[Seed] Creating primary executive workspace...');
    const workspace = await Workspace.create({
      name: 'Hastings Ventures',
      settings: {
        aiModel: 'claude-3-5-sonnet-20241022',
        confidenceThreshold: 0.65,
        autoSyncIntervalMinutes: 15,
        notifyOnClientAction: true,
        timezone: 'America/Los_Angeles',
      },
    });

    console.log('[Seed] Creating demo accounts (Assistant & Client)...');
    const assistantUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'assistant@executive.ai',
      password: 'password123',
      role: 'assistant',
      workspaceId: workspace._id,
      avatar: '', // Clean initials, no stock photos
    });

    const clientUser = await User.create({
      name: 'Alex Hastings',
      email: 'alex.hastings@acme.com',
      password: 'password123',
      role: 'client',
      workspaceId: workspace._id,
      avatar: '', // Clean initials, no stock photos
      clientInfo: {
        title: 'Founder & CEO',
        company: 'Hastings Ventures',
        phone: '+1 (415) 890-2144',
      },
    });

    workspace.ownerId = clientUser._id;
    await workspace.save();

    console.log('[Seed] Connecting simulated Gmail account...');
    const emailAccount = await EmailAccount.create({
      workspaceId: workspace._id,
      provider: 'gmail',
      address: 'alex.hastings@gmail.com',
      displayName: 'Alex Hastings (Work)',
      status: 'connected',
      emailCount: rawSeedEmails.length,
      lastSyncedAt: new Date(),
      isSimulated: true,
    });

    console.log(`[Seed] Seeding ${rawSeedEmails.length} rich conversations and message threads...`);
    for (const item of rawSeedEmails) {
      const messagesData = item.messages || [];
      const latestMessage = messagesData[messagesData.length - 1] || {};

      const conversation = await Conversation.create({
        workspaceId: workspace._id,
        accountId: emailAccount._id,
        subject: item.subject,
        snippet: (latestMessage.body || '').slice(0, 160).replace(/[\r\n]+/g, ' '),
        participants: item.participants,
        lastMessageAt: item.lastMessageAt || new Date(),
        isRead: item.isRead ?? false,
        isImportant: item.isImportant ?? false,
        isArchived: item.isArchived ?? false,
        isCompleted: item.isCompleted ?? false,
        segments: item.segments || ['General'],
        classification: {
          label: item.classification.label,
          confidence: item.classification.confidence,
          reason: item.classification.reason,
          needsReview: item.classification.needsReview ?? false,
          source: item.classification.source || 'ai',
          updatedAt: new Date(),
        },
        summary: item.summary || item.subject,
        extracted: item.extracted || { dates: [], deadlines: [], meetings: [], amounts: [] },
        awaitingResponse: item.awaitingResponse ?? false,
        assignedTo: item.assignedTo || 'assistant',
      });

      if (messagesData.length > 0) {
        const preparedMessages = messagesData.map((m) => ({
          conversationId: conversation._id,
          from: m.from,
          to: [{ name: 'Alex Hastings', email: 'alex.hastings@gmail.com' }],
          subject: m.subject || conversation.subject,
          body: m.body,
          sentAt: m.sentAt || conversation.lastMessageAt,
          direction: m.direction || 'inbound',
        }));
        await Message.insertMany(preparedMessages);
      }
    }

    console.log('[Seed] Creating initial audit activity logs...');
    await ActivityLog.create([
      {
        workspaceId: workspace._id,
        userId: assistantUser._id,
        actorRole: 'assistant',
        action: 'WORKSPACE_INITIALIZED',
        description: 'Workspace initialized for Hastings Ventures.',
        metadata: { workspaceName: workspace.name },
      },
      {
        workspaceId: workspace._id,
        userId: assistantUser._id,
        actorRole: 'system',
        action: 'SYNC_COMPLETED',
        description: `Mailbox sync completed for ${emailAccount.address}. Loaded 45 threads.`,
        metadata: { count: rawSeedEmails.length, provider: 'gmail' },
      },
    ]);

    console.log('[Seed] Completed successfully (zero stock photos)!');
    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  }
};

if (process.argv[1]?.endsWith('seedRunner.js')) {
  runSeed();
}
