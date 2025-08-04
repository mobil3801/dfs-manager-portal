// ClickSend SMS Service Integration
// Using the ClickSend API for sending SMS messages with provided credentials

import { supabase } from '@/lib/supabase';

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

export interface SMSTemplate {
  id: number;
  template_name: string;
  message_content: string;
  template_type: string;
  is_active: boolean;
  priority_level: string;
}

class ClickSendSMSService {
  private config: ClickSendConfig | null = null;
  private isConfigured: boolean = false;
  private testNumbers: string[] = []; // Verified test numbers
  private apiBaseUrl = 'https://rest.clicksend.com/v3';
  private serviceEnabled: boolean = true;

  constructor() {
    // Safely initialize with provided credentials
    this.safeInitialize();
  }

  private async safeInitialize() {
    try {
      // Don't make API calls during initialization to prevent blocking the app
      this.config = {
        username: 'mobil3801beach@gmail.com',
        apiKey: '54DC23E4-34D7-C6B1-0601-112E36A46B49',
        fromNumber: 'DFS',
        testMode: false,
        webhookUrl: undefined
      };
      this.isConfigured = true;
      console.log('📱 ClickSend SMS service initialized (safe mode)');
    } catch (error) {
      console.warn('⚠️ SMS service initialization failed, running in fallback mode:', error);
      this.serviceEnabled = false;
      this.isConfigured = false;
    }
  }

  async configure(config: ClickSendConfig) {
    this.config = config;
    this.isConfigured = true;
    this.serviceEnabled = true;
    console.log('✅ ClickSend SMS service configured');
  }

  async loadConfiguration(): Promise<void> {
    try {
      if (!this.isConfigured) {
        await this.safeInitialize();
      }

      // Safely load configuration from the database without blocking
      const { data, error } = await supabase
        .from('sms_config')
        .select('*')
        .eq('is_enabled', true)
        .order('id', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const config = data[0];
        this.config = {
          username: config.username || 'mobil3801beach@gmail.com',
          apiKey: config.api_key || '54DC23E4-34D7-C6B1-0601-112E36A46B49',
          fromNumber: config.from_number || 'DFS',
          testMode: config.test_mode || false,
          webhookUrl: config.webhook_url
        };
        this.isConfigured = true;
        this.serviceEnabled = true;
      }
    } catch (error) {
      console.warn('SMS configuration loading failed, using defaults:', error);
      // Continue with default configuration
    }
  }

  private async safeApiCall<T>(
    operation: () => Promise<T>,
    fallback: T,
    errorContext: string
  ): Promise<T> {
    if (!this.serviceEnabled) {
      console.warn(`SMS service disabled, skipping ${errorContext}`);
      return fallback;
    }

    try {
      return await operation();
    } catch (error) {
      console.warn(`SMS ${errorContext} failed:`, error);
      // Don't disable service for individual call failures
      return fallback;
    }
  }

  private async makeClickSendRequest(method: string, endpoint: string, data?: any): Promise<any> {
    if (!this.config || !this.serviceEnabled) {
      return { success: false, error: 'SMS service not available' };
    }

    return this.safeApiCall(async () => {
      const url = `${this.apiBaseUrl}${endpoint}`;
      const credentials = btoa(`${this.config!.username}:${this.config!.apiKey}`);

      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
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
    }, { success: false, error: 'API call failed' }, 'API request');
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    if (!this.serviceEnabled) {
      return {
        success: false,
        error: 'SMS service is currently disabled'
      };
    }

    if (!this.isConfigured || !this.config) {
      return {
        success: false,
        error: 'SMS service not configured. Please configure ClickSend settings.'
      };
    }

    return this.safeApiCall(async () => {
      // Validate phone number format
      if (!this.isValidPhoneNumber(message.to)) {
        return {
          success: false,
          error: 'Invalid phone number format. Use E.164 format (+1234567890)'
        };
      }

      // Check test mode restrictions
      if (this.config!.testMode && !this.testNumbers.includes(message.to)) {
        return {
          success: false,
          error: 'Test mode is enabled. Phone number must be verified for testing.'
        };
      }

      // Process template if templateId is provided
      let finalMessage = message.message;
      if (message.templateId) {
        try {
          finalMessage = await this.processTemplate(message.templateId, message.placeholders || {});
        } catch (error) {
          console.warn('Template processing failed, using original message:', error);
        }
      }

      // Send SMS via ClickSend
      const response = await this.sendToClickSend({
        to: message.to,
        message: finalMessage,
        type: message.type
      });

      // Log to SMS history (don't let this fail the SMS send)
      try {
        await this.logSMSHistory({
          recipient_phone: message.to,
          message_content: finalMessage,
          status: response.success ? 'Sent' : 'Failed',
          sent_at: new Date().toISOString(),
          sms_provider_id: response.clickSendMessageId,
          error_message: response.error,
          cost: response.cost || 0
        });
      } catch (error) {
        console.warn('Failed to log SMS history:', error);
      }

      return response;
    }, { success: false, error: 'SMS sending failed' }, 'SMS send');
  }

