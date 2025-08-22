// Product Service using EasySite built-in database
import { EasySiteDB as EasySiteDatabase, TABLE_IDS } from '@/lib/easysite-db';

export interface Product {
  id: string;
  product_name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category?: string;
  category_id?: string;
  price?: number;
  cost?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  unit_of_measure?: string;
  weight?: number;
  station_id?: string;
  supplier_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductData {
  product_name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category?: string;
  category_id?: string;
  price?: number;
  cost?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  unit_of_measure?: string;
  weight?: number;
  station_id?: string;
  supplier_id?: string;
  is_active?: boolean;
}

export const productService = {
  // Get all products
  getAll: async () => {
    try {
      console.log('🛍️ Fetching all active products');

      const response = await EasySiteDatabase.tablePage(TABLE_IDS.PRODUCTS, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'product_name',
        IsAsc: true,
        Filters: [
        { name: 'is_active', op: 'Equal', value: true }]

      });

      if (response.error) {
        console.error('Products fetch error:', response.error);
        return { data: null, error: new Error(response.error) };
      }

      const products = (response.data?.List || []).map((product: any) => ({
        ...product,
        id: product.id?.toString() || '0'
      }));

      console.log('✅ Products fetched successfully:', products.length);
      return { data: products, error: null };

    } catch (error: any) {
      console.error('Error fetching products:', error);
      return { data: null, error };
    }
  },

