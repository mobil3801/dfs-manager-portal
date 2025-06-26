import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Package, Edit2, Trash2, Eye, DollarSign, RefreshCw } from 'lucide-react';
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
  retail_price: number;
  unit_price: number;
  case_price: number;
  supplier: string;
  description: string;
  updated_at: string;
  quantity_in_stock: number;
  minimum_stock: number;
}

const ProductList: React.FC = () => {
  const { user } = useAuth();
  const device = useDeviceAdaptive();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const pageSize = device.isMobile ? 10 : 20;

  const loadProducts = async (page: number = 1, search: string = '', forceRefresh: boolean = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const filters = search ? [{ name: 'product_name', op: 'StringContains', value: search }] : [];

      // Ensure we get fresh data from database
      const { data, error } = await window.ezsite.apis.tablePage(11726, {
        PageNo: page,
        PageSize: pageSize,
        OrderByField: 'updated_at',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw error;

      const productList = data.List || [];

      // Ensure all price fields are properly handled
      const processedProducts = productList.map((product: any) => ({
        ...product,
        price: product.price || 0,
        retail_price: product.retail_price || 0,
        unit_price: product.unit_price || 0,
        case_price: product.case_price || 0,
        quantity_in_stock: product.quantity_in_stock || 0,
        minimum_stock: product.minimum_stock || 0
      }));

      setProducts(processedProducts);
      setTotalPages(Math.ceil((data.VirtualCount || 0) / pageSize));
      setCurrentPage(page);
      setLastRefresh(new Date());

      if (forceRefresh) {
        toast({
          title: 'Updated',
          description: 'Product pricing refreshed successfully.'
        });
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts(1, searchTerm);
  }, [searchTerm, pageSize]);

  // Auto-refresh every 30 seconds to ensure real-time pricing
  useEffect(() => {
    const interval = setInterval(() => {
      loadProducts(currentPage, searchTerm, true);
    }, 30000);

    return () => clearInterval(interval);
  }, [currentPage, searchTerm]);

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete ${product.product_name}?`)) return;

    try {
      const { error } = await window.ezsite.apis.tableDelete(11726, { ID: product.id });
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product deleted successfully.'
      });

      loadProducts(currentPage, searchTerm);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleRefresh = () => {
    loadProducts(currentPage, searchTerm, true);
  };

  const formatPrice = (price: number) => {
    return price > 0 ? `$${price.toFixed(2)}` : '$0.00';
  };

  const getPrimaryPrice = (product: Product) => {
    // Priority: retail_price > unit_price > price > case_price
    return product.retail_price > 0 ? product.retail_price :
    product.unit_price > 0 ? product.unit_price :
    product.price > 0 ? product.price :
    product.case_price > 0 ? product.case_price : 0;
  };

  const getPriceType = (product: Product) => {
    if (product.retail_price > 0) return 'Retail';
    if (product.unit_price > 0) return 'Unit';
    if (product.price > 0) return 'Base';
    if (product.case_price > 0) return 'Case';
    return 'No Price';
  };

  const columns = [
  {
    key: 'product_name',
    label: 'Product Name',
    sortable: true,
    render: (value: string, item: Product) =>
    <div className="flex flex-col">
          <span className="font-medium">{value}</span>
          <span className="text-xs text-gray-500">{item.product_code}</span>
        </div>
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
    mobileHidden: true
  },
  {
    key: 'price',
    label: 'Price',
    sortable: true,
    render: (value: number, item: Product) => {
      const primaryPrice = getPrimaryPrice(item);
      const priceType = getPriceType(item);
      const isOutOfStock = item.quantity_in_stock <= item.minimum_stock;

      return (
        <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-green-600">
                {formatPrice(primaryPrice)}
              </span>
              {isOutOfStock &&
            <Badge variant="destructive" className="text-xs">
                  Low Stock
                </Badge>
            }
            </div>
            <span className="text-xs text-gray-500">{priceType} Price</span>
            {device.isMobile &&
          <span className="text-xs text-gray-400">
                Updated: {new Date(item.updated_at || lastRefresh).toLocaleTimeString()}
              </span>
          }
          </div>);

    }
  },
  {
    key: 'supplier',
    label: 'Supplier',
    sortable: true,
    mobileHidden: true
  },
  {
    key: 'quantity_in_stock',
    label: 'Stock',
    sortable: true,
    mobileHidden: device.isMobile,
    render: (value: number, item: Product) => {
      const isLowStock = value <= item.minimum_stock;
      return (
        <div className="flex items-center space-x-2">
            <span className={isLowStock ? 'text-red-600 font-medium' : ''}>
              {value}
            </span>
            {isLowStock &&
          <Badge variant="destructive" className="text-xs">
                Low
              </Badge>
          }
          </div>);

    }
  }];


  const renderActions = (product: Product) =>
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
      className="text-red-600 hover:text-red-700">
        <Trash2 className="w-4 h-4" />
        {!device.isMobile && <span className="ml-1">Delete</span>}
      </Button>
    </div>;

  const totalValue = products.reduce((sum, product) => {
    const price = getPrimaryPrice(product);
    return sum + price * (product.quantity_in_stock || 0);
  }, 0);

  const lowStockCount = products.filter((p) => p.quantity_in_stock <= p.minimum_stock).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className={`font-bold text-gray-900 dark:text-white ${
          device.optimalFontSize === 'large' ? 'text-3xl' : 'text-2xl'}`
          }>
            Products
          </h1>
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-gray-600 dark:text-gray-400">
              Manage your product catalog with real-time pricing
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <RefreshCw className="w-3 h-3 mr-1" />
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}>

            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <TouchOptimizedButton asChild>
            <Link to="/products/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </TouchOptimizedButton>
        </div>
      </motion.div>

      {/* Stats Cards - Only show on larger screens */}
      {!device.isMobile &&
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4">

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
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-600">
                  ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-gray-600 text-sm">Total Inventory Value</p>
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
                  {products.filter((p) => p.category).length}
                </p>
                <p className="text-gray-600 text-sm">Categorized</p>
              </div>
            </div>
          </AdaptiveCard>
          
          <AdaptiveCard>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            lowStockCount > 0 ? 'bg-red-100' : 'bg-blue-100'}`
            }>
                <div className={`w-4 h-4 rounded-full ${
              lowStockCount > 0 ? 'bg-red-600' : 'bg-blue-600'}`
              }></div>
              </div>
              <div className="ml-4">
                <p className={`text-2xl font-bold ${
              lowStockCount > 0 ? 'text-red-600' : 'text-blue-600'}`
              }>
                  {lowStockCount}
                </p>
                <p className="text-gray-600 text-sm">Low Stock Items</p>
              </div>
            </div>
          </AdaptiveCard>
        </motion.div>
      }

      {/* Real-time pricing info banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Real-time Pricing Active
              </h3>
              <p className="text-xs text-blue-600">
                Prices are automatically refreshed every 30 seconds from the database
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-blue-600 border-blue-300">
            Live Data
          </Badge>
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}>

        <AdaptiveDataTable
          data={products}
          columns={columns}
          searchPlaceholder="Search products..."
          onRowClick={device.isMobile ? (product) => window.location.href = `/products/${product.id}/edit` : undefined}
          actions={renderActions}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: (page) => loadProducts(page, searchTerm)
          }}
          loading={loading}
          emptyMessage="No products found. Create your first product to get started." />

      </motion.div>
    </motion.div>);

};

export default ProductList;