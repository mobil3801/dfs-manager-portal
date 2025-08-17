import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  Settings,
  MessageSquare,
  Clock,
  Users,
  Calendar,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Save } from
'lucide-react';
import AccessDenied from '@/components/AccessDenied';
import useAdminAccess from '@/hooks/use-admin-access';

interface AlertSetting {
  id?: number;
  alert_name: string;
  alert_type: string;
  is_enabled: boolean;
  trigger_condition: string;
  threshold_value: number;
  notification_method: string;
  recipient_list: string;
  message_template: string;
  frequency: string;
  created_at?: string;
  updated_at?: string;
}

interface AlertHistory {
  id: number;
  alert_setting_id: number;
  triggered_at: string;
  status: string;
  message_sent: string;
  recipients: string;
  error_message?: string;
}

const AlertSettings: React.FC = () => {
  const { isAdmin } = useAdminAccess();
  const { toast } = useToast();
  const [alertSettings, setAlertSettings] = useState<AlertSetting[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertSetting | null>(null);
  const [newAlert, setNewAlert] = useState<AlertSetting>({
    alert_name: '',
    alert_type: 'license_expiry',
    is_enabled: true,
    trigger_condition: 'days_before_expiry',
    threshold_value: 30,
    notification_method: 'sms',
    recipient_list: '',
    message_template: 'Alert: {alert_name} - {details}',
    frequency: 'once'
  });

  const alertTypes = [
  { value: 'license_expiry', label: 'License Expiry' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'system_error', label: 'System Error' },
  { value: 'failed_login', label: 'Failed Login' },
  { value: 'daily_report', label: 'Daily Report' },
  { value: 'maintenance_due', label: 'Maintenance Due' }];


  const notificationMethods = [
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
  { value: 'both', label: 'SMS + Email' }];


  const frequencies = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }];


  useEffect(() => {
    fetchAlertSettings();
    fetchAlertHistory();
  }, []);

  const fetchAlertSettings = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(12612, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: []
      });

      if (error) throw new Error(error);
      setAlertSettings(data?.List || []);
    } catch (error) {
      console.error('Error fetching alert settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch alert settings",
        variant: "destructive"
      });
    }
  };

  const fetchAlertHistory = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(12613, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'triggered_at',
        IsAsc: false,
        Filters: []
      });

      if (error) throw new Error(error);
      setAlertHistory(data?.List || []);
    } catch (error) {
      console.error('Error fetching alert history:', error);
    }
  };

  const createAlertSetting = async () => {
    try {
      if (!newAlert.alert_name || !newAlert.recipient_list) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      setLoading(true);
      const { error } = await window.ezsite.apis.tableCreate(12612, {
        ...newAlert,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) throw new Error(error);

      toast({
        title: "Success",
        description: "Alert setting created successfully"
      });

      setNewAlert({
        alert_name: '',
        alert_type: 'license_expiry',
        is_enabled: true,
        trigger_condition: 'days_before_expiry',
        threshold_value: 30,
        notification_method: 'sms',
        recipient_list: '',
        message_template: 'Alert: {alert_name} - {details}',
        frequency: 'once'
      });
      setIsCreateDialogOpen(false);
      await fetchAlertSettings();
    } catch (error: any) {
      console.error('Error creating alert setting:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create alert setting",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAlertSetting = async () => {
    if (!selectedAlert) return;

    try {
      setLoading(true);
      const { error } = await window.ezsite.apis.tableUpdate(12612, {
        ID: selectedAlert.id,
        ...newAlert,
        updated_at: new Date().toISOString()
      });

      if (error) throw new Error(error);

      toast({
        title: "Success",
        description: "Alert setting updated successfully"
      });

      setIsEditDialogOpen(false);
      setSelectedAlert(null);
      await fetchAlertSettings();
    } catch (error: any) {
      console.error('Error updating alert setting:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update alert setting",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAlertSetting = async (id: number) => {
    if (!confirm('Are you sure you want to delete this alert setting?')) return;

    try {
      const { error } = await window.ezsite.apis.tableDelete(12612, id);
      if (error) throw new Error(error);

      toast({
        title: "Success",
        description: "Alert setting deleted successfully"
      });

      await fetchAlertSettings();
    } catch (error: any) {
      console.error('Error deleting alert setting:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete alert setting",
        variant: "destructive"
      });
    }
  };

  const handleEditAlert = (alert: AlertSetting) => {
    setSelectedAlert(alert);
    setNewAlert({
      alert_name: alert.alert_name,
      alert_type: alert.alert_type,
      is_enabled: alert.is_enabled,
      trigger_condition: alert.trigger_condition,
      threshold_value: alert.threshold_value,
      notification_method: alert.notification_method,
      recipient_list: alert.recipient_list,
      message_template: alert.message_template,
      frequency: alert.frequency
    });
    setIsEditDialogOpen(true);
  };

  const testAlert = async (alertId: number) => {
    try {
      setLoading(true);

      // Log a test alert to history
      await window.ezsite.apis.tableCreate(12613, {
        alert_setting_id: alertId,
        triggered_at: new Date().toISOString(),
        status: 'sent',
        message_sent: 'Test alert message',
        recipients: 'Test recipient',
        created_at: new Date().toISOString()
      });

      toast({
        title: "Test Alert Sent",
        description: "Test alert has been triggered successfully"
      });

      await fetchAlertHistory();
    } catch (error: any) {
      console.error('Error testing alert:', error);
      toast({
        title: "Error",
        description: "Failed to send test alert",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAlertTypeBadge = (type: string) => {
    const colors = {
      license_expiry: 'bg-yellow-100 text-yellow-800',
      low_stock: 'bg-red-100 text-red-800',
      system_error: 'bg-red-100 text-red-800',
      failed_login: 'bg-orange-100 text-orange-800',
      daily_report: 'bg-blue-100 text-blue-800',
      maintenance_due: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!isAdmin) {
    return (
      <AccessDenied
        feature="Alert Settings"
        requiredRole="Administrator" />);


  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alert Settings</h1>
          <p className="text-muted-foreground">
            Configure automated alerts and notifications for your system
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              fetchAlertSettings();
              fetchAlertHistory();
            }}
            disabled={loading}>

            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Alert</DialogTitle>
                <DialogDescription>
                  Set up a new automated alert for your system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert_name">Alert Name</Label>
                    <Input
                      id="alert_name"
                      value={newAlert.alert_name}
                      onChange={(e) => setNewAlert({ ...newAlert, alert_name: e.target.value })}
                      placeholder="License Expiry Alert" />

                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alert_type">Alert Type</Label>
                    <Select
                      value={newAlert.alert_type}
                      onValueChange={(value) => setNewAlert({ ...newAlert, alert_type: value })}>

                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {alertTypes.map((type) =>
                        <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="threshold_value">Threshold Value</Label>
                    <Input
                      id="threshold_value"
                      type="number"
                      value={newAlert.threshold_value}
                      onChange={(e) => setNewAlert({ ...newAlert, threshold_value: parseInt(e.target.value) || 0 })}
                      placeholder="30" />

                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notification_method">Notification Method</Label>
                    <Select
                      value={newAlert.notification_method}
                      onValueChange={(value) => setNewAlert({ ...newAlert, notification_method: value })}>

                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationMethods.map((method) =>
                        <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient_list">Recipients</Label>
                  <Input
                    id="recipient_list"
                    value={newAlert.recipient_list}
                    onChange={(e) => setNewAlert({ ...newAlert, recipient_list: e.target.value })}
                    placeholder="+1234567890,admin@example.com" />

                  <p className="text-sm text-muted-foreground">
                    Comma-separated list of phone numbers and/or email addresses
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message_template">Message Template</Label>
                  <Textarea
                    id="message_template"
                    value={newAlert.message_template}
                    onChange={(e) => setNewAlert({ ...newAlert, message_template: e.target.value })}
                    placeholder="Alert: {alert_name} - {details}"
                    rows={3} />

                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_enabled"
                      checked={newAlert.is_enabled}
                      onCheckedChange={(checked) => setNewAlert({ ...newAlert, is_enabled: checked })} />

                    <Label htmlFor="is_enabled">Enable Alert</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={newAlert.frequency}
                      onValueChange={(value) => setNewAlert({ ...newAlert, frequency: value })}>

                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencies.map((freq) =>
                        <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={createAlertSetting} disabled={loading} className="w-full">
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Create Alert
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Bell className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold">{alertSettings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold">
                  {alertSettings.filter((a) => a.is_enabled).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Sent Today</p>
                <p className="text-2xl font-bold">
                  {alertHistory.filter((h) =>
                  new Date(h.triggered_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Failed Alerts</p>
                <p className="text-2xl font-bold">
                  {alertHistory.filter((h) => h.status === 'failed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Alert Settings</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Alert Configuration
              </CardTitle>
              <CardDescription>
                Manage your automated alert settings and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alertSettings.length === 0 ?
              <div className="text-center py-8">
                  <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">No alert settings configured</p>
                  <p className="text-sm text-gray-400">Create your first alert to get started</p>
                </div> :

              <div className="space-y-4">
                  {alertSettings.map((alert) =>
                <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">{alert.alert_name}</h3>
                          <Badge className={getAlertTypeBadge(alert.alert_type)}>
                            {alertTypes.find((t) => t.value === alert.alert_type)?.label}
                          </Badge>
                          <Badge variant={alert.is_enabled ? "default" : "secondary"}>
                            {alert.is_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testAlert(alert.id!)}
                        disabled={loading}>

                            <Bell className="w-4 h-4 mr-1" />
                            Test
                          </Button>
                          <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAlert(alert)}>

                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteAlertSetting(alert.id!)}
                        className="text-red-600 hover:text-red-700">

                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Threshold:</span> {alert.threshold_value}
                        </div>
                        <div>
                          <span className="font-medium">Method:</span> {alert.notification_method}
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span> {alert.frequency}
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Recipients:</span> {alert.recipient_list}
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Message:</span> {alert.message_template}
                      </div>
                    </div>
                )}
                </div>
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Alert History
              </CardTitle>
              <CardDescription>
                View the history of triggered alerts and their delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Triggered At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alertHistory.length === 0 ?
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-3">
                            <Clock className="w-12 h-12 text-gray-300" />
                            <div>
                              <p className="text-gray-500 font-medium">No alert history found</p>
                              <p className="text-sm text-gray-400">Alert activities will appear here</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow> :

                    alertHistory.map((history) =>
                    <TableRow key={history.id}>
                          <TableCell className="font-mono text-sm">
                            {new Date(history.triggered_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(history.status)}
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate" title={history.message_sent}>
                              {history.message_sent}
                            </div>
                          </TableCell>
                          <TableCell>{history.recipients}</TableCell>
                          <TableCell>
                            {history.error_message &&
                        <div className="text-xs text-red-600">
                                {history.error_message}
                              </div>
                        }
                          </TableCell>
                        </TableRow>
                    )
                    }
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Alert Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Alert Setting</DialogTitle>
            <DialogDescription>
              Update the alert configuration and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_alert_name">Alert Name</Label>
                <Input
                  id="edit_alert_name"
                  value={newAlert.alert_name}
                  onChange={(e) => setNewAlert({ ...newAlert, alert_name: e.target.value })}
                  placeholder="License Expiry Alert" />

              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_alert_type">Alert Type</Label>
                <Select
                  value={newAlert.alert_type}
                  onValueChange={(value) => setNewAlert({ ...newAlert, alert_type: value })}>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {alertTypes.map((type) =>
                    <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_threshold_value">Threshold Value</Label>
                <Input
                  id="edit_threshold_value"
                  type="number"
                  value={newAlert.threshold_value}
                  onChange={(e) => setNewAlert({ ...newAlert, threshold_value: parseInt(e.target.value) || 0 })}
                  placeholder="30" />

              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_notification_method">Notification Method</Label>
                <Select
                  value={newAlert.notification_method}
                  onValueChange={(value) => setNewAlert({ ...newAlert, notification_method: value })}>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationMethods.map((method) =>
                    <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_recipient_list">Recipients</Label>
              <Input
                id="edit_recipient_list"
                value={newAlert.recipient_list}
                onChange={(e) => setNewAlert({ ...newAlert, recipient_list: e.target.value })}
                placeholder="+1234567890,admin@example.com" />

            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_message_template">Message Template</Label>
              <Textarea
                id="edit_message_template"
                value={newAlert.message_template}
                onChange={(e) => setNewAlert({ ...newAlert, message_template: e.target.value })}
                placeholder="Alert: {alert_name} - {details}"
                rows={3} />

            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_enabled"
                  checked={newAlert.is_enabled}
                  onCheckedChange={(checked) => setNewAlert({ ...newAlert, is_enabled: checked })} />

                <Label htmlFor="edit_is_enabled">Enable Alert</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_frequency">Frequency</Label>
                <Select
                  value={newAlert.frequency}
                  onValueChange={(value) => setNewAlert({ ...newAlert, frequency: value })}>

                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((freq) =>
                    <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={updateAlertSetting} disabled={loading} className="w-full">
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Update Alert
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

};

export default AlertSettings;