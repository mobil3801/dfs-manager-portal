import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  Settings,
  CreditCard,
  Globe,
  Clock,
  Shield,
  Zap,
  HelpCircle,
  ExternalLink,
  Copy,
  RefreshCw } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TroubleshootingStep {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'config' | 'network' | 'account' | 'delivery';
  solution: string[];
  testable: boolean;
}

const troubleshootingSteps: TroubleshootingStep[] = [
{
  id: 'sms-not-received',
  title: 'SMS Not Received at All',
  description: 'No SMS messages are being received by any recipients',
  severity: 'critical',
  category: 'config',
  testable: true,
  solution: [
  'Verify Twilio Account SID and Auth Token are correct',
  'Check that Twilio account is not suspended or has billing issues',
  'Ensure "From" phone number is a valid Twilio number',
  'Verify phone numbers are in correct E.164 format (+1234567890)',
  'Check if account is in test mode - only verified numbers receive SMS',
  'Test with a verified phone number first']

},
{
  id: 'partial-delivery',
  title: 'Some Recipients Not Getting SMS',
  description: 'SMS works for some numbers but not others',
  severity: 'high',
  category: 'delivery',
  testable: true,
  solution: [
  'Check if problematic numbers are in correct E.164 format',
  'Verify recipients are not blocking SMS from your number',
  'Check if numbers are valid and currently active',
  'Some carriers may block automated SMS - try different carriers',
  'Check Twilio delivery logs for specific error codes',
  'Verify international SMS is enabled if sending globally']

},
{
  id: 'test-mode-issues',
  title: 'Test Mode Limitations',
  description: 'SMS appears to send but recipients don\'t receive messages',
  severity: 'medium',
  category: 'account',
  testable: false,
  solution: [
  'In test mode, only verified phone numbers receive SMS',
  'Go to Twilio Console → Phone Numbers → Manage → Verified Caller IDs',
  'Add and verify each recipient\'s phone number',
  'Or upgrade to a paid Twilio account to exit test mode',
  'Test with your own verified number first']

},
{
  id: 'invalid-credentials',
  title: 'Invalid Twilio Credentials',
  description: 'Authentication errors when trying to send SMS',
  severity: 'critical',
  category: 'config',
  testable: true,
  solution: [
  'Double-check Account SID starts with "AC" and is 34 characters',
  'Verify Auth Token is exactly 32 characters',
  'Copy credentials directly from Twilio Console to avoid typos',
  'Make sure there are no extra spaces or hidden characters',
  'Try regenerating Auth Token if still having issues']

},
{
  id: 'insufficient-funds',
  title: 'Insufficient Account Balance',
  description: 'SMS appears successful but no messages are delivered',
  severity: 'high',
  category: 'account',
  testable: false,
  solution: [
  'Check Twilio account balance in Console → Billing',
  'Add funds to your Twilio account',
  'Set up auto-recharge to prevent future issues',
  'Each SMS costs approximately $0.0075 in the US',
  'International SMS rates vary by country']

},
{
  id: 'phone-format-errors',
  title: 'Phone Number Format Issues',
  description: 'Error messages about invalid phone number format',
  severity: 'medium',
  category: 'config',
  testable: true,
  solution: [
  'Use E.164 format: +[country code][number] (e.g., +1234567890)',
  'Remove spaces, dashes, parentheses from phone numbers',
  'Include country code even for domestic numbers',
  'US numbers: +1 followed by 10 digits',
  'Validate numbers before saving to database']

},
{
  id: 'delay-issues',
  title: 'SMS Delivery Delays',
  description: 'Messages are delivered but with significant delays',
  severity: 'low',
  category: 'delivery',
  testable: false,
  solution: [
  'Normal delivery time is 1-6 seconds, delays up to few minutes are normal',
  'Check if sending large volumes - may be rate limited',
  'Some carriers introduce delays during high traffic periods',
  'Consider using Twilio\'s priority messaging for time-sensitive alerts',
  'Monitor Twilio status page for service issues']

},
{
  id: 'international-issues',
  title: 'International SMS Problems',
  description: 'Issues sending SMS to international numbers',
  severity: 'medium',
  category: 'delivery',
  testable: true,
  solution: [
  'Verify international SMS is enabled in Twilio Console',
  'Check if destination country is supported by Twilio',
  'Some countries require sender registration or pre-approval',
  'International rates are higher - check account balance',
  'Use correct country code format (+44 for UK, +91 for India, etc.)']

}];


const SMSTroubleshootingGuide = () => {
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Record<string, 'testing' | 'passed' | 'failed'>>({});
  const { toast } = useToast();

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) =>
    prev.includes(stepId) ?
    prev.filter((id) => id !== stepId) :
    [...prev, stepId]
    );
  };

  const runDiagnostic = async (stepId: string) => {
    setTestResults((prev) => ({ ...prev, [stepId]: 'testing' }));

    // Simulate diagnostic test
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate random results for demo
    const result = Math.random() > 0.5 ? 'passed' : 'failed';
    setTestResults((prev) => ({ ...prev, [stepId]: result }));

    toast({
      title: result === 'passed' ? "✅ Test Passed" : "❌ Test Failed",
      description: result === 'passed' ?
      "This component appears to be working correctly" :
      "Issues detected - follow the solution steps below",
      variant: result === 'passed' ? 'default' : 'destructive'
    });
  };

  const getSeverityBadge = (severity: TroubleshootingStep['severity']) => {
    const variants = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive'
    } as const;

    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600'
    };

    return (
      <Badge variant={variants[severity]} className={colors[severity]}>
        {severity.toUpperCase()}
      </Badge>);

  };

  const getCategoryIcon = (category: TroubleshootingStep['category']) => {
    const icons = {
      config: Settings,
      network: Globe,
      account: CreditCard,
      delivery: Phone
    };
    const Icon = icons[category];
    return <Icon className="w-4 h-4" />;
  };

  const getTestIcon = (stepId: string) => {
    const result = testResults[stepId];
    if (result === 'testing') return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (result === 'passed') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (result === 'failed') return <XCircle className="w-4 h-4 text-red-500" />;
    return <HelpCircle className="w-4 h-4" />;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard"
    });
  };

  const categorizedSteps = troubleshootingSteps.reduce((acc, step) => {
    if (!acc[step.category]) acc[step.category] = [];
    acc[step.category].push(step);
    return acc;
  }, {} as Record<string, TroubleshootingStep[]>);

  return (
    <div className="space-y-6">
      {/* Quick Diagnostic */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Quick SMS Diagnostic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Start here if SMS is not working:</strong> Run these quick tests to identify the most common issues.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2"
              onClick={() => runDiagnostic('quick-config')}
              disabled={testResults['quick-config'] === 'testing'}>

              <div className="flex items-center space-x-2">
                {getTestIcon('quick-config')}
                <span className="font-semibold">Test Configuration</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Verify Twilio credentials and settings
              </span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2"
              onClick={() => runDiagnostic('quick-connectivity')}
              disabled={testResults['quick-connectivity'] === 'testing'}>

              <div className="flex items-center space-x-2">
                {getTestIcon('quick-connectivity')}
                <span className="font-semibold">Test Connectivity</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Check connection to Twilio API
              </span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2"
              onClick={() => runDiagnostic('quick-account')}
              disabled={testResults['quick-account'] === 'testing'}>

              <div className="flex items-center space-x-2">
                {getTestIcon('quick-account')}
                <span className="font-semibold">Test Account</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Verify account status and balance
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting Steps */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Issues</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {troubleshootingSteps.map((step) =>
            <Card key={step.id}>
                <Collapsible
                open={expandedSteps.includes(step.id)}
                onOpenChange={() => toggleStep(step.id)}>

                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {expandedSteps.includes(step.id) ?
                        <ChevronDown className="w-5 h-5" /> :
                        <ChevronRight className="w-5 h-5" />
                        }
                          {getCategoryIcon(step.category)}
                          <div>
                            <CardTitle className="text-left">{step.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getSeverityBadge(step.severity)}
                          {step.testable &&
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            runDiagnostic(step.id);
                          }}
                          disabled={testResults[step.id] === 'testing'}>

                              {getTestIcon(step.id)}
                              <span className="ml-1">Test</span>
                            </Button>
                        }
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3">Solution Steps:</h4>
                        <div className="space-y-2">
                          {step.solution.map((solution, index) =>
                        <div key={index} className="flex items-start space-x-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 mt-0.5 flex-shrink-0">
                                {index + 1}
                              </div>
                              <p className="text-sm">{solution}</p>
                            </div>
                        )}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}
          </div>
        </TabsContent>

        {Object.entries(categorizedSteps).map(([category, steps]) =>
        <TabsContent key={category} value={category}>
            <div className="space-y-4">
              {steps.map((step) =>
            <Card key={step.id}>
                  <Collapsible
                open={expandedSteps.includes(step.id)}
                onOpenChange={() => toggleStep(step.id)}>

                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {expandedSteps.includes(step.id) ?
                        <ChevronDown className="w-5 h-5" /> :
                        <ChevronRight className="w-5 h-5" />
                        }
                            {getCategoryIcon(step.category)}
                            <div>
                              <CardTitle className="text-left">{step.title}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {step.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getSeverityBadge(step.severity)}
                            {step.testable &&
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            runDiagnostic(step.id);
                          }}
                          disabled={testResults[step.id] === 'testing'}>

                                {getTestIcon(step.id)}
                                <span className="ml-1">Test</span>
                              </Button>
                        }
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-3">Solution Steps:</h4>
                          <div className="space-y-2">
                            {step.solution.map((solution, index) =>
                        <div key={index} className="flex items-start space-x-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 mt-0.5 flex-shrink-0">
                                  {index + 1}
                                </div>
                                <p className="text-sm">{solution}</p>
                              </div>
                        )}
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
            )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ExternalLink className="w-5 h-5 mr-2" />
            Additional Resources & Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Twilio Documentation:</h4>
              <div className="space-y-2 text-sm">
                <a href="https://www.twilio.com/docs/sms/api" target="_blank" rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-600 hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  <span>SMS API Documentation</span>
                </a>
                <a href="https://www.twilio.com/docs/sms/troubleshooting" target="_blank" rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-600 hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  <span>SMS Troubleshooting Guide</span>
                </a>
                <a href="https://status.twilio.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-600 hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  <span>Twilio Status Page</span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Common Error Codes:</h4>
              <div className="space-y-2 text-sm">
                <div><strong>21211:</strong> Invalid phone number format</div>
                <div><strong>21408:</strong> Permission denied to send SMS</div>
                <div><strong>21610:</strong> Message body required</div>
                <div><strong>21614:</strong> "To" number not valid mobile number</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Still Need Help?</span>
            </div>
            <p className="text-sm text-muted-foreground">
              If you've tried all troubleshooting steps and SMS is still not working, consider:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Contacting Twilio Support with your Account SID and error details</li>
              <li>• Checking the Twilio Console logs for detailed error messages</li>
              <li>• Testing with a different phone number or carrier</li>
              <li>• Reviewing your Twilio account settings and compliance requirements</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default SMSTroubleshootingGuide;