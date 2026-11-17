import { EmailProviderInterface } from './emailProviderInterface.js';

export class OutlookProvider extends EmailProviderInterface {
  constructor(config = {}) {
    super(config);
    this.name = 'Microsoft Outlook';
    this.type = 'outlook';
  }

  async getAuthUrl(workspaceId, state = {}) {
    return {
      provider: 'outlook',
      authUrl: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=simulated-ms-client-id&response_type=code&redirect_uri=${encodeURIComponent(
        'http://localhost:5173/onboarding/callback'
      )}&response_mode=query&scope=Mail.ReadWrite%20User.Read&state=${workspaceId}`,
      simulated: true,
      scopes: ['Mail.ReadWrite', 'Mail.Send', 'User.Read', 'offline_access'],
    };
  }

  async exchangeCodeForTokens(code) {
    return {
      accessToken: `EwB4A8l6BAAU_simulated_token_${Date.now()}`,
      refreshToken: `M.R3_simulated_token_${Date.now()}`,
      expiresIn: 3600,
      tokenType: 'Bearer',
      scope: 'Mail.ReadWrite Mail.Send',
    };
  }

  async syncEmails(account, options = {}) {
    return {
      success: true,
      provider: 'outlook',
      accountAddress: account.address,
      syncedBatchCount: options.count || 45,
      simulated: true,
      lastSyncedAt: new Date(),
    };
  }

  async sendMessage(account, messagePayload) {
    return {
      success: true,
      messageId: `outlook_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      provider: 'outlook',
      sentAt: new Date(),
      status: 'SENT',
    };
  }
}

export const outlookProvider = new OutlookProvider();
