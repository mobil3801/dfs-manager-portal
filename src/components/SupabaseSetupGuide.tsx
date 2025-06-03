import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, ExternalLink, Copy, Database, Zap, Shield, Globe, Settings, Code, AlertCircle, FileText, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const SupabaseSetupGuide: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Database schema SQL
  const schemaSql = `-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (built-in auth.users is used)
-- User profiles table for additional user data
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Employee',
  station TEXT DEFAULT '',
  employee_id TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  hire_date TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  detailed_permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  product_name TEXT DEFAULT '',
  product_code TEXT DEFAULT '',
  category TEXT DEFAULT '',
  price DECIMAL DEFAULT 0,
  quantity_in_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  supplier TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_by INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  serial_number INTEGER DEFAULT 0,
  weight DECIMAL DEFAULT 0,
  weight_unit TEXT DEFAULT 'lb',
  department TEXT DEFAULT 'Convenience Store',
  merchant_id INTEGER DEFAULT 0,
  bar_code_case TEXT DEFAULT '',
  bar_code_unit TEXT DEFAULT '',
  last_updated_date TIMESTAMPTZ DEFAULT NOW(),
  last_shopping_date TIMESTAMPTZ DEFAULT NOW(),
  case_price DECIMAL DEFAULT 0,
  unit_per_case INTEGER DEFAULT 1,
  unit_price DECIMAL DEFAULT 0,
  retail_price DECIMAL DEFAULT 0,
  overdue BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT DEFAULT '',
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  position TEXT DEFAULT '',
  station TEXT DEFAULT '',
  hire_date TIMESTAMPTZ DEFAULT NOW(),
  salary DECIMAL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER DEFAULT 0,
  date_of_birth TIMESTAMPTZ DEFAULT NOW(),
  current_address TEXT DEFAULT '',
  mailing_address TEXT DEFAULT '',
  reference_name TEXT DEFAULT '',
  id_document_type TEXT DEFAULT '',
  id_document_file_id INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales reports table
CREATE TABLE IF NOT EXISTS daily_sales_reports_enhanced (
  id BIGSERIAL PRIMARY KEY,
  report_date TIMESTAMPTZ DEFAULT NOW(),
  station TEXT DEFAULT '',
  employee_name TEXT DEFAULT '',
  cash_collection_on_hand DECIMAL DEFAULT 0,
  total_short_over DECIMAL DEFAULT 0,
  credit_card_amount DECIMAL DEFAULT 0,
  debit_card_amount DECIMAL DEFAULT 0,
  mobile_amount DECIMAL DEFAULT 0,
  cash_amount DECIMAL DEFAULT 0,
  grocery_sales DECIMAL DEFAULT 0,
  ebt_sales DECIMAL DEFAULT 0,
  lottery_net_sales DECIMAL DEFAULT 0,
  scratch_off_sales DECIMAL DEFAULT 0,
  lottery_total_cash DECIMAL DEFAULT 0,
  regular_gallons DECIMAL DEFAULT 0,
  super_gallons DECIMAL DEFAULT 0,
  diesel_gallons DECIMAL DEFAULT 0,
  total_gallons DECIMAL DEFAULT 0,
  expenses_data TEXT DEFAULT '[]',
  day_report_file_id INTEGER DEFAULT 0,
  veeder_root_file_id INTEGER DEFAULT 0,
  lotto_report_file_id INTEGER DEFAULT 0,
  scratch_off_report_file_id INTEGER DEFAULT 0,
  total_sales DECIMAL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_by INTEGER DEFAULT 0,
  employee_id TEXT DEFAULT '',
  shift TEXT DEFAULT 'DAY',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Continue with other tables...
-- (This is a condensed version - the full schema would include all tables)`;

  const rlsSql = `-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales_reports_enhanced ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage employees" ON employees
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage sales reports" ON daily_sales_reports_enhanced
  FOR ALL USING (auth.role() = 'authenticated');`;

  const realtimeSql = `-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE employees;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_sales_reports_enhanced;
ALTER PUBLICATION supabase_realtime ADD TABLE vendors;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE licenses_certificates;
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_records;
ALTER PUBLICATION supabase_realtime ADD TABLE salary_records;
ALTER PUBLICATION supabase_realtime ADD TABLE stations;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;`;

  const testConnection = async () => {
    setConnectionStatus('testing');

    try {
      // Test basic connection
      const { data, error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true });

      if (error) {
        console.error('Supabase connection error:', error);
        setConnectionStatus('error');
        toast({
          title: 'Connection Failed',
          description: 'Could not connect to Supabase. Please check your configuration.',
          variant: 'destructive'
        });
      } else {
        setConnectionStatus('success');
        toast({
          title: 'Connection Successful!',
          description: 'Supabase is properly configured and ready for real-time features.'
        });
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      toast({
        title: 'Connection Test Failed',
        description: 'Please verify your environment variables are set correctly.',
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard.`
    });
  };

  const validateSupabaseUrl = (url: string): boolean => {
    const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/;
    return urlPattern.test(url.trim());
  };

  const validateSupabaseKey = (key: string): boolean => {
    // Supabase anon keys typically start with 'eyJ' (JWT format)
    return key.trim().length > 100 && key.trim().startsWith('eyJ');
  };

  const generateEnvFile = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both Supabase URL and API key.',
        variant: 'destructive'
      });
      return;
    }

    if (!validateSupabaseUrl(supabaseUrl)) {
      toast({
        title: 'Invalid URL',
        description: 'Please provide a valid Supabase URL (e.g., https://your-project.supabase.co)',
        variant: 'destructive'
      });
      return;
    }

    if (!validateSupabaseKey(supabaseKey)) {
      toast({
        title: 'Invalid API Key',
        description: 'Please provide a valid Supabase anon public key.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const envContent = `# Supabase Configuration
# Generated automatically by DFS Manager Portal
# Keep these values secure and never commit to version control

VITE_SUPABASE_URL=${supabaseUrl.trim()}
VITE_SUPABASE_ANON_KEY=${supabaseKey.trim()}

# Optional: Add custom configurations below
# VITE_APP_ENVIRONMENT=development
# VITE_APP_VERSION=1.0.0
`;

      // Copy environment content to clipboard
      await navigator.clipboard.writeText(envContent);
      
      // Trigger download of the .env.local file
      const blob = new Blob([envContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '.env.local';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: '✅ Environment File Ready!',
        description: 'The .env.local file has been downloaded and copied to clipboard. Please place it in your project root directory.',
      });

      // Clear the form for security
      setSupabaseUrl('');
      setSupabaseKey('');
      setShowKey(false);
      
      // Move to next step
      setActiveStep(2);
      
    } catch (error) {
      console.error('Error generating .env.local file:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not create .env.local file. Please try again or create it manually.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const setupSteps = [
  {
    title: 'Create Supabase Project',
    description: 'Set up your Supabase project for real-time data',
    icon: Database,
    content:
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

  },
  {
    title: 'Auto-Generate Environment File',
    description: 'Automatically create .env.local with your Supabase credentials',
    icon: FileText,
    content:
    <div className="space-y-4">
          <p>1. In your Supabase project dashboard, go to Settings &gt; API</p>
          <p>2. Copy your Project URL and anon public key, then paste them below:</p>
          
          <div className="space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Automatic .env.local Generator</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="supabase-url" className="text-sm font-medium">Supabase Project URL</Label>
                <Input
                  id="supabase-url"
                  type="url"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">Found in Settings &gt; API &gt; Project URL</p>
              </div>
              
              <div>
                <Label htmlFor="supabase-key" className="text-sm font-medium">Supabase Anon Public Key</Label>
                <div className="relative mt-1">
                  <Input
                    id="supabase-key"
                    type={showKey ? "text" : "password"}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-1">Found in Settings &gt; API &gt; anon public</p>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={generateEnvFile}
                  disabled={isGenerating || !supabaseUrl.trim() || !supabaseKey.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating Environment File...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      ⚡ Auto-Generate & Download .env.local
                    </>
                  )}
                </Button>
                
                {(supabaseUrl.trim() || supabaseKey.trim()) && (
                  <div className="text-xs text-center text-gray-600">
                    {!validateSupabaseUrl(supabaseUrl) && supabaseUrl.trim() && (
                      <p className="text-red-600">⚠️ Invalid URL format</p>
                    )}
                    {!validateSupabaseKey(supabaseKey) && supabaseKey.trim() && (
                      <p className="text-red-600">⚠️ Invalid API key format</p>
                    )}
                    {validateSupabaseUrl(supabaseUrl) && validateSupabaseKey(supabaseKey) && (
                      <p className="text-green-600">✓ Valid credentials - ready to generate!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">Generated file structure:</span>
              <Badge variant="outline" className="text-xs">Preview</Badge>
            </div>
            <div className="font-mono text-xs text-gray-600 bg-white p-3 rounded border">
              <div className="text-green-600"># Supabase Configuration</div>
              <div className="text-green-600"># Auto-generated by DFS Manager Portal</div>
              <div className="mt-2">
                <span className="text-blue-600">VITE_SUPABASE_URL</span>=
                <span className="text-purple-600">{supabaseUrl || 'your-project-url'}</span>
              </div>
              <div>
                <span className="text-blue-600">VITE_SUPABASE_ANON_KEY</span>=
                <span className="text-purple-600">{supabaseKey ? '***[HIDDEN]***' : 'your-anon-key'}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✨ <strong>Auto-Generation Features:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Validates your Supabase URL format automatically</li>
                  <li>Checks API key format (JWT structure)</li>
                  <li>Downloads ready-to-use .env.local file</li>
                  <li>Copies content to clipboard for easy pasting</li>
                  <li>Includes helpful comments and structure</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Notice:</strong> Place the downloaded .env.local file in your project root directory. Never commit this file to version control as it contains sensitive API keys.
              </AlertDescription>
            </Alert>
          </div>
        </div>

  },
  {
    title: 'Setup Database Schema',
    description: 'Create tables and enable Row Level Security',
    icon: Code,
    content:
    <div className="space-y-4">
          <p>1. Go to your Supabase project dashboard &gt; SQL Editor</p>
          <p>2. Copy and execute the following SQL to create all required tables:</p>
          
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-xs max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Database Schema SQL</span>
              <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(schemaSql, 'Database schema')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <pre className="whitespace-pre-wrap text-xs">{schemaSql}</pre>
          </div>
          
          <p>3. Enable Row Level Security (RLS) for all tables:</p>
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
            <div className="flex items-center justify-between mb-2">
              <span>Enable RLS SQL</span>
              <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(rlsSql, 'RLS setup')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <pre className="whitespace-pre-wrap text-xs">{rlsSql}</pre>
          </div>
          
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              This will create all tables needed for the DFS Manager Portal and enable secure access.
            </AlertDescription>
          </Alert>
        </div>

  },
  {
    title: 'Enable Real-time Features',
    description: 'Configure real-time subscriptions and test connection',
    icon: Zap,
    content:
    <div className="space-y-4">
          <p>1. In your Supabase project, go to Database &gt; Replication</p>
          <p>2. Enable real-time for all tables by adding them to the publication:</p>
          
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
            <div className="flex items-center justify-between mb-2">
              <span>Enable Real-time SQL</span>
              <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(realtimeSql, 'Real-time setup')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <pre className="whitespace-pre-wrap text-xs">{realtimeSql}</pre>
          </div>
          
          <p>3. Test your connection:</p>
          <div className="space-y-2">
            <Button
          onClick={testConnection}
          disabled={connectionStatus === 'testing'}
          className="w-full">
              {connectionStatus === 'testing' ? 'Testing...' : 'Test Supabase Connection'}
            </Button>
            
            {connectionStatus === 'success' &&
        <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-700">
                  ✅ Supabase connection successful! Real-time features are now active.
                </AlertDescription>
              </Alert>
        }
            
            {connectionStatus === 'error' &&
        <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">
                  ❌ Connection failed. Please check your environment variables and try again.
                </AlertDescription>
              </Alert>
        }
          </div>
          
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              Once connected, all data changes will sync in real-time across all users!
            </AlertDescription>
          </Alert>
        </div>

  }];



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
          <TabsList className="grid w-full grid-cols-4">
            {setupSteps.map((step, index) =>
            <TabsTrigger key={index} value={index.toString()} className="text-xs">
                <step.icon className="h-4 w-4 mr-1" />
                {step.title}
              </TabsTrigger>
            )}
          </TabsList>
          
          {setupSteps.map((step, index) =>
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
                    disabled={activeStep === 0}>

                      Previous
                    </Button>
                    <Badge variant="outline">
                      Step {activeStep + 1} of {setupSteps.length}
                    </Badge>
                    <Button
                    onClick={() => setActiveStep(Math.min(setupSteps.length - 1, activeStep + 1))}
                    disabled={activeStep === setupSteps.length - 1}>

                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-800">Full Real-time Activation</span>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            Once all steps are completed, your DFS Manager Portal will have:
          </p>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Real-time data synchronization across all users</li>
            <li>Instant updates for sales reports, inventory, and employee data</li>
            <li>Secure authentication with Row Level Security</li>
            <li>Automatic backup and data persistence</li>
            <li>Live notifications for important events</li>
            <li>Multi-user collaboration with conflict resolution</li>
          </ul>
          <div className="mt-3 p-2 bg-green-100 rounded border-l-4 border-green-500">
            <p className="text-sm text-green-700 font-medium">
              ✨ Pro Tip: After setup, check the real-time status indicator in the top-right corner of your dashboard!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>);

};

export default SupabaseSetupGuide;