import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Zap, Plus, Play, Pause, Settings, Database, Code, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'motion/react';

interface DatabaseTrigger {
  id: string;
  name: string;
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';
  condition: string;
  action: string;
  priority: number;
  isActive: boolean;
  lastExecuted?: Date;
  executionCount: number;
  averageExecutionTime: number;
  errorCount: number;
  description: string;
}

interface TriggerExecution {
  id: string;
  triggerId: string;
  triggerName: string;
  event: string;
  table: string;
  timestamp: Date;
  executionTime: number;
  status: 'success' | 'error' | 'warning';
  data: any;
  result: string;
  errorMessage?: string;
}

interface TriggerStats {
  totalTriggers: number;
  activeTriggers: number;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  triggersToday: number;
}

const DatabaseTriggerSimulator: React.FC = () => {
  const [triggers, setTriggers] = useState<DatabaseTrigger[]>([]);
  const [executions, setExecutions] = useState<TriggerExecution[]>([]);
  const [stats, setStats] = useState<TriggerStats>({
    totalTriggers: 0,
    activeTriggers: 0,
    totalExecutions: 0,
    successRate: 0,
    averageExecutionTime: 0,
    triggersToday: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<DatabaseTrigger | null>(null);
  const [newTrigger, setNewTrigger] = useState<Partial<DatabaseTrigger>>({
    name: '',
    table: '',
    event: 'INSERT',
    condition: '',
    action: '',
    priority: 1,
    isActive: true,
    description: ''
  });
  const { toast } = useToast();

  // Initialize with sample triggers
  useEffect(() => {
    const sampleTriggers: DatabaseTrigger[] = [
    {
      id: 'trigger_1',
      name: 'License Expiry Alert',
      table: 'licenses_certificates',
      event: 'UPDATE',
      condition: 'expiry_date <= CURRENT_DATE + INTERVAL \'30 days\'',
      action: 'EXECUTE send_license_alert_notification(NEW.id, NEW.license_name, NEW.expiry_date)',
      priority: 1,
      isActive: true,
      executionCount: 15,
      averageExecutionTime: 250,
      errorCount: 0,
      description: 'Automatically sends SMS alerts when licenses are approaching expiration'
    },
    {
      id: 'trigger_2',
      name: 'Inventory Low Stock Alert',
      table: 'products',
      event: 'UPDATE',
      condition: 'NEW.quantity_in_stock <= NEW.minimum_stock AND OLD.quantity_in_stock > OLD.minimum_stock',
      action: 'INSERT INTO inventory_alerts (product_id, alert_type, message) VALUES (NEW.id, \'LOW_STOCK\', CONCAT(\'Product \', NEW.product_name, \' is running low\'))',
      priority: 2,
      isActive: true,
      executionCount: 8,
      averageExecutionTime: 180,
      errorCount: 1,
      description: 'Creates alerts when product inventory falls below minimum stock level'
    },
    {
      id: 'trigger_3',
      name: 'Sales Report Auto-Calculation',
      table: 'daily_sales_reports_enhanced',
      event: 'INSERT',
      condition: '',
      action: 'UPDATE daily_sales_reports_enhanced SET total_sales = (grocery_sales + lottery_total_cash + (regular_gallons + super_gallons + diesel_gallons) * 3.50) WHERE id = NEW.id',
      priority: 3,
      isActive: true,
      executionCount: 22,
      averageExecutionTime: 120,
      errorCount: 0,
      description: 'Automatically calculates total sales when a new daily report is created'
    },
    {
      id: 'trigger_4',
      name: 'Employee Audit Trail',
      table: 'employees',
      event: 'UPDATE',
      condition: '',
      action: 'INSERT INTO audit_logs (event_type, user_id, resource_accessed, action_performed, additional_data) VALUES (\'Data Modification\', USER_ID(), \'employees\', \'update\', JSON_OBJECT(\'employee_id\', NEW.employee_id, \'changes\', JSON_OBJECT()))',
      priority: 5,
      isActive: true,
      executionCount: 12,
      averageExecutionTime: 95,
      errorCount: 0,
      description: 'Maintains audit trail for all employee record modifications'
    }];


    setTriggers(sampleTriggers);
  }, []);

  // Simulate trigger monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      simulateDataChanges();
      updateStats();
    }, 3000);

    return () => clearInterval(interval);
  }, [isMonitoring, triggers]);

  const simulateDataChanges = useCallback(() => {
    // Simulate random database changes that might trigger our triggers
    const activeTriggersArray = triggers.filter((t) => t.isActive);
    if (activeTriggersArray.length === 0) return;

    const shouldTrigger = Math.random() < 0.3; // 30% chance
    if (!shouldTrigger) return;

    const randomTrigger = activeTriggersArray[Math.floor(Math.random() * activeTriggersArray.length)];
    executeTrigger(randomTrigger);
  }, [triggers]);

  const executeTrigger = async (trigger: DatabaseTrigger) => {
    const startTime = performance.now();

    try {
      // Simulate trigger execution
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 100));

      const executionTime = performance.now() - startTime;
      const isSuccess = Math.random() > 0.05; // 95% success rate

      const execution: TriggerExecution = {
        id: `exec_${Date.now()}_${Math.random()}`,
        triggerId: trigger.id,
        triggerName: trigger.name,
        event: trigger.event,
        table: trigger.table,
        timestamp: new Date(),
        executionTime,
        status: isSuccess ? 'success' : 'error',
        data: generateMockTriggerData(trigger.table, trigger.event),
        result: isSuccess ? 'Trigger executed successfully' : 'Execution failed',
        errorMessage: isSuccess ? undefined : 'Simulated execution error'
      };

      setExecutions((prev) => [execution, ...prev.slice(0, 99)]); // Keep last 100 executions

      // Update trigger statistics
      setTriggers((prev) => prev.map((t) =>
      t.id === trigger.id ?
      {
        ...t,
        lastExecuted: new Date(),
        executionCount: t.executionCount + 1,
        averageExecutionTime: (t.averageExecutionTime * t.executionCount + executionTime) / (t.executionCount + 1),
        errorCount: isSuccess ? t.errorCount : t.errorCount + 1
      } :
      t
      ));

      if (isSuccess) {
        toast({
          title: `Trigger Executed`,
          description: `${trigger.name} completed successfully`,
          duration: 2000
        });
      } else {
        toast({
          title: `Trigger Failed`,
          description: `${trigger.name} execution failed`,
          variant: "destructive",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Trigger execution error:', error);
    }
  };

  const generateMockTriggerData = (table: string, event: string) => {
    const mockData = {
      licenses_certificates: { id: 1, license_name: 'Business License', expiry_date: '2024-12-31' },
      products: { id: 1, product_name: 'Sample Product', quantity_in_stock: 5, minimum_stock: 10 },
      daily_sales_reports_enhanced: { id: 1, station: 'MOBIL', total_sales: 1250.00 },
      employees: { id: 1, employee_id: 'EMP001', first_name: 'John', last_name: 'Doe' }
    };

    return mockData[table as keyof typeof mockData] || { id: 1, data: 'sample' };
  };

  const updateStats = () => {
    const activeTriggersCount = triggers.filter((t) => t.isActive).length;
    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter((e) => e.status === 'success').length;
    const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions * 100 : 0;
    const avgExecutionTime = executions.length > 0 ?
    executions.reduce((sum, e) => sum + e.executionTime, 0) / executions.length :
    0;

    const today = new Date().toDateString();
    const triggersToday = executions.filter((e) => e.timestamp.toDateString() === today).length;

    setStats({
      totalTriggers: triggers.length,
      activeTriggers: activeTriggersCount,
      totalExecutions,
      successRate,
      averageExecutionTime: avgExecutionTime,
      triggersToday
    });
  };

  const createTrigger = () => {
    if (!newTrigger.name || !newTrigger.table || !newTrigger.action) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const trigger: DatabaseTrigger = {
      id: `trigger_${Date.now()}`,
      name: newTrigger.name!,
      table: newTrigger.table!,
      event: newTrigger.event!,
      condition: newTrigger.condition || '',
      action: newTrigger.action!,
      priority: newTrigger.priority || 1,
      isActive: newTrigger.isActive !== false,
      executionCount: 0,
      averageExecutionTime: 0,
      errorCount: 0,
      description: newTrigger.description || ''
    };

    setTriggers((prev) => [...prev, trigger]);
    setNewTrigger({
      name: '',
      table: '',
      event: 'INSERT',
      condition: '',
      action: '',
      priority: 1,
      isActive: true,
      description: ''
    });
    setShowCreateDialog(false);

    toast({
      title: "Trigger Created",
      description: `${trigger.name} has been added successfully`
    });
  };

  const toggleTrigger = (triggerId: string) => {
    setTriggers((prev) => prev.map((t) =>
    t.id === triggerId ? { ...t, isActive: !t.isActive } : t
    ));
  };

  const deleteTrigger = (triggerId: string) => {
    setTriggers((prev) => prev.filter((t) => t.id !== triggerId));
    toast({
      title: "Trigger Deleted",
      description: "Trigger has been removed successfully"
    });
  };

  const manualExecuteTrigger = (trigger: DatabaseTrigger) => {
    if (trigger.isActive) {
      executeTrigger(trigger);
    } else {
      toast({
        title: "Trigger Inactive",
        description: "Cannot execute inactive trigger",
        variant: "destructive"
      });
    }
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case 'INSERT':return 'bg-green-500';
      case 'UPDATE':return 'bg-blue-500';
      case 'DELETE':return 'bg-red-500';
      case 'SELECT':return 'bg-purple-500';
      default:return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':return 'text-green-600 bg-green-50';
      case 'error':return 'text-red-600 bg-red-50';
      case 'warning':return 'text-yellow-600 bg-yellow-50';
      default:return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: number) => {
    if (priority <= 2) return 'High';
    if (priority <= 4) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Trigger Simulator
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isMonitoring ? "default" : "secondary"}>
                {isMonitoring ? "Monitoring" : "Paused"}
              </Badge>
              <Button
                onClick={() => setIsMonitoring(!isMonitoring)}
                variant={isMonitoring ? "destructive" : "default"}
                size="sm">

                {isMonitoring ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {isMonitoring ? "Pause" : "Start"}
              </Button>
              <Button
                onClick={() => setShowCreateDialog(true)}
                size="sm">

                <Plus className="h-4 w-4 mr-1" />
                New Trigger
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalTriggers}</div>
              <div className="text-sm text-gray-600">Total Triggers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeTriggers}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalExecutions}</div>
              <div className="text-sm text-gray-600">Executions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.successRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.averageExecutionTime.toFixed(0)}ms</div>
              <div className="text-sm text-gray-600">Avg Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{stats.triggersToday}</div>
              <div className="text-sm text-gray-600">Today</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="triggers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="triggers">Triggers ({triggers.length})</TabsTrigger>
          <TabsTrigger value="executions">Executions ({executions.length})</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="triggers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {triggers.map((trigger) =>
            <Card key={trigger.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getEventColor(trigger.event)} text-white`}>
                        {trigger.event}
                      </Badge>
                      <div>
                        <h3 className="font-medium">{trigger.name}</h3>
                        <p className="text-sm text-gray-600">{trigger.table}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getPriorityLabel(trigger.priority)}
                      </Badge>
                      <Switch
                      checked={trigger.isActive}
                      onCheckedChange={() => toggleTrigger(trigger.id)}
                      size="sm" />

                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-700">{trigger.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Executions:</p>
                      <p>{trigger.executionCount}</p>
                    </div>
                    <div>
                      <p className="font-medium">Avg Time:</p>
                      <p>{trigger.averageExecutionTime.toFixed(0)}ms</p>
                    </div>
                    <div>
                      <p className="font-medium">Errors:</p>
                      <p className={trigger.errorCount > 0 ? "text-red-600" : "text-green-600"}>
                        {trigger.errorCount}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Last Run:</p>
                      <p>{trigger.lastExecuted ? trigger.lastExecuted.toLocaleTimeString() : 'Never'}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-600">CONDITION:</p>
                      <code className="text-xs bg-gray-100 p-1 rounded block">
                        {trigger.condition || 'No condition'}
                      </code>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">ACTION:</p>
                      <code className="text-xs bg-gray-100 p-1 rounded block">
                        {trigger.action.substring(0, 100)}...
                      </code>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                    size="sm"
                    variant="outline"
                    onClick={() => manualExecuteTrigger(trigger)}
                    disabled={!trigger.isActive}>

                      <Play className="h-3 w-3 mr-1" />
                      Execute
                    </Button>
                    <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedTrigger(trigger)}>

                      <Settings className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteTrigger(trigger.id)}>

                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-3">
              <AnimatePresence>
                {executions.map((execution, index) =>
                <motion.div
                  key={execution.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.02 }}>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge className={`${getEventColor(execution.event)} text-white`}>
                              {execution.event}
                            </Badge>
                            <div>
                              <p className="font-medium">{execution.triggerName}</p>
                              <p className="text-sm text-gray-600">
                                {execution.table} • {execution.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(execution.status)}>
                              {execution.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {execution.status === 'error' && <Clock className="h-3 w-3 mr-1" />}
                              {execution.status.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {execution.executionTime.toFixed(0)}ms
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Trigger Data:</p>
                            <code className="text-xs bg-gray-100 p-2 rounded block mt-1">
                              {JSON.stringify(execution.data, null, 2)}
                            </code>
                          </div>
                          <div>
                            <p className="font-medium">Result:</p>
                            <p className={`mt-1 p-2 rounded text-xs ${getStatusColor(execution.status)}`}>
                              {execution.result}
                              {execution.errorMessage &&
                            <span className="block mt-1 text-red-600">
                                  Error: {execution.errorMessage}
                                </span>
                            }
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Alert>
            <Code className="h-4 w-4" />
            <AlertDescription>
              Pre-built trigger templates for common database operations. Click to use as a starting point for your custom triggers.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
            {
              name: 'Audit Log Trigger',
              description: 'Automatically log all changes to sensitive tables',
              template: `INSERT INTO audit_logs (event_type, table_name, record_id, old_data, new_data, timestamp) 
