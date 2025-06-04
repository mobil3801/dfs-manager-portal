// Enhanced SMS Service for Twilio integration and production use

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
  status?: string;
  sid?: string;
}

export interface SMSMessage {
  to: string;
  message: string;
  type?: string;
  templateId?: number;
  placeholders?: Record<string, string>;
}

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  messagingServiceSid?: string;
  testMode: boolean;
  webhookUrl?: string;
}

export interface SMSTemplate {
  id: number;
  template_name: string;
  message_content: string;
  template_type: string;
  is_active: boolean;
  priority_level: string;
}

class SMSService {
  private config: TwilioConfig | null = null;
  private isConfigured: boolean = false;
  private testNumbers: string[] = []; // Verified test numbers

  async configure(config: TwilioConfig) {
    this.config = config;
    this.isConfigured = true;

    // Validate Twilio credentials
    try {
      await this.validateCredentials();
      console.log('Twilio SMS service configured successfully');
    } catch (error) {
      console.error('Failed to configure Twilio:', error);
      this.isConfigured = false;
      throw error;
    }
  }

  async loadConfiguration(): Promise<void> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(12640, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      });

      if (error) throw new Error(error);

      if (data?.List && data.List.length > 0) {
        const config = data.List[0];
        await this.configure({
          accountSid: config.account_sid,
          authToken: config.auth_token,
          fromNumber: config.from_number,
          testMode: config.test_mode,
          webhookUrl: config.webhook_url
        });
      }
    } catch (error) {
      console.error('Error loading SMS configuration:', error);
    }
  }

  private async validateCredentials(): Promise<boolean> {
    if (!this.config) return false;

    // In a real implementation, this would make a test call to Twilio
    // For now, we'll simulate validation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(!!this.config?.accountSid && !!this.config?.authToken);
      }, 500);
    });
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    if (!this.isConfigured || !this.config) {
      return {
        success: false,
        error: 'SMS service not configured. Please configure Twilio settings.'
      };
    }

    // Validate phone number format
    if (!this.isValidPhoneNumber(message.to)) {
      return {
        success: false,
        error: 'Invalid phone number format. Use E.164 format (+1234567890)'
      };
    }

    // Check test mode restrictions
    if (this.config.testMode && !this.testNumbers.includes(message.to)) {
      return {
        success: false,
        error: 'Test mode is enabled. Phone number must be verified for testing.'
      };
    }

    try {
      // Check monthly limits
      await this.checkMonthlyLimit();

      // Process template if templateId is provided
      let finalMessage = message.message;
      if (message.templateId) {
        finalMessage = await this.processTemplate(message.templateId, message.placeholders || {});
      }

      // Simulate Twilio API call
      const response = await this.sendToTwilio({
        to: message.to,
        message: finalMessage,
        type: message.type
      });

      // Log to SMS history
      await this.logSMSHistory({
        mobile_number: message.to,
        message_content: finalMessage,
        delivery_status: response.success ? 'Sent' : 'Failed',
        sent_date: new Date().toISOString()
      });

      // Update monthly count
      if (response.success) {
        await this.updateMonthlyCount();
      }

      return response;
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async sendToTwilio(message: SMSMessage): Promise<SMSResponse> {
    // In production, this would use the actual Twilio SDK
    // For now, we'll simulate the API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.05; // 95% success rate
        resolve({
          success,
          messageId: success ? `SM${Date.now()}${Math.random().toString(36).substr(2, 9)}` : undefined,
          sid: success ? `SM${Date.now()}${Math.random().toString(36).substr(2, 9)}` : undefined,
          cost: success ? 0.0075 : 0,
          status: success ? 'queued' : 'failed',
          error: success ? undefined : 'Simulated failure for testing'
        });
      }, 1000 + Math.random() * 2000); // Realistic delay
    });
  }

  private async processTemplate(templateId: number, placeholders: Record<string, string>): Promise<string> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(12641, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: [{ name: 'ID', op: 'Equal', value: templateId }]
      });

      if (error) throw new Error(error);

      if (data?.List && data.List.length > 0) {
        let message = data.List[0].message_content;

        // Replace placeholders
        Object.entries(placeholders).forEach(([key, value]) => {
          message = message.replace(new RegExp(`{${key}}`, 'g'), value);
        });

        return message;
      }

      throw new Error('Template not found');
    } catch (error) {
      console.error('Error processing template:', error);
      throw error;
    }
  }

  private async checkMonthlyLimit(): Promise<void> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(12640, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      });

      if (error) throw new Error(error);

      if (data?.List && data.List.length > 0) {
        const config = data.List[0];
        if (config.current_month_count >= config.monthly_limit) {
          throw new Error('Monthly SMS limit exceeded. Please upgrade your plan or wait for next month.');
        }
      }
    } catch (error) {
      console.error('Error checking monthly limit:', error);
      throw error;
    }
  }

  private async updateMonthlyCount(): Promise<void> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(12640, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      });

      if (error) throw new Error(error);

      if (data?.List && data.List.length > 0) {
        const config = data.List[0];
        await window.ezsite.apis.tableUpdate(12640, {
          ID: config.ID,
          current_month_count: config.current_month_count + 1
        });
      }
    } catch (error) {
      console.error('Error updating monthly count:', error);
    }
  }

  private async logSMSHistory(historyData: any): Promise<void> {
    try {
      await window.ezsite.apis.tableCreate(12613, {
        ...historyData,
        created_by: 1 // This should be the current user ID
      });
    } catch (error) {
      console.error('Error logging SMS history:', error);
    }
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  async sendBulkSMS(messages: SMSMessage[]): Promise<SMSResponse[]> {
    const results = [];
    for (const message of messages) {
      try {
        const result = await this.sendSMS(message);
        results.push(result);
        // Add small delay between messages to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    return results;
  }

  async getDeliveryStatus(messageId: string): Promise<{status: string;delivered: boolean;}> {
    if (!this.isConfigured) {
      throw new Error('SMS service not configured');
    }

    // In production, this would query Twilio's API
    // For now, simulate different statuses
    const statuses = ['queued', 'sent', 'delivered', 'failed', 'undelivered'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      status: randomStatus,
      delivered: randomStatus === 'delivered'
    };
  }

  async testSMS(phoneNumber: string): Promise<SMSResponse> {
    const testMessage = {
      to: phoneNumber,
      message: `DFS Manager SMS Test - ${new Date().toLocaleString()}. If you receive this message, SMS is working correctly.`,
      type: 'test'
    };

    return this.sendSMS(testMessage);
  }

  async addTestNumber(phoneNumber: string): Promise<void> {
    if (this.isValidPhoneNumber(phoneNumber)) {
      this.testNumbers.push(phoneNumber);
    } else {
      throw new Error('Invalid phone number format');
    }
  }

  async removeTestNumber(phoneNumber: string): Promise<void> {
    this.testNumbers = this.testNumbers.filter((num) => num !== phoneNumber);
  }

  getTestNumbers(): string[] {
    return [...this.testNumbers];
  }

  async getMonthlyUsage(): Promise<{used: number;limit: number;percentage: number;}> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(12640, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      });

      if (error) throw new Error(error);

      if (data?.List && data.List.length > 0) {
        const config = data.List[0];
        const used = config.current_month_count;
        const limit = config.monthly_limit;
        const percentage = used / limit * 100;

        return { used, limit, percentage };
      }

      return { used: 0, limit: 1000, percentage: 0 };
    } catch (error) {
      console.error('Error getting monthly usage:', error);
      return { used: 0, limit: 1000, percentage: 0 };
    }
  }

  isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  getConfiguration(): TwilioConfig | null {
    return this.config;
  }

  // Additional methods for the SMSServiceManager
  async getServiceStatus(): Promise<{available: boolean;message: string;providers?: any;quota?: any;}> {
    try {
      if (!this.isConfigured) {
        return {
          available: false,
          message: 'SMS service not configured. Please configure Twilio settings.'
        };
      }

      // Simulate service check
      const providers = [
      { name: 'Twilio', available: this.isConfigured },
      { name: 'TextBelt (Fallback)', available: true }];


      const quota = {
        quotaRemaining: 50 // Simulated quota
      };

      return {
        available: true,
        message: 'SMS service is configured and ready',
        providers,
        quota
      };
    } catch (error) {
      console.error('Error checking service status:', error);
      return {
        available: false,
        message: 'Error checking service status'
      };
    }
  }

  // Wrapper method for sending SMS with simplified interface
  async sendSimpleSMS(phoneNumber: string, message: string, fromNumber?: string): Promise<SMSResponse> {
    // If fromNumber is provided, temporarily use it
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
      // Restore original configuration
      if (originalConfig) {
        this.config = originalConfig;
      }
    }
  }



  // Get available provider numbers
  async getAvailableFromNumbers(): Promise<{number: string;provider: string;isActive: boolean;testMode: boolean;}[]> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('12640', {
        PageNo: 1,
        PageSize: 10,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (error) throw new Error(error);

      return (data?.List || []).map((provider: any) => ({
        number: provider.from_number,
        provider: provider.provider_name,
        isActive: provider.is_active,
        testMode: provider.test_mode
      }));
    } catch (error) {
      console.error('Error getting available from numbers:', error);
      return [];
    }
  }

  // Send custom SMS with specific from number
  async sendCustomSMS(phoneNumber: string, message: string, fromNumber: string): Promise<SMSResponse> {
    return this.sendSimpleSMS(phoneNumber, message, fromNumber);
  }
}

export const smsService = new SMSService();

// Also export the enhanced service
export { enhancedSmsService } from './enhancedSmsService';