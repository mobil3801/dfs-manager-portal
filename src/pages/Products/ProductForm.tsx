import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FormErrorBoundary } from '@/components/ErrorBoundary';
import ProductImageUpload from '@/components/ProductImageUpload';

interface ProductFormData {
  product_name: string;
  description: string;
  sku: string;
  barcode: string;
  category: string;
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  unit_of_measure: string;
  weight: number;
  supplier_id: string;
  is_active: boolean;
}

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const isEdit = !!id;
  const [isLoading, setIsLoading] = useState(false);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    product_name: '',
    description: '',
    sku: '',
    barcode: '',
    category: '',
    price: 0,
    cost: 0,
    stock_quantity: 0,
    min_stock_level: 0,
    max_stock_level: 100,
    unit_of_measure: 'each',
    weight: 0,
    supplier_id: '',
    is_active: true
  });

  const categories = [
  'Food & Beverages',
  'Fuel & Oil',
  'Automotive',
  'Tobacco Products',
  'Lottery & Gaming',
  'Health & Personal Care',
  'Electronics & Accessories',
  'Cleaning Supplies',
  'Office Supplies',
  'Snacks & Candy',
  'Hot Foods & Coffee',
  'Cold Beverages',
  'Energy Drinks',
  'Beer & Wine',
  'Ice & Frozen',
  'Phone Cards & Prepaid',
  'Car Accessories',
  'Gift Cards',
  'Pharmacy & Medicine',
  'General'];


  const unitOptions = [
  'each',
  'lb',
  'oz',
  'gal',
  'qt',
  'pt',
  'fl oz',
  'box',
  'case',
  'pack',
  'bag',
  'bottle',
  'can'];


  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.
      from('products').
      select('*').
      eq('id', id).
      single();

      if (error) throw error;

      if (data) {
        setFormData({
          product_name: data.product_name || '',
          description: data.description || '',
          sku: data.sku || '',
          barcode: data.barcode || '',
          category: data.category || '',
          price: data.price || 0,
          cost: data.cost || 0,
          stock_quantity: data.stock_quantity || 0,
          min_stock_level: data.min_stock_level || 0,
          max_stock_level: data.max_stock_level || 100,
          unit_of_measure: data.unit_of_measure || 'each',
          weight: data.weight || 0,
          supplier_id: data.supplier_id || '',
          is_active: data.is_active !== false
        });

        // Set product image URL if available
        setProductImageUrl(data.image_url || null);
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load product data: " + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUploaded = (imageUrl: string) => {
    setProductImageUrl(imageUrl);
  };

  const handleImageRemoved = () => {
    setProductImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Product name is required."
      });
      return;
    }

    if (!userProfile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User profile not found."
      });
      return;
    }

    setIsLoading(true);
    try {
      let productId = id;

      if (isEdit) {
        const { data, error } = await supabase.
        from('products').
        update({
          ...formData,
          image_url: productImageUrl,
          updated_at: new Date().toISOString()
        }).
        eq('id', id).
        select().
        single();

        if (error) throw error;
        productId = data.id;
      } else {
        const { data, error } = await supabase.
        from('products').
        insert([{
          ...formData,
          image_url: productImageUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]).
        select().
        single();

        if (error) throw error;
        productId = data.id;
      }

      // Image is handled by the ProductImageUpload component

      toast({
        title: "Success",
        description: `Product ${isEdit ? 'updated' : 'created'} successfully.`
      });

      navigate('/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} product: ` + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProfitMargin = () => {
    if (formData.price > 0 && formData.cost > 0) {
      return ((formData.price - formData.cost) / formData.price * 100).toFixed(1);
    }
    return '0';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Update product information' : 'Add a new product to your inventory'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Product' : 'New Product'}</CardTitle>
          <CardDescription>
            {isEdit ? 'Update the product information below' : 'Enter the product details below'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormErrorBoundary
            formName="Product Form"
            showDataRecovery={true}
            onFormReset={() => {
              if (isEdit) {
                fetchProduct();
              } else {
                setFormData({
                  product_name: '',
                  description: '',
                  sku: '',
                  barcode: '',
                  category: '',
                  price: 0,
                  cost: 0,
                  stock_quantity: 0,
                  min_stock_level: 0,
                  max_stock_level: 100,
                  unit_of_measure: 'each',
                  weight: 0,
                  supplier_id: '',
                  is_active: true
                });
                setProductImageUrl(null);
              }
            }}>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="product_name">Product Name *</Label>
                  <Input
                    id="product_name"
                    placeholder="Enter product name"
                    value={formData.product_name}
                    onChange={(e) => handleInputChange('product_name', e.target.value)}
                    required />

                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    placeholder="Enter SKU"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)} />

                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) =>
                      <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    placeholder="Enter barcode"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)} />

                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)} />

              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)} />

                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)} />

                </div>

                <div className="space-y-2">
                  <Label>Profit Margin (%)</Label>
                  <Input
                    value={calculateProfitMargin() + '%'}
                    disabled
                    className="bg-muted" />

                </div>
              </div>

              {/* Inventory */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Current Stock</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)} />

                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_stock_level">Minimum Stock Level</Label>
                  <Input
                    id="min_stock_level"
                    type="number"
                    min="0"
                    value={formData.min_stock_level}
                    onChange={(e) => handleInputChange('min_stock_level', parseInt(e.target.value) || 0)} />

                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_stock_level">Maximum Stock Level</Label>
                  <Input
                    id="max_stock_level"
                    type="number"
                    min="0"
                    value={formData.max_stock_level}
                    onChange={(e) => handleInputChange('max_stock_level', parseInt(e.target.value) || 0)} />

                </div>
              </div>

              {/* Physical Properties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)} />

                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_of_measure">Unit of Measure</Label>
                  <Select
                    value={formData.unit_of_measure}
                    onValueChange={(value) => handleInputChange('unit_of_measure', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((unit) =>
                      <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Product Image */}
              <ProductImageUpload
                productId={id}
                currentImageUrl={productImageUrl}
                onImageUploaded={handleImageUploaded}
                onImageRemoved={handleImageRemoved} />


              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)} />

                <Label htmlFor="is_active">Product is active</Label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6">
                <Button type="button" variant="outline" onClick={() => navigate('/products')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </FormErrorBoundary>
        </CardContent>
      </Card>
    </div>);

};

export default ProductForm;