  // Get products by station
  getByStation: async (stationId: string) => {
    try {
      console.log('🛍️ Fetching products by station:', stationId);

      const response = await EasySiteDatabase.tablePage(TABLE_IDS.PRODUCTS, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'product_name',
        IsAsc: true,
        Filters: [
        { name: 'station_id', op: 'Equal', value: stationId },
        { name: 'is_active', op: 'Equal', value: true }]

      });

      if (response.error) {
        console.error('Products by station fetch error:', response.error);
        return { data: null, error: new Error(response.error) };
      }

      const products = (response.data?.List || []).map((product: any) => ({
        ...product,
        id: product.id?.toString() || '0'
      }));

      console.log('✅ Products by station fetched successfully:', products.length);
      return { data: products, error: null };

    } catch (error: any) {
      console.error('Error fetching products by station:', error);
      return { data: null, error };
    }
  },

  // Get product by ID
  getById: async (id: string) => {
    try {
      console.log('🛍️ Fetching product by ID:', id);

      const response = await EasySiteDatabase.tablePage(TABLE_IDS.PRODUCTS, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
        { name: 'id', op: 'Equal', value: parseInt(id) }]

      });

      if (response.error) {
        console.error('Product by ID fetch error:', response.error);
        return { data: null, error: new Error(response.error) };
      }

      const product = response.data?.List?.[0];
      if (!product) {
        return { data: null, error: new Error('Product not found') };
      }

      const productWithStringId = {
        ...product,
        id: product.id?.toString() || '0'
      };

      console.log('✅ Product by ID fetched successfully:', productWithStringId);
      return { data: productWithStringId, error: null };

    } catch (error: any) {
      console.error('Error fetching product by ID:', error);
      return { data: null, error };
    }
  },

  // Search products
  search: async (searchTerm: string, stationId?: string) => {
    try {
      console.log('🔍 Searching products:', searchTerm, 'Station:', stationId);

      const filters: any[] = [
      { name: 'is_active', op: 'Equal', value: true }];


      if (stationId) {
        filters.push({ name: 'station_id', op: 'Equal', value: stationId });
      }

      // For search, we'll use StringContains on product_name as primary search
      // EasySite doesn't support OR queries like Supabase, so we'll search by name primarily
      filters.push({ name: 'product_name', op: 'StringContains', value: searchTerm });

      const response = await EasySiteDatabase.tablePage(TABLE_IDS.PRODUCTS, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'product_name',
        IsAsc: true,
        Filters: filters
      });

      if (response.error) {
        console.error('Product search error:', response.error);
        return { data: null, error: new Error(response.error) };
      }

      const products = (response.data?.List || []).map((product: any) => ({
        ...product,
        id: product.id?.toString() || '0'
      }));

      console.log('✅ Product search completed:', products.length);
      return { data: products, error: null };

    } catch (error: any) {
      console.error('Error searching products:', error);
      return { data: null, error };
    }
  },

  // Create product
  create: async (productData: CreateProductData) => {
    try {
      console.log('📝 Creating product:', productData.product_name);

      const response = await EasySiteDatabase.tableCreate(TABLE_IDS.PRODUCTS, {
        ...productData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (response.error) {
        console.error('Product creation error:', response.error);
        return { data: null, error: new Error(response.error) };
      }

      const product = {
        ...response.data,
        id: response.data?.id?.toString() || '0'
      };

      console.log('✅ Product created successfully:', product);
      return { data: product, error: null };

    } catch (error: any) {
      console.error('Error creating product:', error);
      return { data: null, error };
    }
  },

  // Update product
  update: async (id: string, productData: Partial<CreateProductData>) => {
    try {
      console.log('📝 Updating product:', id);

      const response = await EasySiteDatabase.tableUpdate(TABLE_IDS.PRODUCTS, {
        id: parseInt(id),
        ...productData,
        updated_at: new Date().toISOString()
      });

      if (response.error) {
        console.error('Product update error:', response.error);
        return { data: null, error: new Error(response.error) };
      }

      const product = {
        ...response.data,
        id: response.data?.id?.toString() || id
      };

      console.log('✅ Product updated successfully:', product);
      return { data: product, error: null };

    } catch (error: any) {
      console.error('Error updating product:', error);
      return { data: null, error };
    }
  },

  // Delete product (soft delete)
  delete: async (id: string) => {
    try {
      console.log('🗑️ Soft deleting product:', id);

      const response = await EasySiteDatabase.tableUpdate(TABLE_IDS.PRODUCTS, {
        id: parseInt(id),
        is_active: false,
        updated_at: new Date().toISOString()
      });

      if (response.error) {
        console.error('Product soft delete error:', response.error);
        return { data: null, error: new Error(response.error) };
      }

      const product = {
        ...response.data,
        id: response.data?.id?.toString() || id
      };

      console.log('✅ Product soft deleted successfully');
      return { data: product, error: null };

    } catch (error: any) {
      console.error('Error soft deleting product:', error);
      return { data: null, error };
    }
  },

  // Hard delete product
  hardDelete: async (id: string) => {
    try {
      console.log('🗑️ Hard deleting product:', id);

      const response = await EasySiteDatabase.tableDelete(TABLE_IDS.PRODUCTS, {
        id: parseInt(id)
      });

      if (response.error) {
        console.error('Product hard delete error:', response.error);
        return { error: new Error(response.error) };
      }

      console.log('✅ Product hard deleted successfully');
      return { error: null };

    } catch (error: any) {
      console.error('Error hard deleting product:', error);
      return { error };
    }
  },

  // Get low stock products
  getLowStock: async (stationId?: string) => {
    try {
      console.log('📉 Fetching low stock products');

      // EasySite doesn't support complex queries like comparing columns
      // We'll fetch all products and filter client-side
      const filters: any[] = [
      { name: 'is_active', op: 'Equal', value: true }];


      if (stationId) {
        filters.push({ name: 'station_id', op: 'Equal', value: stationId });
      }

      const response = await EasySiteDatabase.tablePage(TABLE_IDS.PRODUCTS, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'product_name',
        IsAsc: true,
        Filters: filters
      });

      if (response.error) {
        console.error('Low stock products fetch error:', response.error);
        return { data: null, error: new Error(response.error) };
      }

      // Filter low stock products client-side
      const lowStockProducts = (response.data?.List || []).
      filter((product: any) => {
        const stockQuantity = product.stock_quantity || 0;
        const minStockLevel = product.min_stock_level || 0;
        return minStockLevel > 0 && stockQuantity < minStockLevel;
      }).
      map((product: any) => ({
        ...product,
        id: product.id?.toString() || '0'
      }));

      console.log('✅ Low stock products fetched:', lowStockProducts.length);
      return { data: lowStockProducts, error: null };

    } catch (error: any) {
      console.error('Error fetching low stock products:', error);
      return { data: null, error };
    }
  },

  // Update stock quantity
  updateStock: async (id: string, quantity: number) => {
    try {
      console.log('📦 Updating product stock:', id, 'to', quantity);

      const response = await EasySiteDatabase.tableUpdate(TABLE_IDS.PRODUCTS, {
        id: parseInt(id),
        stock_quantity: quantity,
        updated_at: new Date().toISOString()
      });

      if (response.error) {
        console.error('Product stock update error:', response.error);
        return { data: null, error: new Error(response.error) };
      }

      const product = {
        ...response.data,
        id: response.data?.id?.toString() || id
      };

      console.log('✅ Product stock updated successfully');
      return { data: product, error: null };

    } catch (error: any) {
      console.error('Error updating product stock:', error);
      return { data: null, error };
    }
  },

  // Get products by category
  getByCategory: async (category: string, stationId?: string) => {
    try {
      console.log('🏷️ Fetching products by category:', category);

      const filters: any[] = [
      { name: 'category', op: 'Equal', value: category },
      { name: 'is_active', op: 'Equal', value: true }];


      if (stationId) {
        filters.push({ name: 'station_id', op: 'Equal', value: stationId });
      }

      const response = await EasySiteDatabase.tablePage(TABLE_IDS.PRODUCTS, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'product_name',
        IsAsc: true,
        Filters: filters
      });

      if (response.error) {
        console.error('Products by category fetch error:', response.error);
        return { data: null, error: new Error(response.error) };
      }

      const products = (response.data?.List || []).map((product: any) => ({
        ...product,
        id: product.id?.toString() || '0'
      }));

      console.log('✅ Products by category fetched:', products.length);
      return { data: products, error: null };

    } catch (error: any) {
      console.error('Error fetching products by category:', error);
      return { data: null, error };
    }
  },

  // Get product categories
  getCategories: async () => {
    try {
      console.log('🏷️ Fetching product categories');

      const response = await EasySiteDatabase.tablePage(TABLE_IDS.PRODUCTS, {
        PageNo: 1,
        PageSize: 1000,
        Filters: [
        { name: 'is_active', op: 'Equal', value: true }]

      });

      if (response.error) {
        console.error('Product categories fetch error:', response.error);
        return { data: null, error: new Error(response.error) };
      }

      // Extract unique categories client-side
      const categories = [...new Set(
        (response.data?.List || []).
        map((product: any) => product.category).
        filter((category: any) => category && category.trim() !== '')
      )];

      console.log('✅ Product categories fetched:', categories.length);
      return { data: categories, error: null };

    } catch (error: any) {
      console.error('Error fetching product categories:', error);
      return { data: null, error };
    }
  }
};

export default productService;