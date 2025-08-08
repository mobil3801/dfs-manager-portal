import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Building2, Mail, Phone, MapPin, Eye, Download, FileText, AlertCircle, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleAccess } from '@/contexts/ModuleAccessContext';
import { useAuth } from '@/contexts/AuthContext';
import ViewModal from '@/components/ViewModal';
import { useListKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { motion } from 'motion/react';
import { vendorService, type Vendor } from '@/services/vendorService';
import VendorErrorBoundary from '@/components/ErrorBoundary/VendorErrorBoundary';
import VendorDatabaseTestPanel from '@/components/VendorDatabaseTestPanel';

const VendorListContent: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState<boolean>(false);
  const navigate = useNavigate();

  // Auth context for admin checking
  const { isAdmin, user } = useAuth();

  // Module Access Control
  const {
    canCreate,
    canEdit,
    canDelete,
    isModuleAccessEnabled
  } = useModuleAccess();

  // Permission checks for vendors module
  const canCreateVendor = canCreate('vendors');
  const canEditVendor = canEdit('vendors') && isAdmin(); // Restrict to admin only
  const canDeleteVendor = canDelete('vendors') && isAdmin(); // Restrict to admin only

  const pageSize = 10;

  // Test Supabase connection on component mount
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  useEffect(() => {
    if (supabaseConnected) {
      loadVendors();
    }
  }, [currentPage, searchTerm, supabaseConnected]);

  // Set up real-time subscription
  useEffect(() => {
    let subscription: any = null;

    if (supabaseConnected) {
      try {
        subscription = vendorService.subscribeToVendors((payload) => {
          console.log('Vendor change detected:', payload);
          // Reload vendors when changes occur
          loadVendors();
          setRealTimeEnabled(true);

          toast({
            title: "Real-time Update",
            description: "Vendor data updated from Supabase",
            variant: "default"
          });
        });
      } catch (error) {
        console.error('Error setting up subscription:', error);
        setRealTimeEnabled(false);
      }
    }

    return () => {
      if (subscription) {
        try {
          vendorService.unsubscribeFromVendors(subscription);
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      }
    };
  }, [supabaseConnected]);

  const testSupabaseConnection = async () => {
    try {
      setLoading(true);
      await vendorService.checkTableExists();
      setSupabaseConnected(true);
      setConnectionError(null);

      toast({
        title: "Connection Successful",
        description: "Supabase database and storage are properly connected",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Supabase connection test failed:', error);
      setSupabaseConnected(false);
      setRealTimeEnabled(false);

      if (error.message?.includes('relation "vendors" does not exist')) {
        setConnectionError('DATABASE_TABLE_MISSING');
      } else if (error.message?.includes('JWT')) {
        setConnectionError('AUTH_ERROR');
      } else {
        setConnectionError('CONNECTION_ERROR');
      }

      toast({
        title: "Connection Error",
        description: "Failed to connect to Supabase database. Please check your configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    if (!supabaseConnected) return;

    try {
      setLoading(true);
      setConnectionError(null);

      const result = await vendorService.getVendors({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined
      });

      setVendors(result.vendors);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setSupabaseConnected(true);
    } catch (error: any) {
      console.error('Error loading vendors:', error);
      setSupabaseConnected(false);

      let errorMessage = 'Failed to load vendors. Please check your connection.';

      if (error.message?.includes('relation "vendors" does not exist')) {
        errorMessage = 'Vendors table not found. Please contact administrator to set up the database.';
        setConnectionError('DATABASE_TABLE_MISSING');
      } else if (error.message?.includes('JWT')) {
        errorMessage = 'Authentication error. Please try logging in again.';
        setConnectionError('AUTH_ERROR');
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network connection error. Please check your internet connection.';
        setConnectionError('NETWORK_ERROR');
      } else {
        setConnectionError('CONNECTION_ERROR');
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setSelectedVendorId(vendor.id);
    setViewModalOpen(true);
  };

  const handleEdit = (vendorId: string) => {
    // Check admin permission first
    if (!isAdmin()) {
      toast({
        title: "Access Denied",
        description: "Only administrators can edit vendors.",
        variant: "destructive"
      });
      return;
    }

    // Check edit permission
    if (!canEditVendor) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit vendors.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Validate vendor ID exists
      const vendor = vendors.find((v) => v.id === vendorId);
      if (!vendor) {
        toast({
          title: "Error",
          description: "Vendor not found. Please refresh the list and try again.",
          variant: "destructive"
        });
        loadVendors(); // Refresh the list
        return;
      }

      // Navigate to edit form
      navigate(`/vendors/${vendorId}/edit`);

      // Log for debugging
      console.log('Navigating to edit vendor:', vendorId, vendor);
    } catch (error) {
      console.error('Error navigating to edit form:', error);
      toast({
        title: "Navigation Error",
        description: "Failed to open edit form. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (vendorId: string) => {
    // Check admin permission first
    if (!isAdmin()) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete vendors.",
        variant: "destructive"
      });
      return;
    }

    // Check delete permission
    if (!canDeleteVendor) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete vendors.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      await vendorService.deleteVendor(vendorId);

      toast({
        title: "Success",
        description: "Vendor deleted successfully from Supabase"
      });

      loadVendors();
      setViewModalOpen(false);
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({
        title: "Error",
        description: "Failed to delete vendor from Supabase",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    if (!selectedVendor) return;

    const csvContent = [
    'Field,Value',
    `Vendor Name,${selectedVendor.vendor_name}`,
    `Contact Person,${selectedVendor.contact_person}`,
    `Email,${selectedVendor.email || 'N/A'}`,
    `Phone,${selectedVendor.phone || 'N/A'}`,
    `Address,${selectedVendor.address || 'N/A'}`,
    `Category,${selectedVendor.category}`,
    `Payment Terms,${selectedVendor.payment_terms || 'N/A'}`,
    `Status,${selectedVendor.is_active ? 'Active' : 'Inactive'}`,
    `Documents,${selectedVendor.documents?.length || 0} files`].
    join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendor_${selectedVendor.vendor_name.replace(/\s+/g, '_')}_details.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Vendor details exported successfully"
    });
  };

  const handleCreateVendor = () => {
    // Check create permission
    if (!canCreateVendor) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create vendors.",
        variant: "destructive"
      });
      return;
    }

    navigate('/vendors/new');
  };

  const handleRetryConnection = () => {
    setConnectionError(null);
    testSupabaseConnection();
  };

  // Keyboard shortcuts
  useListKeyboardShortcuts(
    selectedVendorId,
    (id) => {
      const vendor = vendors.find((v) => v.id === id);
      if (vendor) handleView(vendor);
    },
    handleEdit,
    handleDelete,
    handleCreateVendor
  );

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      'Fuel Supplier': 'bg-blue-500',
      'Food & Beverages': 'bg-green-500',
      'Automotive': 'bg-orange-500',
      'Maintenance': 'bg-purple-500',
      'Office Supplies': 'bg-gray-500',
      'Technology': 'bg-indigo-500',
      'Insurance': 'bg-yellow-500',
      'Legal Services': 'bg-red-500',
      'Marketing': 'bg-pink-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  // Define view modal fields
  const getViewModalFields = (vendor: Vendor) => [
  {
    key: 'vendor_name',
    label: 'Vendor Name',
    value: vendor.vendor_name,
    type: 'text' as const,
    icon: Building2
  },
  {
    key: 'contact_person',
    label: 'Contact Person',
    value: vendor.contact_person,
    type: 'text' as const
  },
  {
    key: 'email',
    label: 'Email',
    value: vendor.email || 'N/A',
    type: 'email' as const
  },
  {
    key: 'phone',
    label: 'Phone',
    value: vendor.phone || 'N/A',
    type: 'phone' as const
  },
  {
    key: 'address',
    label: 'Address',
    value: vendor.address || 'N/A',
    type: 'text' as const,
    icon: MapPin
  },
  {
    key: 'category',
    label: 'Category',
    value: vendor.category,
    type: 'badge' as const,
    badgeColor: getCategoryBadgeColor(vendor.category)
  },
  {
    key: 'payment_terms',
    label: 'Payment Terms',
    value: vendor.payment_terms || 'N/A',
    type: 'text' as const
  },
  {
    key: 'is_active',
    label: 'Status',
    value: vendor.is_active,
    type: 'boolean' as const
  },
  {
    key: 'documents',
    label: 'Documents',
    value: `${vendor.documents?.length || 0} files`,
    type: 'text' as const,
    icon: FileText
  }];


  // Show database connection error state
  if (connectionError === 'DATABASE_TABLE_MISSING') {
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
                  Database Setup Required
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Database Table Missing</h3>
              <p className="text-gray-600 mb-4">
                The vendors table hasn't been created yet. Please contact your administrator to set up the database.
              </p>
              <div className="space-y-2">
                <Button onClick={handleRetryConnection} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
                <Button onClick={() => navigate('/dashboard')} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Database Test Panel - Only show for admins */}
      {isAdmin() &&
      <VendorDatabaseTestPanel />
      }
      
      {/* Supabase Connection Status */}
      <Card className={`border ${supabaseConnected ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {supabaseConnected ?
              <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">Supabase Connected</span>
                  <span className="text-green-600 text-sm">Database and storage are properly connected</span>
                  {realTimeEnabled &&
                <Badge variant="outline" className="text-green-600 border-green-300">
                      Real-time Updates
                    </Badge>
                }
                </> :

              <>
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-amber-700 font-medium">Connection Issue</span>
                </>
              }
            </div>
            {!supabaseConnected &&
            <Button size="sm" variant="outline" onClick={testSupabaseConnection}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Test Connection
              </Button>
            }
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-6 h-6" />
                <span>Vendors</span>
              </CardTitle>
              <CardDescription>
                Manage your vendor contacts and information with Supabase integration
              </CardDescription>
            </div>
            
            {/* Only show Add Vendor button if create permission is enabled */}
            {canCreateVendor ?
            <Button onClick={handleCreateVendor} className="flex items-center space-x-2" disabled={!supabaseConnected}>
                <Plus className="w-4 h-4" />
                <span>Add Vendor</span>
              </Button> :

            isModuleAccessEnabled &&
            <Badge variant="secondary" className="text-xs">
                  Create access disabled by admin
                </Badge>

            }
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
                className="pl-10"
                disabled={!supabaseConnected} />

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
              {canCreateVendor && supabaseConnected &&
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleCreateVendor}>

                  Add Your First Vendor
                </Button>
            }
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
                    <TableHead>Documents</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor, index) =>
                <motion.tr
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedVendorId === vendor.id ? 'bg-blue-50 border-blue-200' : ''}`
                  }
                  onClick={() => setSelectedVendorId(vendor.id)}>

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
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {vendor.documents?.length || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(vendor);
                        }}
                        className="text-blue-600 hover:text-blue-700">

                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {/* Only show Edit button if user is admin */}
                          {isAdmin() && canEditVendor &&
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(vendor.id);
                        }}>

                              <Edit className="w-4 h-4" />
                            </Button>
                      }
                          
                          {/* Only show Delete button if user is admin */}
                          {isAdmin() && canDeleteVendor &&
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(vendor.id);
                        }}
                        className="text-red-600 hover:text-red-700">

                              <Trash2 className="w-4 h-4" />
                            </Button>
                      }
                        </div>
                      </TableCell>
                    </motion.tr>
                )}
                </TableBody>
              </Table>
            </div>
          }

          {/* Show permission status when actions are disabled */}
          {(!isAdmin() || !canEditVendor || !canDeleteVendor) && isModuleAccessEnabled &&
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>Access Restrictions:</strong>
                {!isAdmin() && " Edit and Delete access restricted to administrators only."}
                {isAdmin() && !canEditVendor && " Edit access disabled by admin."}
                {isAdmin() && !canDeleteVendor && " Delete access disabled by admin."}
              </p>
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
      
      {/* View Modal */}
      {selectedVendor &&
      <ViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedVendor(null);
          setSelectedVendorId(null);
        }}
        title={selectedVendor.vendor_name}
        subtitle={`Contact: ${selectedVendor.contact_person} • ${selectedVendor.category}`}
        data={selectedVendor}
        fields={getViewModalFields(selectedVendor)}
        onEdit={() => {
          setViewModalOpen(false);
          handleEdit(selectedVendor.id);
        }}
        onDelete={() => handleDelete(selectedVendor.id)}
        onExport={handleExport}
        canEdit={isAdmin() && canEditVendor}
        canDelete={isAdmin() && canDeleteVendor}
        canExport={true} />

      }
    </div>);

};

const VendorList: React.FC = () => {
  return (
    <VendorErrorBoundary>
      <VendorListContent />
    </VendorErrorBoundary>);

};

export default VendorList;