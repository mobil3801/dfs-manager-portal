// SMS Service for sending real SMS messages
// This service integrates with SMS providers to send actual SMS messages

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  status?: string;
}

interface SMSMessage {
  to: string;
  message: string;
}

class SMSService {
  private apiUrl = 'https://api.textbelt.com/text';
  private apiKey = 'textbelt'; // Free tier for testing - replace with actual API key for production

  /**
   * Send SMS using TextBelt API (free SMS service for testing)
   * For production, replace with your preferred SMS provider (Twilio, AWS SNS, etc.)
   */
  async sendSMS(to: string, message: string): Promise<SMSResponse> {
    try {
      console.log(`📱 Sending SMS to ${to}: ${message}`);
      
      // Validate phone number format
      const cleanedNumber = this.formatPhoneNumber(to);
      if (!cleanedNumber) {
        throw new Error('Invalid phone number format');
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: cleanedNumber,
          message: message,
          key: this.apiKey,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ SMS sent successfully to ${cleanedNumber}. Message ID: ${result.textId}`);
        return {
          success: true,
          messageId: result.textId,
          status: 'Sent'
        };
      } else {
        console.error(`❌ SMS failed to ${cleanedNumber}:`, result.error);
        return {
          success: false,
          error: result.error || 'Failed to send SMS',
          status: 'Failed'
        };
      }
    } catch (error) {
      console.error('SMS Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'Error'
      };
    }
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
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get SMS service status
   */
  async getServiceStatus(): Promise<{ available: boolean; message: string }> {
    try {
      // Test the service with a small request
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: '+1234567890', // Test number
          message: 'Service test',
          key: 'test',
        }),
      });

      if (response.ok) {
        return {
          available: true,
          message: 'SMS service is available and ready'
        };
      } else {
        return {
          available: false,
          message: 'SMS service is experiencing issues'
        };
      }
    } catch (error) {
      return {
        available: false,
        message: 'SMS service is currently unavailable'
      };
    }
  }
}

// Create a singleton instance
const smsService = new SMSService();

export default smsService;
export type { SMSResponse, SMSMessage };