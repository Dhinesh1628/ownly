import { EmailAccount, Conversation, ActivityLog } from '../models/index.js';
import { gmailProvider } from '../providers/gmail.js';
import { outlookProvider } from '../providers/outlook.js';

export const getAccounts = async (req, res, next) => {
  try {
    const accounts = await EmailAccount.find({ workspaceId: req.user.workspaceId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuthUrl = async (req, res, next) => {
  try {
    const { provider = 'gmail' } = req.query;
    const providerImpl = provider === 'outlook' ? outlookProvider : gmailProvider;
    const authData = await providerImpl.getAuthUrl(req.user.workspaceId);

    res.status(200).json({
      success: true,
      data: authData,
    });
  } catch (error) {
    next(error);
  }
};

export const connectAccount = async (req, res, next) => {
  try {
    const { provider = 'gmail', address, displayName } = req.body;
    const emailAddress = address || (provider === 'gmail' ? 'alex.hastings@gmail.com' : 'alex.hastings@outlook.com');

    let account = await EmailAccount.findOne({
      workspaceId: req.user.workspaceId,
      address: emailAddress,
    });

    if (account) {
      account.status = 'connected';
      account.lastSyncedAt = new Date();
      await account.save();
    } else {
      account = await EmailAccount.create({
        workspaceId: req.user.workspaceId,
        provider,
        address: emailAddress,
        displayName: displayName || `${req.user.name}'s ${provider.toUpperCase()}`,
        status: 'connected',
        lastSyncedAt: new Date(),
        isSimulated: true,
      });
    }

    const conversationCount = await Conversation.countDocuments({ workspaceId: req.user.workspaceId });
    account.emailCount = conversationCount;
    await account.save();

    await ActivityLog.create({
      workspaceId: req.user.workspaceId,
      userId: req.user._id,
      actorRole: req.user.role,
      action: 'ACCOUNT_CONNECTED',
      description: `Simulated ${provider.toUpperCase()} account connected: ${emailAddress}`,
      metadata: { provider, address: emailAddress },
    });

    res.status(201).json({
      success: true,
      message: `${provider.toUpperCase()} account successfully linked`,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const resyncAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const account = await EmailAccount.findOne({ _id: id, workspaceId: req.user.workspaceId });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    account.status = 'connected';
    account.lastSyncedAt = new Date();
    await account.save();

    await ActivityLog.create({
      workspaceId: req.user.workspaceId,
      userId: req.user._id,
      actorRole: req.user.role,
      action: 'ACCOUNT_RESYNCED',
      description: `Refreshed and synchronized email stream for ${account.address}`,
      metadata: { accountId: account._id },
    });

    res.status(200).json({
      success: true,
      message: 'Account synchronized successfully',
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const disconnectAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const account = await EmailAccount.findOne({ _id: id, workspaceId: req.user.workspaceId });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    await EmailAccount.findByIdAndDelete(id);

    await ActivityLog.create({
      workspaceId: req.user.workspaceId,
      userId: req.user._id,
      actorRole: req.user.role,
      action: 'ACCOUNT_DISCONNECTED',
      description: `Account ${account.address} was disconnected`,
      metadata: { address: account.address },
    });

    res.status(200).json({
      success: true,
      message: 'Account disconnected successfully',
    });
  } catch (error) {
    next(error);
  }
};
