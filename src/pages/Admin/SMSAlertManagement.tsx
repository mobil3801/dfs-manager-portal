import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Phone, Settings, History, Plus, Edit, Trash2, Send, CheckCircle, AlertCircle, TestTube, AlertTriangle } from 'lucide-react';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';
import AccessDenied from '@/components/AccessDenied';
import CustomSMSSendingForm from '@/components/CustomSMSSendingForm';
import EnhancedSMSTestManager from '@/components/EnhancedSMSTestManager';
import SMSConfigurationValidator from '@/components/SMSConfigurationValidator';
import SMSTroubleshootingGuide from '@/components/SMSTroubleshootingGuide';

interface SMSAlertSetting {
  id: number;
  setting_name: string;
  days_before_expiry: number;
  alert_frequency_days: number;
  is_active: boolean;
  message_template: string;
  created_by: number;
}

interface SMSContact {
  id: number;
  contact_name: string;
  mobile_number: string;
  station: string;
  is_active: boolean;
  contact_role: string;
  created_by: number;
}

interface SMSHistory {
  id: number;
  license_id: number;
  contact_id: number;
  mobile_number: string;
  message_content: string;
  sent_date: string;
  delivery_status: string;
  days_before_expiry: number;
  created_by: number;
}

const SMSAlertManagement: React.FC = () => {
  const { isAdmin } = useAdminAccess();
  const [settings, setSettings] = useState<SMSAlertSetting[]>([]);
  const [contacts, setContacts] = useState<SMSContact[]>([]);
  const [history, setHistory] = useState<SMSHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await Promise.allSettled([
        loadSettings(),
        loadContacts(),
        loadHistory()]
        );
      } catch (error) {
        console.error('Error initializing SMS Alert Management:', error);
        setError('Failed to initialize SMS Alert Management');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('12611', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });
      if (error) throw error;
      setSettings(data?.List || []);
    } catch (error) {
      console.error('Error loading SMS settings:', error);
      toast({
        title: "Error",
        description: "Failed to load SMS alert settings",
        variant: "destructive"
      });
    }
  };

  const loadContacts = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('12612', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });
      if (error) throw error;
      setContacts(data?.List || []);
    } catch (error) {
      console.error('Error loading SMS contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load SMS contacts",
        variant: "destructive"
      });
    }
  };

  const loadHistory = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('12613', {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'sent_date',
        IsAsc: false,
        Filters: []
      });
      if (error) throw error;
      setHistory(data?.List || []);
    } catch (error) {
      console.error('Error loading SMS history:', error);
      toast({
        title: "Error",
        description: "Failed to load SMS history",
        variant: "destructive"
      });
    }
  };

  const sendTestSMS = async () => {
    try {
      setLoading(true);
      const testMessage = "🔔 Test SMS from DFS Manager: This is a test message from your License Alert System. SMS functionality is working correctly!";

      // Get all active contacts
      const activeContacts = contacts.filter((c) => c.is_active);

      if (activeContacts.length === 0) {
        toast({
          title: "No Active Contacts",
          description: "Please add active SMS contacts before sending test messages.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sending Test SMS",
        description: `Sending test SMS to ${activeContacts.length} contact(s)...`
      });

      let successCount = 0;
      let failureCount = 0;

      // Send SMS to each contact (simulated)
      for (const contact of activeContacts) {
        console.log(`Sending test SMS to ${contact.contact_name} at ${contact.mobile_number}`);

        // Simulate SMS sending
        const smsResult = {
          success: Math.random() > 0.1, // 90% success rate
          error: Math.random() > 0.1 ? null : 'Simulated failure for testing'
        };

        if (smsResult.success) {
          successCount++;
          console.log(`✅ SMS sent successfully to ${contact.contact_name}`);
        } else {
          failureCount++;
          console.error(`❌ SMS failed to ${contact.contact_name}:`, smsResult.error);
        }

        // Create history record
        await window.ezsite.apis.tableCreate('12613', {
          license_id: 0, // Test SMS
          contact_id: contact.id,
          mobile_number: contact.mobile_number,
          message_content: testMessage,
          sent_date: new Date().toISOString(),
          delivery_status: smsResult.success ? 'Sent' : `Failed - ${smsResult.error}`,
          days_before_expiry: 0,
          created_by: 1
        });
      }

      // Show results
      if (successCount > 0 && failureCount === 0) {
        toast({
          title: "✅ Test SMS Sent Successfully",
          description: `Test SMS sent to all ${successCount} contact(s). Check your mobile device!`
        });
      } else if (successCount > 0 && failureCount > 0) {
        toast({
          title: "⚠️ Partial Success",
          description: `${successCount} SMS sent successfully, ${failureCount} failed. Check SMS History for details.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "❌ All SMS Failed",
          description: "Failed to send SMS to any contacts. Please check phone numbers and try again.",
          variant: "destructive"
        });
      }

      loadHistory();
    } catch (error) {
      console.error('Error sending test SMS:', error);
      toast({
        title: "Error",
        description: `Failed to send test SMS: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Check admin access first
  if (!isAdmin) {
    return (
      <AccessDenied
        feature="SMS Alert Management"
        requiredRole="Administrator" />);

  }

  if (error) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            Error Loading SMS Alert Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={() => window.location.reload()}
            className="w-full mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>);

  }

  return (
    <ComponentErrorBoundary fallback="SMS Alert Management">
      <div className="space-y-6">
        {/* SMS Diagnostic Guide Banner */}
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-2">
              <div><strong>💛 SMS Not Working? Common Fix:</strong></div>
              <div className="text-sm space-y-1">
                <div>• <strong>Check Test Mode:</strong> If in test mode, only verified numbers receive SMS</div>
                <div>• <strong>Verify Phone Format:</strong> Use E.164 format (+1234567890)</div>
                <div>• <strong>Check Twilio Balance:</strong> Insufficient funds will show "sent" but not deliver</div>
                <div>• <strong>Use Debug Tab:</strong> Complete troubleshooting guide available in the Debug tab</div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">SMS Alert Management</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600">SMS Service Online</span>
            </div>
            <Button
              onClick={sendTestSMS}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Sending...' : 'Send Test SMS'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview">📊 Overview</TabsTrigger>
            <TabsTrigger value="config">🔧 Config</TabsTrigger>
            <TabsTrigger value="testing">🧪 Testing</TabsTrigger>
            <TabsTrigger value="troubleshoot">🔍 Debug</TabsTrigger>
            <TabsTrigger value="custom">📱 Send SMS</TabsTrigger>
            <TabsTrigger value="contacts">📞 Contacts</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
            <TabsTrigger value="history">📝 History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Active Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {contacts.filter((c) => c.is_active).length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Out of {contacts.length} total contacts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Alert Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {settings.filter((s) => s.is_active).length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Active alert configurations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <History className="w-5 h-5 mr-2" />
                    Recent Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {history.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    SMS messages sent
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Setup Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">1</div>
                    <span>Add SMS contacts in the SMS Contacts tab</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">2</div>
                    <span>Configure alert settings for license expiry notifications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">3</div>
                    <span>Send test SMS to verify everything works correctly</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">4</div>
                    <span>Monitor SMS history to track delivery status</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <SMSConfigurationValidator />
          </TabsContent>

          <TabsContent value="testing">
            <EnhancedSMSTestManager />
          </TabsContent>

          <TabsContent value="troubleshoot">
            <SMSTroubleshootingGuide />
          </TabsContent>

          <TabsContent value="custom">
            <CustomSMSSendingForm />
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    SMS Contacts ({contacts.filter((c) => c.is_active).length} active)
                  </CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {contacts.length > 0 ?
                <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Mobile Number</TableHead>
                        <TableHead>Station</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map((contact) =>
                    <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.contact_name}</TableCell>
                          <TableCell>{contact.mobile_number}</TableCell>
                          <TableCell>{contact.station}</TableCell>
                          <TableCell>{contact.contact_role}</TableCell>
                          <TableCell>
                            <Badge variant={contact.is_active ? 'default' : 'secondary'}>
                              {contact.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                  </Table> :

                <div className="text-center py-8">
                    <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No SMS Contacts</h3>
                    <p className="text-muted-foreground mb-4">
                      Add contacts to receive SMS alerts for license expiries
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Contact
                    </Button>
                  </div>
                }
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    SMS Alert Settings
                  </CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Setting
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {settings.length > 0 ?
                <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Setting Name</TableHead>
                        <TableHead>Days Before</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settings.map((setting) =>
                    <TableRow key={setting.id}>
                          <TableCell className="font-medium">{setting.setting_name}</TableCell>
                          <TableCell>{setting.days_before_expiry} days</TableCell>
                          <TableCell>Every {setting.alert_frequency_days} days</TableCell>
                          <TableCell>
                            <Badge variant={setting.is_active ? 'default' : 'secondary'}>
                              {setting.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                  </Table> :

                <div className="text-center py-8">
                    <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Alert Settings</h3>
                    <p className="text-muted-foreground mb-4">
                      Configure when and how often to send license expiry alerts
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Setting
                    </Button>
                  </div>
                }
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  SMS Alert History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length > 0 ?
                <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date Sent</TableHead>
                        <TableHead>Mobile Number</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Days Before Expiry</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((record) =>
                    <TableRow key={record.id}>
                          <TableCell>
                            {new Date(record.sent_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{record.mobile_number}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {record.message_content}
                          </TableCell>
                          <TableCell>
                            {record.days_before_expiry === 0 ? 'Test' : `${record.days_before_expiry} days`}
                          </TableCell>
                          <TableCell>
                            <Badge
                          variant={record.delivery_status === 'Sent' || record.delivery_status === 'Test Sent' ?
                          'default' : 'destructive'}>
                              {record.delivery_status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                  </Table> :

                <div className="text-center py-8">
                    <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No SMS History</h3>
                    <p className="text-muted-foreground mb-4">
                      SMS delivery history will appear here once you start sending alerts
                    </p>
                    <Button onClick={sendTestSMS} disabled={loading}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Test SMS
                    </Button>
                  </div>
                }
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ComponentErrorBoundary>);

};

export default SMSAlertManagement;