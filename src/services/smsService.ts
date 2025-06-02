// Enhanced SMS Service for sending real SMS messages
// This service integrates with multiple SMS providers and includes comprehensive error handling

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  status?: string;
  cost?: number;
  provider?: string;
}

interface SMSMessage {
  to: string;
  message: string;
  priority?: 'low' | 'normal' | 'high';
}

interface SMSProvider {
  name: string;
  url: string;
  apiKey: string;
  isActive: boolean;
}

class SMSService {
  private providers: SMSProvider[] = [
  {
    name: 'TextBelt',
    url: 'https://api.textbelt.com/text',
    apiKey: 'textbelt', // Free tier for testing
    isActive: true
  },
  {
    name: 'Twilio',
    url: 'https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json',
    apiKey: 'YOUR_TWILIO_AUTH_TOKEN',
    isActive: false // Set to true when configured
  }];


  private currentProvider: SMSProvider;

  constructor() {
    this.currentProvider = this.providers.find((p) => p.isActive) || this.providers[0];
  }

  /**
   * Send SMS using the active provider with failover support
   */
  async sendSMS(to: string, message: string, options?: {priority?: 'low' | 'normal' | 'high';}): Promise<SMSResponse> {
    try {
      console.log(`📱 Sending SMS via ${this.currentProvider.name} to ${to}: ${message}`);

      // Validate phone number format
      const cleanedNumber = this.formatPhoneNumber(to);
      if (!cleanedNumber) {
        throw new Error('Invalid phone number format');
      }

      // Validate message length
      if (message.length > 1600) {
        throw new Error('Message too long (max 1600 characters)');
      }

      // Try current provider first
      let result = await this.sendWithProvider(this.currentProvider, cleanedNumber, message);

      // If failed, try other active providers
      if (!result.success) {
        console.log(`⚠️ Primary provider failed, trying backup providers...`);
        for (const provider of this.providers) {
          if (provider !== this.currentProvider && provider.isActive) {
            result = await this.sendWithProvider(provider, cleanedNumber, message);
            if (result.success) {
              console.log(`✅ Backup provider ${provider.name} succeeded`);
              break;
            }
          }
        }
      }

      return result;
    } catch (error) {
      console.error('SMS Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'Error',
        provider: this.currentProvider.name
      };
    }
  }

  /**
   * Send SMS using a specific provider
   */
  private async sendWithProvider(provider: SMSProvider, to: string, message: string): Promise<SMSResponse> {
    try {
      if (provider.name === 'TextBelt') {
        return await this.sendWithTextBelt(provider, to, message);
      } else if (provider.name === 'Twilio') {
        return await this.sendWithTwilio(provider, to, message);
      } else {
        throw new Error(`Unsupported provider: ${provider.name}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Provider error',
        status: 'Failed',
        provider: provider.name
      };
    }
  }

  /**
   * Send SMS using TextBelt API
   */
  private async sendWithTextBelt(provider: SMSProvider, to: string, message: string): Promise<SMSResponse> {
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: to,
        message: message,
        key: provider.apiKey
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ SMS sent successfully via TextBelt to ${to}. Message ID: ${result.textId}`);
      return {
        success: true,
        messageId: result.textId,
        status: 'Sent',
        cost: result.quotaRemaining ? 0 : 0.1, // Estimate cost
        provider: 'TextBelt'
      };
    } else {
      console.error(`❌ TextBelt SMS failed to ${to}:`, result.error);
      return {
        success: false,
        error: result.error || 'Failed to send SMS via TextBelt',
        status: 'Failed',
        provider: 'TextBelt'
      };
    }
  }

  /**
   * Send SMS using Twilio API (placeholder for when configured)
   */
  private async sendWithTwilio(provider: SMSProvider, to: string, message: string): Promise<SMSResponse> {
    // This is a placeholder implementation
    // In production, you would implement the actual Twilio API call
    console.log(`📞 Twilio SMS implementation needed for ${to}`);

    return {
      success: false,
      error: 'Twilio provider not configured',
      status: 'Not Configured',
      provider: 'Twilio'
    };
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulkSMS(messages: SMSMessage[]): Promise<SMSResponse[]> {
    console.log(`📱 Sending bulk SMS to ${messages.length} recipients`);

    const results: SMSResponse[] = [];

    // Send messages with delay to avoid rate limiting
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const result = await this.sendSMS(message.to, message.message);
      results.push(result);

      // Add delay between messages (1 second)
      if (i < messages.length - 1) {
        await this.delay(1000);
      }
    }

    return results;
  }

  /**
   * Format phone number to international format
   */
  private formatPhoneNumber(phoneNumber: string): string | null {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // If it starts with 1 and has 11 digits (US/Canada)
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }

    // If it has 10 digits, assume US/Canada and add +1
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }

