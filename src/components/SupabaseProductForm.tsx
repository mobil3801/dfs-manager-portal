import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { productService, stationService } from '@/services/databaseService';
import { Loader2, Save, Package, Barcode, DollarSign, Hash } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  barcode: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  cost: z.number().min(0, 'Cost must be positive'),
  quantity_in_stock: z.number().int().min(0, 'Stock quantity must be non-negative'),
  min_stock_level: z.number().int().min(0, 'Minimum stock level must be non-negative'),
  supplier: z.string().optional(),
  description: z.string().optional(),
  station_id: z.string().min(1, 'Station is required')
});

type ProductFormData = z.infer<typeof productSchema>;

interface SupabaseProductFormProps {
  productId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SupabaseProductForm: React.FC<SupabaseProductFormProps> = ({
  productId,
  onSuccess,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!productId);
  const [stations, setStations] = useState<any[]>([]);
  const { toast } = useToast();
  const { userProfile } = useSupabaseAuth();

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
      quantity_in_stock: 0,
      min_stock_level: 0,
      price: 0,
      cost: 0
    }
  });

  // Load stations on mount
  useEffect(() => {
    loadStations();
  }, []);

  // Load product data if editing
  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadStations = async () => {
    try {
      const { data, error } = await stationService.getAll();
      if (error) {
        console.error('Failed to load stations:', error);
      } else {
        setStations(data || []);

        // Auto-select user's station if they're limited to one
        if (userProfile?.station_id && data?.length === 1) {
          setValue('station_id', userProfile.station_id);
        }
      }
    } catch (error) {
      console.error('Error loading stations:', error);
    }
  };

  const loadProduct = async () => {
    if (!productId) return;

    setLoadingData(true);
    try {
      const { data, error } = await productService.getById(productId);

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
          name: data.name || '',
          barcode: data.barcode || '',
          category: data.category || '',
          price: data.price || 0,
          cost: data.cost || 0,
          quantity_in_stock: data.quantity_in_stock || 0,
          min_stock_level: data.min_stock_level || 0,
          supplier: data.supplier || '',
          description: data.description || '',
          station_id: data.station_id || ''
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
      if (productId) {
        // Update existing product
        const { error } = await productService.update(productId, data);
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

      if (onSuccess) {
        onSuccess();
      }
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
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading product data...</p>
          </div>
        </CardContent>
      </Card>);

  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {productId ? 'Edit Product' : 'Add New Product'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter product name"
                  className="pl-10"
                  disabled={isLoading} />

              </div>
              {errors.name &&
              <p className="text-sm text-red-600">{errors.name.message}</p>
              }
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
                  disabled={isLoading} />

              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value)}
                disabled={isLoading}>

                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fuel">Fuel</SelectItem>
                  <SelectItem value="Food">Food & Beverages</SelectItem>
                  <SelectItem value="Tobacco">Tobacco</SelectItem>
                  <SelectItem value="Automotive">Automotive</SelectItem>
                  <SelectItem value="Lottery">Lottery</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.category &&
              <p className="text-sm text-red-600">{errors.category.message}</p>
              }
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                {...register('supplier')}
                placeholder="Enter supplier name"
                disabled={isLoading} />

            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost Price *</Label>
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
                  disabled={isLoading} />

              </div>
              {errors.cost &&
              <p className="text-sm text-red-600">{errors.cost.message}</p>
              }
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Selling Price *</Label>
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
                  disabled={isLoading} />

              </div>
              {errors.price &&
              <p className="text-sm text-red-600">{errors.price.message}</p>
              }
            </div>
          </div>

          {/* Inventory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity_in_stock">Current Stock</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="quantity_in_stock"
                  type="number"
                  min="0"
                  {...register('quantity_in_stock', { valueAsNumber: true })}
                  placeholder="0"
                  className="pl-10"
                  disabled={isLoading} />

              </div>
              {errors.quantity_in_stock &&
              <p className="text-sm text-red-600">{errors.quantity_in_stock.message}</p>
              }
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
                  disabled={isLoading} />

              </div>
              {errors.min_stock_level &&
              <p className="text-sm text-red-600">{errors.min_stock_level.message}</p>
              }
            </div>
          </div>

          {/* Station Selection */}
          <div className="space-y-2">
            <Label htmlFor="station_id">Station *</Label>
            <Select
              value={watch('station_id')}
              onValueChange={(value) => setValue('station_id', value)}
              disabled={isLoading}>

              <SelectTrigger>
                <SelectValue placeholder="Select station" />
              </SelectTrigger>
              <SelectContent>
                {stations.map((station) =>
                <SelectItem key={station.id} value={station.id}>
                    {station.name}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.station_id &&
            <p className="text-sm text-red-600">{errors.station_id.message}</p>
            }
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter product description"
              rows={3}
              disabled={isLoading} />

          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            {onCancel &&
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}>

                Cancel
              </Button>
            }
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]">

              {isLoading ?
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </> :

              <>
                  <Save className="mr-2 h-4 w-4" />
                  {productId ? 'Update' : 'Create'} Product
                </>
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>);

};

export default SupabaseProductForm;