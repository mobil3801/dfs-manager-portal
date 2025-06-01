import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Truck, Save } from 'lucide-react';

interface DeliveryRecord {
  id?: number;
  delivery_date: string;
  bol_number: string;
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

const DeliveryForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DeliveryRecord>({
    delivery_date: new Date().toISOString().split('T')[0],
    bol_number: '',
    station: '',
    regular_tank_volume: 0,
    plus_tank_volume: 0,
    super_tank_volume: 0,
    regular_delivered: 0,
    plus_delivered: 0,
    super_delivered: 0,
    delivery_notes: '',
    created_by: 1 // This should be set from auth context
  });

  const stations = ['MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];

  useEffect(() => {
    if (id) {
      loadDeliveryRecord();
    }
  }, [id]);

  const loadDeliveryRecord = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage(12196, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'id', op: 'Equal', value: parseInt(id!) }]
      });

      if (error) throw error;

      if (data?.List?.length > 0) {
        const record = data.List[0];
        setFormData({
          ...record,
          delivery_date: record.delivery_date ? new Date(record.delivery_date).toISOString().split('T')[0] : ''
        });
      }
    } catch (error) {
      console.error('Error loading delivery record:', error);
      toast({
        title: "Error",
        description: "Failed to load delivery record",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.station || !formData.delivery_date || !formData.bol_number) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Date, BOL Number, and Station)",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        delivery_date: new Date(formData.delivery_date).toISOString()
      };

      if (id) {
        const { error } = await window.ezsite.apis.tableUpdate(12196, {
          ID: parseInt(id),
          ...submitData
        });
        if (error) throw error;

        toast({
          title: "Success",
          description: "Delivery record updated successfully"
        });
      } else {
        const { error } = await window.ezsite.apis.tableCreate(12196, submitData);
        if (error) throw error;

        toast({
          title: "Success",
          description: "Delivery record created successfully"
        });
      }

      navigate('/delivery');
    } catch (error) {
      console.error('Error saving delivery record:', error);
      toast({
        title: "Error",
        description: "Failed to save delivery record",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof DeliveryRecord, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading && id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery record...</p>
        </div>
      </div>);

  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button
          onClick={() => navigate('/delivery')}
          variant="ghost"
          className="mb-4">

          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Delivery List
        </Button>
        
        <div className="flex items-center gap-2 mb-4">
          <Truck className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Edit Delivery Record' : 'New Delivery Record'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="delivery_date">Delivery Date *</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                  required />

              </div>
              
              <div>
                <Label htmlFor="bol_number">BOL Number *</Label>
                <Input
                  id="bol_number"
                  type="text"
                  placeholder="Enter BOL Number"
                  value={formData.bol_number}
                  onChange={(e) => handleInputChange('bol_number', e.target.value)}
                  required />
              </div>
              
              <div>
                <Label htmlFor="station">Station *</Label>
                <Select
                  value={formData.station}
                  onValueChange={(value) => handleInputChange('station', value)}>

                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) =>
                    <SelectItem key={station} value={station}>
                        {station}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Before Delivery Tank Report */}
        <Card>
          <CardHeader>
            <CardTitle>Before Delivery Tank Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="regular_tank_volume">Regular Tank Volume (Gallons)</Label>
                <NumberInput
                  id="regular_tank_volume"
                  step="0.01"
                  value={formData.regular_tank_volume}
                  onChange={(value) => handleInputChange('regular_tank_volume', value)} />

              </div>
              
              <div>
                <Label htmlFor="plus_tank_volume">Plus Tank Volume (Gallons)</Label>
                <NumberInput
                  id="plus_tank_volume"
                  step="0.01"
                  value={formData.plus_tank_volume}
                  onChange={(value) => handleInputChange('plus_tank_volume', value)} />

              </div>
              
              <div>
                <Label htmlFor="super_tank_volume">Super Tank Volume (Gallons)</Label>
                <NumberInput
                  id="super_tank_volume"
                  step="0.01"
                  value={formData.super_tank_volume}
                  onChange={(value) => handleInputChange('super_tank_volume', value)} />

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivered Amounts */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Amounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="regular_delivered">Regular Delivered (Gallons)</Label>
                <NumberInput
                  id="regular_delivered"
                  step="0.01"
                  value={formData.regular_delivered}
                  onChange={(value) => handleInputChange('regular_delivered', value)} />

              </div>
              
              <div>
                <Label htmlFor="plus_delivered">Plus Delivered (Gallons)</Label>
                <NumberInput
                  id="plus_delivered"
                  step="0.01"
                  value={formData.plus_delivered}
                  onChange={(value) => handleInputChange('plus_delivered', value)} />

              </div>
              
              <div>
                <Label htmlFor="super_delivered">Super Delivered (Gallons)</Label>
                <NumberInput
                  id="super_delivered"
                  step="0.01"
                  value={formData.super_delivered}
                  onChange={(value) => handleInputChange('super_delivered', value)} />

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="delivery_notes">Delivery Notes</Label>
              <Textarea
                id="delivery_notes"
                value={formData.delivery_notes}
                onChange={(e) => handleInputChange('delivery_notes', e.target.value)}
                placeholder="Enter any additional notes about the delivery..."
                rows={3} />

            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/delivery')}>

            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Delivery Record'}
          </Button>
        </div>
      </form>
    </div>);

};

export default DeliveryForm;