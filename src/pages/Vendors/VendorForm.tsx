import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Building2, Save, ArrowLeft, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import StationDropdown from '@/components/StationDropdown';
import VendorDocumentUpload from '@/components/VendorDocumentUpload';
import { vendorService, type VendorFormData, type Vendor } from '@/services/vendorService';
import { useAuth } from '@/contexts/AuthContext';
import VendorErrorBoundary from '@/components/ErrorBoundary/VendorErrorBoundary';

const VendorFormContent: React.FC = () => {
  const [formData, setFormData] = useState<VendorFormData>({
    vendor_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    payment_terms: '',
    is_active: true,
    station_id: '',
    documents: []
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const categories = vendorService.getVendorCategories();
  const paymentTermsOptions = vendorService.getPaymentTermsOptions();

  // Test Supabase connection on component mount
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadVendor(id);
    }
  }, [id]);

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

  const loadVendor = async (vendorId: string) => {
    try {
      setLoading(true);
      setConnectionError(null);

      const vendor = await vendorService.getVendorById(vendorId);

      if (vendor) {
        setFormData({
          vendor_name: vendor.vendor_name || '',
          contact_person: vendor.contact_person || '',
          email: vendor.email || '',
          phone: vendor.phone || '',
          address: vendor.address || '',
          category: vendor.category || '',
          payment_terms: vendor.payment_terms || '',
          is_active: vendor.is_active !== false,
          station_id: vendor.station_id || '',
          documents: vendor.documents || []
        });
        setSelectedStation(vendor.station_id || '');
        setDocuments(vendor.documents || []);
        setSupabaseConnected(true);
      }
    } catch (error: any) {
      console.error('Error loading vendor:', error);
      setSupabaseConnected(false);

      let errorMessage = 'Failed to load vendor details';

      if (error.message?.includes('relation "vendors" does not exist')) {
        errorMessage = 'Vendors table not found. Please contact administrator.';
        setConnectionError('DATABASE_TABLE_MISSING');
      } else if (error.message?.includes('JWT')) {
        errorMessage = 'Authentication error. Please try logging in again.';
        setConnectionError('AUTH_ERROR');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.vendor_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Vendor name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.contact_person.trim()) {
      toast({
        title: "Validation Error",
        description: "Contact person is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      setConnectionError(null);

      const dataToSubmit = {
        ...formData,
        station_id: selectedStation || undefined,
        documents: documents
      };

      if (isEditing && id) {
        const updatedVendor = await vendorService.updateVendor(id, dataToSubmit);
        setSupabaseConnected(true);
        toast({
          title: "Success",
          description: "Vendor updated successfully with Supabase integration"
        });
      } else {
        const newVendor = await vendorService.createVendor(dataToSubmit, user?.id);
        setSupabaseConnected(true);
        toast({
          title: "Success",
          description: "Vendor created successfully with Supabase integration"
        });
      }

      navigate('/vendors');
    } catch (error: any) {
      console.error('Error saving vendor:', error);
      setSupabaseConnected(false);

      let errorMessage = `Failed to ${isEditing ? 'update' : 'create'} vendor`;

      if (error.message?.includes('relation "vendors" does not exist')) {
        errorMessage = 'Vendors table not found. Please contact administrator.';
        setConnectionError('DATABASE_TABLE_MISSING');
      } else if (error.message?.includes('JWT')) {
        errorMessage = 'Authentication error. Please try logging in again.';
        setConnectionError('AUTH_ERROR');
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

  const handleInputChange = (field: keyof VendorFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStationSelect = (station: string) => {
    setSelectedStation(station);
    setFormData((prev) => ({ ...prev, station_id: station }));
  };

  const handleDocumentsChange = (updatedDocuments: any[]) => {
    setDocuments(updatedDocuments);
    setFormData((prev) => ({
      ...prev,
      documents: updatedDocuments
    }));
  };

  const handleRetryConnection = () => {
    setConnectionError(null);
    testSupabaseConnection();
    if (id) {
      loadVendor(id);
    }
  };

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
                  <span>Vendor Form</span>
                </CardTitle>
                <CardDescription>
                  Database Setup Required
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/vendors')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Vendors
              </Button>
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
                <Button onClick={() => navigate('/vendors')} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Vendors
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Supabase Connection Status */}
      <Card className={`border ${supabaseConnected ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
        <CardContent className="pt-4">
          <div className="flex items-center space-x-2">
            {supabaseConnected ?
            <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">Supabase Connected</span>
                <span className="text-green-600 text-sm">Database and storage are properly connected</span>
              </> :

            <>
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-amber-700 font-medium">Connection Issue</span>
                <Button size="sm" variant="outline" onClick={testSupabaseConnection}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Test Connection
                </Button>
              </>
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
                <span>{isEditing ? 'Edit Vendor' : 'Add New Vendor'}</span>
              </CardTitle>
              <CardDescription>
                {isEditing ? 'Update vendor information with Supabase integration' : 'Add a new vendor to your contacts with Supabase storage'}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('/vendors')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vendors
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedStation && !isEditing ?
          <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">Select Station First</h3>
                <p className="text-gray-600">Please select a station before creating a vendor.</p>
              </div>
              
              <div className="max-w-md mx-auto space-y-4">
                <StationDropdown
                id="station"
                label="Station"
                value={selectedStation}
                onValueChange={handleStationSelect}
                placeholder="Select a station"
                required
                includeAll // Vendors can be associated with ALL stations or specific ones
              />
              </div>
            </div> :

          <form onSubmit={handleSubmit} className="space-y-6">
              {selectedStation &&
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Selected Station</h4>
                      <p className="text-blue-700">
                        {selectedStation === 'ALL' ? 'All Stations' : selectedStation}
                        {selectedStation === 'ALL' &&
                    <span className="text-sm text-blue-600 ml-2">(Multi-station vendor)</span>
                    }
                      </p>
                    </div>
                    {!isEditing &&
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStation('')}>

                        Change Station
                      </Button>
                }
                  </div>
                </div>
            }
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vendor_name">Vendor Name *</Label>
                  <Input
                  id="vendor_name"
                  value={formData.vendor_name}
                  onChange={(e) => handleInputChange('vendor_name', e.target.value)}
                  placeholder="Enter vendor company name"
                  required />

                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person *</Label>
                  <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  placeholder="Enter primary contact name"
                  required />

                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address" />

                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number" />

                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) =>
                    <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                    )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Select value={formData.payment_terms} onValueChange={(value) => handleInputChange('payment_terms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTermsOptions.map((terms) =>
                    <SelectItem key={terms} value={terms}>
                          {terms}
                        </SelectItem>
                    )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter full business address"
                rows={3} />

              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Active Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)} />

                  <span className="text-sm text-gray-600">
                    {formData.is_active ? 'Active vendor' : 'Inactive vendor'}
                  </span>
                </div>
              </div>

              {/* Document Upload Section - Only show for editing */}
              {isEditing && id && supabaseConnected &&
            <VendorDocumentUpload
              vendorId={id}
              documents={documents}
              onDocumentsChange={handleDocumentsChange} />

            }

              <div className="flex items-center justify-end space-x-4">
                <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/vendors')}>

                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ?
                'Saving...' :

                <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? 'Update Vendor' : 'Create Vendor'}
                    </>
                }
                </Button>
              </div>
            </form>
          }
        </CardContent>
      </Card>
    </div>);

};

const VendorForm: React.FC = () => {
  return (
    <VendorErrorBoundary>
      <VendorFormContent />
    </VendorErrorBoundary>);

};

export default VendorForm;