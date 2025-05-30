import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Package, Save, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface ProductFormData {
  product_name: string;
  product_code: string;
  category: string;
  price: number;
  quantity_in_stock: number;
  minimum_stock: number;
  supplier: string;
  description: string;
}

const ProductForm: React.FC = () => {
  const [formData, setFormData] = useState<ProductFormData>({
    product_name: '',
    product_code: '',
    category: '',
    price: 0,
    quantity_in_stock: 0,
    minimum_stock: 0,
    supplier: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadProduct(parseInt(id));
    }
  }, [id]);

  const loadProduct = async (productId: number) => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage('11726', {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'ID', op: 'Equal', value: productId }]
      });

      if (error) throw error;

      if (data && data.List && data.List.length > 0) {
        const product = data.List[0];
        setFormData({
          product_name: product.product_name || '',
          product_code: product.product_code || '',
          category: product.category || '',
          price: product.price || 0,
          quantity_in_stock: product.quantity_in_stock || 0,
          minimum_stock: product.minimum_stock || 0,
          supplier: product.supplier || '',
          description: product.description || ''
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
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
        created_by: 1, // Default user ID since we removed auth
        updated_at: new Date().toISOString()
      };

      if (isEditing && id) {
        const { error } = await window.ezsite.apis.tableUpdate('11726', {
          ID: parseInt(id),
          ...dataToSubmit
        });
        if (error) throw error;

        toast({
          title: "Success",
          description: "Product updated successfully"
        });
      } else {
        const { error } = await window.ezsite.apis.tableCreate('11726', dataToSubmit);
        if (error) throw error;

        toast({
          title: "Success",
          description: "Product created successfully"
        });
      }

      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} product`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-6 h-6" />
                <span>{isEditing ? 'Edit Product' : 'Add New Product'}</span>
              </CardTitle>
              <CardDescription>
                {isEditing ? 'Update product information' : 'Add a new product to your inventory'}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('/products')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name *</Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) => handleInputChange('product_name', e.target.value)}
                  placeholder="Enter product name"
                  required />

              </div>

              <div className="space-y-2">
                <Label htmlFor="product_code">Product Code *</Label>
                <Input
                  id="product_code"
                  value={formData.product_code}
                  onChange={(e) => handleInputChange('product_code', e.target.value)}
                  placeholder="Enter product code"
                  required />

              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Enter product category" />

              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  placeholder="Enter supplier name" />

              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required />

              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity_in_stock">Quantity in Stock *</Label>
                <Input
                  id="quantity_in_stock"
                  type="number"
                  min="0"
                  value={formData.quantity_in_stock}
                  onChange={(e) => handleInputChange('quantity_in_stock', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  required />

              </div>

              <div className="space-y-2">
                <Label htmlFor="minimum_stock">Minimum Stock Level</Label>
                <Input
                  id="minimum_stock"
                  type="number"
                  min="0"
                  value={formData.minimum_stock}
                  onChange={(e) => handleInputChange('minimum_stock', parseInt(e.target.value) || 0)}
                  placeholder="0" />

              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter product description"
                rows={4} />

            </div>

            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/products')}>

                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ?
                'Saving...' :

                <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Update Product' : 'Create Product'}
                  </>
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>);

};

export default ProductForm;