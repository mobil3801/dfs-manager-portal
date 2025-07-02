// Enhanced ClickSend SMS Service with Database Integration
// This service integrates with the SMS management interface

export interface ClickSendConfig {
  username: string;
  apiKey: string;
  fromNumber: string;
  testMode: boolean;
  webhookUrl?: string;
  isEnabled: boolean;
  dailyLimit: number;
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

class EnhancedClickSendSMSService {
  private config: ClickSendConfig | null = null;
  private isConfigured: boolean = false;
  private apiBaseUrl = 'https://rest.clicksend.com/v3';

  constructor() {
    this.initializeFromDatabase();
  }

  private async initializeFromDatabase() {
    try {
      await this.loadConfigurationFromDB();
      console.log('🚀 Enhanced ClickSend SMS service initialized from database');
    } catch (error) {
      console.error('❌ Failed to initialize from database, using defaults:', error);
      await this.initializeWithDefaults();
    }
  }

  private async initializeWithDefaults() {
    try {
      this.config = {
        username: 'mobil3801beach@gmail.com',
        apiKey: '54DC23E4-34D7-C6B1-0601-112E36A46B49',
        fromNumber: 'DFS',
        testMode: false,
        isEnabled: true,
        dailyLimit: 100
      };
      this.isConfigured = true;
      console.log('✅ Enhanced ClickSend SMS service configured with default credentials');
    } catch (error) {
      console.error('❌ Failed to initialize with defaults:', error);
    }
  }

  async loadConfigurationFromDB(): Promise<void> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(24201, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [{ name: 'is_enabled', op: 'Equal', value: true }]
      });

      if (error) {
        console.log('No SMS configuration found in database, using defaults');
        await this.initializeWithDefaults();
        return;
      }

