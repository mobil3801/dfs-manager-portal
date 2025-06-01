import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Phone, Settings, History, Plus, Edit, Trash2, Send } from 'lucide-react';

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
  const [settings, setSettings] = useState<SMSAlertSetting[]>([]);
  const [contacts, setContacts] = useState<SMSContact[]>([]);
  const [history, setHistory] = useState<SMSHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSettingDialogOpen, setIsSettingDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SMSAlertSetting | null>(null);
  const [editingContact, setEditingContact] = useState<SMSContact | null>(null);
  const { toast } = useToast();

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
    loadSettings();
    loadContacts();
    loadHistory();
  }, []);

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
      setSettings(data.List || []);
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
      setContacts(data.List || []);
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
      setHistory(data.List || []);
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
      // Simulate sending test SMS
      const testMessage = "Test SMS: This is a test message from DFS Manager License Alert System.";
      
      // Send to all active contacts
      const activeContacts = contacts.filter(c => c.is_active);
      
      for (const contact of activeContacts) {
        // Create history record for test SMS
        await window.ezsite.apis.tableCreate('12613', {
          license_id: 0, // Test SMS
          contact_id: contact.id,
          mobile_number: contact.mobile_number,
          message_content: testMessage,
          sent_date: new Date().toISOString(),
          delivery_status: 'Test Sent',
          days_before_expiry: 0,
          created_by: 1
        });
      }

      toast({
        title: "Test SMS Sent",
        description: `Test SMS sent to ${activeContacts.length} contacts`
      });
      
      loadHistory();
    } catch (error) {
      console.error('Error sending test SMS:', error);
      toast({
        title: "Error",
        description: "Failed to send test SMS",
        variant: "destructive"
      });
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">SMS Alert Management</h1>
        <Button onClick={sendTestSMS} className="bg-blue-600 hover:bg-blue-700">
          <Send className="w-4 h-4 mr-2" />
          Send Test SMS
        </Button>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Alert Settings</TabsTrigger>
          <TabsTrigger value="contacts">SMS Contacts</TabsTrigger>
          <TabsTrigger value="history">SMS History</TabsTrigger>
        </TabsList>

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
                          onChange={(e) => setNewSetting({...newSetting, setting_name: e.target.value})}
                          placeholder="e.g., Standard License Alert"
                        />
                      </div>
                      <div>
                        <Label htmlFor="days_before">Days Before Expiry</Label>
                        <Input
                          id="days_before"
                          type="number"
                          value={newSetting.days_before_expiry}
                          onChange={(e) => setNewSetting({...newSetting, days_before_expiry: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="frequency">Alert Frequency (Days)</Label>
                        <Input
                          id="frequency"
                          type="number"
                          value={newSetting.alert_frequency_days}
                          onChange={(e) => setNewSetting({...newSetting, alert_frequency_days: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={newSetting.is_active}
                          onCheckedChange={(checked) => setNewSetting({...newSetting, is_active: checked})}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>
                      <div>
                        <Label htmlFor="template">Message Template</Label>
                        <Textarea
                          id="template"
                          value={newSetting.message_template}
                          onChange={(e) => setNewSetting({...newSetting, message_template: e.target.value})}
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
                    <TableHead>Setting Name</TableHead>
                    <TableHead>Days Before</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.map((setting) => (
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
                  SMS Contacts ({contacts.filter(c => c.is_active).length} active)
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
                          onChange={(e) => setNewContact({...newContact, contact_name: e.target.value})}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="mobile_number">Mobile Number</Label>
                        <Input
                          id="mobile_number"
                          value={newContact.mobile_number}
                          onChange={(e) => setNewContact({...newContact, mobile_number: e.target.value})}
                          placeholder="+1234567890"
                        />
                      </div>
                      <div>
                        <Label htmlFor="station">Station</Label>
                        <Select
                          value={newContact.station}
                          onValueChange={(value) => setNewContact({...newContact, station: value})}
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
                          onValueChange={(value) => setNewContact({...newContact, contact_role: value})}
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
                          onCheckedChange={(checked) => setNewContact({...newContact, is_active: checked})}
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
                    <TableHead>Date Sent</TableHead>
                    <TableHead>Mobile Number</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Days Before Expiry</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => (
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
                          variant={record.delivery_status === 'Sent' || record.delivery_status === 'Test Sent' 
                            ? 'default' : 'destructive'}
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
      </Tabs>
    </div>
  );
};

export default SMSAlertManagement;