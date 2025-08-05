import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Building2, Save, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import StationDropdown from '@/components/StationDropdown';
import VendorDocumentUpload from '@/components/VendorDocumentUpload';
import { vendorService, type VendorFormData, type Vendor } from '@/services/vendorService';
import { useAuth } from '@/contexts/AuthContext';

const VendorForm: React.FC = () => {
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

  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const categories = vendorService.getVendorCategories();
  const paymentTermsOptions = vendorService.getPaymentTermsOptions();

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadVendor(id);
    }
  }, [id]);

  const loadVendor = async (vendorId: string) => {
    try {
      setLoading(true);
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
      }
    } catch (error) {
      console.error('Error loading vendor:', error);
      toast({
        title: "Error",
        description: "Failed to load vendor details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const dataToSubmit = {
        ...formData,
        station_id: selectedStation || undefined,
        documents: documents
      };

      if (isEditing && id) {
        const updatedVendor = await vendorService.updateVendor(id, dataToSubmit);
        toast({
          title: "Success",
          description: "Vendor updated successfully"
        });
      } else {
        const newVendor = await vendorService.createVendor(dataToSubmit, user?.id);
        toast({
          title: "Success",
          description: "Vendor created successfully"
        });
      }

      navigate('/vendors');
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} vendor`,
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

  return (
    <div className="space-y-6">
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
          {!selectedStation && !isEditing ? (
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
                  includeAll={true} // Vendors can be associated with ALL stations or specific ones
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {selectedStation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Selected Station</h4>
                      <p className="text-blue-700">
                        {selectedStation === 'ALL' ? 'All Stations' : selectedStation}
                        {selectedStation === 'ALL' && (
                          <span className="text-sm text-blue-600 ml-2">(Multi-station vendor)</span>
                        )}
                      </p>
                    </div>
                    {!isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStation('')}
                      >
                        Change Station
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vendor_name">Vendor Name *</Label>
                  <Input
                    id="vendor_name"
                    value={formData.vendor_name}
                    onChange={(e) => handleInputChange('vendor_name', e.target.value)}
                    placeholder="Enter vendor company name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person *</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => handleInputChange('contact_person', e.target.value)}
                    placeholder="Enter primary contact name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
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
                      {paymentTermsOptions.map((terms) => (
                        <SelectItem key={terms} value={terms}>
                          {terms}
                        </SelectItem>
                      ))}
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
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Active Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <span className="text-sm text-gray-600">
                    {formData.is_active ? 'Active vendor' : 'Inactive vendor'}
                  </span>
                </div>
              </div>

              {/* Document Upload Section - Only show for editing */}
              {isEditing && id && (
                <VendorDocumentUpload
                  vendorId={id}
                  documents={documents}
                  onDocumentsChange={handleDocumentsChange}
                />
              )}

              <div className="flex items-center justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/vendors')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? 'Update Vendor' : 'Create Vendor'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorForm;