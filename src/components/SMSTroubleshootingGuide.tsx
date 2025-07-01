import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Phone,
  CreditCard,
  Shield,
  Network,
  MessageSquare,
  Settings,
  HelpCircle,
  ExternalLink,
  Copy,
  RefreshCw } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TroubleshootingItem {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  solution: string[];
  code?: string;
  links?: {title: string;url: string;}[];
}

const SMSTroubleshootingGuide: React.FC = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const { toast } = useToast();

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
    prev.includes(id) ?
    prev.filter((item) => item !== id) :
    [...prev, id]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code snippet copied successfully."
    });
  };

  const runDiagnostics = async () => {
    setRunningDiagnostics(true);

    // Simulate diagnostic process
    await new Promise((resolve) => setTimeout(resolve, 3000));

    toast({
      title: "Diagnostics Complete",
      description: "Check the results below for potential issues."
    });

    setRunningDiagnostics(false);
  };

  const troubleshootingItems: TroubleshootingItem[] = [
  {
    id: 'sms-not-sending',
    title: 'SMS Messages Not Sending',
    description: 'Messages appear as "sent" but recipients don\'t receive them',
    severity: 'high',
    category: 'delivery',
    solution: [
    'Check if your Twilio account is in trial mode - trial accounts can only send to verified numbers',
    'Verify that the recipient phone number is in E.164 format (+1234567890)',
    'Ensure your Twilio account has sufficient balance',
    'Check if the recipient number is on Twilio\'s blocklist',
    'Verify your Twilio phone number is active and not suspended'],

    code: `// Correct phone number format
const phoneNumber = "+1234567890"; // ✅ Correct
const phoneNumber = "234-567-8890"; // ❌ Wrong`,
    links: [
    { title: 'Twilio Phone Number Formats', url: 'https://www.twilio.com/docs/glossary/what-e164' }]

  },
  {
    id: 'auth-failed',
    title: 'Authentication Failed Error',
    description: 'Getting 401 Unauthorized errors when sending SMS',
    severity: 'high',
    category: 'authentication',
    solution: [
    'Double-check your Twilio Account SID - it should start with "AC"',
    'Verify your Auth Token is correct and hasn\'t been regenerated',
    'Ensure there are no extra spaces in your credentials',
    'Check if your Twilio account is active and not suspended',
    'Try regenerating your Auth Token in Twilio Console'],

    code: `// Check your credentials format
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token: your_auth_token_here`,
    links: [
    { title: 'Twilio Console', url: 'https://console.twilio.com/' }]

  },
  {
    id: 'invalid-phone',
    title: 'Invalid Phone Number Error',
    description: 'Getting errors about invalid or unreachable phone numbers',
    severity: 'medium',
    category: 'phone-format',
    solution: [
    'Use E.164 format for all phone numbers (+country_code + number)',
    'Remove any spaces, dashes, or parentheses from phone numbers',
    'Verify the country code is correct',
    'Check if the number is a valid mobile number (not landline)',
    'Test with a known valid number first'],

    code: `// Phone number format examples
US: +12345678901
UK: +441234567890
Canada: +15551234567`,
    links: [
    { title: 'International Phone Formats', url: 'https://en.wikipedia.org/wiki/E.164' }]

  },
  {
    id: 'twilio-balance',
    title: 'Insufficient Twilio Balance',
    description: 'Messages fail to send due to low account balance',
    severity: 'high',
    category: 'billing',
    solution: [
    'Check your Twilio account balance in the Console',
    'Add funds to your Twilio account',
    'Set up automatic recharge to prevent future issues',
    'Monitor usage to estimate monthly costs',
    'Consider setting up balance alerts'],

    links: [
    { title: 'Twilio Billing Console', url: 'https://console.twilio.com/billing' }]

  },
  {
    id: 'test-mode-issues',
    title: 'Test Mode Limitations',
    description: 'SMS only works for certain numbers in test mode',
    severity: 'medium',
    category: 'configuration',
    solution: [
    'In trial mode, SMS only works with verified phone numbers',
    'Add phone numbers to your verified list in Twilio Console',
    'Consider upgrading to a paid account for unrestricted sending',
    'Test with verified numbers first',
    'Check the trial account limitations in Twilio docs'],

    links: [
    { title: 'Twilio Trial Account Info', url: 'https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account' }]

  },
  {
    id: 'rate-limiting',
    title: 'Rate Limiting Issues',
    description: 'Messages fail after sending many SMS in short time',
    severity: 'medium',
    category: 'limits',
    solution: [
    'Implement delays between SMS messages',
    'Check Twilio\'s rate limits for your account type',
    'Consider upgrading your account for higher limits',
    'Batch SMS sending with appropriate delays',
    'Monitor your sending patterns'],

    code: `// Add delay between messages
await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay`
  },
  {
    id: 'webhook-failures',
    title: 'Delivery Status Not Updating',
    description: 'SMS delivery status remains "sent" without updates',
    severity: 'low',
    category: 'webhooks',
    solution: [
    'Set up Twilio webhooks for delivery status updates',
    'Verify webhook URL is accessible from internet',
    'Check webhook endpoint for proper response codes',
    'Monitor webhook logs for failures',
    'Ensure webhook URL uses HTTPS'],

    code: `// Webhook URL example
https://yourdomain.com/webhook/sms-status`
  }];


  const getStatusIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const categories = {
    delivery: 'Message Delivery',
    authentication: 'Authentication',
    'phone-format': 'Phone Numbers',
    billing: 'Billing & Balance',
    configuration: 'Configuration',
    limits: 'Rate Limits',
    webhooks: 'Webhooks'
  };

  return (
    <div className="space-y-6">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>SMS Troubleshooting Guide</strong> - Use this guide to diagnose and fix common SMS delivery issues.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">SMS Troubleshooting</h2>
        <Button onClick={runDiagnostics} disabled={runningDiagnostics}>
          {runningDiagnostics ?
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> :

          <Settings className="w-4 h-4 mr-2" />
          }
          {runningDiagnostics ? 'Running...' : 'Run Diagnostics'}
        </Button>
      </div>

      <Tabs defaultValue="common-issues" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="common-issues">🔧 Common Issues</TabsTrigger>
          <TabsTrigger value="quick-fixes">⚡ Quick Fixes</TabsTrigger>
          <TabsTrigger value="resources">📚 Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="common-issues">
          <div className="space-y-4">
            {Object.entries(categories).map(([categoryKey, categoryName]) => {
              const categoryItems = troubleshootingItems.filter((item) => item.category === categoryKey);

              if (categoryItems.length === 0) return null;

              return (
                <Card key={categoryKey}>
                  <CardHeader>
                    <CardTitle className="text-lg">{categoryName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {categoryItems.map((item) =>
                    <Collapsible key={item.id}>
                        <CollapsibleTrigger
                        onClick={() => toggleItem(item.id)}
                        className="flex items-center justify-between w-full p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">

                          <div className="flex items-center space-x-3">
                            {getStatusIcon(item.severity)}
                            <div>
                              <div className="font-medium">{item.title}</div>
                              <div className="text-sm text-muted-foreground">{item.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusColor(item.severity) as any}>
                              {item.severity.toUpperCase()}
                            </Badge>
                            {openItems.includes(item.id) ?
                          <ChevronDown className="w-4 h-4" /> :

                          <ChevronRight className="w-4 h-4" />
                          }
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-3 pb-3">
                          <div className="mt-3 space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Solution Steps:</h4>
                              <ol className="list-decimal list-inside space-y-1 text-sm">
                                {item.solution.map((step, index) =>
                              <li key={index} className="text-gray-700">{step}</li>
                              )}
                              </ol>
                            </div>
                            
                            {item.code &&
                          <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">Code Example:</h4>
                                  <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(item.code!)}>

                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy
                                  </Button>
                                </div>
                                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                                  <code>{item.code}</code>
                                </pre>
                              </div>
                          }
                            
                            {item.links && item.links.length > 0 &&
                          <div>
                                <h4 className="font-medium mb-2">Helpful Links:</h4>
                                <div className="space-y-1">
                                  {item.links.map((link, index) =>
                              <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-blue-600 hover:text-blue-800">

                                      <ExternalLink className="w-3 h-3 mr-1" />
                                      {link.title}
                                    </a>
                              )}
                                </div>
                              </div>
                          }
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </CardContent>
                </Card>);

            })}
          </div>
        </TabsContent>

        <TabsContent value="quick-fixes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Phone Number Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div><strong>✅ Correct:</strong> +1234567890</div>
                  <div><strong>❌ Wrong:</strong> (123) 456-7890</div>
                  <div><strong>❌ Wrong:</strong> 123-456-7890</div>
                  <div><strong>❌ Wrong:</strong> 1234567890</div>
                </div>
                <Alert>
                  <AlertDescription className="text-xs">
                    Always use E.164 format: + [country code] [phone number]
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Account Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div>• Check balance in Twilio Console</div>
                  <div>• SMS costs ~$0.0075 per message</div>
                  <div>• Set up auto-recharge</div>
                  <div>• Monitor usage patterns</div>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open Billing Console
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div>• Account SID starts with "AC"</div>
                  <div>• Auth Token is case-sensitive</div>
                  <div>• No spaces in credentials</div>
                  <div>• Regenerate if compromised</div>
                </div>
                <Alert>
                  <AlertDescription className="text-xs">
                    Never share your Auth Token publicly
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Network className="w-5 h-5 mr-2" />
                  Test Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div>• Trial accounts have restrictions</div>
                  <div>• Only verified numbers receive SMS</div>
                  <div>• Add numbers to verified list</div>
                  <div>• Upgrade for full access</div>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Verify Numbers
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Twilio Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="https://www.twilio.com/docs/sms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">

                  <div>
                    <div className="font-medium">SMS API Docs</div>
                    <div className="text-sm text-muted-foreground">Complete SMS API reference</div>
                  </div>
                  <ExternalLink className="w-4 h-4" />
                </a>
                
                <a
                  href="https://www.twilio.com/docs/sms/troubleshooting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">

                  <div>
                    <div className="font-medium">SMS Troubleshooting</div>
                    <div className="text-sm text-muted-foreground">Official troubleshooting guide</div>
                  </div>
                  <ExternalLink className="w-4 h-4" />
                </a>
                
                <a
                  href="https://console.twilio.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">

                  <div>
                    <div className="font-medium">Twilio Console</div>
                    <div className="text-sm text-muted-foreground">Manage your account</div>
                  </div>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Testing Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded">
                  <div className="font-medium">SMS Test Numbers</div>
                  <div className="text-sm text-muted-foreground">
                    Use these for testing without charges
                  </div>
                  <div className="text-xs font-mono mt-1">+15005550006 (Valid)</div>
                </div>
                
                <div className="p-3 border rounded">
                  <div className="font-medium">Webhook Tester</div>
                  <div className="text-sm text-muted-foreground">
                    Test webhook deliveries
                  </div>
                  <div className="text-xs text-blue-600 mt-1">webhook.site</div>
                </div>
                
                <div className="p-3 border rounded">
                  <div className="font-medium">Phone Validator</div>
                  <div className="text-sm text-muted-foreground">
                    Validate phone number formats
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Twilio Lookup API</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  <strong>Critical SMS Issues?</strong> Contact Twilio Support directly through their console.
                  For application-specific issues, check the SMS logs and error messages in the History tab.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

};

export default SMSTroubleshootingGuide;