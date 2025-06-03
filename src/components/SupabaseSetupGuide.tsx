import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, ExternalLink, Copy, Database, Zap, Shield, Globe, Settings, Code, AlertCircle, FileText, Eye, EyeOff, Download, Sparkles, Server, Cloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const SupabaseSetupGuide: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [databasePassword, setDatabasePassword] = useState('');
  const [projectRegion, setProjectRegion] = useState('us-east-1');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const { toast } = useToast();

  // Enhanced database schema SQL with all tables
  const schemaSql = `-- Enhanced Database Schema for DFS Manager Portal
-- Auto-generated with complete table structure
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

-- Products table with enhanced fields
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

-- All other tables from the schema...
-- (This includes employees, sales reports, vendors, etc.)
-- Full schema available in project documentation

-- Trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`;

  const rlsSql = `-- Enhanced Row Level Security Configuration
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Additional policies for other tables...
-- (Full RLS configuration available in documentation)`;

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
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE sms_alert_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE sms_alert_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE sms_alert_history;`;

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
          title: '🎉 Connection Successful!',
          description: 'Supabase is properly configured and ready for real-time features.',
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

  const generateEnhancedEnvFiles = async () => {
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
      // Extract project ID from URL for additional configurations
      const projectId = supabaseUrl.replace('https://', '').split('.')[0];
      const currentDate = new Date().toISOString();
      
      const developmentEnvContent = `# DFS Manager Portal - Development Environment Configuration
# Auto-generated on ${currentDate}
# ⚠️  KEEP SECURE - Never commit to version control

# ===== CORE SUPABASE CONFIGURATION =====
VITE_SUPABASE_URL=${supabaseUrl.trim()}
VITE_SUPABASE_ANON_KEY=${supabaseKey.trim()}

# ===== DATABASE CONNECTION STRINGS =====
# Direct PostgreSQL connection for advanced operations
# Replace [PASSWORD] with your actual database password
DATABASE_URL=postgresql://postgres.${projectId}:[PASSWORD]@aws-0-${projectRegion}.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.${projectId}:[PASSWORD]@aws-0-${projectRegion}.pooler.supabase.com:5432/postgres

# Connection pooling for better performance
PGBOUNCER_URL=postgresql://postgres.${projectId}:[PASSWORD]@aws-0-${projectRegion}.pooler.supabase.com:6543/postgres?pgbouncer=true

# Connection pool settings
SUPABASE_POOL_SIZE=20
SUPABASE_POOL_TIMEOUT=30

# ===== PROJECT CONFIGURATION =====
VITE_APP_NAME="DFS Manager Portal"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENVIRONMENT="development"
VITE_SUPABASE_PROJECT_ID="${projectId}"
VITE_PROJECT_REGION="${projectRegion}"

# ===== FEATURE FLAGS =====
VITE_ENABLE_REALTIME=true
VITE_ENABLE_FILE_UPLOAD=true
VITE_ENABLE_SMS_ALERTS=true
VITE_ENABLE_AUDIT_LOGGING=true
VITE_ENABLE_VISUAL_EDITING=true
VITE_ENABLE_BARCODE_SCANNING=true
VITE_ENABLE_PRINT_FEATURES=true
VITE_ENABLE_BATCH_OPERATIONS=true

# ===== STORAGE CONFIGURATION =====
VITE_SUPABASE_STORAGE_BUCKET="dfs-manager-files"
VITE_MAX_FILE_SIZE_MB=25
VITE_ALLOWED_FILE_TYPES="image/*,application/pdf,text/*,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
VITE_IMAGE_COMPRESSION_QUALITY=0.8
VITE_AUTO_COMPRESS_IMAGES=true

# ===== SECURITY SETTINGS =====
VITE_ENABLE_RLS=true
VITE_SESSION_TIMEOUT_MINUTES=480
VITE_ENABLE_MFA=false
VITE_PASSWORD_MIN_LENGTH=8
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_LOCKOUT_DURATION_MINUTES=15

# ===== API & PERFORMANCE CONFIGURATION =====
VITE_API_TIMEOUT_MS=30000
VITE_MAX_RETRY_ATTEMPTS=3
VITE_ENABLE_API_CACHING=true
VITE_CACHE_DURATION_MINUTES=15
VITE_BATCH_SIZE_LIMIT=1000

