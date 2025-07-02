import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { clickSendSmsService } from '@/services/clickSendSmsService';
import {
  Send,
  CheckCircle,
  AlertCircle,
  Phone,
  MessageSquare,
  Zap
} from 'lucide-react';

const ClickSendTestDemo: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('Hello from DFS Manager! Your ClickSend SMS integration is working perfectly.');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const sendTestSMS = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive"
      });
      return;
    }

    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number in E.164 format (+1234567890)",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await clickSendSmsService.sendSMS({
        to: phoneNumber,
        message: message,
        type: 'test'
      });

      setLastResult(response);

      if (response.success) {
        toast({
          title: "SMS Sent Successfully!",
          description: `Message sent to ${phoneNumber} via ClickSend`
        });
      } else {
        toast({
          title: "SMS Failed",
          description: response.error || "Failed to send SMS",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('SMS Test Error:', error);
      toast({
        title: "Error",
        description: "An error occurred while sending the SMS",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkServiceStatus = async () => {
    try {
      setLoading(true);
      const status = await clickSendSmsService.getServiceStatus();
      const balance = await clickSendSmsService.getAccountBalance();
      
      toast({
        title: "Service Status",
        description: `Status: ${status.available ? 'Available' : 'Unavailable'} | Balance: $${balance.toFixed(2)}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check service status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            ClickSend SMS Integration Demo
            <Badge className="ml-auto bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </CardTitle>
          <CardDescription>
            Test your ClickSend SMS integration with the provided credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>ClickSend Credentials Configured:</strong><br />
              • Username: mobil3801beach@gmail.com<br />
              • API Key: 54DC23E4-34D7-C6B1-0601-112E36A46B49<br />
              • Source: DFS
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter phone number in E.164 format
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Label>
                <Input
                  id="message"
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={sendTestSMS}
                  disabled={loading || !phoneNumber}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {loading ? 'Sending...' : 'Send Test SMS'}
                </Button>
                <Button
                  variant="outline"
                  onClick={checkServiceStatus}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Check Status
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Service Information</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Service Provider</span>
                  <Badge>ClickSend</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Integration Status</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">API Endpoint</span>
                  <span className="text-xs text-muted-foreground">rest.clicksend.com/v3</span>
                </div>
              </div>
            </div>
          </div>

          {lastResult && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Last SMS Result</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Success:</span> 
                    {lastResult.success ? (
                      <Badge className="ml-2 bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="ml-2">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        No
                      </Badge>
                    )}
                  </div>
                  {lastResult.messageId && (
                    <div>
                      <span className="font-medium">Message ID:</span> {lastResult.messageId}
                    </div>
                  )}
                  {lastResult.cost && (
                    <div>
                      <span className="font-medium">Cost:</span> ${lastResult.cost}
                    </div>
                  )}
                  {lastResult.status && (
                    <div>
                      <span className="font-medium">Status:</span> {lastResult.status}
                    </div>
                  )}
                  {lastResult.error && (
                    <div className="col-span-2">
                      <span className="font-medium text-red-600">Error:</span> {lastResult.error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              <strong>Integration Complete!</strong> Your DFS Manager application now uses ClickSend exclusively for all SMS functionality. 
              All existing SMS features will automatically use your provided ClickSend credentials.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClickSendTestDemo;
