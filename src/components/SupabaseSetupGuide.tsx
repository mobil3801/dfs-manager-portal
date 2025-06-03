import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, ExternalLink, Copy, Database, Zap, Shield, Globe, Settings, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SupabaseSetupGuide: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard.`,
    });
  };

  const setupSteps = [
    {
      title: 'Create Supabase Project',
      description: 'Set up your Supabase project for real-time data',
      icon: Database,
      content: (
        <div className="space-y-4">
          <p>1. Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a> and create a new account or sign in.</p>
          <p>2. Click "New Project" and fill in the details:</p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>Project name: DFS Manager Portal</li>
            <li>Database password: Choose a strong password</li>
            <li>Region: Select closest to your location</li>
          </ul>
          <p>3. Wait for the project to be created (usually takes 1-2 minutes).</p>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your project will be ready when you see the dashboard with API settings.
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      title: 'Configure Environment Variables',
      description: 'Set up your API keys and connection strings',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <p>1. In your Supabase project dashboard, go to Settings &gt; API</p>
          <p>2. Copy your Project URL and anon public key:</p>
          
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
            <div className="flex items-center justify-between mb-2">
              <span>VITE_SUPABASE_URL=https://your-project.supabase.co</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard('VITE_SUPABASE_URL=https://your-project.supabase.co', 'Supabase URL template')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span>VITE_SUPABASE_ANON_KEY=your-anon-key-here</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard('VITE_SUPABASE_ANON_KEY=your-anon-key-here', 'Supabase anon key template')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p>3. Create a <code>.env.local</code> file in your project root and add these variables with your actual values.</p>
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Never commit your actual API keys to version control. Use .env.local for local development.
            </AlertDescription>
          </Alert>
        </div>
      )
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Database className="h-4 w-4 mr-2" />
          Setup Supabase
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Setup Guide
          </DialogTitle>
          <DialogDescription>
            Complete guide to integrate Supabase for real-time data and automatic storage
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeStep.toString()} onValueChange={(value) => setActiveStep(parseInt(value))}>
          <TabsList className="grid w-full grid-cols-2">
            {setupSteps.map((step, index) => (
              <TabsTrigger key={index} value={index.toString()} className="text-xs">
                <step.icon className="h-4 w-4 mr-1" />
                {step.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {setupSteps.map((step, index) => (
            <TabsContent key={index} value={index.toString()} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <step.icon className="h-5 w-5" />
                    {step.title}
                  </CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {step.content}
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                      disabled={activeStep === 0}
                    >
                      Previous
                    </Button>
                    <Badge variant="outline">
                      Step {activeStep + 1} of {setupSteps.length}
                    </Badge>
                    <Button
                      onClick={() => setActiveStep(Math.min(setupSteps.length - 1, activeStep + 1))}
                      disabled={activeStep === setupSteps.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Code className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-800">Quick Start</span>
          </div>
          <p className="text-sm text-blue-700">
            Once configured, your DFS Manager Portal will automatically sync all data with Supabase and provide 
            real-time updates across all users. The system maintains compatibility with your existing API while 
            adding powerful real-time capabilities.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupabaseSetupGuide;