import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Shield, Eye, Search, Download, Filter, Calendar } from 'lucide-react';
import AuditLoggerService from '@/services/auditLogger';

interface AuditLog {
  id: number;
  event_type: string;
  user_id?: number;
  username?: string;
  ip_address?: string;
  user_agent?: string;
  event_timestamp: string;
  event_status: string;
  resource_accessed?: string;
  action_performed?: string;
  failure_reason?: string;
  session_id?: string;
  risk_level: string;
  additional_data?: string;
  station?: string;
  geo_location?: string;
}

const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState&lt;AuditLog[]&gt;([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    event_type: '',
    event_status: '',
    risk_level: '',
    username: '',
    station: '',
    date_from: '',
    date_to: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const pageSize = 20;

  const auditLogger = AuditLoggerService.getInstance();

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await auditLogger.getLogs(currentPage, pageSize, filters);
      
      if (error) {
        throw new Error(error);
      }

      if (data?.List) {
        setLogs(data.List);
        setTotalCount(data.VirtualCount || 0);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev =&gt; ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      event_type: '',
      event_status: '',
      risk_level: '',
      username: '',
      station: '',
      date_from: '',
      date_to: ''
    });
    setCurrentPage(1);
  };

  const exportLogs = async () => {
    try {
      const { data, error } = await auditLogger.getLogs(1, 1000, filters);
      
      if (error) {
        throw new Error(error);
      }

      if (data?.List) {
        const csv = [
          'Event Type,Username,IP Address,Timestamp,Status,Risk Level,Resource,Action,Failure Reason,Station',
          ...data.List.map((log: AuditLog) =&gt; 
            `"${log.event_type}","${log.username || 'N/A'}","${log.ip_address || 'N/A'}","${log.event_timestamp}","${log.event_status}","${log.risk_level}","${log.resource_accessed || 'N/A'}","${log.action_performed || 'N/A'}","${log.failure_reason || 'N/A'}","${log.station || 'N/A'}"`
          )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: "Audit logs exported successfully"
        });
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast({
        title: "Error",
        description: "Failed to export audit logs",
        variant: "destructive"
      });
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical': return 'bg-red-500 hover:bg-red-600';
      case 'High': return 'bg-orange-500 hover:bg-orange-600';
      case 'Medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Low': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-500 hover:bg-green-600';
      case 'Failed': return 'bg-red-500 hover:bg-red-600';
      case 'Blocked': return 'bg-orange-500 hover:bg-orange-600';
      case 'Suspicious': return 'bg-purple-500 hover:bg-purple-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    &lt;div className="space-y-6"&gt;
      &lt;Card&gt;
        &lt;CardHeader&gt;
          &lt;div className="flex items-center justify-between"&gt;
            &lt;div className="flex items-center space-x-2"&gt;
              &lt;Shield className="h-5 w-5 text-blue-600" /&gt;
              &lt;CardTitle&gt;Audit Log Viewer&lt;/CardTitle&gt;
            &lt;/div&gt;
            &lt;div className="flex items-center space-x-2"&gt;
              &lt;Button
                variant="outline"
                size="sm"
                onClick={() =&gt; setShowFilters(!showFilters)}
              &gt;
                &lt;Filter className="h-4 w-4 mr-2" /&gt;
                Filters
              &lt;/Button&gt;
              &lt;Button
                variant="outline"
                size="sm"
                onClick={exportLogs}
              &gt;
                &lt;Download className="h-4 w-4 mr-2" /&gt;
                Export
              &lt;/Button&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/CardHeader&gt;

        {showFilters && (
          &lt;CardContent className="border-t"&gt;
            &lt;div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4"&gt;
              &lt;div&gt;
                &lt;label className="text-sm font-medium mb-1 block"&gt;Event Type&lt;/label&gt;
                &lt;Select value={filters.event_type} onValueChange={(value) =&gt; handleFilterChange('event_type', value)}&gt;
                  &lt;SelectTrigger&gt;
                    &lt;SelectValue placeholder="All events" /&gt;
                  &lt;/SelectTrigger&gt;
                  &lt;SelectContent&gt;
                    &lt;SelectItem value=""&gt;All Events&lt;/SelectItem&gt;
                    &lt;SelectItem value="Login"&gt;Login&lt;/SelectItem&gt;
                    &lt;SelectItem value="Logout"&gt;Logout&lt;/SelectItem&gt;
                    &lt;SelectItem value="Failed Login"&gt;Failed Login&lt;/SelectItem&gt;
                    &lt;SelectItem value="Registration"&gt;Registration&lt;/SelectItem&gt;
                    &lt;SelectItem value="Password Reset"&gt;Password Reset&lt;/SelectItem&gt;
                    &lt;SelectItem value="Data Access"&gt;Data Access&lt;/SelectItem&gt;
                    &lt;SelectItem value="Data Modification"&gt;Data Modification&lt;/SelectItem&gt;
                    &lt;SelectItem value="Permission Change"&gt;Permission Change&lt;/SelectItem&gt;
                    &lt;SelectItem value="Admin Action"&gt;Admin Action&lt;/SelectItem&gt;
                    &lt;SelectItem value="Suspicious Activity"&gt;Suspicious Activity&lt;/SelectItem&gt;
                  &lt;/SelectContent&gt;
                &lt;/Select&gt;
              &lt;/div&gt;

              &lt;div&gt;
                &lt;label className="text-sm font-medium mb-1 block"&gt;Status&lt;/label&gt;
                &lt;Select value={filters.event_status} onValueChange={(value) =&gt; handleFilterChange('event_status', value)}&gt;
                  &lt;SelectTrigger&gt;
                    &lt;SelectValue placeholder="All statuses" /&gt;
                  &lt;/SelectTrigger&gt;
                  &lt;SelectContent&gt;
                    &lt;SelectItem value=""&gt;All Statuses&lt;/SelectItem&gt;
                    &lt;SelectItem value="Success"&gt;Success&lt;/SelectItem&gt;
                    &lt;SelectItem value="Failed"&gt;Failed&lt;/SelectItem&gt;
                    &lt;SelectItem value="Blocked"&gt;Blocked&lt;/SelectItem&gt;
                    &lt;SelectItem value="Suspicious"&gt;Suspicious&lt;/SelectItem&gt;
                  &lt;/SelectContent&gt;
                &lt;/Select&gt;
              &lt;/div&gt;

              &lt;div&gt;
                &lt;label className="text-sm font-medium mb-1 block"&gt;Risk Level&lt;/label&gt;
                &lt;Select value={filters.risk_level} onValueChange={(value) =&gt; handleFilterChange('risk_level', value)}&gt;
                  &lt;SelectTrigger&gt;
                    &lt;SelectValue placeholder="All risk levels" /&gt;
                  &lt;/SelectTrigger&gt;
                  &lt;SelectContent&gt;
                    &lt;SelectItem value=""&gt;All Risk Levels&lt;/SelectItem&gt;
                    &lt;SelectItem value="Low"&gt;Low&lt;/SelectItem&gt;
                    &lt;SelectItem value="Medium"&gt;Medium&lt;/SelectItem&gt;
                    &lt;SelectItem value="High"&gt;High&lt;/SelectItem&gt;
                    &lt;SelectItem value="Critical"&gt;Critical&lt;/SelectItem&gt;
                  &lt;/SelectContent&gt;
                &lt;/Select&gt;
              &lt;/div&gt;

              &lt;div&gt;
                &lt;label className="text-sm font-medium mb-1 block"&gt;Station&lt;/label&gt;
                &lt;Select value={filters.station} onValueChange={(value) =&gt; handleFilterChange('station', value)}&gt;
                  &lt;SelectTrigger&gt;
                    &lt;SelectValue placeholder="All stations" /&gt;
                  &lt;/SelectTrigger&gt;
                  &lt;SelectContent&gt;
                    &lt;SelectItem value=""&gt;All Stations&lt;/SelectItem&gt;
                    &lt;SelectItem value="MOBIL"&gt;MOBIL&lt;/SelectItem&gt;
                    &lt;SelectItem value="AMOCO ROSEDALE"&gt;AMOCO ROSEDALE&lt;/SelectItem&gt;
                    &lt;SelectItem value="AMOCO BROOKLYN"&gt;AMOCO BROOKLYN&lt;/SelectItem&gt;
                  &lt;/SelectContent&gt;
                &lt;/Select&gt;
              &lt;/div&gt;

              &lt;div&gt;
                &lt;label className="text-sm font-medium mb-1 block"&gt;Username&lt;/label&gt;
                &lt;Input
                  placeholder="Search username..."
                  value={filters.username}
                  onChange={(e) =&gt; handleFilterChange('username', e.target.value)}
                /&gt;
              &lt;/div&gt;

              &lt;div&gt;
                &lt;label className="text-sm font-medium mb-1 block"&gt;Date From&lt;/label&gt;
                &lt;Input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) =&gt; handleFilterChange('date_from', e.target.value)}
                /&gt;
              &lt;/div&gt;

              &lt;div&gt;
                &lt;label className="text-sm font-medium mb-1 block"&gt;Date To&lt;/label&gt;
                &lt;Input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) =&gt; handleFilterChange('date_to', e.target.value)}
                /&gt;
              &lt;/div&gt;

              &lt;div className="flex items-end"&gt;
                &lt;Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                &gt;
                  Clear Filters
                &lt;/Button&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/CardContent&gt;
        )}

        &lt;CardContent&gt;
          {loading ? (
            &lt;div className="flex justify-center py-8"&gt;
              &lt;div className="text-muted-foreground"&gt;Loading audit logs...&lt;/div&gt;
            &lt;/div&gt;
          ) : (
            &lt;&gt;
              &lt;div className="rounded-md border"&gt;
                &lt;Table&gt;
                  &lt;TableHeader&gt;
                    &lt;TableRow&gt;
                      &lt;TableHead&gt;Timestamp&lt;/TableHead&gt;
                      &lt;TableHead&gt;Event Type&lt;/TableHead&gt;
                      &lt;TableHead&gt;User&lt;/TableHead&gt;
                      &lt;TableHead&gt;Status&lt;/TableHead&gt;
                      &lt;TableHead&gt;Risk Level&lt;/TableHead&gt;
                      &lt;TableHead&gt;Resource&lt;/TableHead&gt;
                      &lt;TableHead&gt;Action&lt;/TableHead&gt;
                      &lt;TableHead&gt;Station&lt;/TableHead&gt;
                      &lt;TableHead&gt;IP Address&lt;/TableHead&gt;
                    &lt;/TableRow&gt;
                  &lt;/TableHeader&gt;
                  &lt;TableBody&gt;
                    {logs.length === 0 ? (
                      &lt;TableRow&gt;
                        &lt;TableCell colSpan={9} className="text-center py-8 text-muted-foreground"&gt;
                          No audit logs found
                        &lt;/TableCell&gt;
                      &lt;/TableRow&gt;
                    ) : (
                      logs.map((log) =&gt; (
                        &lt;TableRow key={log.id}&gt;
                          &lt;TableCell className="text-sm"&gt;
                            {format(new Date(log.event_timestamp), 'MMM dd, yyyy HH:mm:ss')}
                          &lt;/TableCell&gt;
                          &lt;TableCell&gt;
                            &lt;Badge variant="outline"&gt;{log.event_type}&lt;/Badge&gt;
                          &lt;/TableCell&gt;
                          &lt;TableCell&gt;
                            {log.username || 'Anonymous'}
                          &lt;/TableCell&gt;
                          &lt;TableCell&gt;
                            &lt;Badge className={`text-white ${getStatusBadgeColor(log.event_status)}`}&gt;
                              {log.event_status}
                            &lt;/Badge&gt;
                          &lt;/TableCell&gt;
                          &lt;TableCell&gt;
                            &lt;Badge className={`text-white ${getRiskBadgeColor(log.risk_level)}`}&gt;
                              {log.risk_level}
                            &lt;/Badge&gt;
                          &lt;/TableCell&gt;
                          &lt;TableCell className="text-sm"&gt;
                            {log.resource_accessed || 'N/A'}
                          &lt;/TableCell&gt;
                          &lt;TableCell className="text-sm"&gt;
                            {log.action_performed || 'N/A'}
                          &lt;/TableCell&gt;
                          &lt;TableCell&gt;
                            {log.station || 'N/A'}
                          &lt;/TableCell&gt;
                          &lt;TableCell className="text-sm"&gt;
                            {log.ip_address || 'N/A'}
                          &lt;/TableCell&gt;
                        &lt;/TableRow&gt;
                      ))
                    )}
                  &lt;/TableBody&gt;
                &lt;/Table&gt;
              &lt;/div&gt;

              {/* Pagination */}
              {totalPages &gt; 1 && (
                &lt;div className="flex items-center justify-between mt-4"&gt;
                  &lt;div className="text-sm text-muted-foreground"&gt;
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
                  &lt;/div&gt;
                  &lt;div className="flex items-center space-x-2"&gt;
                    &lt;Button
                      variant="outline"
                      size="sm"
                      onClick={() =&gt; setCurrentPage(prev =&gt; Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    &gt;
                      Previous
                    &lt;/Button&gt;
                    &lt;span className="text-sm"&gt;
                      Page {currentPage} of {totalPages}
                    &lt;/span&gt;
                    &lt;Button
                      variant="outline"
                      size="sm"
                      onClick={() =&gt; setCurrentPage(prev =&gt; Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    &gt;
                      Next
                    &lt;/Button&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
              )}
            &lt;/&gt;
          )}
        &lt;/CardContent&gt;
      &lt;/Card&gt;
    &lt;/div&gt;
  );
};

export default AuditLogViewer;