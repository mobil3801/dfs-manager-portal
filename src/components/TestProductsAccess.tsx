import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Edit, Trash2, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  product_name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category?: string;
  price?: number;
  cost?: number;
  stock_quantity?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

const TestProductsAccess: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const testConnection = async () => {
    setLoading(true);
    setConnectionStatus('testing');
    setError(null);

    try {
      // Test basic connection to Supabase products table
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .limit(5);

      if (error) {
        throw new Error(`Database Error: ${error.message}`);
      }

      setProducts(data || []);
      setConnectionStatus('connected');
      
      toast({
        title: "Connection Successful",
        description: `Successfully connected to Supabase. Found ${count || 0} products.`,
        variant: "default"
      });

    } catch (err: any) {
      console.error('Connection test failed:', err);
      setError(err.message);
      setConnectionStatus('error');
      
      toast({
        title: "Connection Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestProduct = async () => {
    setLoading(true);
    try {
      const testProduct = {
        product_name: `Test Product ${Date.now()}`,
        description: 'This is a test product created by the connection tester',
        sku: `TEST-${Date.now()}`,
        category: 'General',
        price: 9.99,
        cost: 5.99,
        stock_quantity: 10,
        is_active: true
      };

      const { data, error } = await supabase
        .from('products')
        .insert([testProduct])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Test Product Created",
        description: `Successfully created test product: ${data.product_name}`,
        variant: "default"
      });

      // Refresh products list
      testConnection();

    } catch (err: any) {
      console.error('Failed to create test product:', err);
      toast({
        title: "Create Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Delete product "${productName}"?`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Product Deleted",
        description: `Successfully deleted: ${productName}`,
        variant: "default"
      });

      // Refresh products list
      testConnection();

    } catch (err: any) {
      console.error('Failed to delete product:', err);
      toast({
        title: "Delete Failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'testing': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      case 'testing': return <Database className="w-5 h-5 animate-pulse" />;
      default: return <Database className="w-5 h-5" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-6 h-6" />
            <span>Products Database Connection Test</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={getStatusColor()}>
                {getStatusIcon()}
              </div>
              <div>
                <p className="font-medium">
                  Connection Status: <span className={getStatusColor()}>{connectionStatus}</span>
                </p>
                {error && (
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                )}
              </div>
            </div>
            <Button 
              onClick={testConnection} 
              disabled={loading}
              variant={connectionStatus === 'connected' ? 'default' : 'outline'}>
              {loading ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          {/* Actions */}
          {connectionStatus === 'connected' && (
            <div className="flex space-x-4">
              <Button onClick={createTestProduct} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Create Test Product
              </Button>
            </div>
          )}

          {/* Products List */}
          {products.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Products ({products.length})</h3>
              <div className="grid gap-4">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{product.product_name}</h4>
                        {product.description && (
                          <p className="text-sm text-gray-600">{product.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProduct(product.id, product.product_name)}
                          className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">SKU:</span>
                        <p className="font-medium">{product.sku || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <p className="font-medium">{product.category || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <p className="font-medium">{product.price ? `$${product.price.toFixed(2)}` : '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Stock:</span>
                        <p className="font-medium">{product.stock_quantity || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Test Instructions:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Click "Test Connection" to verify Supabase database connectivity</li>
              <li>If successful, try creating a test product</li>
              <li>Verify that CRUD operations work correctly</li>
              <li>Check that the products table structure matches expectations</li>
              <li>Clean up test data by deleting test products</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestProductsAccess;