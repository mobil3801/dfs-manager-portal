import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  ExternalLink, 
  CheckCircle, 
  ArrowRight,
  Phone,
  Key,
  User,
  CreditCard,
  Settings
} from 'lucide-react';

const SMSSetupGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Create Sinch ClickSend Account",
      description: "Sign up for a Sinch ClickSend account to get your API credentials",
      completed: false
    },
    {
      id: 2,
      title: "Get API Credentials",
      description: "Obtain your username and API key from the Sinch ClickSend dashboard",
      completed: false
    },
    {
      id: 3,
      title: "Purchase Credits",
      description: "Add credits to your account to send SMS messages",
      completed: false
    },
    {
      id: 4,
      title: "Configure SMS Service",
      description: "Enter your credentials in the DFS Manager configuration",
      completed: false
    },
    {
      id: 5,
      title: "Test SMS Service",
      description: "Send a test message to verify everything is working",
      completed: false
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Sinch ClickSend SMS Setup Guide
          </CardTitle>
          <CardDescription>
            Complete step-by-step guide to set up SMS notifications with Sinch ClickSend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              This guide will help you configure Sinch ClickSend SMS service for your DFS Manager system.
              You'll need to create a Sinch ClickSend account and obtain API credentials.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {currentStep === step.id && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                </div>

                {currentStep === step.id && (
                  <Card className="ml-12">
                    <CardContent className="p-4">
                      {step.id === 1 && (
                        <div className="space-y-3">
                          <p className="text-sm">
                            1. Go to <a href="https://www.clicksend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                              Sinch ClickSend website <ExternalLink className="h-3 w-3" />
                            </a>
                          </p>
                          <p className="text-sm">2. Click "Sign Up" and create your account</p>
                          <p className="text-sm">3. Complete the email verification process</p>
                          <p className="text-sm">4. Log in to your new ClickSend dashboard</p>
                          <Button 
                            size="sm" 
                            onClick={() => setCurrentStep(2)}
                            className="flex items-center gap-2"
                          >
                            Next Step <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      {step.id === 2 && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium">Get your API credentials:</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <strong>Username:</strong> Your ClickSend login email
                            </div>
                            <div className="flex items-center gap-2">
                              <Key className="h-4 w-4" />
                              <strong>API Key:</strong> Go to Account → API Credentials in your dashboard
                            </div>
                          </div>
                          <p className="text-sm">
                            Navigate to your account settings and find the API credentials section.
                            Copy your username (email) and generate/copy your API key.
                          </p>
                          <Button 
                            size="sm" 
                            onClick={() => setCurrentStep(3)}
                            className="flex items-center gap-2"
                          >
                            Next Step <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      {step.id === 3 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <p className="text-sm font-medium">Purchase SMS Credits:</p>
                          </div>
                          <p className="text-sm">
                            1. In your ClickSend dashboard, go to "Buy Credit"
                          </p>
                          <p className="text-sm">
                            2. Choose your credit package (recommend starting with $10-20)
                          </p>
                          <p className="text-sm">
                            3. Complete the payment process
                          </p>
                          <Alert>
                            <CreditCard className="h-4 w-4" />
                            <AlertDescription>
                              SMS costs vary by destination. US SMS typically costs around $0.04-0.06 per message.
                              Check current pricing in your ClickSend dashboard.
                            </AlertDescription>
                          </Alert>
                          <Button 
                            size="sm" 
                            onClick={() => setCurrentStep(4)}
                            className="flex items-center gap-2"
                          >
                            Next Step <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      {step.id === 4 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            <p className="text-sm font-medium">Configure DFS Manager:</p>
                          </div>
                          <p className="text-sm">
                            1. Go to the SMS Configuration tab in this system
                          </p>
                          <p className="text-sm">
                            2. Enter your ClickSend username (email)
                          </p>
                          <p className="text-sm">
                            3. Enter your API key
                          </p>
                          <p className="text-sm">
                            4. Set your sender phone number (if you have a dedicated number)
                          </p>
                          <p className="text-sm">
                            5. Enable the SMS service
                          </p>
                          <p className="text-sm">
                            6. Save the configuration
                          </p>
                          <Button 
                            size="sm" 
                            onClick={() => setCurrentStep(5)}
                            className="flex items-center gap-2"
                          >
                            Next Step <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      {step.id === 5 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <p className="text-sm font-medium">Test Your Setup:</p>
                          </div>
                          <p className="text-sm">
                            1. Go to the SMS Testing tab
                          </p>
                          <p className="text-sm">
                            2. Enter a test phone number (in E.164 format: +1234567890)
                          </p>
                          <p className="text-sm">
                            3. Send a test message
                          </p>
                          <p className="text-sm">
                            4. Verify you receive the message on your phone
                          </p>
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              Once you receive the test message, your Sinch ClickSend SMS service is fully configured and ready to use!
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {index < steps.length - 1 && currentStep > step.id && (
                  <Separator className="ml-4 w-4 rotate-90" />
                )}
              </div>
            ))}
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Important Notes:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• SMS messages cost money - monitor your usage and account balance</li>
                <li>• Always test with a real phone number before deploying to production</li>
                <li>• Set appropriate daily limits to prevent unexpected charges</li>
                <li>• Keep your API credentials secure and never share them</li>
                <li>• Check Sinch ClickSend's delivery reports for message status</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMSSetupGuide;
