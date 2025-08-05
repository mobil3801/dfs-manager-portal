import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface Vendor {
  id: string;
  vendor_name: string;
  contact_person: string;
  email?: string;
  phone?: string;
  address?: string;
  category: string;
  payment_terms?: string;
  is_active: boolean;
  station_id?: string;
  created_by?: string;
  documents?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface VendorFormData {
  vendor_name: string;
  contact_person: string;
  email?: string;
  phone?: string;
  address?: string;
  category: string;
  payment_terms?: string;
  is_active: boolean;
  station_id?: string;
  documents?: any[];
}

class VendorService {
  /**
   * Check if vendors table exists and is accessible
   */
  async checkTableExists() {
    try {
      const { data, error } = await supabase.
      from('vendors').
      select('count', { count: 'exact' }).
      limit(1);

      if (error) {
        console.error('Table check error:', error);
        if (error.message.includes('relation "vendors" does not exist')) {
          throw new Error('VENDORS_TABLE_NOT_FOUND');
        }
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error checking vendors table:', error);
      throw error;
    }
  }

  /**
   * Get all vendors with optional filtering
   */
  async getVendors(options: {
    page?: number;
    limit?: number;
    search?: string;
    stationId?: string;
    category?: string;
    isActive?: boolean;
  } = {}) {
    try {
      // First check if table exists
      await this.checkTableExists();

      const { page = 1, limit = 10, search, stationId, category, isActive } = options;
      const offset = (page - 1) * limit;

      let query = supabase.
      from('vendors').
      select(`
          *,
          stations(name, station_id)
        `, { count: 'exact' }).
      order('vendor_name');

      // Apply filters
      if (search) {
        query = query.or(
          `vendor_name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`
        );
      }

      if (stationId && stationId !== 'ALL') {
        query = query.eq('station_id', stationId);
      }

      if (category) {
        query = query.eq('category', category);
      }

      if (typeof isActive === 'boolean') {
        query = query.eq('is_active', isActive);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching vendors:', error);
        throw error;
      }

      return {
        vendors: data || [],
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error in getVendors:', error);
      throw error;
    }
  }

  /**
   * Get vendor by ID
   */
  async getVendorById(id: string) {
    try {
      await this.checkTableExists();

      const { data, error } = await supabase.
      from('vendors').
      select(`
          *,
          stations(name, station_id)
        `).
      eq('id', id).
      single();

      if (error) {
        console.error('Error fetching vendor:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getVendorById:', error);
      throw error;
    }
  }

  /**
   * Create new vendor
   */
  async createVendor(vendorData: VendorFormData, userId?: string) {
    try {
      await this.checkTableExists();

      const dataToInsert = {
        ...vendorData,
        created_by: userId,
        documents: vendorData.documents || []
      };

      const { data, error } = await supabase.
      from('vendors').
      insert([dataToInsert]).
      select(`
          *,
          stations(name, station_id)
        `).
      single();

      if (error) {
        console.error('Error creating vendor:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createVendor:', error);
      throw error;
    }
  }

  /**
   * Update vendor
   */
  async updateVendor(id: string, vendorData: Partial<VendorFormData>) {
    try {
      await this.checkTableExists();

      const { data, error } = await supabase.
      from('vendors').
      update({
        ...vendorData,
        updated_at: new Date().toISOString()
      }).
      eq('id', id).
      select(`
          *,
          stations(name, station_id)
        `).
      single();

      if (error) {
        console.error('Error updating vendor:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateVendor:', error);
      throw error;
    }
  }

  /**
   * Delete vendor
   */
  async deleteVendor(id: string) {
    try {
      await this.checkTableExists();

      const { error } = await supabase.
      from('vendors').
      delete().
      eq('id', id);

      if (error) {
        console.error('Error deleting vendor:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteVendor:', error);
      throw error;
    }
  }

  /**
   * Upload vendor document to Supabase Storage
   */
  async uploadDocument(vendorId: string, file: File) {
    try {
      // Check if bucket exists, create if not
      const bucketName = 'vendor-documents';

      const fileExt = file.name.split('.').pop();
      const fileName = `vendor-${vendorId}-${Date.now()}.${fileExt}`;
      const filePath = `vendors/${vendorId}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage.
      from(bucketName).
      upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.
      from(bucketName).
      getPublicUrl(filePath);

      // Update vendor's documents array
      const { data: vendor } = await supabase.
      from('vendors').
      select('documents').
      eq('id', vendorId).
      single();

      const currentDocuments = vendor?.documents || [];
      const newDocument = {
        id: Date.now().toString(),
        name: file.name,
        url: publicUrl,
        path: filePath,
        type: file.type,
        size: file.size,
        uploaded_at: new Date().toISOString()
      };

      const { data, error } = await supabase.
      from('vendors').
      update({
        documents: [...currentDocuments, newDocument],
        updated_at: new Date().toISOString()
      }).
      eq('id', vendorId).
      select().
      single();

      if (error) {
        console.error('Error updating vendor documents:', error);
        throw error;
      }

      return {
        document: newDocument,
        vendor: data
      };
    } catch (error) {
      console.error('Error in uploadDocument:', error);
      throw error;
    }
  }

  /**
   * Delete vendor document
   */
  async deleteDocument(vendorId: string, documentId: string) {
    try {
      // Get current vendor documents
      const { data: vendor } = await supabase.
      from('vendors').
      select('documents').
      eq('id', vendorId).
      single();

      if (!vendor?.documents) {
        throw new Error('No documents found for this vendor');
      }

      const document = vendor.documents.find((doc: any) => doc.id === documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Delete file from storage
      const { error: deleteError } = await supabase.storage.
      from('vendor-documents').
      remove([document.path]);

      if (deleteError) {
        console.error('Error deleting file from storage:', deleteError);
        // Continue with database update even if storage deletion fails
      }

      // Update vendor's documents array
      const updatedDocuments = vendor.documents.filter((doc: any) => doc.id !== documentId);

      const { data, error } = await supabase.
      from('vendors').
      update({
        documents: updatedDocuments,
        updated_at: new Date().toISOString()
      }).
      eq('id', vendorId).
      select().
      single();

      if (error) {
        console.error('Error updating vendor documents:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in deleteDocument:', error);
      throw error;
    }
  }

  /**
   * Get vendor categories for dropdown
   */
  getVendorCategories() {
    return [
    'Fuel Supplier',
    'Food & Beverages',
    'Automotive',
    'Maintenance',
    'Office Supplies',
    'Technology',
    'Cleaning Services',
    'Security Services',
    'Insurance',
    'Legal Services',
    'Marketing',
    'Other'];

  }

  /**
   * Get payment terms options
   */
  getPaymentTermsOptions() {
    return [
    'Net 30',
    'Net 15',
    'Net 10',
    'Payment on Delivery',
    'Prepaid',
    '2/10 Net 30',
    '1/10 Net 30',
    'Custom Terms'];

  }

  /**
   * Subscribe to vendor changes
   */
  subscribeToVendors(callback: (payload: any) => void) {
    try {
      const subscription = supabase.
      channel('vendors-changes').
      on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendors'
        },
        callback
      ).
      subscribe();

      return subscription;
    } catch (error) {
      console.error('Error setting up subscription:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from vendor changes
   */
  unsubscribeFromVendors(subscription: any) {
    try {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  }
}

export const vendorService = new VendorService();
export default vendorService;