  private async sendToClickSend(message: SMSMessage): Promise<SMSResponse> {
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

  private async processTemplate(templateId: number, placeholders: Record<string, string>): Promise<string> {
    const { data, error } = await supabase
      .from('sms_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) throw error;

    if (data) {
      let message = data.message_content;

      // Replace placeholders
      Object.entries(placeholders).forEach(([key, value]) => {
        message = message.replace(new RegExp(`{${key}}`, 'g'), value);
      });

      return message;
    }

    throw new Error('Template not found');
  }

  private async logSMSHistory(historyData: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('sms_history')
        .insert([{
          ...historyData,
          sent_by_user_id: 1 // This should be the current user ID
        }]);

      if (error) throw error;
    } catch (error) {
      console.warn('Error logging SMS history:', error);
      // Don't throw, as this shouldn't fail the SMS send
    }
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  async testSMS(phoneNumber: string): Promise<SMSResponse> {
    const testMessage = {
      to: phoneNumber,
      message: `DFS Manager SMS Test - ${new Date().toLocaleString()}. If you receive this message, ClickSend SMS is working correctly.`,
      type: 'test'
    };

    return this.sendSMS(testMessage);
  }

  async getServiceStatus(): Promise<{available: boolean; message: string; providers?: any; quota?: any;}> {
    if (!this.serviceEnabled) {
      return {
        available: false,
        message: 'SMS service is disabled due to initialization errors'
      };
    }

    if (!this.isConfigured) {
      return {
        available: false,
        message: 'SMS service not configured. Please configure ClickSend settings.'
      };
    }

    return this.safeApiCall(async () => {
      const accountResponse = await this.makeClickSendRequest('GET', '/account');

      const providers = [{
        name: 'ClickSend',
        available: this.isConfigured && accountResponse.success
      }];

      const quota = {
        quotaRemaining: accountResponse.success ? accountResponse.data?.data?.balance || 0 : 0
      };

      return {
        available: accountResponse.success,
        message: accountResponse.success ? 'ClickSend SMS service is configured and ready' : 'ClickSend connection failed',
        providers,
        quota
      };
    }, {
      available: false,
      message: 'Unable to check service status'
    }, 'service status check');
  }

  async sendSimpleSMS(phoneNumber: string, message: string, fromNumber?: string): Promise<SMSResponse> {
    const originalConfig = this.config;
    if (fromNumber && this.config) {
      this.config = { ...this.config, fromNumber };
    }

    try {
      const result = await this.sendSMS({
        to: phoneNumber,
        message: message,
        type: 'custom'
      });
      return result;
    } finally {
      if (originalConfig) {
        this.config = originalConfig;
      }
    }
  }

  isServiceConfigured(): boolean {
    return this.isConfigured && this.serviceEnabled;
  }

  getConfiguration(): ClickSendConfig | null {
    return this.config;
  }

  // Safe methods that won't crash the app
  async addTestNumber(phoneNumber: string): Promise<void> {
    if (this.isValidPhoneNumber(phoneNumber)) {
      this.testNumbers.push(phoneNumber);
    }
  }

  async removeTestNumber(phoneNumber: string): Promise<void> {
    this.testNumbers = this.testNumbers.filter((num) => num !== phoneNumber);
  }

  getTestNumbers(): string[] {
    return [...this.testNumbers];
  }

  async getDailyUsage(): Promise<{used: number; limit: number; percentage: number;}> {
    return this.safeApiCall(async () => {
      const { data, error } = await supabase
        .from('sms_config')
        .select('*')
        .eq('is_enabled', true)
        .order('id', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const config = data[0];
        const today = new Date().toISOString().split('T')[0];

        const { count } = await supabase
          .from('sms_history')
          .select('*', { count: 'exact', head: true })
          .gte('sent_at', today)
          .eq('status', 'Sent');

        const used = count || 0;
        const limit = config.daily_limit;
        const percentage = used / limit * 100;

        return { used, limit, percentage };
      }

      return { used: 0, limit: 100, percentage: 0 };
    }, { used: 0, limit: 100, percentage: 0 }, 'daily usage check');
  }

  // Batch operations
  async sendBulkSMS(messages: SMSMessage[]): Promise<SMSResponse[]> {
    const results = [];
    for (const message of messages) {
      try {
        const result = await this.sendSMS(message);
        results.push(result);
        // Add delay between messages
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    return results;
  }

  async getAccountBalance(): Promise<number> {
    return this.safeApiCall(async () => {
      const response = await this.makeClickSendRequest('GET', '/account');
      if (response.success && response.data) {
        return response.data.data.balance || 0;
      }
      return 0;
    }, 0, 'account balance check');
  }
}

export const clickSendSmsService = new ClickSendSMSService();

// Enhanced SMS Service with production features
class ProductionClickSendSMSService extends ClickSendSMSService {
  async loadEnvironmentConfig(): Promise<void> {
    try {
      const envConfig = {
        username: 'mobil3801beach@gmail.com',
        apiKey: '54DC23E4-34D7-C6B1-0601-112E36A46B49',
        fromNumber: 'DFS',
        testMode: import.meta.env.VITE_SMS_TEST_MODE === 'true' || false,
        webhookUrl: import.meta.env.VITE_SMS_WEBHOOK_URL
      };

      await this.configure(envConfig);
      console.log('📱 Production ClickSend SMS service configured');
    } catch (error) {
      console.warn('Production SMS configuration failed:', error);
      throw error;
    }
  }

  async initializeForProduction(): Promise<void> {
    try {
      await this.loadEnvironmentConfig();
      console.log('🚀 Production ClickSend SMS service initialized');
    } catch (error) {
      console.warn('⚠️ Production SMS service initialization failed:', error);
      // Don't throw - allow app to continue
    }
  }
}

export const productionClickSendSmsService = new ProductionClickSendSMSService();

// Export for backward compatibility and as the main SMS service
export const smsService = clickSendSmsService;
export const productionSmsService = productionClickSendSmsService;
export default clickSendSmsService;