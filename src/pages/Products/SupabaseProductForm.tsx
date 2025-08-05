import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { productService } from '@/services/productService';
import { stationService } from '@/services/databaseService';
import { Loader2, Save, Package, ArrowLeft, Barcode, DollarSign, Hash } from 'lucide-react';

const productSchema = z.object({
  product_name: z.string().min(1, 'Product name is required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string().optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
  cost: z.number().min(0, 'Cost must be positive').optional(),
  stock_quantity: z.number().int().min(0, 'Stock quantity must be non-negative').optional(),
  min_stock_level: z.number().int().min(0, 'Minimum stock level must be non-negative').optional(),
  max_stock_level: z.number().int().min(0, 'Maximum stock level must be non-negative').optional(),
  unit_of_measure: z.string().optional(),
  weight: z.number().min(0, 'Weight must be positive').optional(),
  station_id: z.string().optional(),
  supplier_id: z.string().optional(),
  description: z.string().optional()
});

type ProductFormData = z.infer<typeof productSchema>;

const SupabaseProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { userProfile } = useSupabaseAuth();

  const isEdit = !!id;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [stations, setStations] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      stock_quantity: 0,
      min_stock_level: 0,
      max_stock_level: 0,
      price: 0,
      cost: 0,
      weight: 0
    }
  });

  // Load stations on mount
  useEffect(() => {
    loadStations();
  }, []);

  // Load product data if editing
  useEffect(() => {
    if (isEdit) {
      loadProduct();
    }
  }, [id]);

  const loadStations = async () => {
    try {
      const { data, error } = await stationService.getAllStations();
      if (error) {
        console.error('Failed to load stations:', error);
      } else {
        setStations(data || []);

        // Auto-select user's station
        if (userProfile?.station_id && !isEdit) {
          setValue('station_id', userProfile.station_id);
        }
      }
    } catch (error) {
      console.error('Error loading stations:', error);
    }
  };

  const loadProduct = async () => {
    if (!id) return;

    setLoadingData(true);
    try {
      const { data, error } = await productService.getById(id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load product data',
          variant: 'destructive'
        });
        return;
      }

      if (data) {
        // Reset form with product data
        reset({
          product_name: data.product_name || '',
          sku: data.sku || '',
          barcode: data.barcode || '',
          category: data.category || '',
          price: data.price || 0,
          cost: data.cost || 0,
          stock_quantity: data.stock_quantity || 0,
          min_stock_level: data.min_stock_level || 0,
          max_stock_level: data.max_stock_level || 0,
          unit_of_measure: data.unit_of_measure || '',
          weight: data.weight || 0,
          station_id: data.station_id || '',
          supplier_id: data.supplier_id || '',
          description: data.description || ''
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product data',
        variant: 'destructive'
      });
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);

    try {
      if (isEdit) {
        // Update existing product
        const { error } = await productService.update(id!, data);
        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Product updated successfully'
        });
      } else {
        // Create new product
        const { error } = await productService.create(data);
        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Product created successfully'
        });
      }

      navigate('/products');
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save product',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading product data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = [
    'Fuel',
    'Food & Beverages',
    'Tobacco',
    'Automotive',
    'Lottery',
    'Convenience Store',
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
    'Pharmacy & Medicine'
  ];

  const unitOfMeasures = [
    'Each',
    'Pound (lb)',
    'Ounce (oz)',
    'Gallon (gal)',
    'Quart (qt)',
    'Liter (L)',
    'Case',
    'Box',
    'Pack',
    'Carton'
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
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

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEdit ? 'Edit Product' : 'New Product'}
          </CardTitle>
          <CardDescription>
            {isEdit ? 'Update the product information below' : 'Enter the product details below'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name *</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="product_name"
                    {...register('product_name')}
                    placeholder="Enter product name"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.product_name && (
                  <p className="text-sm text-red-600">{errors.product_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  {...register('sku')}
                  placeholder="Enter SKU"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="barcode"
                    {...register('barcode')}
                    placeholder="Enter barcode"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={watch('category') || ''}
                  onValueChange={(value) => setValue('category', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Cost Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('cost', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.cost && (
                  <p className="text-sm text-red-600">{errors.cost.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Selling Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
            </div>

            {/* Inventory */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Current Stock</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    {...register('stock_quantity', { valueAsNumber: true })}
                    placeholder="0"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.stock_quantity && (
                  <p className="text-sm text-red-600">{errors.stock_quantity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_stock_level">Minimum Stock Level</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="min_stock_level"
                    type="number"
                    min="0"
                    {...register('min_stock_level', { valueAsNumber: true })}
                    placeholder="0"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.min_stock_level && (
                  <p className="text-sm text-red-600">{errors.min_stock_level.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_stock_level">Maximum Stock Level</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="max_stock_level"
                    type="number"
                    min="0"
                    {...register('max_stock_level', { valueAsNumber: true })}
                    placeholder="0"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.max_stock_level && (
                  <p className="text-sm text-red-600">{errors.max_stock_level.message}</p>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_of_measure">Unit of Measure</Label>
                <Select
                  value={watch('unit_of_measure') || ''}
                  onValueChange={(value) => setValue('unit_of_measure', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOfMeasures.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.001"
                  min="0"
                  {...register('weight', { valueAsNumber: true })}
                  placeholder="0.000"
                  disabled={isLoading}
                />
                {errors.weight && (
                  <p className="text-sm text-red-600">{errors.weight.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="station_id">Station</Label>
                <Select
                  value={watch('station_id') || ''}
                  onValueChange={(value) => setValue('station_id', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter product description"
                rows={3}
                disabled={isLoading}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/products')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? 'Update' : 'Create'} Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseProductForm;