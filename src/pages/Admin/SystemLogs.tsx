import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useBatchSelection } from '@/hooks/use-batch-selection';
import BatchActionBar from '@/components/BatchActionBar';
import BatchDeleteDialog from '@/components/BatchDeleteDialog';
import AccessDenied from '@/components/AccessDenied';
import useAdminAccess from '@/hooks/use-admin-access';
import {
  FileText,
  Download,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Database,
  Shield,
  Mail,
  Calendar } from
'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  category: string;
  message: string;
  user?: string;
  ip_address?: string;
  details?: any;
}

const SystemLogs: React.FC = () => {
  const { isAdmin } = useAdminAccess();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateRange, setDateRange] = useState('today');
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false);
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const { toast } = useToast();

  // Batch selection hook
  const batchSelection = useBatchSelection<LogEntry>();

  const logLevels = ['INFO', 'WARNING', 'ERROR', 'DEBUG'];
  const categories = ['Authentication', 'Database', 'File Upload', 'Email', 'API', 'Security', 'System'];
  const dateRanges = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'all', label: 'All time' }];


  useEffect(() => {
    generateSampleLogs();
  }, []);

  const generateSampleLogs = () => {
    const sampleLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category: 'Authentication',
      message: 'User login successful',
      user: 'admin@dfsmanager.com',
      ip_address: '192.168.1.100'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      level: 'WARNING',
      category: 'Database',
      message: 'High database connection count detected',
      details: { connections: 85, max: 100 }
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      level: 'ERROR',
      category: 'File Upload',
      message: 'File upload failed: size exceeds limit',
      user: 'employee@dfsmanager.com',
      details: { fileName: 'large_document.pdf', size: '15MB', limit: '10MB' }
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      level: 'INFO',
      category: 'API',
      message: 'Sales report created successfully',
      user: 'manager@dfsmanager.com',
      details: { reportId: 'SR-2024-001', station: 'MOBIL' }
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      level: 'WARNING',
      category: 'Security',
      message: 'Multiple failed login attempts detected',
      ip_address: '203.0.113.10',
      details: { attempts: 5, timeframe: '5 minutes' }
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      level: 'INFO',
      category: 'Email',
      message: 'Email notification sent successfully',
      details: { recipient: 'manager@station.com', type: 'inventory_alert' }
    },
    {
      id: '7',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
      level: 'ERROR',
      category: 'Database',
      message: 'Database connection timeout',
      details: { timeout: '30s', query: 'SELECT * FROM products' }
    },
    {
      id: '8',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
      level: 'DEBUG',
      category: 'System',
      message: 'Scheduled backup completed',
      details: { backupSize: '2.3GB', duration: '45 minutes' }
    },
    {
      id: '9',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      level: 'INFO',
      category: 'Authentication',
      message: 'Password reset requested',
      user: 'employee@dfsmanager.com',
      ip_address: '192.168.1.150'
    },
    {
      id: '10',
      timestamp: new Date(Date.now() - 4200000).toISOString(),
      level: 'WARNING',
      category: 'System',
      message: 'Low disk space warning',
      details: { available: '2.1GB', threshold: '5GB' }
    }];


    setLogs(sampleLogs);
  };

  const refreshLogs = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      generateSampleLogs();
      toast({
        title: "Logs Refreshed",
        description: "System logs have been updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    const filteredLogs = getFilteredLogs();
    const csvContent = [
    ['Timestamp', 'Level', 'Category', 'Message', 'User', 'IP Address'],
    ...filteredLogs.map((log) => [
    log.timestamp,
    log.level,
    log.category,
    log.message,
    log.user || '',
    log.ip_address || '']
    )].
    map((row) => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Logs have been exported to CSV file"
    });
  };

  // Batch operations
  const handleBatchDelete = () => {
    const selectedData = batchSelection.getSelectedData(filteredLogs, (log) => log.id);
    if (selectedData.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select log entries to delete",
        variant: "destructive"
      });
      return;
    }
    setIsBatchDeleteDialogOpen(true);
  };

  const confirmBatchDelete = async () => {
    setBatchActionLoading(true);
    try {
      const selectedData = batchSelection.getSelectedData(filteredLogs, (log) => log.id);
      const selectedIds = selectedData.map((log) => log.id);

      // Filter out selected logs
      const remainingLogs = logs.filter((log) => !selectedIds.includes(log.id));
      setLogs(remainingLogs);

      toast({
        title: "Success",
        description: `Deleted ${selectedData.length} log entries successfully`
      });

      setIsBatchDeleteDialogOpen(false);
      batchSelection.clearSelection();
    } catch (error) {
      console.error('Error in batch delete:', error);
      toast({
        title: "Error",
        description: `Failed to delete log entries: ${error}`,
        variant: "destructive"
      });
    } finally {
      setBatchActionLoading(false);
    }
  };

  const getFilteredLogs = () => {
    return logs.filter((log) => {
      const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user && log.user.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel = selectedLevel === 'All' || log.level === selectedLevel;
      const matchesCategory = selectedCategory === 'All' || log.category === selectedCategory;

      // Date filtering logic would go here based on dateRange

      return matchesSearch && matchesLevel && matchesCategory;
    });
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR':return <XCircle className="w-4 h-4 text-red-500" />;
      case 'WARNING':return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'INFO':return <Info className="w-4 h-4 text-blue-500" />;
      case 'DEBUG':return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'ERROR':return 'bg-red-100 text-red-800';
      case 'WARNING':return 'bg-yellow-100 text-yellow-800';
      case 'INFO':return 'bg-blue-100 text-blue-800';
      case 'DEBUG':return 'bg-gray-100 text-gray-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Authentication':return <User className="w-4 h-4" />;
      case 'Database':return <Database className="w-4 h-4" />;
      case 'Security':return <Shield className="w-4 h-4" />;
      case 'Email':return <Mail className="w-4 h-4" />;
      default:return <FileText className="w-4 h-4" />;
    }
  };

  const filteredLogs = getFilteredLogs();
  const errorCount = logs.filter((log) => log.level === 'ERROR').length;
  const warningCount = logs.filter((log) => log.level === 'WARNING').length;
  const infoCount = logs.filter((log) => log.level === 'INFO').length;

  // Check admin access first
  if (!isAdmin) {
    return (
      <AccessDenied
        feature="System Logs"
        requiredRole="Administrator" />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={refreshLogs} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportLogs} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Info className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Info</p>
                <p className="text-2xl font-bold text-blue-600">{infoCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Action Bar */}
      <BatchActionBar
        selectedCount={batchSelection.selectedCount}
        onBatchDelete={handleBatchDelete}
        onClearSelection={batchSelection.clearSelection}
        isLoading={batchActionLoading}
        showEdit={false} />


      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10" />

            </div>
            
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Levels</SelectItem>
                {logLevels.map((level) =>
                <SelectItem key={level} value={level}>{level}</SelectItem>
                )}
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {categories.map((category) =>
                <SelectItem key={category} value={category}>{category}</SelectItem>
                )}
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) =>
                <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                )}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedLevel('All');
                setSelectedCategory('All');
                setDateRange('today');
              }}>

              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={filteredLogs.length > 0 && batchSelection.selectedCount === filteredLogs.length}
                      onCheckedChange={() => batchSelection.toggleSelectAll(filteredLogs, (log) => log.id)}
                      aria-label="Select all logs" />

                  </TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) =>
                <TableRow key={log.id} className={batchSelection.isSelected(log.id) ? "bg-blue-50" : ""}>
                    <TableCell>
                      <Checkbox
                      checked={batchSelection.isSelected(log.id)}
                      onCheckedChange={() => batchSelection.toggleItem(log.id)}
                      aria-label={`Select log ${log.id}`} />

                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getLevelIcon(log.level)}
                        <Badge className={getLevelBadgeColor(log.level)}>
                          {log.level}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(log.category)}
                        <span>{log.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={log.message}>
                        {log.message}
                      </div>
                      {log.details &&
                    <details className="mt-1">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View details
                          </summary>
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                    }
                    </TableCell>
                    <TableCell>
                      {log.user &&
                    <div className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{log.user}</span>
                        </div>
                    }
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ip_address}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredLogs.length === 0 &&
          <div className="text-center py-8 text-gray-500">
              No logs found matching the current filters.
            </div>
          }
        </CardContent>
      </Card>

      {/* Batch Delete Dialog */}
      <BatchDeleteDialog
        isOpen={isBatchDeleteDialogOpen}
        onClose={() => setIsBatchDeleteDialogOpen(false)}
        onConfirm={confirmBatchDelete}
        selectedCount={batchSelection.selectedCount}
        isLoading={batchActionLoading}
        itemName="log entries"
        selectedItems={batchSelection.getSelectedData(filteredLogs, (log) => log.id).map((log) => ({
          id: log.id,
          name: `${log.level} - ${log.category} - ${log.message.substring(0, 50)}...`
        }))} />

    </div>);

};

export default SystemLogs;