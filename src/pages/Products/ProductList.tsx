
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Package, Edit2, Trash2, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';
import { useToast } from '@/hooks/use-toast';
import AdaptiveCard from '@/components/AdaptiveCard';
import AdaptiveDataTable from '@/components/AdaptiveDataTable';
import { TouchOptimizedButton } from '@/components/TouchOptimizedComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: number;
  product_name: string;
  product_code: string;
  category: string;
  price: number;
  quantity_in_stock: number;
  minimum_stock: number;
  supplier: string;
  description: string;
  updated_at: string;
}

const ProductList: React.FC = () => {
  const { user } = useAuth();
  const device = useDeviceAdaptive();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = device.isMobile ? 10 : 20;

  const loadProducts = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const filters = search ? [{ name: 'product_name', op: 'StringContains', value: search }] : [];
      
      const { data, error } = await window.ezsite.apis.tablePage(11726, {
        PageNo: page,
        PageSize: pageSize,
        OrderByField: 'updated_at',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw error;

      setProducts(data.List || []);
      setTotalPages(Math.ceil((data.VirtualCount || 0) / pageSize));
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1, searchTerm);
  }, [searchTerm, pageSize]);

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete ${product.product_name}?`)) return;

    try {
      const { error } = await window.ezsite.apis.tableDelete(11726, { ID: product.id });
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product deleted successfully.',
      });
      
      loadProducts(currentPage, searchTerm);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current <= 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (current <= minimum) return { label: 'Low Stock', variant: 'destructive' as const };
    if (current <= minimum * 2) return { label: 'Warning', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const columns = [
    {
      key: 'product_name',
      label: 'Product Name',
      sortable: true,
      render: (value: string, item: Product) => (
        <div className="flex flex-col">
          <span className="font-medium">{value}</span>
          <span className="text-xs text-gray-500">{item.product_code}</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      mobileHidden: true,
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: 'quantity_in_stock',
      label: 'Stock',
      sortable: true,
      render: (value: number, item: Product) => {
        const status = getStockStatus(value, item.minimum_stock);
        return (
          <div className="flex flex-col items-start">
            <span className="font-medium">{value}</span>
            <Badge variant={status.variant} className="text-xs">
              {status.label}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'supplier',
      label: 'Supplier',
      sortable: true,
      mobileHidden: true,
    },
  ];

  const renderActions = (product: Product) => (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="sm" asChild>
        <Link to={`/products/${product.id}/edit`}>
          <Edit2 className="w-4 h-4" />
          {!device.isMobile && <span className="ml-1">Edit</span>}
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDelete(product)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4" />
        {!device.isMobile && <span className="ml-1">Delete</span>}
      </Button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className={`font-bold text-gray-900 dark:text-white ${
            device.optimalFontSize === 'large' ? 'text-3xl' : 'text-2xl'
          }`}>
            Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your inventory and product catalog
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <TouchOptimizedButton asChild>
            <Link to="/products/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </TouchOptimizedButton>
        </div>
      </motion.div>

      {/* Stats Cards - Only show on larger screens */}
      {!device.isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <AdaptiveCard>
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-gray-600 text-sm">Total Products</p>
              </div>
            </div>
          </AdaptiveCard>
          <AdaptiveCard>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.quantity_in_stock > p.minimum_stock * 2).length}
                </p>
                <p className="text-gray-600 text-sm">In Stock</p>
              </div>
            </div>
          </AdaptiveCard>
          <AdaptiveCard>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-yellow-600">
                  {products.filter(p => p.quantity_in_stock <= p.minimum_stock * 2 && p.quantity_in_stock > p.minimum_stock).length}
                </p>
                <p className="text-gray-600 text-sm">Low Stock</p>
              </div>
            </div>
          </AdaptiveCard>
          <AdaptiveCard>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.quantity_in_stock <= p.minimum_stock).length}
                </p>
                <p className="text-gray-600 text-sm">Critical</p>
              </div>
            </div>
          </AdaptiveCard>
        </motion.div>
      )}

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AdaptiveDataTable
          data={products}
          columns={columns}
          searchPlaceholder="Search products..."
          onRowClick={device.isMobile ? (product) => window.location.href = `/products/${product.id}/edit` : undefined}
          actions={renderActions}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: (page) => loadProducts(page, searchTerm),
          }}
          loading={loading}
          emptyMessage="No products found. Create your first product to get started."
        />
      </motion.div>
    </motion.div>
  );
};

export default ProductList;
