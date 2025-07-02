import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Bell,
  Mail,
  Smartphone,
  Clock,
  AlertTriangle,
  Save,
  Plus,
  Trash2 } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AlertRule {
  id: string;
  name: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'expired';
  threshold: number;
  isEnabled: boolean;
  notificationMethods: string[];
  priority: 'high' | 'medium' | 'low';
}

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  emailAddress: string;
  phoneNumber: string;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

const AlertSettingsPage: React.FC = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Mock data initialization
  useEffect(() => {
    const mockRules: AlertRule[] = [
    {
      id: '1',
      name: 'Low Stock Alert',
      type: 'low_stock',
      threshold: 10,
      isEnabled: true,
      notificationMethods: ['email', 'app'],
      priority: 'medium'
    },
    {
      id: '2',
      name: 'Out of Stock Alert',
      type: 'out_of_stock',
      threshold: 0,
      isEnabled: true,
      notificationMethods: ['email', 'sms', 'app'],
      priority: 'high'
    },
    {
      id: '3',
      name: 'Expiring Products',
      type: 'expiring',
      threshold: 7, // days
      isEnabled: true,
      notificationMethods: ['email'],
      priority: 'medium'
    }];


    const mockNotificationSettings: NotificationSettings = {
      emailEnabled: true,
      smsEnabled: false,
      inAppEnabled: true,
      emailAddress: 'manager@gasstation.com',
      phoneNumber: '+1234567890',
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '06:00'
      }
    };

    setTimeout(() => {
      setAlertRules(mockRules);
      setNotificationSettings(mockNotificationSettings);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to the backend
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Settings saved",
        description: "Alert settings have been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateAlertRule = (id: string, updates: Partial<AlertRule>) => {
    setAlertRules((prev) => prev.map((rule) =>
    rule.id === id ? { ...rule, ...updates } : rule
    ));
  };

  const addNewRule = () => {
    const newRule: AlertRule = {
      id: Date.now().toString(),
      name: 'New Alert Rule',
      type: 'low_stock',
      threshold: 5,
      isEnabled: true,
      notificationMethods: ['app'],
      priority: 'medium'
    };
    setAlertRules((prev) => [...prev, newRule]);
  };

  const deleteRule = (id: string) => {
    setAlertRules((prev) => prev.filter((rule) => rule.id !== id));
    toast({
      title: "Rule deleted",
      description: "Alert rule has been removed."
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'low_stock':return 'Low Stock';
      case 'out_of_stock':return 'Out of Stock';
      case 'expiring':return 'Expiring Soon';
      case 'expired':return 'Expired';
      default:return type;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>);

  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alert Settings</h1>
          <p className="text-muted-foreground">
            Configure inventory alerts and notification preferences
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving} className="flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </Button>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Alert Rules</h2>
            <Button onClick={addNewRule} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Rule</span>
            </Button>
          </div>

          <div className="grid gap-4">
            {alertRules.map((rule) =>
            <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Switch
                      checked={rule.isEnabled}
                      onCheckedChange={(checked) => updateAlertRule(rule.id, { isEnabled: checked })} />

                      <div>
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <Badge variant="outline">{getTypeLabel(rule.type)}</Badge>
                          <Badge variant={rule.priority === 'high' ? 'destructive' : 'secondary'}>
                            {rule.priority.toUpperCase()}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRule(rule.id)}
                    className="text-destructive hover:text-destructive">

                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${rule.id}`}>Rule Name</Label>
                      <Input
                      id={`name-${rule.id}`}
                      value={rule.name}
                      onChange={(e) => updateAlertRule(rule.id, { name: e.target.value })} />

                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`type-${rule.id}`}>Alert Type</Label>
                      <Select
                      value={rule.type}
                      onValueChange={(value) => updateAlertRule(rule.id, { type: value as AlertRule['type'] })}>

                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low_stock">Low Stock</SelectItem>
                          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                          <SelectItem value="expiring">Expiring Soon</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`threshold-${rule.id}`}>
                        Threshold {rule.type === 'expiring' ? '(days)' : '(quantity)'}
                      </Label>
                      <Input
                      id={`threshold-${rule.id}`}
                      type="number"
                      value={rule.threshold}
                      onChange={(e) => updateAlertRule(rule.id, { threshold: parseInt(e.target.value) || 0 })} />

                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`priority-${rule.id}`}>Priority</Label>
                      <Select
                      value={rule.priority}
                      onValueChange={(value) => updateAlertRule(rule.id, { priority: value as AlertRule['priority'] })}>

                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label>Notification Methods</Label>
                      <div className="flex items-center space-x-4">
                        {['email', 'sms', 'app'].map((method) =>
                      <label key={method} className="flex items-center space-x-2 cursor-pointer">
                            <input
                          type="checkbox"
                          checked={rule.notificationMethods.includes(method)}
                          onChange={(e) => {
                            const methods = e.target.checked ?
                            [...rule.notificationMethods, method] :
                            rule.notificationMethods.filter((m) => m !== method);
                            updateAlertRule(rule.id, { notificationMethods: methods });
                          }}
                          className="rounded" />

                            <span className="capitalize">{method === 'app' ? 'In-App' : method}</span>
                          </label>
                      )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <h2 className="text-xl font-semibold">Notification Settings</h2>
          
          {notificationSettings &&
          <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>Email Notifications</span>
                  </CardTitle>
                  <CardDescription>Configure email alert settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-enabled">Enable Email Notifications</Label>
                    <Switch
                    id="email-enabled"
                    checked={notificationSettings.emailEnabled}
                    onCheckedChange={(checked) =>
                    setNotificationSettings((prev) => prev ? { ...prev, emailEnabled: checked } : undefined)
                    } />

                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-address">Email Address</Label>
                    <Input
                    id="email-address"
                    type="email"
                    value={notificationSettings.emailAddress}
                    onChange={(e) =>
                    setNotificationSettings((prev) => prev ? { ...prev, emailAddress: e.target.value } : undefined)
                    }
                    disabled={!notificationSettings.emailEnabled} />

                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5" />
                    <span>SMS Notifications</span>
                  </CardTitle>
                  <CardDescription>Configure SMS alert settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
                    <Switch
                    id="sms-enabled"
                    checked={notificationSettings.smsEnabled}
                    onCheckedChange={(checked) =>
                    setNotificationSettings((prev) => prev ? { ...prev, smsEnabled: checked } : undefined)
                    } />

                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <Input
                    id="phone-number"
                    type="tel"
                    value={notificationSettings.phoneNumber}
                    onChange={(e) =>
                    setNotificationSettings((prev) => prev ? { ...prev, phoneNumber: e.target.value } : undefined)
                    }
                    disabled={!notificationSettings.smsEnabled} />

                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>In-App Notifications</span>
                  </CardTitle>
                  <CardDescription>Configure in-app alert settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="app-enabled">Enable In-App Notifications</Label>
                    <Switch
                    id="app-enabled"
                    checked={notificationSettings.inAppEnabled}
                    onCheckedChange={(checked) =>
                    setNotificationSettings((prev) => prev ? { ...prev, inAppEnabled: checked } : undefined)
                    } />

                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Quiet Hours</span>
                  </CardTitle>
                  <CardDescription>Set quiet hours to avoid notifications during specific times</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="quiet-enabled">Enable Quiet Hours</Label>
                    <Switch
                    id="quiet-enabled"
                    checked={notificationSettings.quietHours.enabled}
                    onCheckedChange={(checked) =>
                    setNotificationSettings((prev) => prev ? {
                      ...prev,
                      quietHours: { ...prev.quietHours, enabled: checked }
                    } : undefined)
                    } />

                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                      id="start-time"
                      type="time"
                      value={notificationSettings.quietHours.startTime}
                      onChange={(e) =>
                      setNotificationSettings((prev) => prev ? {
                        ...prev,
                        quietHours: { ...prev.quietHours, startTime: e.target.value }
                      } : undefined)
                      }
                      disabled={!notificationSettings.quietHours.enabled} />

                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                      id="end-time"
                      type="time"
                      value={notificationSettings.quietHours.endTime}
                      onChange={(e) =>
                      setNotificationSettings((prev) => prev ? {
                        ...prev,
                        quietHours: { ...prev.quietHours, endTime: e.target.value }
                      } : undefined)
                      }
                      disabled={!notificationSettings.quietHours.enabled} />

                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          }
        </TabsContent>
      </Tabs>
    </div>);

};

export default AlertSettingsPage;