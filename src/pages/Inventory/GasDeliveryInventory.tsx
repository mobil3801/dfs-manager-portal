import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Fuel,
  Truck,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Eye } from
'lucide-react';
import { useNavigate } from 'react-router-dom';
import VisualEditToolbar from '@/components/VisualEditToolbar';

interface GasDelivery {
  id: number;
  delivery_date: string;
  station: string;
  fuel_type: string;
  quantity_delivered: number;
  unit_price: number;
  total_amount: number;
  supplier: string;
  delivery_truck_number: string;
  driver_name: string;
  status: 'Delivered' | 'Pending' | 'In Transit' | 'Cancelled';
  tank_level_before: number;
  tank_level_after: number;
  delivery_notes: string;
  created_by: number;
}

const GasDeliveryInventory: React.FC = () => {
  const [deliveries, setDeliveries] = useState<GasDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stationFilter, setStationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock data - will be replaced with API calls
  const mockDeliveries: GasDelivery[] = [
  {
    id: 1,
    delivery_date: '2024-01-15T10:30:00Z',
    station: 'MOBIL',
    fuel_type: 'Regular (87)',
    quantity_delivered: 8500,
    unit_price: 2.85,
    total_amount: 24225.00,
    supplier: 'ExxonMobil Supply',
    delivery_truck_number: 'TRK-001',
    driver_name: 'John Smith',
    status: 'Delivered',
    tank_level_before: 2500,
    tank_level_after: 11000,
    delivery_notes: 'Delivery completed successfully. Tank capacity verified.',
    created_by: 1
  },
  {
    id: 2,
    delivery_date: '2024-01-15T14:15:00Z',
    station: 'AMOCO ROSEDALE',
    fuel_type: 'Premium (93)',
    quantity_delivered: 6000,
    unit_price: 3.15,
    total_amount: 18900.00,
    supplier: 'BP Supply Chain',
    delivery_truck_number: 'TRK-102',
    driver_name: 'Mike Johnson',
    status: 'In Transit',
    tank_level_before: 1800,
    tank_level_after: 0,
    delivery_notes: 'Delivery scheduled for 2 PM. Tank inspection completed.',
    created_by: 1
  },
  {
    id: 3,
    delivery_date: '2024-01-16T09:00:00Z',
    station: 'AMOCO BROOKLYN',
    fuel_type: 'Diesel',
    quantity_delivered: 7200,
    unit_price: 3.05,
    total_amount: 21960.00,
    supplier: 'Shell Energy',
    delivery_truck_number: 'TRK-205',
    driver_name: 'Sarah Davis',
    status: 'Pending',
    tank_level_before: 3200,
    tank_level_after: 0,
    delivery_notes: 'Scheduled delivery. Awaiting truck arrival.',
    created_by: 1
  }];


  useEffect(() => {
    // Simulate API call
    const fetchDeliveries = () => {
      setLoading(true);
      setTimeout(() => {
        setDeliveries(mockDeliveries);
        setLoading(false);
      }, 1000);
    };

    fetchDeliveries();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Delivered</Badge>;
      case 'In Transit':
        return <Badge className="bg-blue-100 text-blue-800"><Truck className="w-3 h-3 mr-1" />In Transit</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'Cancelled':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
    delivery.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.delivery_truck_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.fuel_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStation = !stationFilter || stationFilter === 'all' || delivery.station === stationFilter;
    const matchesStatus = !statusFilter || statusFilter === 'all' || delivery.status === statusFilter;
    const matchesFuelType = !fuelTypeFilter || fuelTypeFilter === 'all' || delivery.fuel_type === fuelTypeFilter;

    return matchesSearch && matchesStation && matchesStatus && matchesFuelType;
  });

  const totalDeliveries = filteredDeliveries.length;
  const totalQuantity = filteredDeliveries.reduce((sum, delivery) => sum + delivery.quantity_delivered, 0);
  const totalValue = filteredDeliveries.reduce((sum, delivery) => sum + delivery.total_amount, 0);
  const completedDeliveries = filteredDeliveries.filter((d) => d.status === 'Delivered').length;

  return (
    <div className="space-y-6">
      <VisualEditToolbar />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Fuel className="w-6 h-6 mr-2 text-blue-600" />
            GAS Delivery Inventory
          </h1>
          <p className="text-gray-600 mt-1">Track and manage fuel deliveries across all stations</p>
        </div>
        <Button
          onClick={() => navigate('/gas-delivery/new')}
          className="mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          New Delivery
        </Button>
      </div>

      {/* Station Selection */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Select Station</h2>
              <p className="text-gray-600 text-sm">Choose a station to view its gas delivery inventory</p>
            </div>
            <div className="w-full sm:w-80">
              <Select value={stationFilter} onValueChange={setStationFilter}>
                <SelectTrigger className="bg-white border-blue-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Choose Station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stations</SelectItem>
                  <SelectItem value="MOBIL">MOBIL</SelectItem>
                  <SelectItem value="AMOCO ROSEDALE">AMOCO ROSEDALE</SelectItem>
                  <SelectItem value="AMOCO BROOKLYN">AMOCO BROOKLYN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {stationFilter && stationFilter !== 'all' &&
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-blue-800 font-medium flex items-center">
                <Fuel className="w-4 h-4 mr-2" />
                Showing data for: <span className="ml-1 font-bold">{stationFilter}</span>
              </p>
            </div>
          }
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            {stationFilter === 'all' ? 'All Stations Summary' : `${stationFilter} Summary`}
          </CardTitle>
          <CardDescription>
            {stationFilter === 'all' ?
            'Overall statistics for all gas delivery operations' :
            `Statistics for ${stationFilter} station deliveries`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900">{totalDeliveries}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Fuel className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Gallons</p>
                  <p className="text-2xl font-bold text-gray-900">{totalQuantity.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedDeliveries}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search deliveries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10" />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="In Transit">In Transit</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Fuel Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fuel Types</SelectItem>
                <SelectItem value="Regular (87)">Regular (87)</SelectItem>
                <SelectItem value="Premium (93)">Premium (93)</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setFuelTypeFilter('all');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gas Delivery Records</CardTitle>
          <CardDescription>
            Recent fuel deliveries and their status across all stations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ?
          <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div> :

          <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Fuel Type</TableHead>
                    <TableHead>Quantity (Gal)</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((delivery) =>
                <TableRow key={delivery.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(delivery.delivery_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{delivery.station}</Badge>
                      </TableCell>
                      <TableCell>{delivery.fuel_type}</TableCell>
                      <TableCell className="font-medium">
                        {delivery.quantity_delivered.toLocaleString()}
                      </TableCell>
                      <TableCell>{delivery.supplier}</TableCell>
                      <TableCell>{delivery.driver_name}</TableCell>
                      <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                      <TableCell className="font-medium">
                        ${delivery.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                )}
                </TableBody>
              </Table>
            </div>
          }

          {!loading && filteredDeliveries.length === 0 &&
          <div className="text-center py-8">
              <Fuel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          }
        </CardContent>
      </Card>
    </div>);

};

export default GasDeliveryInventory;