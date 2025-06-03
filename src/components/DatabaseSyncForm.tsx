import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Key, 
  Globe, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Shield,
  RotateCcw,
  Monitor,
  Trash2,
  Plus
} from 'lucide-react';

interface SyncConfig {
  projectUrl: string;
  apiKey: string;
  jwtSecret: string;
  databaseType: string;
  autoSync: boolean;
  syncInterval: number;
  backupEnabled: boolean;
  encryptionEnabled: boolean;
}

interface SyncStatus {
  isConnected: boolean;
  lastSync: string;
  tablesCount: number;
  recordsCount: number;
  status: 'idle' | 'syncing' | 'error' | 'success';
  errors: string[];
}

const DatabaseSyncForm: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    projectUrl: '',
    apiKey: '',
    jwtSecret: '',
    databaseType: 'postgresql',
    autoSync: true,
    syncInterval: 300, // 5 minutes
    backupEnabled: true,
    encryptionEnabled: true
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: false,
    lastSync: '',
    tablesCount: 0,
    recordsCount: 0,
    status: 'idle',
    errors: []
  });

  const [detectedStructures, setDetectedStructures] = useState<any[]>([]);

  const handleInputChange = (field: keyof SyncConfig, value: any) => {
    setSyncConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful connection
      setSyncStatus(prev => ({
        ...prev,
        isConnected: true,
        status: 'success'
      }));
      
      toast({
        title: "Connection Successful",
        description: "Successfully connected to your project database.",
      });
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isConnected: false,
        status: 'error',
        errors: ['Failed to connect to database']
      }));
      
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the database. Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const scanForStructures = async () => {
    setIsLoading(true);
    try {
      // Simulate scanning for form structures
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockStructures = [
        {
          name: 'user_registration_form',
          type: 'form',
          fields: ['email', 'password', 'firstName', 'lastName', 'phone'],
          detected: new Date().toISOString(),
          status: 'new'
        },
        {
          name: 'product_inventory',
          type: 'table',
          fields: ['productName', 'sku', 'price', 'quantity', 'category'],
          detected: new Date().toISOString(),
          status: 'existing'
        },
        {
          name: 'order_management',
          type: 'form',
          fields: ['orderNumber', 'customerEmail', 'items', 'totalAmount'],
          detected: new Date().toISOString(),
          status: 'new'
        }
      ];
      
      setDetectedStructures(mockStructures);
      
      toast({
        title: "Scan Complete",
        description: `Found ${mockStructures.length} form/table structures.`,
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Unable to scan for structures. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startAutoSync = async () => {
    setIsLoading(true);
    try {
      // Simulate starting auto-sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create tables for detected structures
      for (const structure of detectedStructures) {
        if (structure.status === 'new') {
          console.log(`Creating table for: ${structure.name}`);
          // Here you would call the actual table creation API
        }
      }
      
      setSyncStatus(prev => ({
        ...prev,
        status: 'success',
        lastSync: new Date().toISOString(),
        tablesCount: detectedStructures.length,
        recordsCount: 0
      }));
      
      toast({
        title: "Auto-Sync Started",
        description: "Database synchronization is now active and monitoring for changes.",
      });
      
      // Start monitoring interval
      if (syncConfig.autoSync) {
        setInterval(() => {
          console.log('Auto-sync check...');
          // Check for new structures and sync
        }, syncConfig.syncInterval * 1000);
      }
      
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to start auto-sync. Please check your configuration.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopAutoSync = () => {
    setSyncStatus(prev => ({
      ...prev,
      status: 'idle'
    }));
    
    toast({
      title: "Auto-Sync Stopped",
      description: "Database synchronization has been paused.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Auto Database Sync</h1>
        <p className="text-muted-foreground">
          Automatically synchronize your application forms and tables with your database
        </p>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="structures">Structures</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Database Credentials
                </CardTitle>
                <CardDescription>
                  Enter your project database credentials to enable auto-sync
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectUrl">Project URL</Label>
                  <Input
                    id="projectUrl"
                    placeholder="https://your-project.com"
                    value={syncConfig.projectUrl}
                    onChange={(e) => handleInputChange('projectUrl', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Your API key"
                    value={syncConfig.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jwtSecret">JWT Secret</Label>
                  <Input
                    id="jwtSecret"
                    type="password"
                    placeholder="Your JWT secret"
                    value={syncConfig.jwtSecret}
                    onChange={(e) => handleInputChange('jwtSecret', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="databaseType">Database Type</Label>
                  <Select 
                    value={syncConfig.databaseType}
                    onValueChange={(value) => handleInputChange('databaseType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="mongodb">MongoDB</SelectItem>
                      <SelectItem value="sqlite">SQLite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={testConnection}
                    disabled={isTesting || !syncConfig.projectUrl || !syncConfig.apiKey}
                    className="flex-1"
                  >
                    {isTesting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Globe className="h-4 w-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {syncStatus.isConnected ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className={syncStatus.isConnected ? 'text-green-600' : 'text-red-600'}>
                    {syncStatus.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                {syncStatus.isConnected && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tables:</span>
                      <Badge variant="secondary">{syncStatus.tablesCount}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Records:</span>
                      <Badge variant="secondary">{syncStatus.recordsCount}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Sync:</span>
                      <span className="text-sm text-muted-foreground">
                        {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'}
                      </span>
                    </div>
                  </div>
                )}

                {syncStatus.errors.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {syncStatus.errors.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={scanForStructures}
                    disabled={!syncStatus.isConnected || isLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Database className="h-4 w-4 mr-2" />
                    )}
                    Scan Structures
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="structures">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Detected Structures
              </CardTitle>
              <CardDescription>
                Forms and tables found in your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              {detectedStructures.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No structures detected. Click "Scan Structures" to find forms and tables.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {detectedStructures.map((structure, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            {structure.type === 'form' ? (
                              <Plus className="h-4 w-4" />
                            ) : (
                              <Database className="h-4 w-4" />
                            )}
                            {structure.name}
                          </h4>
                          <Badge variant={structure.status === 'new' ? 'default' : 'secondary'}>
                            {structure.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Type: {structure.type} | Fields: {structure.fields.length}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {structure.fields.map((field: string, fieldIndex: number) => (
                            <Badge key={fieldIndex} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sync className="h-5 w-5" />
                  Auto-Sync Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Auto-Sync Status:</span>
                  <Badge variant={syncStatus.status === 'success' ? 'default' : 'secondary'}>
                    {syncStatus.status}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={startAutoSync}
                    disabled={!syncStatus.isConnected || isLoading || syncStatus.status === 'success'}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Start Auto-Sync
                  </Button>
                  <Button 
                    onClick={stopAutoSync}
                    disabled={syncStatus.status !== 'success'}
                    variant="outline"
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Stop Sync
                  </Button>
                </div>

                {syncStatus.status === 'success' && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Auto-sync is active. Database will automatically update when changes are detected.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sync Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{syncStatus.tablesCount}</div>
                    <div className="text-sm text-muted-foreground">Tables Synced</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{syncStatus.recordsCount}</div>
                    <div className="text-sm text-muted-foreground">Records Synced</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Last Sync</div>
                  <div className="font-medium">
                    {syncStatus.lastSync ? 
                      new Date(syncStatus.lastSync).toLocaleString() : 
                      'Never'
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Sync Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoSync">Enable Auto-Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync when changes are detected
                  </p>
                </div>
                <Switch
                  id="autoSync"
                  checked={syncConfig.autoSync}
                  onCheckedChange={(checked) => handleInputChange('autoSync', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="syncInterval">Sync Interval (seconds)</Label>
                <Input
                  id="syncInterval"
                  type="number"
                  value={syncConfig.syncInterval}
                  onChange={(e) => handleInputChange('syncInterval', parseInt(e.target.value))}
                  min="60"
                  max="3600"
                />
                <p className="text-sm text-muted-foreground">
                  How often to check for changes (minimum 60 seconds)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="backupEnabled">Enable Backups</Label>
                  <p className="text-sm text-muted-foreground">
                    Create backups before making changes
                  </p>
                </div>
                <Switch
                  id="backupEnabled"
                  checked={syncConfig.backupEnabled}
                  onCheckedChange={(checked) => handleInputChange('backupEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="encryptionEnabled">Enable Encryption</Label>
                  <p className="text-sm text-muted-foreground">
                    Encrypt sensitive data during sync
                  </p>
                </div>
                <Switch
                  id="encryptionEnabled"
                  checked={syncConfig.encryptionEnabled}
                  onCheckedChange={(checked) => handleInputChange('encryptionEnabled', checked)}
                />
              </div>

              <div className="pt-4">
                <Button className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseSyncForm;