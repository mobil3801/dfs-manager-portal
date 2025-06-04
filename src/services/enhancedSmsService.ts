// Enhanced SMS Service with Real Twilio Integration and Comprehensive Debugging

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
  status?: string;
  sid?: string;
  errorCode?: string;
  errorDetails?: any;
  providerResponse?: any;
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

export interface DeliveryStatus {
  messageId: string;
  status: string;
  errorCode?: string;
  errorMessage?: string;
  delivered: boolean;
  deliveredAt?: string;
  failureReason?: string;
}

class EnhancedSMSService {
  private config: TwilioConfig | null = null;
  private isConfigured: boolean = false;
  private testNumbers: string[] = [];
  private debugMode: boolean = false;

  constructor() {
    this.debugMode = true; // Enable debug mode by default
  }

  async configure(config: TwilioConfig) {
    this.config = config;

    try {
      // Validate Twilio credentials with real API call
      const isValid = await this.validateCredentials();
      if (!isValid) {
        throw new Error('Invalid Twilio credentials');
      }

      this.isConfigured = true;
      this.log('Twilio SMS service configured successfully');

      return { success: true };
    } catch (error) {
      this.log('Failed to configure Twilio:', error);
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
      } else {
        throw new Error('No SMS provider configuration found');
      }
    } catch (error) {
      this.log('Error loading SMS configuration:', error);
      throw error;
    }
  }

  private async validateCredentials(): Promise<boolean> {
    if (!this.config) return false;

    try {
      // Make a real API call to Twilio to validate credentials
      const response = await this.makeApiCall('/Accounts.json', 'GET');
      return response.ok;
    } catch (error) {
      this.log('Credential validation failed:', error);
      return false;
    }
  }

  private async makeApiCall(endpoint: string, method: string = 'GET', data?: any): Promise<Response> {
    if (!this.config) {
      throw new Error('SMS service not configured');
    }

    const baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}`;
    const url = `${baseUrl}${endpoint}`;

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${this.config.accountSid}:${this.config.authToken}`)
    };

    const options: RequestInit = {
      method,
      headers
    };

    if (data && method !== 'GET') {
      options.body = new URLSearchParams(data).toString();
    }

    this.log(`Making API call to: ${url}`, { method, data });

    const response = await fetch(url, options);

    this.log(`API response status: ${response.status}`, {
      headers: Object.fromEntries(response.headers.entries())
    });

    return response;
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    if (!this.isConfigured || !this.config) {
      return {
        success: false,
        error: 'SMS service not configured. Please configure Twilio settings.',
        errorCode: 'SERVICE_NOT_CONFIGURED'
      };
    }

    // Validate and format phone number
    const formattedNumber = this.formatPhoneNumber(message.to);
    if (!formattedNumber) {
      return {
        success: false,
        error: 'Invalid phone number format. Use E.164 format (+1234567890)',
        errorCode: 'INVALID_PHONE_NUMBER'
      };
    }

    // Check test mode restrictions
    if (this.config.testMode && !this.testNumbers.includes(formattedNumber)) {
      return {
        success: false,
        error: `Test mode is enabled. Phone number ${formattedNumber} must be verified for testing.`,
        errorCode: 'TEST_MODE_RESTRICTION'
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

      // Send to Twilio
      const response = await this.sendToTwilio({
        to: formattedNumber,
        message: finalMessage,
        type: message.type
      });

      // Log to SMS history
      await this.logSMSHistory({
        mobile_number: formattedNumber,
        message_content: finalMessage,
        delivery_status: response.success ? 'Sent' : 'Failed',
        sent_date: new Date().toISOString(),
        days_before_expiry: 0
      });

      // Update monthly count if successful
      if (response.success) {
        await this.updateMonthlyCount();
      }

      return response;
    } catch (error) {
      this.log('SMS sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        errorCode: 'SEND_FAILED'
      };
    }
  }

  private async sendToTwilio(message: SMSMessage): Promise<SMSResponse> {
    try {
      const messageData = {
        To: message.to,
        From: this.config!.fromNumber,
        Body: message.message
      };

      this.log('Sending SMS to Twilio:', messageData);

      const response = await this.makeApiCall('/Messages.json', 'POST', messageData);

      if (response.ok) {
        const result = await response.json();
        this.log('Twilio response:', result);

        return {
          success: true,
          messageId: result.sid,
          sid: result.sid,
          status: result.status,
          cost: parseFloat(result.price || '0'),
          providerResponse: result
        };
      } else {
        const errorData = await response.json();
        this.log('Twilio error response:', errorData);

        return {
          success: false,
          error: errorData.message || 'Failed to send SMS',
          errorCode: errorData.code?.toString() || 'TWILIO_ERROR',
          errorDetails: errorData,
          providerResponse: errorData
        };
      }
    } catch (error) {
      this.log('Network error sending to Twilio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
        errorCode: 'NETWORK_ERROR'
      };
    }
  }

  private formatPhoneNumber(phoneNumber: string): string | null {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Handle different phone number formats
    if (cleaned.length === 10) {
      // US number without country code
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // US number with country code
      return `+${cleaned}`;
    } else if (cleaned.length >= 10 && cleaned.length <= 15) {
      // International number
      return `+${cleaned}`;
    }

    return null;
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    return this.formatPhoneNumber(phoneNumber) !== null;
  }

  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus> {
    if (!this.isConfigured) {
      throw new Error('SMS service not configured');
    }

    try {
      const response = await this.makeApiCall(`/Messages/${messageId}.json`, 'GET');

      if (response.ok) {
        const result = await response.json();
        this.log('Delivery status from Twilio:', result);

        return {
          messageId: result.sid,
          status: result.status,
          errorCode: result.error_code?.toString(),
          errorMessage: result.error_message,
          delivered: result.status === 'delivered',
          deliveredAt: result.date_sent,
          failureReason: result.error_message
        };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get delivery status');
      }
    } catch (error) {
      this.log('Error getting delivery status:', error);
      throw error;
    }
  }

  async testSMS(phoneNumber: string): Promise<SMSResponse> {
    const testMessage = {
      to: phoneNumber,
      message: `🔥 DFS Manager SMS Test - ${new Date().toLocaleString()}\n\n✅ If you receive this message, SMS is working correctly!\n\n📱 Message ID: TEST-${Date.now()}`,
      type: 'test'
    };

    return this.sendSMS(testMessage);
  }

  async testSMSWithDetails(phoneNumber: string): Promise<{
    response: SMSResponse;
    deliveryStatus?: DeliveryStatus;
    configStatus: any;
  }> {
    // Test configuration first
    const configStatus = await this.getServiceStatus();

    // Send test SMS
    const response = await this.testSMS(phoneNumber);

    let deliveryStatus;
    if (response.success && response.messageId) {
      // Wait a bit and check delivery status
      setTimeout(async () => {
        try {
          deliveryStatus = await this.getDeliveryStatus(response.messageId!);
          this.log('Delivery status for test SMS:', deliveryStatus);
        } catch (error) {
          this.log('Error checking delivery status:', error);
        }
      }, 5000);
    }

    return {
      response,
      deliveryStatus,
      configStatus
    };
  }

  async addTestNumber(phoneNumber: string): Promise<void> {
    const formatted = this.formatPhoneNumber(phoneNumber);
    if (formatted) {
      this.testNumbers.push(formatted);
      this.log(`Added test number: ${formatted}`);
    } else {
      throw new Error('Invalid phone number format');
    }
  }

  async removeTestNumber(phoneNumber: string): Promise<void> {
    const formatted = this.formatPhoneNumber(phoneNumber);
    if (formatted) {
      this.testNumbers = this.testNumbers.filter((num) => num !== formatted);
      this.log(`Removed test number: ${formatted}`);
    }
  }

  getTestNumbers(): string[] {
    return [...this.testNumbers];
  }

  async getServiceStatus(): Promise<{
    available: boolean;
    message: string;
    providers?: any;
    quota?: any;
    configuration?: any;
    testMode?: boolean;
  }> {
    try {
      if (!this.isConfigured) {
        return {
          available: false,
          message: 'SMS service not configured. Please configure Twilio settings.'
        };
      }

      // Test Twilio API connection
      const isValid = await this.validateCredentials();

      if (!isValid) {
        return {
          available: false,
          message: 'Twilio credentials are invalid. Please check your Account SID and Auth Token.'
        };
      }

      // Get account information
      const accountInfo = await this.getAccountInfo();

      const providers = [
      {
        name: 'Twilio',
        available: this.isConfigured,
        configured: true,
        testMode: this.config?.testMode || false
      }];


      const quota = {
        quotaRemaining: accountInfo?.balance || 'Unknown'
      };

      return {
        available: true,
        message: 'SMS service is configured and ready',
        providers,
        quota,
        configuration: {
          fromNumber: this.config?.fromNumber,
          testMode: this.config?.testMode,
          testNumbers: this.testNumbers
        },
        testMode: this.config?.testMode
      };
    } catch (error) {
      this.log('Error checking service status:', error);
      return {
        available: false,
        message: `Error checking service status: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async getAccountInfo(): Promise<any> {
    try {
      const response = await this.makeApiCall('.json', 'GET');
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      this.log('Error getting account info:', error);
      return null;
    }
  }

  // Helper methods from original service
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
      this.log('Error processing template:', error);
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
      this.log('Error checking monthly limit:', error);
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
      this.log('Error updating monthly count:', error);
    }
  }

  private async logSMSHistory(historyData: any): Promise<void> {
    try {
      await window.ezsite.apis.tableCreate(12613, {
        ...historyData,
        created_by: 1 // This should be the current user ID
      });
    } catch (error) {
      this.log('Error logging SMS history:', error);
    }
  }

  private log(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[EnhancedSMSService] ${message}`, data || '');
    }
  }

  // Public methods for debugging
  enableDebugMode(): void {
    this.debugMode = true;
  }

  disableDebugMode(): void {
    this.debugMode = false;
  }

  isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  getConfiguration(): TwilioConfig | null {
    return this.config;
  }
}

export const enhancedSmsService = new EnhancedSMSService();