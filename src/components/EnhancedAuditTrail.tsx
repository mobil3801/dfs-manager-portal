import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Shield, Search, Filter, Download, Eye, AlertTriangle, CheckCircle, Clock, Calendar as CalendarIcon, Database, User, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: string;
  userId: number;
  userName: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
  resourceAccessed: string;
  actionPerformed: string;
  eventStatus: 'Success' | 'Failed' | 'Blocked' | 'Suspicious';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  sessionId: string;
  geoLocation: string;
  station: string;
  additionalData: any;
  failureReason?: string;
  dataChanges?: {
    before: any;
    after: any;
    fieldsChanged: string[];
  };
}

interface AuditMetrics {
  totalEvents: number;
  eventsToday: number;
  successRate: number;
  highRiskEvents: number;
  failedLogins: number;
  suspiciousActivity: number;
  averageSessionDuration: number;
  mostActiveUser: string;
}

interface AuditFilter {
  dateRange: {from: Date | null;to: Date | null;};
  eventType: string;
  riskLevel: string;
  status: string;
  user: string;
  station: string;
  searchTerm: string;
}

const EnhancedAuditTrail: React.FC = () => {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [metrics, setMetrics] = useState<AuditMetrics>({
    totalEvents: 0,
    eventsToday: 0,
    successRate: 0,
    highRiskEvents: 0,
    failedLogins: 0,
    suspiciousActivity: 0,
    averageSessionDuration: 0,
    mostActiveUser: ''
  });
  const [filters, setFilters] = useState<AuditFilter>({
    dateRange: { from: null, to: null },
    eventType: 'all',
    riskLevel: 'all',
    status: 'all',
    user: 'all',
    station: 'all',
    searchTerm: ''
  });
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const { toast } = useToast();

  // Initialize with sample audit data
  useEffect(() => {
    generateSampleAuditData();
  }, []);

  // Real-time audit logging simulation
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const interval = setInterval(() => {
      generateRandomAuditEvent();
      updateMetrics();
    }, 3000);

    return () => clearInterval(interval);
  }, [isRealTimeEnabled, auditEvents]);

  const generateSampleAuditData = () => {
    const sampleEvents: AuditEvent[] = [
    {
      id: 'audit_1',
      timestamp: new Date(Date.now() - 300000),
      eventType: 'Login',
      userId: 1,
      userName: 'john.doe@gasstation.com',
      userRole: 'Administrator',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      resourceAccessed: '/admin/dashboard',
      actionPerformed: 'login',
      eventStatus: 'Success',
      riskLevel: 'Low',
      sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),
      geoLocation: 'New York, NY, USA',
      station: 'MOBIL',
      additionalData: { loginMethod: 'password', rememberMe: true }
    },
    {
      id: 'audit_2',
      timestamp: new Date(Date.now() - 240000),
      eventType: 'Data Modification',
      userId: 2,
      userName: 'sarah.manager@gasstation.com',
      userRole: 'Management',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      resourceAccessed: 'products',
      actionPerformed: 'update',
      eventStatus: 'Success',
      riskLevel: 'Medium',
      sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),
      geoLocation: 'Brooklyn, NY, USA',
      station: 'AMOCO BROOKLYN',
      additionalData: { recordId: 123 },
      dataChanges: {
        before: { price: 9.99, quantity: 50 },
        after: { price: 10.99, quantity: 45 },
        fieldsChanged: ['price', 'quantity']
      }
    },
    {
      id: 'audit_3',
      timestamp: new Date(Date.now() - 180000),
      eventType: 'Failed Login',
      userId: 0,
      userName: 'unknown@attacker.com',
      userRole: 'Unknown',
      ipAddress: '45.123.45.67',
      userAgent: 'curl/7.68.0',
      resourceAccessed: '/login',
      actionPerformed: 'login_attempt',
      eventStatus: 'Failed',
      riskLevel: 'High',
      sessionId: '',
      geoLocation: 'Unknown Location',
      station: '',
      additionalData: { attempts: 5, blocked: true },
      failureReason: 'Invalid credentials - multiple attempts detected'
    },
    {
      id: 'audit_4',
      timestamp: new Date(Date.now() - 120000),
      eventType: 'Permission Change',
      userId: 1,
      userName: 'john.doe@gasstation.com',
      userRole: 'Administrator',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      resourceAccessed: 'user_management',
      actionPerformed: 'permission_update',
      eventStatus: 'Success',
      riskLevel: 'Critical',
      sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),
      geoLocation: 'New York, NY, USA',
      station: 'ALL',
      additionalData: {
        targetUserId: 3,
        permissionChanges: ['added_admin_access', 'removed_station_restriction']
      }
    }];


    setAuditEvents(sampleEvents);
  };

  const generateRandomAuditEvent = useCallback(() => {
    const eventTypes = ['Login', 'Logout', 'Data Access', 'Data Modification', 'Failed Login', 'Permission Change', 'Admin Action'];
    const users = [
    { id: 1, name: 'john.doe@gasstation.com', role: 'Administrator' },
    { id: 2, name: 'sarah.manager@gasstation.com', role: 'Management' },
    { id: 3, name: 'mike.employee@gasstation.com', role: 'Employee' }];

    const stations = ['MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN', 'ALL'];
    const resources = ['products', 'employees', 'sales_reports', 'licenses', 'orders', 'vendors'];
    const statuses: ('Success' | 'Failed' | 'Blocked' | 'Suspicious')[] = ['Success', 'Failed', 'Blocked', 'Suspicious'];
    const riskLevels: ('Low' | 'Medium' | 'High' | 'Critical')[] = ['Low', 'Medium', 'High', 'Critical'];

    const shouldGenerate = Math.random() < 0.4; // 40% chance
    if (!shouldGenerate) return;

    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const isFailedAttempt = Math.random() < 0.1; // 10% chance of failure

    const newEvent: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      eventType,
      userId: isFailedAttempt ? 0 : user.id,
      userName: isFailedAttempt ? 'suspicious@attacker.com' : user.name,
      userRole: isFailedAttempt ? 'Unknown' : user.role,
      ipAddress: isFailedAttempt ? `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : '192.168.1.' + (100 + Math.floor(Math.random() * 10)),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      resourceAccessed: resources[Math.floor(Math.random() * resources.length)],
      actionPerformed: isFailedAttempt ? 'unauthorized_access_attempt' : ['view', 'create', 'update', 'delete'][Math.floor(Math.random() * 4)],
      eventStatus: isFailedAttempt ? statuses[Math.floor(Math.random() * 3) + 1] : 'Success',
      riskLevel: isFailedAttempt ? Math.random() < 0.5 ? 'High' : 'Critical' : riskLevels[Math.floor(Math.random() * 2)],
      sessionId: isFailedAttempt ? '' : 'sess_' + Math.random().toString(36).substr(2, 9),
      geoLocation: isFailedAttempt ? 'Unknown Location' : 'New York, NY, USA',
      station: stations[Math.floor(Math.random() * stations.length)],
      additionalData: {
        timestamp: new Date().toISOString(),
        suspicious: isFailedAttempt
      },
      failureReason: isFailedAttempt ? 'Unauthorized access attempt detected' : undefined
    };

    setAuditEvents((prev) => [newEvent, ...prev.slice(0, 99)]); // Keep last 100 events
  }, []);

  const updateMetrics = useCallback(() => {
    const today = new Date().toDateString();
    const eventsToday = auditEvents.filter((e) => e.timestamp.toDateString() === today).length;
    const successfulEvents = auditEvents.filter((e) => e.eventStatus === 'Success').length;
    const highRiskEvents = auditEvents.filter((e) => e.riskLevel === 'High' || e.riskLevel === 'Critical').length;
    const failedLogins = auditEvents.filter((e) => e.eventType === 'Failed Login').length;
    const suspiciousActivity = auditEvents.filter((e) => e.eventStatus === 'Suspicious' || e.eventStatus === 'Blocked').length;

    // Calculate most active user
    const userActivity = auditEvents.reduce((acc, event) => {
      acc[event.userName] = (acc[event.userName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostActiveUser = Object.entries(userActivity).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    setMetrics({
      totalEvents: auditEvents.length,
      eventsToday,
      successRate: auditEvents.length > 0 ? successfulEvents / auditEvents.length * 100 : 0,
      highRiskEvents,
      failedLogins,
      suspiciousActivity,
      averageSessionDuration: Math.random() * 120 + 30, // Simulated 30-150 minutes
      mostActiveUser
    });
  }, [auditEvents]);

  const getFilteredEvents = (): AuditEvent[] => {
    return auditEvents.filter((event) => {
      // Date range filter
      if (filters.dateRange.from && event.timestamp < filters.dateRange.from) return false;
      if (filters.dateRange.to && event.timestamp > filters.dateRange.to) return false;

      // Other filters
      if (filters.eventType !== 'all' && event.eventType !== filters.eventType) return false;
      if (filters.riskLevel !== 'all' && event.riskLevel !== filters.riskLevel) return false;
      if (filters.status !== 'all' && event.eventStatus !== filters.status) return false;
      if (filters.station !== 'all' && event.station !== filters.station) return false;
      if (filters.user !== 'all' && !event.userName.includes(filters.user)) return false;

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          event.userName.toLowerCase().includes(searchLower) ||
          event.resourceAccessed.toLowerCase().includes(searchLower) ||
          event.actionPerformed.toLowerCase().includes(searchLower) ||
          event.ipAddress.includes(searchLower));

      }

      return true;
    });
  };

  const exportAuditData = () => {
    const filteredEvents = getFilteredEvents();

    if (exportFormat === 'json') {
      const dataStr = JSON.stringify(filteredEvents, null, 2);
      downloadFile(dataStr, 'audit-trail.json', 'application/json');
    } else if (exportFormat === 'csv') {
      const csvHeaders = 'Timestamp,Event Type,User,IP Address,Resource,Action,Status,Risk Level,Station,Details\n';
      const csvData = filteredEvents.map((event) =>
      `${event.timestamp.toISOString()},${event.eventType},${event.userName},${event.ipAddress},${event.resourceAccessed},${event.actionPerformed},${event.eventStatus},${event.riskLevel},${event.station},"${JSON.stringify(event.additionalData).replace(/"/g, '""')}"`
      ).join('\n');
      downloadFile(csvHeaders + csvData, 'audit-trail.csv', 'text/csv');
    }

    toast({
      title: "Export Complete",
      description: `Audit data exported as ${exportFormat.toUpperCase()}`
    });
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low':return 'bg-green-500 text-white';
      case 'Medium':return 'bg-yellow-500 text-white';
      case 'High':return 'bg-orange-500 text-white';
      case 'Critical':return 'bg-red-500 text-white';
      default:return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Failed':return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'Blocked':return <Shield className="h-4 w-4 text-orange-500" />;
      case 'Suspicious':return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const clearFilters = () => {
    setFilters({
      dateRange: { from: null, to: null },
      eventType: 'all',
      riskLevel: 'all',
      status: 'all',
      user: 'all',
      station: 'all',
      searchTerm: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Enhanced Audit Trail
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isRealTimeEnabled ? "default" : "secondary"}>
                {isRealTimeEnabled ? "Real-time" : "Paused"}
              </Badge>
              <Button
                onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                variant={isRealTimeEnabled ? "destructive" : "default"}
                size="sm">

                {isRealTimeEnabled ? "Pause" : "Start"} Logging
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.eventsToday}</div>
              <div className="text-sm text-gray-600">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.successRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.highRiskEvents}</div>
              <div className="text-sm text-gray-600">High Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.failedLogins}</div>
              <div className="text-sm text-gray-600">Failed Logins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{metrics.suspiciousActivity}</div>
              <div className="text-sm text-gray-600">Suspicious</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{metrics.averageSessionDuration.toFixed(0)}m</div>
              <div className="text-sm text-gray-600">Avg Session</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-teal-600 truncate">{metrics.mostActiveUser.split('@')[0]}</div>
              <div className="text-sm text-gray-600">Most Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">Audit Events ({getFilteredEvents().length})</TabsTrigger>
          <TabsTrigger value="analytics">Security Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search events..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
                      className="pl-8" />

                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Type</label>
                  <Select value={filters.eventType} onValueChange={(value) => setFilters((prev) => ({ ...prev, eventType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Login">Login</SelectItem>
                      <SelectItem value="Logout">Logout</SelectItem>
                      <SelectItem value="Data Modification">Data Modification</SelectItem>
                      <SelectItem value="Failed Login">Failed Login</SelectItem>
                      <SelectItem value="Permission Change">Permission Change</SelectItem>
                      <SelectItem value="Admin Action">Admin Action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Risk Level</label>
                  <Select value={filters.riskLevel} onValueChange={(value) => setFilters((prev) => ({ ...prev, riskLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Success">Success</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                      <SelectItem value="Suspicious">Suspicious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Station</label>
                  <Select value={filters.station} onValueChange={(value) => setFilters((prev) => ({ ...prev, station: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stations</SelectItem>
                      <SelectItem value="MOBIL">MOBIL</SelectItem>
                      <SelectItem value="AMOCO ROSEDALE">AMOCO ROSEDALE</SelectItem>
                      <SelectItem value="AMOCO BROOKLYN">AMOCO BROOKLYN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end gap-2">
                  <Button variant="outline" onClick={clearFilters} size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                  <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={exportAuditData} size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <ScrollArea className="h-96">
            <div className="space-y-2">
              <AnimatePresence>
                {getFilteredEvents().map((event, index) =>
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.02 }}>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedEvent(event)}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(event.eventStatus)}
                            <div>
                              <p className="font-medium text-sm">{event.eventType}</p>
                              <p className="text-xs text-gray-600">
                                {event.userName} • {event.timestamp.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getRiskLevelColor(event.riskLevel)}>
                              {event.riskLevel}
                            </Badge>
                            <Badge variant="outline">
                              {event.station || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="font-medium">Resource:</span>
                            <span className="ml-1">{event.resourceAccessed}</span>
                          </div>
                          <div>
                            <span className="font-medium">Action:</span>
                            <span className="ml-1">{event.actionPerformed}</span>
                          </div>
                          <div>
                            <span className="font-medium">IP:</span>
                            <span className="ml-1">{event.ipAddress}</span>
                          </div>
                          <div>
                            <span className="font-medium">Location:</span>
                            <span className="ml-1">{event.geoLocation}</span>
                          </div>
                        </div>

                        {event.failureReason &&
                      <Alert className="mt-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              {event.failureReason}
                            </AlertDescription>
                          </Alert>
                      }
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Security Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Authentication Success Rate</span>
                      <span>{metrics.successRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.successRate} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Risk Level Distribution</span>
                      <span>{(metrics.highRiskEvents / metrics.totalEvents * 100).toFixed(1)}% High/Critical</span>
                    </div>
                    <Progress value={metrics.highRiskEvents / metrics.totalEvents * 100} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Security Incident Rate</span>
                      <span>{(metrics.suspiciousActivity / metrics.totalEvents * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.suspiciousActivity / metrics.totalEvents * 100} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Activity Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Most Active User:</span>
                    <Badge variant="outline">{metrics.mostActiveUser}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Session Duration:</span>
                    <Badge variant="outline">{metrics.averageSessionDuration.toFixed(0)} minutes</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed Login Attempts:</span>
                    <Badge variant="destructive">{metrics.failedLogins}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Blocked Activities:</span>
                    <Badge variant="secondary">{metrics.suspiciousActivity}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Security analytics help identify patterns and potential threats. Regular monitoring and analysis of audit trails 
              are essential for maintaining system security and compliance.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">SOX Compliance</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">98.5%</div>
                <p className="text-sm text-gray-600">Audit Trail Coverage</p>
                <Progress value={98.5} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">GDPR Compliance</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">95.2%</div>
                <p className="text-sm text-gray-600">Data Protection Score</p>
                <Progress value={95.2} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">PCI DSS</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">92.8%</div>
                <p className="text-sm text-gray-600">Security Standards</p>
                <Progress value={92.8} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>All administrative actions logged</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Failed access attempts monitored</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Data modifications tracked</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span>User session management</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Geographic access logging</span>
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Audit Event Details</DialogTitle>
          </DialogHeader>
          
          {selectedEvent &&
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Event Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Type:</span> {selectedEvent.eventType}</div>
                    <div><span className="font-medium">Timestamp:</span> {selectedEvent.timestamp.toLocaleString()}</div>
                    <div><span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getRiskLevelColor(selectedEvent.riskLevel)}`}>
                        {selectedEvent.eventStatus}
                      </Badge>
                    </div>
                    <div><span className="font-medium">Risk Level:</span> 
                      <Badge className={`ml-2 ${getRiskLevelColor(selectedEvent.riskLevel)}`}>
                        {selectedEvent.riskLevel}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">User Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">User:</span> {selectedEvent.userName}</div>
                    <div><span className="font-medium">Role:</span> {selectedEvent.userRole}</div>
                    <div><span className="font-medium">IP Address:</span> {selectedEvent.ipAddress}</div>
                    <div><span className="font-medium">Location:</span> {selectedEvent.geoLocation}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Action Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Resource:</span> {selectedEvent.resourceAccessed}</div>
                  <div><span className="font-medium">Action:</span> {selectedEvent.actionPerformed}</div>
                  <div><span className="font-medium">Station:</span> {selectedEvent.station}</div>
                  <div><span className="font-medium">Session ID:</span> {selectedEvent.sessionId}</div>
                </div>
              </div>

              {selectedEvent.dataChanges &&
            <div className="space-y-2">
                  <h4 className="font-medium">Data Changes</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Before:</p>
                      <code className="text-xs bg-red-50 p-2 rounded block">
                        {JSON.stringify(selectedEvent.dataChanges.before, null, 2)}
                      </code>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">After:</p>
                      <code className="text-xs bg-green-50 p-2 rounded block">
                        {JSON.stringify(selectedEvent.dataChanges.after, null, 2)}
                      </code>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Fields Changed:</p>
                    <div className="flex gap-1 mt-1">
                      {selectedEvent.dataChanges.fieldsChanged.map((field) =>
                  <Badge key={field} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                  )}
                    </div>
                  </div>
                </div>
            }

              <div className="space-y-2">
                <h4 className="font-medium">Additional Data</h4>
                <code className="text-xs bg-gray-100 p-3 rounded block">
                  {JSON.stringify(selectedEvent.additionalData, null, 2)}
                </code>
              </div>

              {selectedEvent.failureReason &&
            <Alert className="border-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <span className="font-medium">Failure Reason: </span>
                    {selectedEvent.failureReason}
                  </AlertDescription>
                </Alert>
            }
            </div>
          }
        </DialogContent>
      </Dialog>
    </div>);

};

export default EnhancedAuditTrail;