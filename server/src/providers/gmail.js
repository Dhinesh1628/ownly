import { EmailProviderInterface } from './emailProviderInterface.js';

export class GmailProvider extends EmailProviderInterface {
  constructor(config = {}) {
    super(config);
    this.name = 'Gmail';
    this.type = 'gmail';
  }

  async getAuthUrl(workspaceId, state = {}) {
    // Realistic Google OAuth consent parameters for simulation
    return {
      provider: 'gmail',
      authUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=simulated-google-client-id&redirect_uri=${encodeURIComponent(
        'http://localhost:5173/onboarding/callback'
      )}&response_type=code&scope=https://www.googleapis.com/auth/gmail.modify&state=${workspaceId}`,
      simulated: true,
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    };
  }

  async exchangeCodeForTokens(code) {
    // In simulated mode, return valid mock tokens
    return {
      accessToken: `ya29.simulated_access_token_${Date.now()}`,
      refreshToken: `1//0g_simulated_refresh_token_${Date.now()}`,
      expiresIn: 3600,
      tokenType: 'Bearer',
      scope: 'https://www.googleapis.com/auth/gmail.modify',
    };
  }

  async syncEmails(account, options = {}) {
    return {
      success: true,
      provider: 'gmail',
      accountAddress: account.address,
      syncedBatchCount: options.count || 45,
      simulated: true,
      lastSyncedAt: new Date(),
    };
  }

  async sendMessage(account, messagePayload) {
    return {
      success: true,
      messageId: `gmail_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      provider: 'gmail',
      sentAt: new Date(),
      status: 'SENT',
    };
  }
}

export const gmailProvider = new GmailProvider();
