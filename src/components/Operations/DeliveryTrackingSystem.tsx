import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  FuelIcon,
  CalendarIcon,
  SearchIcon,
  PlusIcon,
  FileTextIcon,
  TrendingUpIcon,
  BarChart3Icon } from
'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer } from
'recharts';
import { ReportHeader, MetricCard, ReportSection, DataTable } from '@/components/Reports/ComprehensiveReportLayout';
import { format } from 'date-fns';

interface DeliveryRecord {
  id: number;
  delivery_date: string;
  station: string;
  regular_tank_volume: number;
  plus_tank_volume: number;
  super_tank_volume: number;
  regular_delivered: number;
  plus_delivered: number;
  super_delivered: number;
  delivery_notes: string;
  created_by: number;
  bol_number: string;
}

interface TankReport {
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
}

interface DeliveryFilters {
  station: string;
  status: string;
  dateRange: string;
  search: string;
}

const DeliveryTrackingSystem: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [tankReports, setTankReports] = useState<TankReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DeliveryFilters>({
    station: 'ALL',
    status: 'all',
    dateRange: 'week',
    search: ''
  });
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);
  const [showNewDelivery, setShowNewDelivery] = useState(false);
  const [showTankReport, setShowTankReport] = useState(false);
  const { toast } = useToast();

  const stations = ['ALL', 'MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];
  const statusOptions = ['all', 'pending', 'verified', 'discrepancy'];

  useEffect(() => {
    fetchDeliveryData();
    fetchTankReports();
  }, [filters]);

  const fetchDeliveryData = async () => {
    try {
      setLoading(true);

      const today = new Date();
      let startDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(today);
          break;
        case 'week':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          break;
      }

      const queryFilters = [
      {
        name: "delivery_date",
        op: "GreaterThanOrEqual",
        value: startDate.toISOString()
      }];


      if (filters.station !== 'ALL') {
        queryFilters.push({
          name: "station",
          op: "Equal",
          value: filters.station
        });
      }

      if (filters.search) {
        queryFilters.push({
          name: "bol_number",
          op: "StringContains",
          value: filters.search
        });
      }

      const { data, error } = await window.ezsite.apis.tablePage(12196, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "delivery_date",
        IsAsc: false,
        Filters: queryFilters
      });

      if (error) throw error;
      setDeliveries(data.List);
    } catch (error) {
      console.error('Error fetching delivery data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch delivery data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTankReports = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(12331, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "report_date",
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;
      setTankReports(data.List);
    } catch (error) {
      console.error('Error fetching tank reports:', error);
    }
  };

  const calculateMetrics = () => {
    const totalDeliveries = deliveries.length;
    const totalGallonsDelivered = deliveries.reduce((sum, delivery) =>
    sum + delivery.regular_delivered + delivery.plus_delivered + delivery.super_delivered, 0);

    const verifiedDeliveries = tankReports.filter((report) =>
    report.verification_status === 'Verified').length;

    const pendingVerification = deliveries.filter((delivery) =>
    !tankReports.some((report) => report.delivery_record_id === delivery.id)).length;

    const discrepancies = tankReports.filter((report) =>
    report.verification_status === 'Discrepancy Found').length;

    const averageDeliverySize = totalDeliveries > 0 ? totalGallonsDelivered / totalDeliveries : 0;

    return {
      totalDeliveries,
      totalGallonsDelivered,
      verifiedDeliveries,
      pendingVerification,
      discrepancies,
      averageDeliverySize,
      verificationRate: totalDeliveries > 0 ? verifiedDeliveries / totalDeliveries * 100 : 0
    };
  };

  const getDeliveryTrends = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map((date) => {
      const dayDeliveries = deliveries.filter((delivery) =>
      delivery.delivery_date.split('T')[0] === date);

      const totalGallons = dayDeliveries.reduce((sum, delivery) =>
      sum + delivery.regular_delivered + delivery.plus_delivered + delivery.super_delivered, 0);

      return {
        date: format(new Date(date), 'MMM dd'),
        deliveries: dayDeliveries.length,
        gallons: totalGallons,
        regular: dayDeliveries.reduce((sum, d) => sum + d.regular_delivered, 0),
        plus: dayDeliveries.reduce((sum, d) => sum + d.plus_delivered, 0),
        super: dayDeliveries.reduce((sum, d) => sum + d.super_delivered, 0)
      };
    });
  };

  const getStationPerformance = () => {
    return stations.filter((s) => s !== 'ALL').map((station) => {
      const stationDeliveries = deliveries.filter((d) => d.station === station);
      const stationReports = tankReports.filter((r) => r.station === station);

      const totalGallons = stationDeliveries.reduce((sum, delivery) =>
      sum + delivery.regular_delivered + delivery.plus_delivered + delivery.super_delivered, 0);

      const verified = stationReports.filter((r) => r.verification_status === 'Verified').length;
      const verificationRate = stationDeliveries.length > 0 ? verified / stationDeliveries.length * 100 : 0;

      return {
        station,
        deliveries: stationDeliveries.length,
        totalGallons,
        verificationRate: verificationRate.toFixed(1),
        avgTemperature: stationReports.length > 0 ?
        (stationReports.reduce((sum, r) => sum + r.tank_temperature, 0) / stationReports.length).toFixed(1) : '0'
      };
    });
  };

  const getRecentDeliveries = () => {
    return deliveries.slice(0, 10).map((delivery) => {
      const report = tankReports.find((r) => r.delivery_record_id === delivery.id);
      const status = report ? report.verification_status : 'Pending Verification';

      return [
      format(new Date(delivery.delivery_date), 'MMM dd, yyyy'),
      delivery.bol_number,
      delivery.station,
      (delivery.regular_delivered + delivery.plus_delivered + delivery.super_delivered).toLocaleString(),
      <Badge
        key={delivery.id}
        variant={status === 'Verified' ? 'default' :
        status === 'Discrepancy Found' ? 'destructive' : 'secondary'}>

          {status}
        </Badge>];

    });
  };

  const handleCreateDelivery = async (deliveryData: any) => {
    try {
      const { error } = await window.ezsite.apis.tableCreate(12196, {
        delivery_date: deliveryData.delivery_date,
        station: deliveryData.station,
        regular_tank_volume: deliveryData.regular_tank_volume,
        plus_tank_volume: deliveryData.plus_tank_volume,
        super_tank_volume: deliveryData.super_tank_volume,
        regular_delivered: deliveryData.regular_delivered,
        plus_delivered: deliveryData.plus_delivered,
        super_delivered: deliveryData.super_delivered,
        delivery_notes: deliveryData.delivery_notes,
        bol_number: deliveryData.bol_number,
        created_by: 1 // Current user ID
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Delivery record created successfully"
      });

      setShowNewDelivery(false);
      fetchDeliveryData();
    } catch (error) {
      console.error('Error creating delivery:', error);
      toast({
        title: "Error",
        description: "Failed to create delivery record",
        variant: "destructive"
      });
    }
  };

  const handleCreateTankReport = async (reportData: any) => {
    try {
      const { error } = await window.ezsite.apis.tableCreate(12331, {
        report_date: new Date().toISOString(),
        station: selectedDelivery?.station,
        delivery_record_id: selectedDelivery?.id,
        bol_number: selectedDelivery?.bol_number,
        regular_tank_final: reportData.regular_tank_final,
        plus_tank_final: reportData.plus_tank_final,
        super_tank_final: reportData.super_tank_final,
        tank_temperature: reportData.tank_temperature,
        verification_status: reportData.verification_status,
        discrepancy_notes: reportData.discrepancy_notes,
        reported_by: reportData.reported_by,
        supervisor_approval: false,
        additional_notes: reportData.additional_notes,
        created_by: 1 // Current user ID
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tank report created successfully"
      });

      setShowTankReport(false);
      setSelectedDelivery(null);
      fetchTankReports();
    } catch (error) {
      console.error('Error creating tank report:', error);
      toast({
        title: "Error",
        description: "Failed to create tank report",
        variant: "destructive"
      });
    }
  };

  const metrics = calculateMetrics();
  const trendData = getDeliveryTrends();
  const stationPerformance = getStationPerformance();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) =>
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
            )}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>);

  }

  return (
    <div className="p-6 space-y-6">
      <ReportHeader
        title="Delivery Tracking System"
        subtitle="Complete fuel delivery monitoring and verification"
        reportId={`DT-${Date.now()}`}
        onPrint={() => window.print()}
        onExport={() => toast({ title: "Export", description: "Export functionality coming soon" })}
        onFilter={() => {}} />


      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Deliveries"
          value={metrics.totalDeliveries.toLocaleString()}
          subtitle="This period"
          icon={<TruckIcon className="w-5 h-5" />}
          trend={{ value: 12.5, isPositive: true }} />

        <MetricCard
          title="Gallons Delivered"
          value={metrics.totalGallonsDelivered.toLocaleString()}
          subtitle="Total fuel volume"
          icon={<FuelIcon className="w-5 h-5" />}
          trend={{ value: 8.3, isPositive: true }} />

        <MetricCard
          title="Verification Rate"
          value={`${metrics.verificationRate.toFixed(1)}%`}
          subtitle="Completed verifications"
          icon={<CheckCircleIcon className="w-5 h-5" />}
          trend={{ value: 5.2, isPositive: true }} />

        <MetricCard
          title="Pending Verification"
          value={metrics.pendingVerification}
          subtitle="Awaiting tank reports"
          icon={<ClockIcon className="w-5 h-5" />}
          trend={{ value: -15.1, isPositive: true }} />

      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Delivery Management Controls</span>
            <div className="flex gap-2">
              <Dialog open={showNewDelivery} onOpenChange={setShowNewDelivery}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Delivery
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Record New Delivery</DialogTitle>
                  </DialogHeader>
                  <NewDeliveryForm onSubmit={handleCreateDelivery} />
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium">Station</Label>
              <Select value={filters.station} onValueChange={(value) => setFilters({ ...filters, station: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) =>
                  <SelectItem key={station} value={station}>{station}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Time Period</Label>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deliveries</SelectItem>
                  <SelectItem value="pending">Pending Verification</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="discrepancy">Discrepancies</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Search BOL</Label>
              <div className="relative mt-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="BOL number..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10" />

              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportSection title="Daily Delivery Volume">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="gallons" fill="#3B82F6" name="Total Gallons" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportSection>

        <ReportSection title="Fuel Type Distribution">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="regular" fill="#10B981" name="Regular" />
                <Bar dataKey="plus" fill="#F59E0B" name="Plus" />
                <Bar dataKey="super" fill="#EF4444" name="Super" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportSection>
      </div>

      {/* Station Performance */}
      <ReportSection title="Station Performance Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stationPerformance.map((station, index) =>
          <Card key={station.station} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" />
                    {station.station}
                  </span>
                  <Badge variant="outline">{station.verificationRate}%</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Deliveries:</span>
                    <span className="font-medium">{station.deliveries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Gallons:</span>
                    <span className="font-medium">{station.totalGallons.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Temperature:</span>
                    <span className="font-medium">{station.avgTemperature}°F</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ReportSection>

      {/* Recent Deliveries */}
      <ReportSection title="Recent Deliveries">
        <DataTable
          headers={['Date', 'BOL Number', 'Station', 'Gallons', 'Status']}
          data={getRecentDeliveries()}
          showRowNumbers={true}
          alternateRows={true} />

      </ReportSection>

      {/* Tank Report Dialog */}
      <Dialog open={showTankReport} onOpenChange={setShowTankReport}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create After-Delivery Tank Report</DialogTitle>
          </DialogHeader>
          {selectedDelivery &&
          <TankReportForm
            delivery={selectedDelivery}
            onSubmit={handleCreateTankReport} />

          }
        </DialogContent>
      </Dialog>
    </div>);

};

// New Delivery Form Component
const NewDeliveryForm: React.FC<{onSubmit: (data: any) => void;}> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    delivery_date: new Date().toISOString().split('T')[0],
    station: '',
    regular_tank_volume: 0,
    plus_tank_volume: 0,
    super_tank_volume: 0,
    regular_delivered: 0,
    plus_delivered: 0,
    super_delivered: 0,
    delivery_notes: '',
    bol_number: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Delivery Date</Label>
          <Input
            type="date"
            value={formData.delivery_date}
            onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
            required />

        </div>
        <div>
          <Label>Station</Label>
          <Select value={formData.station} onValueChange={(value) => setFormData({ ...formData, station: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select station" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MOBIL">MOBIL</SelectItem>
              <SelectItem value="AMOCO ROSEDALE">AMOCO ROSEDALE</SelectItem>
              <SelectItem value="AMOCO BROOKLYN">AMOCO BROOKLYN</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>BOL Number</Label>
        <Input
          value={formData.bol_number}
          onChange={(e) => setFormData({ ...formData, bol_number: e.target.value })}
          placeholder="Bill of Lading number"
          required />

      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Regular Tank Volume</Label>
          <Input
            type="number"
            value={formData.regular_tank_volume}
            onChange={(e) => setFormData({ ...formData, regular_tank_volume: Number(e.target.value) })}
            placeholder="Gallons" />

        </div>
        <div>
          <Label>Plus Tank Volume</Label>
          <Input
            type="number"
            value={formData.plus_tank_volume}
            onChange={(e) => setFormData({ ...formData, plus_tank_volume: Number(e.target.value) })}
            placeholder="Gallons" />

        </div>
        <div>
          <Label>Super Tank Volume</Label>
          <Input
            type="number"
            value={formData.super_tank_volume}
            onChange={(e) => setFormData({ ...formData, super_tank_volume: Number(e.target.value) })}
            placeholder="Gallons" />

        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Regular Delivered</Label>
          <Input
            type="number"
            value={formData.regular_delivered}
            onChange={(e) => setFormData({ ...formData, regular_delivered: Number(e.target.value) })}
            placeholder="Gallons" />

        </div>
        <div>
          <Label>Plus Delivered</Label>
          <Input
            type="number"
            value={formData.plus_delivered}
            onChange={(e) => setFormData({ ...formData, plus_delivered: Number(e.target.value) })}
            placeholder="Gallons" />

        </div>
        <div>
          <Label>Super Delivered</Label>
          <Input
            type="number"
            value={formData.super_delivered}
            onChange={(e) => setFormData({ ...formData, super_delivered: Number(e.target.value) })}
            placeholder="Gallons" />

        </div>
      </div>

      <div>
        <Label>Delivery Notes</Label>
        <Textarea
          value={formData.delivery_notes}
          onChange={(e) => setFormData({ ...formData, delivery_notes: e.target.value })}
          placeholder="Additional notes about the delivery" />

      </div>

      <Button type="submit" className="w-full">Create Delivery Record</Button>
    </form>);

};

// Tank Report Form Component
const TankReportForm: React.FC<{delivery: DeliveryRecord;onSubmit: (data: any) => void;}> = ({ delivery, onSubmit }) => {
  const [formData, setFormData] = useState({
    regular_tank_final: 0,
    plus_tank_final: 0,
    super_tank_final: 0,
    tank_temperature: 70,
    verification_status: 'Verified',
    discrepancy_notes: '',
    reported_by: '',
    additional_notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Delivery Information</h4>
        <p className="text-sm text-blue-700">BOL: {delivery.bol_number} | Station: {delivery.station}</p>
        <p className="text-sm text-blue-700">Date: {format(new Date(delivery.delivery_date), 'MMM dd, yyyy')}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Regular Tank Final</Label>
          <Input
            type="number"
            value={formData.regular_tank_final}
            onChange={(e) => setFormData({ ...formData, regular_tank_final: Number(e.target.value) })}
            placeholder="Final gallons" />

        </div>
        <div>
          <Label>Plus Tank Final</Label>
          <Input
            type="number"
            value={formData.plus_tank_final}
            onChange={(e) => setFormData({ ...formData, plus_tank_final: Number(e.target.value) })}
            placeholder="Final gallons" />

        </div>
        <div>
          <Label>Super Tank Final</Label>
          <Input
            type="number"
            value={formData.super_tank_final}
            onChange={(e) => setFormData({ ...formData, super_tank_final: Number(e.target.value) })}
            placeholder="Final gallons" />

        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tank Temperature (°F)</Label>
          <Input
            type="number"
            value={formData.tank_temperature}
            onChange={(e) => setFormData({ ...formData, tank_temperature: Number(e.target.value) })} />

        </div>
        <div>
          <Label>Verification Status</Label>
          <Select value={formData.verification_status} onValueChange={(value) => setFormData({ ...formData, verification_status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Verified">Verified</SelectItem>
              <SelectItem value="Discrepancy Found">Discrepancy Found</SelectItem>
              <SelectItem value="Pending Review">Pending Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Reported By</Label>
        <Input
          value={formData.reported_by}
          onChange={(e) => setFormData({ ...formData, reported_by: e.target.value })}
          placeholder="Name of person who conducted measurement"
          required />

      </div>

      {formData.verification_status === 'Discrepancy Found' &&
      <div>
          <Label>Discrepancy Notes</Label>
          <Textarea
          value={formData.discrepancy_notes}
          onChange={(e) => setFormData({ ...formData, discrepancy_notes: e.target.value })}
          placeholder="Describe the discrepancy found" />

        </div>
      }

      <div>
        <Label>Additional Notes</Label>
        <Textarea
          value={formData.additional_notes}
          onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
          placeholder="Any additional observations" />

      </div>

      <Button type="submit" className="w-full">Submit Tank Report</Button>
    </form>);

};

export default DeliveryTrackingSystem;