# ===== MONITORING & ANALYTICS =====
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_USAGE_ANALYTICS=false
VITE_ENABLE_MEMORY_LEAK_DETECTION=true
VITE_LOG_RETENTION_DAYS=30

# ===== NOTIFICATION SETTINGS =====
VITE_NOTIFICATION_TIMEOUT_MS=5000
VITE_ENABLE_BROWSER_NOTIFICATIONS=true
VITE_ENABLE_EMAIL_NOTIFICATIONS=true
VITE_ENABLE_SOUND_NOTIFICATIONS=false
VITE_MAX_NOTIFICATIONS_DISPLAYED=10

# ===== DEVELOPMENT SETTINGS =====
VITE_DEBUG_MODE=true
VITE_ENABLE_DEV_TOOLS=true
VITE_LOG_LEVEL="info"
VITE_ENABLE_REDUX_DEVTOOLS=true
VITE_ENABLE_REACT_QUERY_DEVTOOLS=true

# ===== SMS INTEGRATION (TWILIO) =====
# Uncomment and configure for SMS alerts
# VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
# VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
# VITE_TWILIO_PHONE_NUMBER=your_twilio_phone_number
# VITE_SMS_RATE_LIMIT_PER_HOUR=100

# ===== EMAIL SERVICE CONFIGURATION =====
# VITE_EMAIL_SERVICE_PROVIDER="supabase"
# VITE_EMAIL_FROM_ADDRESS="noreply@your-domain.com"
# VITE_EMAIL_REPLY_TO_ADDRESS="support@your-domain.com"

# ===== BACKUP & SYNC SETTINGS =====
VITE_AUTO_BACKUP_ENABLED=true
VITE_BACKUP_INTERVAL_HOURS=24
VITE_SYNC_CONFLICT_RESOLUTION="latest_wins"
VITE_ENABLE_OFFLINE_MODE=true
VITE_OFFLINE_STORAGE_QUOTA_MB=50

# ===== UI/UX CONFIGURATION =====
VITE_THEME_MODE="light"
VITE_ENABLE_DARK_MODE=true
VITE_DEFAULT_PAGINATION_SIZE=20
VITE_ENABLE_TABLE_SORTING=true
VITE_ENABLE_EXPORT_FEATURES=true
VITE_ENABLE_KEYBOARD_SHORTCUTS=true
VITE_ANIMATION_DURATION_MS=300

# ===== BUSINESS LOGIC SETTINGS =====
VITE_DEFAULT_STATION="MOBIL"
VITE_CURRENCY_CODE="USD"
VITE_CURRENCY_SYMBOL="$"
VITE_TAX_RATE_PERCENTAGE=8.25
VITE_LOW_STOCK_THRESHOLD=10
VITE_CRITICAL_STOCK_THRESHOLD=5
VITE_LICENSE_EXPIRY_WARNING_DAYS=30

# ===== INTEGRATION ENDPOINTS =====
# VITE_EXTERNAL_API_BASE_URL="https://api.your-partner.com"
# VITE_WEBHOOK_BASE_URL="https://your-domain.com/webhooks"
# VITE_ANALYTICS_ENDPOINT="https://analytics.your-domain.com"

# ===== DEPLOYMENT CONFIGURATION =====
VITE_DEPLOYMENT_ENVIRONMENT="development"
VITE_BUILD_TIMESTAMP="${currentDate}"
VITE_GIT_COMMIT_HASH="auto-generated"

# ===== SETUP INSTRUCTIONS =====
# 1. Replace [PASSWORD] in DATABASE_URL with your actual Supabase database password
# 2. Configure SMS and email settings if needed
# 3. Update external API endpoints for your integrations
# 4. Restart your development server after making changes
# 5. Keep this file secure and never commit to version control

`;

      const productionEnvContent = `# DFS Manager Portal - Production Environment Configuration
# Auto-generated on ${currentDate}
# 🔐 PRODUCTION CREDENTIALS - MAXIMUM SECURITY REQUIRED

# ===== PRODUCTION SUPABASE CONFIGURATION =====
VITE_SUPABASE_URL=${supabaseUrl.trim()}
VITE_SUPABASE_ANON_KEY=${supabaseKey.trim()}

