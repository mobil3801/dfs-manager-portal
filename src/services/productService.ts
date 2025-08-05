import { supabase } from '@/lib/supabase';

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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('product_name');

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching products:', error);
      return { data: null, error };
    }
  },

  // Get products by station
  getByStation: async (stationId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('station_id', stationId)
        .eq('is_active', true)
        .order('product_name');

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching products by station:', error);
      return { data: null, error };
    }
  },

  // Get product by ID
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching product by ID:', error);
      return { data: null, error };
    }
  },

  // Search products
  search: async (searchTerm: string, stationId?: string) => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (stationId) {
        query = query.eq('station_id', stationId);
      }

      // Search in multiple fields
      query = query.or(`product_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);

      const { data, error } = await query.order('product_name');

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error searching products:', error);
      return { data: null, error };
    }
  },

  // Create product
  create: async (productData: CreateProductData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating product:', error);
      return { data: null, error };
    }
  },

  // Update product
  update: async (id: string, productData: Partial<CreateProductData>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating product:', error);
      return { data: null, error };
    }
  },

  // Delete product (soft delete)
  delete: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error deleting product:', error);
      return { data: null, error };
    }
  },

  // Hard delete product
  hardDelete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Error hard deleting product:', error);
      return { error };
    }
  },

  // Get low stock products
  getLowStock: async (stationId?: string) => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .lt('stock_quantity', supabase.from('products').select('min_stock_level'));

      if (stationId) {
        query = query.eq('station_id', stationId);
      }

      const { data, error } = await query.order('product_name');

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching low stock products:', error);
      return { data: null, error };
    }
  },

  // Update stock quantity
  updateStock: async (id: string, quantity: number) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          stock_quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating product stock:', error);
      return { data: null, error };
    }
  },

  // Get products by category
  getByCategory: async (category: string, stationId?: string) => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true);

      if (stationId) {
        query = query.eq('station_id', stationId);
      }

      const { data, error } = await query.order('product_name');

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching products by category:', error);
      return { data: null, error };
    }
  },

  // Get product categories
  getCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true)
        .not('category', 'is', null);

      if (error) throw error;

      // Extract unique categories
      const categories = [...new Set(data?.map(item => item.category) || [])];

      return { data: categories, error: null };
    } catch (error: any) {
      console.error('Error fetching product categories:', error);
      return { data: null, error };
    }
  }
};

export default productService;