VALUES ('${newTrigger.event}', '${newTrigger.table}', NEW.id, OLD, NEW, NOW())`
            },
            {
              name: 'Status Update Notification',
              description: 'Send notifications when status fields change',
              template: `IF NEW.status != OLD.status THEN
  INSERT INTO notifications (user_id, message, type) 
  VALUES (NEW.user_id, CONCAT('Status changed to ', NEW.status), 'status_update');
END IF`
            },
            {
              name: 'Calculated Field Update',
              description: 'Automatically update calculated fields',
              template: `UPDATE ${newTrigger.table} 
SET calculated_field = (field1 + field2) * 0.1 
WHERE id = NEW.id`
            },
            {
              name: 'Cascade Delete Safety',
              description: 'Prevent accidental cascade deletions',
              template: `IF (SELECT COUNT(*) FROM related_table WHERE parent_id = OLD.id) > 0 THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete record with dependencies';
END IF`
            }].
            map((template, index) =>
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                    <Button
                    size="sm"
                    onClick={() => {
                      setNewTrigger((prev) => ({ ...prev, action: template.template }));
                      setShowCreateDialog(true);
                    }}>

                      Use Template
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <code className="text-xs bg-gray-100 p-2 rounded block">
                    {template.template}
                  </code>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Trigger Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Database Trigger</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trigger Name</Label>
                <Input
                  value={newTrigger.name}
                  onChange={(e) => setNewTrigger((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter trigger name" />

              </div>
              <div className="space-y-2">
                <Label>Table</Label>
                <Select value={newTrigger.table} onValueChange={(value) => setNewTrigger((prev) => ({ ...prev, table: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="products">products</SelectItem>
                    <SelectItem value="employees">employees</SelectItem>
                    <SelectItem value="licenses_certificates">licenses_certificates</SelectItem>
                    <SelectItem value="daily_sales_reports_enhanced">daily_sales_reports_enhanced</SelectItem>
                    <SelectItem value="orders">orders</SelectItem>
                    <SelectItem value="vendors">vendors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event</Label>
                <Select value={newTrigger.event} onValueChange={(value: any) => setNewTrigger((prev) => ({ ...prev, event: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSERT">INSERT</SelectItem>
                    <SelectItem value="UPDATE">UPDATE</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="SELECT">SELECT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority (1 = Highest)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newTrigger.priority}
                  onChange={(e) => setNewTrigger((prev) => ({ ...prev, priority: Number(e.target.value) }))} />

              </div>
            </div>

            <div className="space-y-2">
              <Label>Condition (Optional)</Label>
              <Input
                value={newTrigger.condition}
                onChange={(e) => setNewTrigger((prev) => ({ ...prev, condition: e.target.value }))}
                placeholder="e.g., NEW.status != OLD.status" />

            </div>

            <div className="space-y-2">
              <Label>Action (SQL Code)</Label>
              <Textarea
                value={newTrigger.action}
                onChange={(e) => setNewTrigger((prev) => ({ ...prev, action: e.target.value }))}
                placeholder="Enter the SQL action to execute"
                rows={4} />

            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={newTrigger.description}
                onChange={(e) => setNewTrigger((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this trigger does" />

            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={newTrigger.isActive}
                onCheckedChange={(checked) => setNewTrigger((prev) => ({ ...prev, isActive: checked }))} />

              <Label>Active</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createTrigger}>
                Create Trigger
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

};

export default DatabaseTriggerSimulator;