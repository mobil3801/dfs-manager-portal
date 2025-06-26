
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Shield, 
  Users, 
  Building, 
  Bell, 
  Database, 
  Lock, 
  Globe,
  Save,
  RotateCcw,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedPermissions } from '@/hooks/use-enhanced-permissions';
import { motion } from 'motion/react';
import RoleBasedPermissionSystem from '@/components/Admin/RoleBasedPermissionSystem';
import { AdminSettings } from '@/components/Admin/AdminSettings';

interface SettingsData {
  general: {
    siteName: string;
    siteDescription: string;
    timezone: string;
    dateFormat: string;
    currency: string;
  };
  security: {
    enableTwoFactor: boolean;
    sessionTimeout: number;
    passwordPolicy: string;
    allowMultipleSessions: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    desktopNotifications: boolean;
    alertThreshold: number;
  };
  stations: {
    defaultStation: string;
    enableCrossStationReporting: boolean;
    enableStationSpecificInventory: boolean;
  };
}

const EnhancedAppSettings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData>({
    general: {
      siteName: 'DFS Gas Station Manager',
      siteDescription: 'Comprehensive management system for gas stations',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD'
    },
    security: {
      enableTwoFactor: false,
      sessionTimeout: 30,
      passwordPolicy: 'medium',
      allowMultipleSessions: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      desktopNotifications: true,
      alertThreshold: 7
    },
    stations: {
      defaultStation: 'MOBIL',
      enableCrossStationReporting: true,
      enableStationSpecificInventory: true
    }
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasPermission, isAdmin, isManagement } = useEnhancedPermissions();

  console.log('EnhancedAppSettings: Component initialized', { user, isAdmin, isManagement });

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Saving settings:', settings);
      
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been successfully updated.',
      });
      
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      general: {
        siteName: 'DFS Gas Station Manager',
        siteDescription: 'Comprehensive management system for gas stations',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD'
      },
      security: {
        enableTwoFactor: false,
        sessionTimeout: 30,
        passwordPolicy: 'medium',
        allowMultipleSessions: false
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        desktopNotifications: true,
        alertThreshold: 7
      },
      stations: {
        defaultStation: 'MOBIL',
        enableCrossStationReporting: true,
        enableStationSpecificInventory: true
      }
    });
    
    toast({
      title: 'Settings Reset',
      description: 'All settings have been reset to default values.',
    });
  };

  const updateSettings = (section: keyof SettingsData, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-blue-600" />
                <CardTitle>Application Settings</CardTitle>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={saving}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
            <CardDescription>
              Configure system settings, security, notifications, and user management.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="stations" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Stations</span>
          </TabsTrigger>
          {(isAdmin || isManagement) && (
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Admin Panel</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic application settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => updateSettings('general', 'siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => updateSettings('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSettings('general', 'siteDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={settings.general.dateFormat}
                    onValueChange={(value) => updateSettings('general', 'dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.general.currency}
                    onValueChange={(value) => updateSettings('general', 'currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security policies and access controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">
                    Require additional verification for login
                  </p>
                </div>
                <Switch
                  checked={settings.security.enableTwoFactor}
                  onCheckedChange={(checked) => updateSettings('security', 'enableTwoFactor', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Multiple Sessions</Label>
                  <p className="text-sm text-gray-500">
                    Allow users to be logged in from multiple devices
                  </p>
                </div>
                <Switch
                  checked={settings.security.allowMultipleSessions}
                  onCheckedChange={(checked) => updateSettings('security', 'allowMultipleSessions', checked)}
                />
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                    min="5"
                    max="480"
                  />
                </div>
                <div>
                  <Label htmlFor="passwordPolicy">Password Policy</Label>
                  <Select
                    value={settings.security.passwordPolicy}
                    onValueChange={(value) => updateSettings('security', 'passwordPolicy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                      <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                      <SelectItem value="strong">Strong (12+ chars, symbols)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Security settings will take effect on the next user login.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateSettings('notifications', 'emailNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive critical alerts via SMS
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.smsNotifications}
                  onCheckedChange={(checked) => updateSettings('notifications', 'smsNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Desktop Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Show browser notifications
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.desktopNotifications}
                  onCheckedChange={(checked) => updateSettings('notifications', 'desktopNotifications', checked)}
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="alertThreshold">License Alert Threshold (days)</Label>
                <Input
                  id="alertThreshold"
                  type="number"
                  value={settings.notifications.alertThreshold}
                  onChange={(e) => updateSettings('notifications', 'alertThreshold', parseInt(e.target.value))}
                  min="1"
                  max="90"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Alert when licenses expire within this many days
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Station Settings</CardTitle>
              <CardDescription>
                Configure station-specific settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="defaultStation">Default Station</Label>
                <Select
                  value={settings.stations.defaultStation}
                  onValueChange={(value) => updateSettings('stations', 'defaultStation', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MOBIL">MOBIL</SelectItem>
                    <SelectItem value="AMOCO ROSEDALE">AMOCO ROSEDALE</SelectItem>
                    <SelectItem value="AMOCO BROOKLYN">AMOCO BROOKLYN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Cross-Station Reporting</Label>
                  <p className="text-sm text-gray-500">
                    Allow reports across multiple stations
                  </p>
                </div>
                <Switch
                  checked={settings.stations.enableCrossStationReporting}
                  onCheckedChange={(checked) => updateSettings('stations', 'enableCrossStationReporting', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Station-Specific Inventory</Label>
                  <p className="text-sm text-gray-500">
                    Maintain separate inventory for each station
                  </p>
                </div>
                <Switch
                  checked={settings.stations.enableStationSpecificInventory}
                  onCheckedChange={(checked) => updateSettings('stations', 'enableStationSpecificInventory', checked)}
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Station settings affect data visibility and reporting capabilities.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {(isAdmin || isManagement) && (
          <TabsContent value="admin" className="space-y-4">
            {isAdmin ? (
              <RoleBasedPermissionSystem />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span>Limited Admin Access</span>
                  </CardTitle>
                  <CardDescription>
                    Management role has restricted access to admin functions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Contact your system administrator for full admin panel access.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default EnhancedAppSettings;