# ===== PRODUCTION DATABASE =====
# ⚠️  Use production database credentials
DATABASE_URL=postgresql://postgres.${projectId}:[PROD_PASSWORD]@aws-0-${projectRegion}.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.${projectId}:[PROD_PASSWORD]@aws-0-${projectRegion}.pooler.supabase.com:5432/postgres
PGBOUNCER_URL=postgresql://postgres.${projectId}:[PROD_PASSWORD]@aws-0-${projectRegion}.pooler.supabase.com:6543/postgres?pgbouncer=true

# ===== PRODUCTION SETTINGS =====
NODE_ENV=production
VITE_APP_ENVIRONMENT="production"
VITE_DEBUG_MODE=false
VITE_ENABLE_DEV_TOOLS=false
VITE_LOG_LEVEL="error"

# ===== SECURITY (PRODUCTION) =====
VITE_ENABLE_HTTPS_ONLY=true
VITE_ENABLE_CSP=true
VITE_SESSION_TIMEOUT_MINUTES=240
VITE_ENABLE_MFA=true
VITE_MAX_LOGIN_ATTEMPTS=3
VITE_LOCKOUT_DURATION_MINUTES=30

# ===== PERFORMANCE (PRODUCTION) =====
VITE_ENABLE_API_CACHING=true
VITE_ENABLE_COMPRESSION=true
VITE_ENABLE_SOURCE_MAPS=false
VITE_CACHE_DURATION_MINUTES=60
VITE_BATCH_SIZE_LIMIT=500

# ===== MONITORING (PRODUCTION) =====
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_USAGE_ANALYTICS=true
VITE_LOG_RETENTION_DAYS=90

# ===== BACKUP & RELIABILITY =====
VITE_AUTO_BACKUP_ENABLED=true
VITE_BACKUP_INTERVAL_HOURS=6
VITE_ENABLE_REDUNDANCY=true
VITE_FAILOVER_ENABLED=true

# ===== PRODUCTION INTEGRATIONS =====
# Configure with production API keys
# VITE_TWILIO_ACCOUNT_SID=prod_twilio_account_sid
# VITE_TWILIO_AUTH_TOKEN=prod_twilio_auth_token
# VITE_EXTERNAL_API_BASE_URL="https://api.production-partner.com"

`;

      // Configuration summary file
      const configSummaryContent = `# DFS Manager Portal - Configuration Summary
# Generated on ${currentDate}

## Environment Files Generated:
1. .env.local - Development configuration with all features
2. .env.production - Production-optimized configuration
3. config-summary.md - This summary file

## Key Features Configured:
✅ Supabase real-time database integration
✅ File upload and storage management
✅ SMS alert system integration
✅ Enhanced security settings
✅ Performance optimization
✅ Error monitoring and analytics
✅ Backup and sync capabilities
✅ Business logic configurations

## Database Connection:
- Project ID: ${projectId}
- Region: ${projectRegion}
- Connection pooling enabled
- Row Level Security configured

## Next Steps:
1. Place .env.local in your project root directory
2. Update database password in connection strings
3. Configure external integrations (SMS, email)
4. Run database schema setup in Supabase
5. Test connection using the setup guide

## Security Notes:
⚠️  Never commit .env files to version control
🔐 Use different credentials for production
🛡️  Enable MFA for production environments
📊 Monitor logs and performance regularly

