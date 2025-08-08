
// ClickSend SMS Service Integration
// Using the ClickSend API for sending SMS messages with provided credentials

export interface ClickSendConfig {
  username: string;
  apiKey: string;
  fromNumber: string;
  testMode: boolean;
  webhookUrl?: string;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
  status?: string;
  clickSendMessageId?: string;
}

export interface SMSMessage {
  to: string;
  message: string;
  type?: string;
  templateId?: number;
  placeholders?: Record<string, string>;
}

class ClickSendSMSService {
  private config: ClickSendConfig | null = null;
  private isConfigured: boolean = false;
  private testNumbers: string[] = [];
  private apiBaseUrl = 'https://rest.clicksend.com/v3';

  constructor() {
    // Don't auto-initialize to prevent startup errors
  }

  async configure(config: ClickSendConfig) {
    this.config = config;
    this.isConfigured = true;

    try {
      console.log('✅ ClickSend SMS service configured');
    } catch (error) {
      console.error('❌ Failed to configure ClickSend:', error);
      this.isConfigured = false;
      throw error;
    }
  }

  async initializeWithCredentials() {
    try {
      await this.configure({
        username: 'mobil3801beach@gmail.com',
        apiKey: '54DC23E4-34D7-C6B1-0601-112E36A46B49',
        fromNumber: 'DFS',
        testMode: false,
        webhookUrl: undefined
      });
      console.log('🚀 ClickSend SMS service initialized with provided credentials');
    } catch (error) {
      console.error('❌ Failed to initialize ClickSend with provided credentials:', error);
      throw error;
    }
  }

  private async makeClickSendRequest(method: string, endpoint: string, data?: any): Promise<any> {
    if (!this.config) {
      throw new Error('SMS service not configured');
    }

    const url = `${this.apiBaseUrl}${endpoint}`;
    const credentials = btoa(`${this.config.username}:${this.config.apiKey}`);

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.response_msg || result.error_message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('ClickSend API request failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    if (!this.isConfigured || !this.config) {
      return {
        success: false,
        error: 'SMS service not configured. Please configure ClickSend settings.'
      };
    }

    try {
      const smsMessage = {
        source: this.config?.fromNumber || 'DFS',
        to: message.to,
        body: message.message
      };

      const smsCollection = {
        messages: [smsMessage]
      };

      const response = await this.makeClickSendRequest('POST', '/sms/send', smsCollection);

      if (response.success && response.data?.data?.messages?.[0]) {
        const messageResult = response.data.data.messages[0];

        return {
          success: messageResult.status === 'SUCCESS',
          messageId: messageResult.message_id,
          clickSendMessageId: messageResult.message_id,
          cost: parseFloat(messageResult.message_price) || 0,
          status: messageResult.status,
          error: messageResult.status !== 'SUCCESS' ? messageResult.custom_string : undefined
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to send SMS'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async testSMS(phoneNumber: string): Promise<SMSResponse> {
    const testMessage = {
      to: phoneNumber,
      message: `DFS Manager SMS Test - ${new Date().toLocaleString()}. SMS service is working correctly.`,
      type: 'test'
    };
    return this.sendSMS(testMessage);
  }

  isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  getConfiguration(): ClickSendConfig | null {
    return this.config;
  }

  async getServiceStatus(): Promise<{
    available: boolean;
    message: string;
    providers?: any;
    quota?: any;
  }> {
    try {
      if (!this.isConfigured) {
        return {
          available: false,
          message: 'SMS service not configured. Please configure ClickSend settings.'
        };
      }

      return {
        available: this.isConfigured,
        message: this.isConfigured ? 'ClickSend SMS service is ready' : 'ClickSend connection failed',
        providers: [{ name: 'ClickSend', available: this.isConfigured }],
        quota: { quotaRemaining: 0 }
      };
    } catch (error) {
      console.error('Error checking service status:', error);
      return {
        available: false,
        message: 'Error checking service status'
      };
    }
  }
}

// Create a single instance but don't initialize it automatically
export const clickSendSmsService = new ClickSendSMSService();
export const smsService = clickSendSmsService;
export default clickSendSmsService;
