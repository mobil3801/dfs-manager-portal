import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Truck, Filter, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VisualEditToolbar from '@/components/VisualEditToolbar';

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
}

const DeliveryList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stationFilter, setStationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const stations = ['MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];

  useEffect(() => {
    loadDeliveries();
  }, [currentPage, searchTerm, stationFilter]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);

      const filters = [];

      if (stationFilter !== 'all') {
        filters.push({
          name: 'station',
          op: 'Equal',
          value: stationFilter
        });
      }

      if (searchTerm) {
        filters.push({
          name: 'delivery_notes',
          op: 'StringContains',
          value: searchTerm
        });
      }

      const { data, error } = await window.ezsite.apis.tablePage(12196, {
        PageNo: currentPage,
        PageSize: pageSize,
        OrderByField: 'delivery_date',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw error;

      setDeliveries(data?.List || []);
      setTotalCount(data?.VirtualCount || 0);
    } catch (error) {
      console.error('Error loading deliveries:', error);
      toast({
        title: "Error",
        description: "Failed to load delivery records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this delivery record?')) {
      return;
    }

    try {
      const { error } = await window.ezsite.apis.tableDelete(12196, { ID: id });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Delivery record deleted successfully"
      });

      loadDeliveries();
    } catch (error) {
      console.error('Error deleting delivery:', error);
      toast({
        title: "Error",
        description: "Failed to delete delivery record",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatNumber = (num: number) => {
    return num.toFixed(2);
  };

  const getTotalDelivered = (record: DeliveryRecord) => {
    return record.regular_delivered + record.plus_delivered + record.super_delivered;
  };

  const getTotalTankVolume = (record: DeliveryRecord) => {
    return record.regular_tank_volume + record.plus_tank_volume + record.super_tank_volume;
  };

  const getStationBadgeColor = (station: string) => {
    switch (station) {
      case 'MOBIL':
        return 'bg-red-100 text-red-800';
      case 'AMOCO ROSEDALE':
        return 'bg-blue-100 text-blue-800';
      case 'AMOCO BROOKLYN':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading && deliveries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery records...</p>
        </div>
      </div>);

  }

  return (
    <div className="container mx-auto px-4 py-6">
      <VisualEditToolbar className="mb-6" />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Delivery Records</h1>
          </div>
          <Button onClick={() => navigate('/delivery/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Delivery
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10" />

              </div>
              
              <div>
                <Select value={stationFilter} onValueChange={setStationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by station" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stations</SelectItem>
                    {stations.map((station) =>
                    <SelectItem key={station} value={station}>
                        {station}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadDeliveries}>
                  <Filter className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
            <p className="text-sm text-gray-600">Total Deliveries</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {deliveries.reduce((sum, d) => sum + getTotalDelivered(d), 0).toFixed(0)}
            </div>
            <p className="text-sm text-gray-600">Total Gallons Delivered</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(deliveries.map((d) => d.station)).size}
            </div>
            <p className="text-sm text-gray-600">Stations Served</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {deliveries.filter((d) => new Date(d.delivery_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <p className="text-sm text-gray-600">This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Records</CardTitle>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ?
          <div className="text-center py-8">
              <Truck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No delivery records found</p>
              <Button onClick={() => navigate('/delivery/new')} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add First Delivery
              </Button>
            </div> :

          <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial</TableHead>
                      <TableHead>Station Name</TableHead>
                      <TableHead>Regular (Delivered)</TableHead>
                      <TableHead>Plus Delivered</TableHead>
                      <TableHead>Super Delivered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.map((delivery, index) =>
                      <TableRow key={delivery.id}>
                        <TableCell className="font-medium">
                          {(currentPage - 1) * pageSize + index + 1}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStationBadgeColor(delivery.station)}>
                            {delivery.station}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-blue-600">
                          {formatNumber(delivery.regular_delivered)} gal
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatNumber(delivery.plus_delivered)} gal
                        </TableCell>
                        <TableCell className="font-medium text-purple-600">
                          {formatNumber(delivery.super_delivered)} gal
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 &&
            <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
                  </p>
                  <div className="flex space-x-2">
                    <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}>

                      Previous
                    </Button>
                    <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}>

                      Next
                    </Button>
                  </div>
                </div>
            }
            </>
          }
        </CardContent>
      </Card>
    </div>);

};

export default DeliveryList;