import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, FileText, AlertTriangle, CheckCircle, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PrintDialog from '@/components/PrintDialog';

interface License {
  ID: number;
  license_name: string;
  license_number: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  station: string;
  category: string;
  status: string;
  document_file_id: number;
  created_by: number;
}

const LicenseList: React.FC = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLicenseForPrint, setSelectedLicenseForPrint] = useState<License | null>(null);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const pageSize = 10;

  useEffect(() => {
    loadLicenses();
  }, [currentPage, searchTerm]);

  const loadLicenses = async () => {
    try {
      setLoading(true);
      const filters = [];

      if (searchTerm) {
        filters.push({ name: 'license_name', op: 'StringContains', value: searchTerm });
      }

      const { data, error } = await window.ezsite.apis.tablePage('11731', {
        PageNo: currentPage,
        PageSize: pageSize,
        OrderByField: 'expiry_date',
        IsAsc: true,
        Filters: filters
      });

      if (error) throw error;

      setLicenses(data?.List || []);
      setTotalCount(data?.VirtualCount || 0);
    } catch (error) {
      console.error('Error loading licenses:', error);
      toast({
        title: "Error",
        description: "Failed to load licenses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (licenseId: number) => {
    if (!confirm('Are you sure you want to delete this license?')) {
      return;
    }

    try {
      const { error } = await window.ezsite.apis.tableDelete('11731', { ID: licenseId });
      if (error) throw error;

      toast({
        title: "Success",
        description: "License deleted successfully"
      });
      loadLicenses();
    } catch (error) {
      console.error('Error deleting license:', error);
      toast({
        title: "Error",
        description: "Failed to delete license",
        variant: "destructive"
      });
    }
  };

  const handlePrint = (license: License) => {
    setSelectedLicenseForPrint(license);
    setIsPrintDialogOpen(true);
  };

  const closePrintDialog = () => {
    setIsPrintDialogOpen(false);
    setSelectedLicenseForPrint(null);
  };

  // Check if user is Administrator
  const isAdmin = userProfile?.role === 'Administrator';

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      case 'pending renewal':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      'Business': 'bg-blue-500',
      'Environmental': 'bg-green-500',
      'Safety': 'bg-orange-500',
      'Health': 'bg-purple-500',
      'Fire': 'bg-red-500',
      'Building': 'bg-gray-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const getStationBadgeColor = (station: string) => {
    switch (station.toUpperCase()) {
      case 'MOBIL':
        return 'bg-blue-600';
      case 'AMOCO ROSEDALE':
        return 'bg-green-600';
      case 'AMOCO BROOKLYN':
        return 'bg-purple-600';
      case 'ALL':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysDiff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysDiff <= 30 && daysDiff >= 0;
  };

  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Calculate summary stats
  const stats = licenses.reduce((acc, license) => ({
    active: acc.active + (license.status.toLowerCase() === 'active' ? 1 : 0),
    expiring_soon: acc.expiring_soon + (isExpiringSoon(license.expiry_date) ? 1 : 0),
    expired: acc.expired + (isExpired(license.expiry_date) ? 1 : 0)
  }), { active: 0, expiring_soon: 0, expired: 0 });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Licenses</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold">{stats.expiring_soon}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold">{stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6" />
                <span>Licenses & Certificates</span>
              </CardTitle>
              <CardDescription>
                Manage your business licenses and certificates
              </CardDescription>
            </div>
            <Button onClick={() => navigate('/licenses/new')} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add License</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search licenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10" />

            </div>
          </div>

          {/* Licenses Table */}
          {loading ?
          <div className="space-y-4">
              {[...Array(5)].map((_, i) =>
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            )}
            </div> :
          licenses.length === 0 ?
          <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No licenses found</p>
              <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/licenses/new')}>

                Add Your First License
              </Button>
            </div> :

          <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>License Name</TableHead>
                    <TableHead>License Number</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses.map((license) =>
                <TableRow key={license.ID} className={isExpired(license.expiry_date) ? 'bg-red-50' : isExpiringSoon(license.expiry_date) ? 'bg-yellow-50' : ''}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{license.license_name}</p>
                          <p className="text-sm text-gray-500">{license.issuing_authority}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {license.license_number}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-white ${getCategoryBadgeColor(license.category)}`}>
                          {license.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-white ${getStationBadgeColor(license.station)}`}>
                          {license.station}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(license.issue_date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{formatDate(license.expiry_date)}</span>
                          {isExpired(license.expiry_date) &&
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      }
                          {isExpiringSoon(license.expiry_date) && !isExpired(license.expiry_date) &&
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      }
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-white ${getStatusBadgeColor(license.status)}`}>
                          {license.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(license)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Print Document">
                            <Printer className="w-4 h-4" />
                          </Button>
                          {isAdmin &&
                      <>
                              <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/licenses/edit/${license.ID}`)}
                          title="Edit License">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(license.ID)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete License">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                      }
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
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} licenses
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

      {/* Print Dialog */}
      <PrintDialog
        license={selectedLicenseForPrint}
        isOpen={isPrintDialogOpen}
        onClose={closePrintDialog} />

    </div>);

};

export default LicenseList;