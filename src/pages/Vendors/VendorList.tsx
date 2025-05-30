import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Vendor {
  ID: number;
  vendor_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  payment_terms: string;
  is_active: boolean;
  created_by: number;
}

const VendorList: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const pageSize = 10;

  useEffect(() => {
    loadVendors();
  }, [currentPage, searchTerm]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const filters = [];

      if (searchTerm) {
        filters.push({ name: 'vendor_name', op: 'StringContains', value: searchTerm });
      }

      const { data, error } = await window.ezsite.apis.tablePage('11729', {
        PageNo: currentPage,
        PageSize: pageSize,
        OrderByField: 'vendor_name',
        IsAsc: true,
        Filters: filters
      });

      if (error) throw error;

      setVendors(data?.List || []);
      setTotalCount(data?.VirtualCount || 0);
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vendorId: number) => {
    if (!confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      const { error } = await window.ezsite.apis.tableDelete('11729', { ID: vendorId });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Vendor deleted successfully"
      });
      loadVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive"
      });
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      'Fuel Supplier': 'bg-blue-500',
      'Food & Beverages': 'bg-green-500',
      'Automotive': 'bg-orange-500',
      'Maintenance': 'bg-purple-500',
      'Office Supplies': 'bg-gray-500',
      'Technology': 'bg-indigo-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-6 h-6" />
                <span>Vendors</span>
              </CardTitle>
              <CardDescription>
                Manage your vendor contacts and information
              </CardDescription>
            </div>
            <Button onClick={() => navigate('/vendors/new')} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Vendor</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10" />

            </div>
          </div>

          {/* Vendors Table */}
          {loading ?
          <div className="space-y-4">
              {[...Array(5)].map((_, i) =>
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            )}
            </div> :
          vendors.length === 0 ?
          <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No vendors found</p>
              <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/vendors/new')}>

                Add Your First Vendor
              </Button>
            </div> :

          <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) =>
                <TableRow key={vendor.ID}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{vendor.vendor_name}</p>
                          {vendor.address &&
                      <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-xs">{vendor.address}</span>
                            </div>
                      }
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{vendor.contact_person}</p>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {vendor.email &&
                      <div className="flex items-center space-x-1 text-sm">
                              <Mail className="w-3 h-3" />
                              <span>{vendor.email}</span>
                            </div>
                      }
                          {vendor.phone &&
                      <div className="flex items-center space-x-1 text-sm">
                              <Phone className="w-3 h-3" />
                              <span>{vendor.phone}</span>
                            </div>
                      }
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-white ${getCategoryBadgeColor(vendor.category)}`}>
                          {vendor.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{vendor.payment_terms || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={vendor.is_active ? "default" : "secondary"}>
                          {vendor.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/vendors/edit/${vendor.ID}`)}>

                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(vendor.ID)}
                        className="text-red-600 hover:text-red-700">

                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                )}
                </TableBody>
              </Table>
            </div>
          }

          {/* Pagination */}
          {totalPages > 1 &&
          <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} vendors
              </p>
              <div className="flex items-center space-x-2">
                <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}>

                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}>

                  Next
                </Button>
              </div>
            </div>
          }
        </CardContent>
      </Card>
    </div>);

};

export default VendorList;