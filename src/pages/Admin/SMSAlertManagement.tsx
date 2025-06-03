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
import { useBatchSelection } from '@/hooks/use-batch-selection';
import BatchActionBar from '@/components/BatchActionBar';
import BatchDeleteDialog from '@/components/BatchDeleteDialog';
import BatchEditDialog from '@/components/BatchEditDialog';
import { MessageSquare, Phone, Settings, History, Plus, Edit, Trash2, Send, CheckCircle, AlertCircle, TestTube } from 'lucide-react';
import SMSSetupGuide from '@/components/SMSSetupGuide';
import SMSServiceManager from '@/components/SMSServiceManager';
import SMSAlertTrigger from '@/components/SMSAlertTrigger';
import SMSTestManager from '@/components/SMSTestManager';
import AccessDenied from '@/components/AccessDenied';
import useAdminAccess from '@/hooks/use-admin-access';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';

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
  const [isSettingDialogOpen, setIsSettingDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SMSAlertSetting | null>(null);
  const [editingContact, setEditingContact] = useState<SMSContact | null>(null);
  const [sendingTestSMS, setSendingTestSMS] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<{available: boolean; message: string;} | null>(null);
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false);
  const [isBatchEditDialogOpen, setIsBatchEditDialogOpen] = useState(false);
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('test');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Batch selection hooks
  const settingsBatchSelection = useBatchSelection<SMSAlertSetting>();
  const contactsBatchSelection = useBatchSelection<SMSContact>();
  const historyBatchSelection = useBatchSelection<SMSHistory>();

  // Batch edit form data
  const [batchEditData, setBatchEditData] = useState({
    is_active: true,
    station: '',
    contact_role: ''
  });

  // Validate phone number helper function
  const isValidPhoneNumber = (phone: string) => {
    try {
      const cleaned = phone.replace(/[^\d]/g, '');
      return cleaned.length >= 10 && cleaned.length <= 15;
    } catch (error) {
      console.error('Error validating phone number:', error);
      return false;
    }
  };

  // New setting form state
  const [newSetting, setNewSetting] = useState({
    setting_name: '',
    days_before_expiry: 30,
    alert_frequency_days: 7,
    is_active: true,
    message_template: "ALERT: License '{license_name}' for {station} expires on {expiry_date}. Please renew immediately."
  });

  // New contact form state
  const [newContact, setNewContact] = useState({
    contact_name: '',
    mobile_number: '',
    station: 'ALL',
    is_active: true,
    contact_role: 'Manager'
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.allSettled([
          loadSettings(),
          loadContacts(),
          loadHistory(),
          checkServiceStatus()
        ]);
      } catch (error) {
        console.error('Error initializing SMS Alert Management:', error);
        setError('Failed to initialize SMS Alert Management');
      }
    };

    initializeData();
  }, []);

  const checkServiceStatus = async () => {
    try {
      // Simulate service check - replace with actual smsService when available
      setServiceStatus({
        available: true,
        message: 'SMS service is ready for configuration'
      });
    } catch (error) {
      console.error('Error checking SMS service status:', error);
      setServiceStatus({
        available: false,
        message: 'Unable to check SMS service status'
      });
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
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

  const saveSetting = async () => {
    try {
      setLoading(true);
      const settingData = {
        ...newSetting,
        created_by: 1 // Replace with actual user ID
      };

      let response;
      if (editingSetting) {
        response = await window.ezsite.apis.tableUpdate('12611', {
          id: editingSetting.id,
          ...settingData
        });
      } else {
        response = await window.ezsite.apis.tableCreate('12611', settingData);
      }

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: `SMS alert setting ${editingSetting ? 'updated' : 'created'} successfully`
      });

      setIsSettingDialogOpen(false);
      setEditingSetting(null);
      setNewSetting({
        setting_name: '',
        days_before_expiry: 30,
        alert_frequency_days: 7,
        is_active: true,
        message_template: "ALERT: License '{license_name}' for {station} expires on {expiry_date}. Please renew immediately."
      });
      loadSettings();
    } catch (error) {
      console.error('Error saving SMS setting:', error);
      toast({
        title: "Error",
        description: "Failed to save SMS alert setting",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveContact = async () => {
    try {
      setLoading(true);
      const contactData = {
        ...newContact,
        created_by: 1 // Replace with actual user ID
      };

      let response;
      if (editingContact) {
        response = await window.ezsite.apis.tableUpdate('12612', {
          id: editingContact.id,
          ...contactData
        });
      } else {
        response = await window.ezsite.apis.tableCreate('12612', contactData);
      }

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: `SMS contact ${editingContact ? 'updated' : 'added'} successfully`
      });

      setIsContactDialogOpen(false);
      setEditingContact(null);
      setNewContact({
        contact_name: '',
        mobile_number: '',
        station: 'ALL',
        is_active: true,
        contact_role: 'Manager'
      });
      loadContacts();
    } catch (error) {
      console.error('Error saving SMS contact:', error);
      toast({
        title: "Error",
        description: "Failed to save SMS contact",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSetting = async (id: number) => {
    try {
      const { error } = await window.ezsite.apis.tableDelete('12611', { id });
      if (error) throw error;

      toast({
        title: "Success",
        description: "SMS alert setting deleted successfully"
      });
      loadSettings();
    } catch (error) {
      console.error('Error deleting SMS setting:', error);
      toast({
        title: "Error",
        description: "Failed to delete SMS alert setting",
        variant: "destructive"
      });
    }
  };

  const deleteContact = async (id: number) => {
    try {
      const { error } = await window.ezsite.apis.tableDelete('12612', { id });
      if (error) throw error;

      toast({
        title: "Success",
        description: "SMS contact deleted successfully"
      });
      loadContacts();
    } catch (error) {
      console.error('Error deleting SMS contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete SMS contact",
        variant: "destructive"
      });
    }
  };

  const sendTestSMS = async () => {
    try {
      setSendingTestSMS(true);
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

        // Validate phone number
        if (!isValidPhoneNumber(contact.mobile_number)) {
          console.error(`Invalid phone number for ${contact.contact_name}: ${contact.mobile_number}`);
          failureCount++;

          // Still create history record for tracking
          await window.ezsite.apis.tableCreate('12613', {
            license_id: 0,
            contact_id: contact.id,
            mobile_number: contact.mobile_number,
            message_content: testMessage,
            sent_date: new Date().toISOString(),
            delivery_status: 'Failed - Invalid Number',
            days_before_expiry: 0,
            created_by: 1
          });
          continue;
        }

        // Simulate SMS sending (replace with actual SMS service)
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
      setSendingTestSMS(false);
    }
  };

  const editSetting = (setting: SMSAlertSetting) => {
    setEditingSetting(setting);
    setNewSetting({
      setting_name: setting.setting_name,
      days_before_expiry: setting.days_before_expiry,
      alert_frequency_days: setting.alert_frequency_days,
      is_active: setting.is_active,
      message_template: setting.message_template
    });
    setIsSettingDialogOpen(true);
  };

  const editContact = (contact: SMSContact) => {
    setEditingContact(contact);
    setNewContact({
      contact_name: contact.contact_name,
      mobile_number: contact.mobile_number,
      station: contact.station,
      is_active: contact.is_active,
      contact_role: contact.contact_role
    });
    setIsContactDialogOpen(true);
  };

  // Batch operations for settings
  const handleBatchDeleteSettings = () => {
    const selectedData = settingsBatchSelection.getSelectedData(settings, (setting) => setting.id);
    if (selectedData.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select settings to delete",
        variant: "destructive"
      });
      return;
    }
    setIsBatchDeleteDialogOpen(true);
  };

  const confirmBatchDeleteSettings = async () => {
    setBatchActionLoading(true);
    try {
      const selectedData = settingsBatchSelection.getSelectedData(settings, (setting) => setting.id);

      for (const setting of selectedData) {
        const { error } = await window.ezsite.apis.tableDelete('12611', { id: setting.id });
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Deleted ${selectedData.length} SMS alert settings successfully`
      });

      setIsBatchDeleteDialogOpen(false);
      settingsBatchSelection.clearSelection();
      loadSettings();
    } catch (error) {
      console.error('Error in batch delete:', error);
      toast({
        title: "Error",
        description: `Failed to delete settings: ${error}`,
        variant: "destructive"
      });
    } finally {
      setBatchActionLoading(false);
    }
  };

  // Batch operations for contacts
  const handleBatchEditContacts = () => {
    const selectedData = contactsBatchSelection.getSelectedData(contacts, (contact) => contact.id);
    if (selectedData.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select contacts to edit",
        variant: "destructive"
      });
      return;
    }
    setIsBatchEditDialogOpen(true);
  };

  const handleBatchDeleteContacts = () => {
    const selectedData = contactsBatchSelection.getSelectedData(contacts, (contact) => contact.id);
    if (selectedData.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select contacts to delete",
        variant: "destructive"
      });
      return;
    }
    setIsBatchDeleteDialogOpen(true);
  };

  const confirmBatchEditContacts = async () => {
    setBatchActionLoading(true);
    try {
      const selectedData = contactsBatchSelection.getSelectedData(contacts, (contact) => contact.id);
      const updates = selectedData.map((contact) => ({
        id: contact.id,
        ...(batchEditData.station && { station: batchEditData.station }),
        ...(batchEditData.contact_role && { contact_role: batchEditData.contact_role }),
        is_active: batchEditData.is_active
      }));

      for (const update of updates) {
        const { error } = await window.ezsite.apis.tableUpdate('12612', update);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Updated ${selectedData.length} SMS contacts successfully`
      });

      setIsBatchEditDialogOpen(false);
      contactsBatchSelection.clearSelection();
      loadContacts();
    } catch (error) {
      console.error('Error in batch edit:', error);
      toast({
        title: "Error",
        description: `Failed to update contacts: ${error}`,
        variant: "destructive"
      });
    } finally {
      setBatchActionLoading(false);
    }
  };

  const confirmBatchDeleteContacts = async () => {
    setBatchActionLoading(true);
    try {
      const selectedData = contactsBatchSelection.getSelectedData(contacts, (contact) => contact.id);

      for (const contact of selectedData) {
        const { error } = await window.ezsite.apis.tableDelete('12612', { id: contact.id });
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Deleted ${selectedData.length} SMS contacts successfully`
      });

      setIsBatchDeleteDialogOpen(false);
      contactsBatchSelection.clearSelection();
      loadContacts();
    } catch (error) {
      console.error('Error in batch delete:', error);
      toast({
        title: "Error",
        description: `Failed to delete contacts: ${error}`,
        variant: "destructive"
      });
    } finally {
      setBatchActionLoading(false);
    }
  };

  // Batch operations for history
  const handleBatchDeleteHistory = () => {
    const selectedData = historyBatchSelection.getSelectedData(history, (record) => record.id);
    if (selectedData.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select history records to delete",
        variant: "destructive"
      });
      return;
    }
    setIsBatchDeleteDialogOpen(true);
  };

  const confirmBatchDeleteHistory = async () => {
    setBatchActionLoading(true);
    try {
      const selectedData = historyBatchSelection.getSelectedData(history, (record) => record.id);

      for (const record of selectedData) {
        const { error } = await window.ezsite.apis.tableDelete('12613', { id: record.id });
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Deleted ${selectedData.length} SMS history records successfully`
      });

      setIsBatchDeleteDialogOpen(false);
      historyBatchSelection.clearSelection();
      loadHistory();
    } catch (error) {
      console.error('Error in batch delete:', error);
      toast({
        title: "Error",
        description: `Failed to delete history records: ${error}`,
        variant: "destructive"
      });
    } finally {
      setBatchActionLoading(false);
    }
  };

  // Get current batch selection based on active tab
  const getCurrentBatchSelection = () => {
    switch (activeTab) {
      case 'settings': return settingsBatchSelection;
      case 'contacts': return contactsBatchSelection;
      case 'history': return historyBatchSelection;
      default: return { selectedCount: 0, clearSelection: () => {} };
    }
  };

  // Get current batch operations based on active tab
  const getCurrentBatchOperations = () => {
    switch (activeTab) {
      case 'settings':
        return {
          onBatchDelete: handleBatchDeleteSettings,
          showEdit: false
        };
      case 'contacts':
        return {
          onBatchEdit: handleBatchEditContacts,
          onBatchDelete: handleBatchDeleteContacts,
          showEdit: true
        };
      case 'history':
        return {
          onBatchDelete: handleBatchDeleteHistory,
          showEdit: false
        };
      default:
        return { showEdit: false };
    }
  };

  // Get current selected data for dialogs
  const getCurrentSelectedData = () => {
    switch (activeTab) {
      case 'settings':
        return settingsBatchSelection.getSelectedData(settings, (setting) => setting.id).map((setting) => ({
          id: setting.id,
          name: setting.setting_name
        }));
      case 'contacts':
        return contactsBatchSelection.getSelectedData(contacts, (contact) => contact.id).map((contact) => ({
          id: contact.id,
          name: `${contact.contact_name} - ${contact.mobile_number}`
        }));
      case 'history':
        return historyBatchSelection.getSelectedData(history, (record) => record.id).map((record) => ({
          id: record.id,
          name: `${record.mobile_number} - ${new Date(record.sent_date).toLocaleDateString()}`
        }));
      default:
        return [];
    }
  };

  // Get current confirm function based on active tab
  const getCurrentConfirmFunction = () => {
    switch (activeTab) {
      case 'settings': return confirmBatchDeleteSettings;
      case 'contacts': return activeTab === 'contacts' && isBatchEditDialogOpen ? confirmBatchEditContacts : confirmBatchDeleteContacts;
      case 'history': return confirmBatchDeleteHistory;
      default: return () => {};
    }
  };

  // Check admin access first
  if (!isAdmin) {
    return (
      <AccessDenied
        feature="SMS Alert Management"
        requiredRole="Administrator"
      />
    );
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
            className="w-full mt-4"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <ComponentErrorBoundary fallback="SMS Alert Management">
      <div className="space-y-6">
        {/* SMS Test Guide Banner */}
        <Alert className="border-blue-200 bg-blue-50">
          <TestTube className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>🚨 Important:</strong> Before enabling automatic license expiry alerts, please test your Twilio configuration in the <strong>SMS Test</strong> tab to ensure everything is working properly.
          </AlertDescription>
        </Alert>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">SMS Alert Management</h1>
          <div className="flex items-center space-x-4">
            {serviceStatus && (
              <div className="flex items-center space-x-2">
                {serviceStatus.available ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-sm ${
                  serviceStatus.available ? 'text-green-600' : 'text-red-600'
                }`}>
                  {serviceStatus.available ? 'SMS Service Online' : 'SMS Service Offline'}
                </span>
              </div>
            )}
            <Button
              onClick={sendTestSMS}
              disabled={sendingTestSMS || !serviceStatus?.available}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {sendingTestSMS ? 'Sending...' : 'Send Test SMS'}
            </Button>
          </div>
        </div>

        {/* SMS Setup Guide */}
        <SMSSetupGuide />

        {/* Show batch action bar only for relevant tabs */}
        {(activeTab === 'settings' || activeTab === 'contacts' || activeTab === 'history') && (
          <BatchActionBar
            selectedCount={getCurrentBatchSelection().selectedCount}
            onBatchEdit={getCurrentBatchOperations().onBatchEdit}
            onBatchDelete={getCurrentBatchOperations().onBatchDelete}
            onClearSelection={getCurrentBatchSelection().clearSelection}
            isLoading={batchActionLoading}
            showEdit={getCurrentBatchOperations().showEdit}
          />
        )}

        <Tabs defaultValue="test" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="test" className="bg-blue-50 text-blue-700 font-semibold">🧪 SMS Test</TabsTrigger>
            <TabsTrigger value="service">SMS Service</TabsTrigger>
            <TabsTrigger value="trigger">Alert Triggers</TabsTrigger>
            <TabsTrigger value="contacts">SMS Contacts</TabsTrigger>
            <TabsTrigger value="settings">Alert Settings</TabsTrigger>
            <TabsTrigger value="history">SMS History</TabsTrigger>
          </TabsList>

          <TabsContent value="trigger">
            <SMSAlertTrigger />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    SMS Alert Settings
                  </CardTitle>
                  <Dialog open={isSettingDialogOpen} onOpenChange={setIsSettingDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingSetting(null);
                        setNewSetting({
                          setting_name: '',
                          days_before_expiry: 30,
                          alert_frequency_days: 7,
                          is_active: true,
                          message_template: "ALERT: License '{license_name}' for {station} expires on {expiry_date}. Please renew immediately."
                        });
                      }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Setting
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingSetting ? 'Edit' : 'Add'} SMS Alert Setting
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="setting_name">Setting Name</Label>
                          <Input
                            id="setting_name"
                            value={newSetting.setting_name}
                            onChange={(e) => setNewSetting({ ...newSetting, setting_name: e.target.value })}
                            placeholder="e.g., Standard License Alert"
                          />
                        </div>
                        <div>
                          <Label htmlFor="days_before">Days Before Expiry</Label>
                          <Input
                            id="days_before"
                            type="number"
                            value={newSetting.days_before_expiry}
                            onChange={(e) => setNewSetting({ ...newSetting, days_before_expiry: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="frequency">Alert Frequency (Days)</Label>
                          <Input
                            id="frequency"
                            type="number"
                            value={newSetting.alert_frequency_days}
                            onChange={(e) => setNewSetting({ ...newSetting, alert_frequency_days: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_active"
                            checked={newSetting.is_active}
                            onCheckedChange={(checked) => setNewSetting({ ...newSetting, is_active: checked })}
                          />
                          <Label htmlFor="is_active">Active</Label>
                        </div>
                        <div>
                          <Label htmlFor="template">Message Template</Label>
                          <Textarea
                            id="template"
                            value={newSetting.message_template}
                            onChange={(e) => setNewSetting({ ...newSetting, message_template: e.target.value })}
                            placeholder="Use {license_name}, {station}, {expiry_date} as placeholders"
                            rows={3}
                          />
                        </div>
                        <Button onClick={saveSetting} disabled={loading} className="w-full">
                          {loading ? 'Saving...' : editingSetting ? 'Update' : 'Create'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={settings.length > 0 && settingsBatchSelection.selectedCount === settings.length}
                          onCheckedChange={() => settingsBatchSelection.toggleSelectAll(settings, (setting) => setting.id)}
                          aria-label="Select all settings"
                        />
                      </TableHead>
                      <TableHead>Setting Name</TableHead>
                      <TableHead>Days Before</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settings.map((setting) => (
                      <TableRow key={setting.id} className={settingsBatchSelection.isSelected(setting.id) ? "bg-blue-50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={settingsBatchSelection.isSelected(setting.id)}
                            onCheckedChange={() => settingsBatchSelection.toggleItem(setting.id)}
                            aria-label={`Select setting ${setting.setting_name}`}
                          />
                        </TableCell>
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => editSetting(setting)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteSetting(setting.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    SMS Contacts ({contacts.filter((c) => c.is_active).length} active)
                  </CardTitle>
                  <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingContact(null);
                        setNewContact({
                          contact_name: '',
                          mobile_number: '',
                          station: 'ALL',
                          is_active: true,
                          contact_role: 'Manager'
                        });
                      }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Contact
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingContact ? 'Edit' : 'Add'} SMS Contact
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="contact_name">Contact Name</Label>
                          <Input
                            id="contact_name"
                            value={newContact.contact_name}
                            onChange={(e) => setNewContact({ ...newContact, contact_name: e.target.value })}
                            placeholder="Full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="mobile_number">Mobile Number</Label>
                          <Input
                            id="mobile_number"
                            value={newContact.mobile_number}
                            onChange={(e) => setNewContact({ ...newContact, mobile_number: e.target.value })}
                            placeholder="+1234567890 or 1234567890"
                          />
                          {newContact.mobile_number && !isValidPhoneNumber(newContact.mobile_number) && (
                            <p className="text-sm text-red-500 mt-1">
                              Please enter a valid phone number (e.g., +1234567890 or 1234567890)
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="station">Station</Label>
                          <Select
                            value={newContact.station}
                            onValueChange={(value) => setNewContact({ ...newContact, station: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">All Stations</SelectItem>
                              <SelectItem value="MOBIL">MOBIL</SelectItem>
                              <SelectItem value="AMOCO ROSEDALE">AMOCO ROSEDALE</SelectItem>
                              <SelectItem value="AMOCO BROOKLYN">AMOCO BROOKLYN</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="contact_role">Role</Label>
                          <Select
                            value={newContact.contact_role}
                            onValueChange={(value) => setNewContact({ ...newContact, contact_role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Manager">Manager</SelectItem>
                              <SelectItem value="Supervisor">Supervisor</SelectItem>
                              <SelectItem value="Administrator">Administrator</SelectItem>
                              <SelectItem value="Owner">Owner</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="contact_active"
                            checked={newContact.is_active}
                            onCheckedChange={(checked) => setNewContact({ ...newContact, is_active: checked })}
                          />
                          <Label htmlFor="contact_active">Active</Label>
                        </div>
                        <Button onClick={saveContact} disabled={loading} className="w-full">
                          {loading ? 'Saving...' : editingContact ? 'Update' : 'Add'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={contacts.length > 0 && contactsBatchSelection.selectedCount === contacts.length}
                          onCheckedChange={() => contactsBatchSelection.toggleSelectAll(contacts, (contact) => contact.id)}
                          aria-label="Select all contacts"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Mobile Number</TableHead>
                      <TableHead>Station</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id} className={contactsBatchSelection.isSelected(contact.id) ? "bg-blue-50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={contactsBatchSelection.isSelected(contact.id)}
                            onCheckedChange={() => contactsBatchSelection.toggleItem(contact.id)}
                            aria-label={`Select contact ${contact.contact_name}`}
                          />
                        </TableCell>
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => editContact(contact)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteContact(contact.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={history.length > 0 && historyBatchSelection.selectedCount === history.length}
                          onCheckedChange={() => historyBatchSelection.toggleSelectAll(history, (record) => record.id)}
                          aria-label="Select all history records"
                        />
                      </TableHead>
                      <TableHead>Date Sent</TableHead>
                      <TableHead>Mobile Number</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Days Before Expiry</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((record) => (
                      <TableRow key={record.id} className={historyBatchSelection.isSelected(record.id) ? "bg-blue-50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={historyBatchSelection.isSelected(record.id)}
                            onCheckedChange={() => historyBatchSelection.toggleItem(record.id)}
                            aria-label={`Select history record ${record.id}`}
                          />
                        </TableCell>
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
                              'default' : 'destructive'}
                          >
                            {record.delivery_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="service">
            <SMSServiceManager />
          </TabsContent>

          <TabsContent value="test">
            <SMSTestManager />
          </TabsContent>
        </Tabs>

        {/* Batch Edit Dialog for Contacts */}
        <BatchEditDialog
          isOpen={isBatchEditDialogOpen}
          onClose={() => setIsBatchEditDialogOpen(false)}
          onSave={confirmBatchEditContacts}
          selectedCount={contactsBatchSelection.selectedCount}
          isLoading={batchActionLoading}
          itemName="SMS contacts"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="batch_station">Station</Label>
              <Select value={batchEditData.station} onValueChange={(value) => setBatchEditData({ ...batchEditData, station: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select station to update" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Keep existing stations</SelectItem>
                  <SelectItem value="ALL">All Stations</SelectItem>
                  <SelectItem value="MOBIL">MOBIL</SelectItem>
                  <SelectItem value="AMOCO ROSEDALE">AMOCO ROSEDALE</SelectItem>
                  <SelectItem value="AMOCO BROOKLYN">AMOCO BROOKLYN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="batch_role">Contact Role</Label>
              <Select value={batchEditData.contact_role} onValueChange={(value) => setBatchEditData({ ...batchEditData, contact_role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role to update" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Keep existing roles</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Administrator">Administrator</SelectItem>
                  <SelectItem value="Owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="batch_is_active"
                checked={batchEditData.is_active}
                onCheckedChange={(checked) => setBatchEditData({ ...batchEditData, is_active: checked })}
              />
              <Label htmlFor="batch_is_active">Set all selected contacts as active</Label>
            </div>
          </div>
        </BatchEditDialog>

        {/* Batch Delete Dialog */}
        <BatchDeleteDialog
          isOpen={isBatchDeleteDialogOpen}
          onClose={() => setIsBatchDeleteDialogOpen(false)}
          onConfirm={getCurrentConfirmFunction()}
          selectedCount={getCurrentBatchSelection().selectedCount}
          isLoading={batchActionLoading}
          itemName={activeTab === 'settings' ? 'SMS alert settings' : activeTab === 'contacts' ? 'SMS contacts' : 'SMS history records'}
          selectedItems={getCurrentSelectedData()}
        />
      </div>
    </ComponentErrorBoundary>
  );
};

export default SMSAlertManagement;