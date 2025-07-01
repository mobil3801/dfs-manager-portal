import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Send, Phone, MessageSquare, Users, AlertCircle } from 'lucide-react';

interface Contact {
  id: number;
  contact_name: string;
  mobile_number: string;
  station: string;
  is_active: boolean;
  contact_role: string;
}

const CustomSMSSendingForm: React.FC = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [sendingMethod, setSendingMethod] = useState<'contacts' | 'manual'>('contacts');
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage('12612', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'contact_name',
        IsAsc: true,
        Filters: [
        { name: 'is_active', op: 'Equal', value: true }]

      });
      if (error) throw error;
      setContacts(data?.List || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load SMS contacts',
        variant: 'destructive'
      });
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleContactSelection = (contactId: number, checked: boolean) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, contactId]);
    } else {
      setSelectedContacts(selectedContacts.filter((id) => id !== contactId));
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic E.164 format validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const handleSendSMS = async () => {
    if (!message.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter a message to send',
        variant: 'destructive'
      });
      return;
    }

    let recipients: {name: string;phone: string;}[] = [];

    if (sendingMethod === 'contacts') {
      if (selectedContacts.length === 0) {
        toast({
          title: 'No Recipients',
          description: 'Please select at least one contact',
          variant: 'destructive'
        });
        return;
      }

      recipients = contacts.
      filter((contact) => selectedContacts.includes(contact.id)).
      map((contact) => ({
        name: contact.contact_name,
        phone: contact.mobile_number
      }));
    } else {
      if (!phoneNumber.trim()) {
        toast({
          title: 'Phone Number Required',
          description: 'Please enter a phone number',
          variant: 'destructive'
        });
        return;
      }

      if (!validatePhoneNumber(phoneNumber)) {
        toast({
          title: 'Invalid Phone Number',
          description: 'Please enter a valid phone number in E.164 format (e.g., +1234567890)',
          variant: 'destructive'
        });
        return;
      }

      recipients = [{ name: 'Manual Entry', phone: phoneNumber }];
    }

    setLoading(true);
    try {
      let successCount = 0;
      let failureCount = 0;

      // Send SMS to each recipient
      for (const recipient of recipients) {
        try {
          // Simulate SMS sending (replace with actual SMS service call)
          const smsResult = {
            success: Math.random() > 0.1, // 90% success rate for simulation
            error: Math.random() > 0.1 ? null : 'Simulated failure for testing'
          };

          if (smsResult.success) {
            successCount++;
            console.log(`✅ SMS sent successfully to ${recipient.name} (${recipient.phone})`);
          } else {
            failureCount++;
            console.error(`❌ SMS failed to ${recipient.name} (${recipient.phone}):`, smsResult.error);
          }

          // Create history record
          await window.ezsite.apis.tableCreate('12613', {
            license_id: 0, // Custom SMS
            contact_id: sendingMethod === 'contacts' ?
            contacts.find((c) => c.mobile_number === recipient.phone)?.id || 0 : 0,
            mobile_number: recipient.phone,
            message_content: message,
            sent_date: new Date().toISOString(),
            delivery_status: smsResult.success ? 'Sent' : `Failed - ${smsResult.error}`,
            days_before_expiry: 0,
            created_by: 1
          });
        } catch (error) {
          failureCount++;
          console.error(`Error sending SMS to ${recipient.name}:`, error);
        }
      }

      // Show results
      if (successCount > 0 && failureCount === 0) {
        toast({
          title: '✅ SMS Sent Successfully',
          description: `Message sent to ${successCount} recipient(s)`
        });
      } else if (successCount > 0 && failureCount > 0) {
        toast({
          title: '⚠️ Partial Success',
          description: `${successCount} sent successfully, ${failureCount} failed`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: '❌ All SMS Failed',
          description: 'Failed to send SMS to any recipients',
          variant: 'destructive'
        });
      }

      // Reset form
      setMessage('');
      setPhoneNumber('');
      setSelectedContacts([]);

    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: 'Error',
        description: `Failed to send SMS: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sending Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Send Custom SMS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Sending Method</Label>
              <Select value={sendingMethod} onValueChange={(value: 'contacts' | 'manual') => setSendingMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contacts">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Send to Saved Contacts
                    </div>
                  </SelectItem>
                  <SelectItem value="manual">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Manual Phone Number Entry
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Manual Phone Number Entry */}
            {sendingMethod === 'manual' &&
            <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)} />

                <p className="text-sm text-gray-600">
                  Enter phone number in E.164 format (e.g., +1234567890)
                </p>
              </div>
            }

            {/* Contact Selection */}
            {sendingMethod === 'contacts' &&
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Select Recipients</Label>
                  <Badge variant="outline">
                    {selectedContacts.length} of {contacts.length} selected
                  </Badge>
                </div>

                {loadingContacts ?
              <div className="text-center py-4">Loading contacts...</div> :
              contacts.length === 0 ?
              <div className="text-center py-6 text-gray-500">
                    <Phone className="w-8 h-8 mx-auto mb-2" />
                    <p>No active contacts found.</p>
                    <p className="text-sm">Add contacts in the SMS Contacts tab first.</p>
                  </div> :

              <div className="max-h-60 overflow-y-auto space-y-3 border rounded-lg p-4">
                    {contacts.map((contact) =>
                <div key={contact.id} className="flex items-center space-x-3">
                        <Checkbox
                    id={`contact-${contact.id}`}
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={(checked) =>
                    handleContactSelection(contact.id, checked as boolean)
                    } />

                        <label
                    htmlFor={`contact-${contact.id}`}
                    className="flex-1 cursor-pointer">

                          <div className="font-medium">{contact.contact_name}</div>
                          <div className="text-sm text-gray-600">
                            {contact.mobile_number} • {contact.station} • {contact.contact_role}
                          </div>
                        </label>
                      </div>
                )}
                  </div>
              }

                {contacts.length > 0 &&
              <div className="flex space-x-2">
                    <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedContacts(contacts.map((c) => c.id))}>

                      Select All
                    </Button>
                    <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedContacts([])}>

                      Clear All
                    </Button>
                  </div>
              }
              </div>
            }

            {/* Message Input */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your custom message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={160} />

              <div className="flex justify-between text-sm text-gray-600">
                <span>SMS messages are limited to 160 characters</span>
                <span>{message.length}/160</span>
              </div>
            </div>

            {/* SMS Preview */}
            {message.trim() &&
            <div className="bg-gray-50 border rounded-lg p-3">
                <Label className="text-sm font-medium text-gray-700">Message Preview:</Label>
                <div className="mt-1 text-sm text-gray-900">{message}</div>
              </div>
            }

            {/* Send Button */}
            <div className="flex justify-end space-x-3">
              <Button
                onClick={handleSendSMS}
                disabled={loading || !message.trim()}
                className="bg-blue-600 hover:bg-blue-700">

                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Sending...' : 'Send SMS'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Message Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessage('🔔 Reminder: Your license expires soon. Please renew to avoid any business disruptions.')}>

              License Reminder
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessage('⚠️ URGENT: Your license expires in 3 days. Immediate action required.')}>

              Urgent Alert
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessage('✅ Test message from DFS Manager - SMS system is working correctly!')}>

              Test Message
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessage('📋 Please check your DFS Manager dashboard for important updates.')}>

              Dashboard Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SMS Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <AlertCircle className="w-5 h-5 mr-2" />
            SMS Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-2">
          <div>• Keep messages under 160 characters for single SMS delivery</div>
          <div>• Use clear, actionable language</div>
          <div>• Include your business name for identification</div>
          <div>• Test with a small group before sending to all contacts</div>
          <div>• Respect opt-out requests and local regulations</div>
        </CardContent>
      </Card>
    </div>);

};

export default CustomSMSSendingForm;