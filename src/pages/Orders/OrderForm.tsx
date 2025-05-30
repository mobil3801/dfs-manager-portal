import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Save, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface OrderFormData {
  order_number: string;
  vendor_id: string;
  order_date: string;
  expected_delivery: string;
  station: string;
  total_amount: number;
  status: string;
  notes: string;
}

interface Vendor {
  ID: number;
  vendor_name: string;
}

const OrderForm: React.FC = () => {
  const [formData, setFormData] = useState<OrderFormData>({
    order_number: '',
    vendor_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery: '',
    station: '',
    total_amount: 0,
    status: 'Pending',
    notes: ''
  });
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const stations = ['MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];
  const statuses = ['Pending', 'Approved', 'Shipped', 'Delivered', 'Cancelled'];

  useEffect(() => {
    loadVendors();
    if (id) {
      setIsEditing(true);
      loadOrder(parseInt(id));
    }
  }, [id]);

  const loadVendors = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('11729', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'vendor_name',
        IsAsc: true,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      });

      if (error) throw error;
      setVendors(data?.List || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  const loadOrder = async (orderId: number) => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage('11730', {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'ID', op: 'Equal', value: orderId }]
      });

      if (error) throw error;

      if (data && data.List && data.List.length > 0) {
        const order = data.List[0];
        setFormData({
          order_number: order.order_number || '',
          vendor_id: order.vendor_id?.toString() || '',
          order_date: order.order_date ? order.order_date.split('T')[0] : '',
          expected_delivery: order.expected_delivery ? order.expected_delivery.split('T')[0] : '',
          station: order.station || '',
          total_amount: order.total_amount || 0,
          status: order.status || 'Pending',
          notes: order.notes || ''
        });
      }
    } catch (error) {
      console.error('Error loading order:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateOrderNumber = () => {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    return `ORD-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}-${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      let orderNumber = formData.order_number;
      if (!orderNumber && !isEditing) {
        orderNumber = generateOrderNumber();
      }

      const dataToSubmit = {
        ...formData,
        order_number: orderNumber,
        vendor_id: parseInt(formData.vendor_id),
        order_date: formData.order_date ? new Date(formData.order_date).toISOString() : '',
        expected_delivery: formData.expected_delivery ? new Date(formData.expected_delivery).toISOString() : '',
        created_by: 1
      };

      if (isEditing && id) {
        const { error } = await window.ezsite.apis.tableUpdate('11730', {
          ID: parseInt(id),
          ...dataToSubmit
        });
        if (error) throw error;

        toast({
          title: "Success",
          description: "Order updated successfully"
        });
      } else {
        const { error } = await window.ezsite.apis.tableCreate('11730', dataToSubmit);
        if (error) throw error;

        toast({
          title: "Success",
          description: "Order created successfully"
        });
      }

      navigate('/orders');
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} order`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof OrderFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="w-6 h-6" />
                <span>{isEditing ? 'Edit Order' : 'Create New Order'}</span>
              </CardTitle>
              <CardDescription>
                {isEditing ? 'Update order information' : 'Create a new purchase order'}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('/orders')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="order_number">Order Number</Label>
                <Input
                  id="order_number"
                  value={formData.order_number}
                  onChange={(e) => handleInputChange('order_number', e.target.value)}
                  placeholder={isEditing ? "Enter order number" : "Auto-generated if left empty"} />

                {!isEditing &&
                <p className="text-sm text-gray-500">Leave empty to auto-generate</p>
                }
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor_id">Vendor *</Label>
                <Select value={formData.vendor_id} onValueChange={(value) => handleInputChange('vendor_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors && vendors.map((vendor) =>
                    vendor.ID ? (
                      <SelectItem key={vendor.ID} value={vendor.ID.toString()}>
                        {vendor.vendor_name || 'Unknown Vendor'}
                      </SelectItem>
                    ) : null
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order_date">Order Date *</Label>
                <Input
                  id="order_date"
                  type="date"
                  value={formData.order_date}
                  onChange={(e) => handleInputChange('order_date', e.target.value)}
                  required />

              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_delivery">Expected Delivery Date</Label>
                <Input
                  id="expected_delivery"
                  type="date"
                  value={formData.expected_delivery}
                  onChange={(e) => handleInputChange('expected_delivery', e.target.value)} />

              </div>

              <div className="space-y-2">
                <Label htmlFor="station">Delivery Station *</Label>
                <Select value={formData.station} onValueChange={(value) => handleInputChange('station', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations && stations.map((station) =>
                    <SelectItem key={station} value={station}>
                        {station}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_amount">Total Amount ($) *</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.total_amount}
                  onChange={(e) => handleInputChange('total_amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required />

              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses && statuses.map((status) =>
                    <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any additional notes about this order..."
                rows={4} />

            </div>

            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/orders')}>

                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ?
                'Saving...' :

                <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Update Order' : 'Create Order'}
                  </>
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>);

};

export default OrderForm;