      if (data?.List && data.List.length > 0) {
        const dbConfig = data.List[0];
        this.config = {
          username: dbConfig.username || 'mobil3801beach@gmail.com',
          apiKey: dbConfig.api_key || '54DC23E4-34D7-C6B1-0601-112E36A46B49',
          fromNumber: dbConfig.from_number || 'DFS',
          testMode: dbConfig.test_mode || false,
          isEnabled: dbConfig.is_enabled !== false,
          dailyLimit: dbConfig.daily_limit || 100,
          webhookUrl: dbConfig.webhook_url
        };
        this.isConfigured = this.config.isEnabled;
        console.log('✅ SMS configuration loaded from database');
      } else {
        await this.initializeWithDefaults();
      }
    } catch (error) {
      console.error('Error loading SMS configuration from database:', error);
      await this.initializeWithDefaults();
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
        throw new Error(result.response_msg || result.message || `HTTP ${response.status}`);
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('ClickSend API request failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    if (!this.isConfigured || !this.config || !this.config.isEnabled) {
      return {
        success: false,
        error: 'SMS service not configured or disabled. Please check SMS settings in Admin Panel.'
      };
    }

    // Validate phone number format
    if (!this.isValidPhoneNumber(message.to)) {
      return {
        success: false,
        error: 'Invalid phone number format. Use E.164 format (+1234567890)'
      };
    }

    try {
      // Check daily limits
      await this.checkDailyLimit();

      // Send SMS via ClickSend
      const response = await this.sendToClickSend(message);

      // Log to SMS history
      await this.logSMSHistory({
        recipient_phone: message.to,
        message_content: message.message,
        sender_name: this.config.fromNumber,
        status: response.success ? 'Sent' : 'Failed',
        sent_at: new Date().toISOString(),
        message_id: response.messageId,
        clicksend_message_id: response.clickSendMessageId,
        cost: response.cost || 0,
        error_message: response.error,
        message_type: message.type || 'notification',
        sent_by_user_id: 1 // Should be current user ID
      });

      return response;
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async sendToClickSend(message: SMSMessage): Promise<SMSResponse> {
    try {
      const smsData = {
        messages: [{
          source: this.config?.fromNumber || 'DFS',
          to: message.to,
          body: message.message
        }]
      };

      const response = await this.makeClickSendRequest('POST', '/sms/send', smsData);

      if (response.success && response.data) {
        const messageResult = response.data.data.messages[0];

        return {
          success: messageResult.status === 'SUCCESS',
          messageId: messageResult.message_id,
          clickSendMessageId: messageResult.message_id,
          cost: messageResult.message_price,
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

  private async checkDailyLimit(): Promise<void> {
    if (!this.config) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await window.ezsite.apis.tablePage(24202, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [
          { name: 'sent_at', op: 'StringStartsWith', value: today },
          { name: 'status', op: 'Equal', value: 'Sent' }
        ]
      });

      if (error) throw new Error(error);

      const todayCount = data?.VirtualCount || 0;

      if (todayCount >= this.config.dailyLimit) {
        throw new Error('Daily SMS limit exceeded. Please contact administrator or wait for tomorrow.');
      }
    } catch (error) {
      console.error('Error checking daily limit:', error);
      throw error;
    }
  }

  private async logSMSHistory(historyData: any): Promise<void> {
    try {
      await window.ezsite.apis.tableCreate(24202, historyData);
    } catch (error) {
      console.error('Error logging SMS history:', error);
    }
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  async testConnection(): Promise<{ success: boolean; message: string; balance?: number }> {
    if (!this.config) {
      return { success: false, message: 'SMS service not configured' };
    }

    try {
      const response = await this.makeClickSendRequest('GET', '/account');
      
      if (response.success) {
        return {
          success: true,
          message: 'Connection successful',
          balance: response.data?.data?.balance || 0
        };
      } else {
        return {
          success: false,
          message: response.error || 'Connection failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  async sendTestSMS(phoneNumber: string, customMessage?: string): Promise<SMSResponse> {
    const message = customMessage || `DFS Manager SMS Test - ${new Date().toLocaleString()}. ClickSend SMS is working correctly.`;
    
    return this.sendSMS({
      to: phoneNumber,
      message: message,
      type: 'test'
    });
  }

  async getDailyUsage(): Promise<{ used: number; limit: number; percentage: number }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await window.ezsite.apis.tablePage(24202, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [
          { name: 'sent_at', op: 'StringStartsWith', value: today },
          { name: 'status', op: 'Equal', value: 'Sent' }
        ]
      });

      if (error) throw new Error(error);

      const used = data?.VirtualCount || 0;
      const limit = this.config?.dailyLimit || 100;
      const percentage = limit > 0 ? (used / limit) * 100 : 0;

      return { used, limit, percentage };
    } catch (error) {
      console.error('Error getting daily usage:', error);
      return { used: 0, limit: 100, percentage: 0 };
    }
  }

  async getAccountBalance(): Promise<number> {
    try {
      const response = await this.makeClickSendRequest('GET', '/account');
      if (response.success && response.data) {
        return response.data.data.balance || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting account balance:', error);
      return 0;
    }
  }

  isServiceConfigured(): boolean {
    return this.isConfigured && this.config?.isEnabled === true;
  }

  getConfiguration(): ClickSendConfig | null {
    return this.config;
  }

  async refreshConfiguration(): Promise<void> {
    await this.loadConfigurationFromDB();
  }

  // Re-export for compatibility
  async sendSimpleSMS(phoneNumber: string, message: string, fromNumber?: string): Promise<SMSResponse> {
    const originalFromNumber = this.config?.fromNumber;
    if (fromNumber && this.config) {
      this.config.fromNumber = fromNumber;
    }

    try {
      const result = await this.sendSMS({
        to: phoneNumber,
        message: message,
        type: 'custom'
      });
      return result;
    } finally {
      if (originalFromNumber && this.config) {
        this.config.fromNumber = originalFromNumber;
      }
    }
  }
}

// Create and export the enhanced service instance
export const enhancedClickSendSmsService = new EnhancedClickSendSMSService();

// Export as default and alternative names for compatibility
export default enhancedClickSendSmsService;
export const smsService = enhancedClickSendSmsService;
export const clickSendSmsService = enhancedClickSendSmsService;