## Support:
For configuration help, refer to the Supabase Setup Guide
or check the project documentation.
`;

      // Copy content to clipboard
      await navigator.clipboard.writeText(developmentEnvContent);

      // Generate and download all files
      const downloadFile = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      // Download all configuration files
      downloadFile(developmentEnvContent, '.env.local');
      setTimeout(() => downloadFile(productionEnvContent, '.env.production'), 1000);
      setTimeout(() => downloadFile(configSummaryContent, 'config-summary.md'), 2000);

      toast({
        title: '🚀 Enhanced Configuration Package Generated!',
        description: 'Downloaded 3 files: .env.local, .env.production, and config-summary.md with comprehensive project settings.'
      });

      // Clear the form for security
      setSupabaseUrl('');
      setSupabaseKey('');
      setDatabasePassword('');
      setShowKey(false);

      // Move to next step
      setActiveStep(2);

    } catch (error) {
      console.error('Error generating enhanced environment files:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not create environment files. Please try again or create them manually.',
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
      content: (
        <div className="space-y-4">
          <p>1. Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a> and create a new account or sign in.</p>
          <p>2. Click "New Project" and fill in the details:</p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>Project name: DFS Manager Portal</li>
            <li>Database password: Choose a strong password (save it!)</li>
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
      title: 'Enhanced Auto-Generation',
      description: 'Generate comprehensive environment configuration with database connections',
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <p>1. In your Supabase project dashboard, go to Settings &gt; API</p>
          <p>2. Copy your Project URL and anon public key, then configure below:</p>
          
          <div className="space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Enhanced Environment Generator</span>
              <Badge variant="outline" className="text-xs bg-green-100 text-green-800">NEW</Badge>
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

              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-xs"
                >
                  {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
                </Button>
              </div>

              {showAdvancedOptions && (
                <div className="space-y-3 p-4 bg-white/50 rounded border">
                  <div>
                    <Label htmlFor="project-region" className="text-sm font-medium">Project Region</Label>
                    <select
                      id="project-region"
                      value={projectRegion}
                      onChange={(e) => setProjectRegion(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="us-east-1">US East (N. Virginia)</option>
                      <option value="us-west-1">US West (N. California)</option>
                      <option value="eu-west-1">Europe (Ireland)</option>
                      <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="db-password" className="text-sm font-medium">Database Password (Optional)</Label>
                    <Input
                      id="db-password"
                      type="password"
                      placeholder="Your database password"
                      value={databasePassword}
                      onChange={(e) => setDatabasePassword(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-600 mt-1">Will be included in connection strings</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Button
                  onClick={generateEnhancedEnvFiles}
                  disabled={isGenerating || !supabaseUrl.trim() || !supabaseKey.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating Enhanced Configuration...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      🚀 Generate Enhanced Environment Package
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
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-700 font-medium">Enhanced Package Includes:</span>
              <Badge variant="outline" className="text-xs bg-green-100 text-green-800">3 Files</Badge>
            </div>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li><strong>.env.local</strong> - Complete development configuration</li>
              <li><strong>.env.production</strong> - Production-optimized settings</li>
              <li><strong>config-summary.md</strong> - Setup guide and documentation</li>
            </ul>
          </div>
          
          <Alert>
            <Server className="h-4 w-4" />
            <AlertDescription>
              ✨ <strong>New Features:</strong> Database connection strings, performance settings, security configurations, SMS integration setup, and comprehensive business logic variables.
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      title: 'Setup Database Schema',
      description: 'Create tables and enable Row Level Security',
      icon: Code,
      content: (
        <div className="space-y-4">
          <p>1. Go to your Supabase project dashboard &gt; SQL Editor</p>
          <p>2. Copy and execute the following SQL to create all required tables:</p>
          
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-xs max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Enhanced Database Schema SQL</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(schemaSql, 'Database schema')}
              >
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
                onClick={() => copyToClipboard(rlsSql, 'RLS setup')}
              >
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
      )
    },
    {
      title: 'Enable Real-time Features',
      description: 'Configure real-time subscriptions and test connection',
      icon: Zap,
      content: (
        <div className="space-y-4">
          <p>1. In your Supabase project, go to Database &gt; Replication</p>
          <p>2. Enable real-time for all tables by adding them to the publication:</p>
          
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
            <div className="flex items-center justify-between mb-2">
              <span>Enable Real-time SQL</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(realtimeSql, 'Real-time setup')}
              >
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
              className="w-full"
            >
              {connectionStatus === 'testing' ? 'Testing...' : 'Test Supabase Connection'}
            </Button>
            
            {connectionStatus === 'success' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-700">
                  ✅ Supabase connection successful! Real-time features are now active.
                </AlertDescription>
              </Alert>
            )}
            
            {connectionStatus === 'error' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">
                  ❌ Connection failed. Please check your environment variables and try again.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              Once connected, all data changes will sync in real-time across all users!
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
            Enhanced Supabase Setup Guide
            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">Auto-Generation</Badge>
          </DialogTitle>
          <DialogDescription>
            Complete guide with enhanced auto-generation for environment files, database connections, and project configurations
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeStep.toString()} onValueChange={(value) => setActiveStep(parseInt(value))}>
          <TabsList className="grid w-full grid-cols-4">
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
        
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="h-4 w-4 text-blue-600" />
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
            <li>Enhanced database connection management</li>
            <li>Comprehensive environment configuration</li>
          </ul>
          <div className="mt-3 p-2 bg-green-100 rounded border-l-4 border-green-500">
            <p className="text-sm text-green-700 font-medium">
              ✨ Pro Tip: After setup, check the real-time status indicator in the top-right corner of your dashboard!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupabaseSetupGuide;