import { productService, CreateProductData } from '@/services/productService';
import { toast } from '@/hooks/use-toast';

export interface LegacyProduct {
  ID: number;
  product_name: string;
  category: string;
  quantity_in_stock: number;
  minimum_stock: number;
  supplier: string;
  description: string;
  created_by: number;
  serial_number: number;
  weight: number;
  weight_unit: string;
  department: string;
  merchant_id: number;
  bar_code_case: string;
  bar_code_unit: string;
  last_updated_date: string;
  last_shopping_date: string;
  case_price: number;
  unit_per_case: number;
  unit_price: number;
  retail_price: number;
  overdue: boolean;
}

export const migrateProductsToSupabase = async (): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> => {
  try {
    // First, get all products from the legacy API
    const legacyResponse = await window.ezsite.apis.tablePage('11726', {
      PageNo: 1,
      PageSize: 1000,
      OrderByField: 'ID',
      IsAsc: true,
      Filters: []
    });

    if (legacyResponse.error) {
      throw new Error('Failed to fetch legacy products: ' + legacyResponse.error);
    }

    const legacyProducts: LegacyProduct[] = legacyResponse.data?.List || [];
    
    if (legacyProducts.length === 0) {
      return { success: 0, failed: 0, errors: ['No legacy products found'] };
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Migrate each product
    for (const legacyProduct of legacyProducts) {
      try {
        // Map legacy product to Supabase format
        const supabaseProduct: CreateProductData = {
          product_name: legacyProduct.product_name,
          description: legacyProduct.description || undefined,
          sku: legacyProduct.serial_number?.toString() || undefined,
          barcode: legacyProduct.bar_code_unit || legacyProduct.bar_code_case || undefined,
          category: legacyProduct.category || legacyProduct.department || undefined,
          price: legacyProduct.retail_price || undefined,
          cost: legacyProduct.unit_price || undefined,
          stock_quantity: legacyProduct.quantity_in_stock || 0,
          min_stock_level: legacyProduct.minimum_stock || 0,
          unit_of_measure: legacyProduct.weight_unit || undefined,
          weight: legacyProduct.weight || undefined,
          is_active: !legacyProduct.overdue
        };

        // Create product in Supabase
        const result = await productService.create(supabaseProduct);

        if (result.error) {
          throw new Error(result.error.message || 'Unknown error');
        }

        successCount++;
        console.log(`Migrated product: ${legacyProduct.product_name}`);

      } catch (error: any) {
        failedCount++;
        const errorMsg = `${legacyProduct.product_name}: ${error.message}`;
        errors.push(errorMsg);
        console.error('Migration error:', errorMsg);
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      errors
    };

  } catch (error: any) {
    console.error('Migration failed:', error);
    return {
      success: 0,
      failed: 0,
      errors: [error.message || 'Migration failed']
    };
  }
};

export const showMigrationDialog = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    const confirmed = confirm(
      'This will migrate all products from the legacy system to Supabase. ' +
      'This operation cannot be undone. ' +
      'Make sure you have a backup of your data before proceeding. ' +
      'Do you want to continue?'
    );
    resolve(confirmed);
  });
};

export const performProductMigration = async () => {
  try {
    const confirmed = await showMigrationDialog();
    
    if (!confirmed) {
      toast({
        title: 'Migration Cancelled',
        description: 'Product migration was cancelled by user.'
      });
      return;
    }

    toast({
      title: 'Migration Started',
      description: 'Migrating products to Supabase...'
    });

    const result = await migrateProductsToSupabase();

    if (result.success > 0) {
      toast({
        title: 'Migration Completed',
        description: `Successfully migrated ${result.success} products. ${result.failed} failed.`
      });
    }

    if (result.failed > 0) {
      console.error('Migration errors:', result.errors);
      toast({
        title: 'Migration Issues',
        description: `${result.failed} products failed to migrate. Check console for details.`,
        variant: 'destructive'
      });
    }

    return result;

  } catch (error: any) {
    console.error('Migration error:', error);
    toast({
      title: 'Migration Failed',
      description: error.message || 'Failed to migrate products',
      variant: 'destructive'
    });
  }
};

export default {
  migrateProductsToSupabase,
  showMigrationDialog,
  performProductMigration
};