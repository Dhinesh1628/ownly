/**
 * Email Provider Abstract Interface
 * Defines the contract that any email provider (Gmail, Outlook, IMAP) must fulfill.
 */
export class EmailProviderInterface {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Generates the OAuth authorization URL or simulated consent parameters.
   */
  async getAuthUrl(workspaceId, state = {}) {
    throw new Error('Method getAuthUrl() must be implemented.');
  }

  /**
   * Exchanges authorization code for provider credentials/tokens.
   */
  async exchangeCodeForTokens(code) {
    throw new Error('Method exchangeCodeForTokens() must be implemented.');
  }

  /**
   * Fetches latest threads/messages for synchronization.
   */
  async syncEmails(account, options = {}) {
    throw new Error('Method syncEmails() must be implemented.');
  }

  /**
   * Sends an outbound email message through the provider.
   */
  async sendMessage(account, messagePayload) {
    throw new Error('Method sendMessage() must be implemented.');
  }
}