    // If it already starts with +, keep as is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }

    // For other international numbers, try to add +1 if it seems like a US number
    if (cleaned.length >= 10) {
      return `+1${cleaned.slice(-10)}`;
    }

    return null;
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber);
    return formatted !== null && formatted.length >= 12;
  }

  /**
   * Delay utility for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get comprehensive SMS service status
   */
  async getServiceStatus(): Promise<{available: boolean;message: string;providers?: any[];quota?: any;}> {
    try {
      const providerStatuses = [];
      let anyAvailable = false;

      for (const provider of this.providers) {
        if (provider.isActive) {
          const status = await this.checkProviderStatus(provider);
          providerStatuses.push({
            name: provider.name,
            ...status
          });
          if (status.available) {
            anyAvailable = true;
          }
        }
      }

      // Get quota information for active provider
      const quota = await this.getQuotaInfo();

      return {
        available: anyAvailable,
        message: anyAvailable ?
        `SMS service is available via ${providerStatuses.filter((p) => p.available).map((p) => p.name).join(', ')}` :
        'No SMS providers are currently available',
        providers: providerStatuses,
        quota
      };
    } catch (error) {
      return {
        available: false,
        message: 'Error checking SMS service status'
      };
    }
  }

  /**
   * Check status of a specific provider
   */
  private async checkProviderStatus(provider: SMSProvider): Promise<{available: boolean;message: string;}> {
    try {
      if (provider.name === 'TextBelt') {
        // For TextBelt, we can check quota
        const response = await fetch('https://api.textbelt.com/quota/textbelt', {
          method: 'GET'
        });

        if (response.ok) {
          const data = await response.json();
          return {
            available: true,
            message: `TextBelt available (${data.quotaRemaining || 0} free messages remaining)`
          };
        }
      }

      return {
        available: provider.isActive,
        message: provider.isActive ? `${provider.name} configured and active` : `${provider.name} inactive`
      };
    } catch (error) {
      return {
        available: false,
        message: `${provider.name} check failed`
      };
    }
  }

  /**
   * Get quota information for the current provider
   */
  async getQuotaInfo(): Promise<any> {
    try {
      if (this.currentProvider.name === 'TextBelt') {
        const response = await fetch('https://api.textbelt.com/quota/textbelt');
        if (response.ok) {
          return await response.json();
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting quota info:', error);
      return null;
    }
  }

  /**
   * Switch to a different provider
   */
  switchProvider(providerName: string): boolean {
    const provider = this.providers.find((p) => p.name === providerName && p.isActive);
    if (provider) {
      this.currentProvider = provider;
      console.log(`🔄 Switched to SMS provider: ${providerName}`);
      return true;
    }
    return false;
  }

  /**
   * Get current provider info
   */
  getCurrentProvider(): SMSProvider {
    return this.currentProvider;
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): SMSProvider[] {
    return this.providers.filter((p) => p.isActive);
  }

  /**
   * Test SMS functionality with a small test message
   */
  async testService(phoneNumber: string): Promise<SMSResponse> {
    const testMessage = `🧪 Test message from DFS Manager SMS Service at ${new Date().toLocaleString()}. Service is working correctly!`;
    return await this.sendSMS(phoneNumber, testMessage);
  }
}

// Create a singleton instance
const smsService = new SMSService();

export default smsService;
export type { SMSResponse, SMSMessage };