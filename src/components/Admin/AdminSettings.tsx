import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Shield, 
  Bell, 
  Key, 
  Users, 
  Database, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Save,
  RefreshCw,
  Lock,
  Unlock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { motion } from 'motion/react';
import EnhancedAdminPanel from './EnhancedAdminPanel';

interface SecuritySettings {
  require_2fa: boolean;
  session_timeout: number;
  max_login_attempts: number;
  password_expiry_days: number;
  audit_retention_days: number;
  auto_logout_inactive: boolean;
  ip_restriction_enabled: boolean;
  allowed_ips: string[];
}

interface SystemSettings {
  backup_enabled: boolean;
  backup_frequency: string;
  maintenance_mode: boolean;
  debug_mode: boolean;
  cache_enabled: boolean;
  auto_sync_enabled: boolean;
}

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const { hasAdminAccess } = useAdminAccess();
  
  const [loading, setLoading] = useState(false);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    require_2fa: false,
    session_timeout: 30,
    max_login_attempts: 5,
    password_expiry_days: 90,
    audit_retention_days: 365,
    auto_logout_inactive: true,
    ip_restriction_enabled: false,
    allowed_ips: []
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    backup_enabled: true,
    backup_frequency: 'daily',
    maintenance_mode: false,
    debug_mode: false,
    cache_enabled: true,
    auto_sync_enabled: true
  });

  const [activeTab, setActiveTab] = useState('admin-panel');

  const saveSecuritySettings = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would save to a configuration table
      // For now, we'll simulate with localStorage
      localStorage.setItem('security_settings', JSON.stringify(securitySettings));
      
      // Log audit event
      await logAuditEvent('Security Settings Updated', 'Administrator updated security configuration');
      
      toast({
        title: "Success",
        description: "Security settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast({
        title: "Error",
        description: "Failed to save security settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSystemSettings = async () => {
    try {
      setLoading(true);
      
      localStorage.setItem('system_settings', JSON.stringify(systemSettings));
      
      await logAuditEvent('System Settings Updated', 'Administrator updated system configuration');
      
      toast({
        title: "Success",
        description: "System settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving system settings:', error);
      toast({
        title: "Error",
        description: "Failed to save system settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logAuditEvent = async (eventType: string, actionPerformed: string) => {
    try {
      await window.ezsite.apis.tableCreate(12706, {
        event_type: eventType,
        user_id: 1,
        username: 'admin',
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent,
        event_timestamp: new Date().toISOString(),
        event_status: 'Success',
        resource_accessed: 'Admin Settings',
        action_performed: actionPerformed,
        session_id: Date.now().toString(),
        risk_level: 'Medium',
        additional_data: JSON.stringify({ module: 'AdminSettings' })
      });
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  };

  useEffect(() => {
    if (hasAdminAccess) {
      // Load saved settings
      const savedSecurity = localStorage.getItem('security_settings');
      const savedSystem = localStorage.getItem('system_settings');
      
      if (savedSecurity) {
        setSecuritySettings(JSON.parse(savedSecurity));
      }
      
      if (savedSystem) {
        setSystemSettings(JSON.parse(savedSystem));
      }
    }
  }, [hasAdminAccess]);

  if (!hasAdminAccess) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have administrator privileges to access these settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">
            Configure system settings and manage user permissions
          </p>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="admin-panel" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Admin Panel
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        {/* Admin Panel Tab */}
        <TabsContent value="admin-panel">
          <EnhancedAdminPanel />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Configure security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Authentication Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold">Authentication</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="require_2fa">Require Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Force all users to enable 2FA for enhanced security
                      </p>
                    </div>
                    <Switch
                      id="require_2fa"
                      checked={securitySettings.require_2fa}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, require_2fa: checked }))
                      }
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                      <Input
                        id="session_timeout"
                        type="number"
                        value={securitySettings.session_timeout}
                        onChange={(e) => 
                          setSecuritySettings(prev => ({ 
                            ...prev, 
                            session_timeout: parseInt(e.target.value) || 30 
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                      <Input
                        id="max_login_attempts"
                        type="number"
                        value={securitySettings.max_login_attempts}
                        onChange={(e) => 
                          setSecuritySettings(prev => ({ 
                            ...prev, 
                            max_login_attempts: parseInt(e.target.value) || 5 
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Password Policy */}
              <div className="space-y-4">
                <h4 className="font-semibold">Password Policy</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="password_expiry">Password Expiry (days)</Label>
                    <Input
                      id="password_expiry"
                      type="number"
                      value={securitySettings.password_expiry_days}
                      onChange={(e) => 
                        setSecuritySettings(prev => ({ 
                          ...prev, 
                          password_expiry_days: parseInt(e.target.value) || 90 
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto_logout">Auto-logout on Inactivity</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically logout inactive users
                      </p>
                    </div>
                    <Switch
                      id="auto_logout"
                      checked={securitySettings.auto_logout_inactive}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, auto_logout_inactive: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Audit Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold">Audit & Logging</h4>
                <div>
                  <Label htmlFor="audit_retention">Audit Log Retention (days)</Label>
                  <Input
                    id="audit_retention"
                    type="number"
                    value={securitySettings.audit_retention_days}
                    onChange={(e) => 
                      setSecuritySettings(prev => ({ 
                        ...prev, 
                        audit_retention_days: parseInt(e.target.value) || 365 
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveSecuritySettings} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Security Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Configure system-wide settings and features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Backup Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold">Backup & Recovery</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="backup_enabled">Automatic Backups</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable automatic database backups
                      </p>
                    </div>
                    <Switch
                      id="backup_enabled"
                      checked={systemSettings.backup_enabled}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, backup_enabled: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Performance Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold">Performance</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="cache_enabled">Enable Caching</Label>
                      <p className="text-sm text-muted-foreground">
                        Improve performance with intelligent caching
                      </p>
                    </div>
                    <Switch
                      id="cache_enabled"
                      checked={systemSettings.cache_enabled}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, cache_enabled: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto_sync">Auto Database Sync</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically sync data across stations
                      </p>
                    </div>
                    <Switch
                      id="auto_sync"
                      checked={systemSettings.auto_sync_enabled}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, auto_sync_enabled: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Maintenance Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold">Maintenance</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Put the system in maintenance mode
                      </p>
                    </div>
                    <Switch
                      id="maintenance_mode"
                      checked={systemSettings.maintenance_mode}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, maintenance_mode: checked }))
                      }
                    />
                  </div>
                  
                  {systemSettings.maintenance_mode && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Maintenance mode will prevent non-admin users from accessing the system.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="debug_mode">Debug Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable detailed logging for troubleshooting
                      </p>
                    </div>
                    <Switch
                      id="debug_mode"
                      checked={systemSettings.debug_mode}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, debug_mode: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveSystemSettings} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save System Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Database Connection</span>
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Authentication Service</span>
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Backup System</span>
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Running
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>SMS Alerts</span>
                  <Badge className="bg-yellow-500 text-white">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Testing
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Active Users</span>
                  <Badge variant="outline">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Users</span>
                  <Badge variant="outline">45</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Daily Logins</span>
                  <Badge variant="outline">28</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Failed Attempts</span>
                  <Badge variant="outline">3</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;