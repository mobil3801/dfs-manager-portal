import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Thermometer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AfterDeliveryTankReport {
  id: number;
  report_date: string;
  station: string;
  delivery_record_id: number;
  bol_number: string;
  regular_tank_final: number;
  plus_tank_final: number;
  super_tank_final: number;
  tank_temperature: number;
  verification_status: string;
  discrepancy_notes: string;
  reported_by: string;
  supervisor_approval: boolean;
  additional_notes: string;
  created_by: number;
}

const AfterDeliveryTankReportList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<AfterDeliveryTankReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stationFilter, setStationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadReports();
  }, [currentPage, searchTerm, statusFilter, stationFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      const filters = [];
      if (searchTerm) {
        filters.push({ name: 'bol_number', op: 'StringContains', value: searchTerm });
      }
      if (statusFilter && statusFilter !== 'all') {
        filters.push({ name: 'verification_status', op: 'Equal', value: statusFilter });
      }
      if (stationFilter && stationFilter !== 'all') {
        filters.push({ name: 'station', op: 'Equal', value: stationFilter });
      }

      const { data, error } = await window.ezsite.apis.tablePage(12331, {
        PageNo: currentPage,
        PageSize: pageSize,
        OrderByField: 'report_date',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw error;

      setReports(data?.List || []);
      setTotalCount(data?.VirtualCount || 0);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tank reports. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tank report?')) return;

    try {
      const { error } = await window.ezsite.apis.tableDelete(12331, { ID: id });
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tank report deleted successfully.',
      });
      
      loadReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tank report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string, supervisorApproval: boolean) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let icon = null;

    switch (status) {
      case 'Verified':
        variant = supervisorApproval ? "default" : "secondary";
        icon = <CheckCircle className="w-3 h-3" />;
        break;
      case 'Discrepancy Found':
        variant = "destructive";
        icon = <AlertTriangle className="w-3 h-3" />;
        break;
      case 'Pending Review':
        variant = "outline";
        icon = <Clock className="w-3 h-3" />;
        break;
    }

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {status}
        {supervisorApproval && status === 'Verified' && ' ✓'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tank reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Thermometer className="w-6 h-6 text-orange-600" />
            After Delivery Tank Reports
          </h1>
          <p className="text-gray-600 mt-1">Track tank levels after fuel deliveries</p>
        </div>
        <Button onClick={() => navigate('/delivery/after-tank-reports/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Tank Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search by BOL number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={stationFilter} onValueChange={setStationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All stations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stations</SelectItem>
                  <SelectItem value="MOBIL">MOBIL</SelectItem>
                  <SelectItem value="AMOCO ROSEDALE">AMOCO ROSEDALE</SelectItem>
                  <SelectItem value="AMOCO BROOKLYN">AMOCO BROOKLYN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Pending Review">Pending Review</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Discrepancy Found">Discrepancy Found</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setStationFilter('all');
                setCurrentPage(1);
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>BOL Number</TableHead>
                <TableHead>Tank Volumes (gal)</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No tank reports found. Create your first report to get started.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{formatDate(report.report_date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.station}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{report.bol_number}</TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <div>Reg: {report.regular_tank_final.toFixed(2)}</div>
                        <div>Plus: {report.plus_tank_final.toFixed(2)}</div>
                        <div>Super: {report.super_tank_final.toFixed(2)}</div>
                      </div>
                    </TableCell>
                    <TableCell>{report.tank_temperature}°F</TableCell>
                    <TableCell>
                      {getStatusBadge(report.verification_status, report.supervisor_approval)}
                    </TableCell>
                    <TableCell>{report.reported_by}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/delivery/after-tank-reports/${report.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReport(report.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AfterDeliveryTankReportList;