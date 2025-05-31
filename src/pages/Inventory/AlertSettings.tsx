import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Bell, Mail, AlertTriangle, Settings } from 'lucide-react';

interface AlertSettings {
  lowStockThreshold: number;
  criticalStockThreshold: number;
  emailNotifications: boolean;
  autoReorderSuggestions: boolean;
  alertFrequency: string;
  notificationEmails: string[];
  businessHoursOnly: boolean;
  weekendsIncluded: boolean;
}

const AlertSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AlertSettings>({
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    emailNotifications: true,
    autoReorderSuggestions: true,
    alertFrequency: 'daily',
    notificationEmails: ['manager@gasstation.com'],
    businessHoursOnly: false,
    weekendsIncluded: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('inventoryAlertSettings');
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        setSettings({ ...settings, ...parsedSettings });
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  };

  const handleInputChange = (field: keyof AlertSettings, value: string | number | boolean | string[]) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailListChange = (emails: string) => {
    const emailArray = emails.split(',').map((email) => email.trim()).filter((email) => email);
    handleInputChange('notificationEmails', emailArray);
  };

  const validateSettings = (): boolean => {
    if (settings.criticalStockThreshold >= settings.lowStockThreshold) {
      toast({
        title: 'Validation Error',
        description: 'Critical stock threshold must be lower than low stock threshold',
        variant: 'destructive'
      });
      return false;
    }

    if (settings.criticalStockThreshold < 0 || settings.lowStockThreshold < 0) {
      toast({
        title: 'Validation Error',
        description: 'Stock thresholds must be positive numbers',
        variant: 'destructive'
      });
      return false;
    }

    if (settings.emailNotifications && settings.notificationEmails.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide at least one email address for notifications',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateSettings()) return;

    setLoading(true);
    try {
      localStorage.setItem('inventoryAlertSettings', JSON.stringify(settings));

      toast({
        title: 'Settings Saved',
        description: 'Alert settings have been updated successfully'
      });

      // Optional: Send a test email to verify settings
      if (settings.emailNotifications) {
        try {
          await window.ezsite.apis.sendEmail({
            from: 'support@ezsite.ai',
            to: settings.notificationEmails,
            subject: '✅ Inventory Alert Settings Updated',
            html: `
              <h2>Inventory Alert Settings Updated</h2>
              <p>Your inventory alert settings have been successfully updated with the following configuration:</p>
              <ul>
                <li><strong>Low Stock Threshold:</strong> ${settings.lowStockThreshold} units</li>
                <li><strong>Critical Stock Threshold:</strong> ${settings.criticalStockThreshold} units</li>
                <li><strong>Email Notifications:</strong> ${settings.emailNotifications ? 'Enabled' : 'Disabled'}</li>
                <li><strong>Alert Frequency:</strong> ${settings.alertFrequency}</li>
                <li><strong>Auto Reorder Suggestions:</strong> ${settings.autoReorderSuggestions ? 'Enabled' : 'Disabled'}</li>
              </ul>
              <p>This is a confirmation email to verify that notifications are working correctly.</p>
              <p><em>Generated at: ${new Date().toLocaleString()}</em></p>
            `
          });
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          toast({
            title: 'Warning',
            description: 'Settings saved but failed to send confirmation email',
            variant: 'destructive'
          });
        }
      }

      setTimeout(() => navigate('/inventory/alerts'), 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save alert settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestAlert = async () => {
    try {
      await window.ezsite.apis.sendEmail({
        from: 'support@ezsite.ai',
        to: settings.notificationEmails,
        subject: '🧪 Test Inventory Alert',
        html: `
          <h2>🧪 Test Inventory Alert</h2>
          <p>This is a test alert to verify your email notification settings are working correctly.</p>
          
          <div style="background-color: #fee; border: 1px solid #fcc; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #c53030; margin: 0 0 10px 0;">⚠️ Simulated Critical Stock Alert</h3>
            <p><strong>Product:</strong> Test Product ABC</p>
            <p><strong>Current Stock:</strong> 2 units</p>
            <p><strong>Minimum Stock:</strong> 10 units</p>
            <p><strong>Supplier:</strong> Test Supplier</p>
          </div>
          
          <div style="background-color: #fef5e7; border: 1px solid #fbd38d; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #c05621; margin: 0 0 10px 0;">📉 Simulated Low Stock Alert</h3>
            <p><strong>Product:</strong> Test Product XYZ</p>
            <p><strong>Current Stock:</strong> 8 units</p>
            <p><strong>Minimum Stock:</strong> 15 units</p>
            <p><strong>Supplier:</strong> Test Supplier</p>
          </div>
          
          <p><strong>Alert Settings:</strong></p>
          <ul>
            <li>Low Stock Threshold: ${settings.lowStockThreshold} units</li>
            <li>Critical Stock Threshold: ${settings.criticalStockThreshold} units</li>
            <li>Alert Frequency: ${settings.alertFrequency}</li>
          </ul>
          
          <p>If you received this email, your alert notifications are configured correctly!</p>
          <p><em>Test sent at: ${new Date().toLocaleString()}</em></p>
        `
      });

      toast({
        title: 'Test Alert Sent',
        description: 'Check your email to verify notifications are working'
      });
    } catch (error) {
      console.error('Error sending test alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test alert email',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/inventory/alerts')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Alerts
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Alert Settings</h1>
          <p className="text-muted-foreground">Configure inventory alert thresholds and notifications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Thresholds */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Stock Thresholds
            </CardTitle>
            <CardDescription>
              Set the stock levels that trigger low stock and critical stock alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="1"
                  value={settings.lowStockThreshold}
                  onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value) || 0)} />

                <p className="text-sm text-muted-foreground">
                  Alert when stock falls below this level
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="criticalStockThreshold">Critical Stock Threshold</Label>
                <Input
                  id="criticalStockThreshold"
                  type="number"
                  min="1"
                  value={settings.criticalStockThreshold}
                  onChange={(e) => handleInputChange('criticalStockThreshold', parseInt(e.target.value) || 0)} />

                <p className="text-sm text-muted-foreground">
                  Urgent alert when stock falls below this level
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Threshold Guidelines</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Critical threshold should be lower than low stock threshold</li>
                <li>• Consider your supplier lead times when setting thresholds</li>
                <li>• Higher-volume products may need higher thresholds</li>
                <li>• Review and adjust thresholds based on sales patterns</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>Preview of how your settings will work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div>
                <div className="font-medium text-red-900">Critical Alert</div>
                <div className="text-sm text-red-700">≤ {settings.criticalStockThreshold} units</div>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div>
                <div className="font-medium text-orange-900">Low Stock Alert</div>
                <div className="text-sm text-orange-700">≤ {settings.lowStockThreshold} units</div>
              </div>
              <Bell className="h-6 w-6 text-orange-600" />
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <div className="font-medium text-green-900">Good Stock</div>
                <div className="text-sm text-green-700">&gt; {settings.lowStockThreshold} units</div>
              </div>
              <div className="h-6 w-6 bg-green-600 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Configure how and when you receive alert notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts via email when stock levels are low
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)} />

            </div>

            {settings.emailNotifications &&
            <>
                <div className="space-y-2">
                  <Label htmlFor="notificationEmails">Notification Email Addresses</Label>
                  <Input
                  id="notificationEmails"
                  type="email"
                  value={settings.notificationEmails.join(', ')}
                  onChange={(e) => handleEmailListChange(e.target.value)}
                  placeholder="manager@example.com, assistant@example.com" />

                  <p className="text-sm text-muted-foreground">
                    Enter multiple email addresses separated by commas
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Business Hours Only</Label>
                    <p className="text-sm text-muted-foreground">
                      Only send alerts during business hours (9 AM - 6 PM)
                    </p>
                  </div>
                  <Switch
                  checked={settings.businessHoursOnly}
                  onCheckedChange={(checked) => handleInputChange('businessHoursOnly', checked)} />

                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Weekends</Label>
                    <p className="text-sm text-muted-foreground">
                      Send alerts on weekends and holidays
                    </p>
                  </div>
                  <Switch
                  checked={settings.weekendsIncluded}
                  onCheckedChange={(checked) => handleInputChange('weekendsIncluded', checked)} />

                </div>

                <Button variant="outline" onClick={sendTestAlert} className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Test Alert Email
                </Button>
              </>
            }
          </CardContent>
        </Card>

        {/* Additional Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Additional Features
            </CardTitle>
            <CardDescription>Extra automation and suggestions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Reorder Suggestions</Label>
                <p className="text-sm text-muted-foreground">
                  Suggest reorder quantities based on sales history
                </p>
              </div>
              <Switch
                checked={settings.autoReorderSuggestions}
                onCheckedChange={(checked) => handleInputChange('autoReorderSuggestions', checked)} />

            </div>

            <div className="space-y-2">
              <Label htmlFor="alertFrequency">Alert Frequency</Label>
              <select
                id="alertFrequency"
                value={settings.alertFrequency}
                onChange={(e) => handleInputChange('alertFrequency', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">

                <option value="realtime">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <p className="text-sm text-muted-foreground">
                How often to check and send alerts
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate('/inventory/alerts')}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ?
          <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </> :

          <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          }
        </Button>
      </div>
    </div>);

};

export default AlertSettingsPage;