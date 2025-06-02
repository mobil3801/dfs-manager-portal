import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ArrowLeft, Save, Calendar, Lock, AlertTriangle } from 'lucide-react';
import BarcodeScanner from '@/components/BarcodeScanner';
import ProductFileUpload from '@/components/ProductFileUpload';
import { useAuth } from '@/contexts/AuthContext';
import { FormErrorBoundary } from '@/components/ErrorBoundary';


const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const { handleApiCall, handleError } = useErrorHandler({
    component: 'ProductForm',
    severity: 'high'
  });


  // Use AuthContext permission methods
  const { canEdit: canEditProduct, canCreate: canCreateProduct } = useAuth();
  const canEdit = canEditProduct('products');

  const [isLoading, setIsLoading] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    serial_number: 0,
    product_name: '',
    weight: 0,
    weight_unit: 'lb',
    department: 'Convenience Store',
    merchant_id: '',
    bar_code_case: '',
    bar_code_unit: '',
    last_updated_date: new Date().toISOString().split('T')[0],
    last_shopping_date: '',
    case_price: 0,
    unit_per_case: 1,
    unit_price: 0,
    retail_price: 0,
    overdue: false,
    category: '',
    supplier: '',
    quantity_in_stock: 0,
    minimum_stock: 0,
    description: ''
  });

  const weightUnits = [
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'ton', label: 'Tons' },
  { value: 'fl_oz', label: 'Fluid Ounces (fl oz)' },
  { value: 'gal', label: 'Gallons (gal)' },
  { value: 'qt', label: 'Quarts (qt)' },
  { value: 'pt', label: 'Pints (pt)' },
  { value: 'cup', label: 'Cups' }];


  const departments = [
  'Convenience Store',
  'Fuel & Oil',
  'Automotive',
  'Food & Beverages',
  'Tobacco Products',
  'Lottery & Gaming',
  'Health & Personal Care',
  'Electronics & Accessories',
  'Cleaning Supplies',
  'Office Supplies'];


  useEffect(() => {
    fetchVendors();
    if (id) {
      fetchProduct();
    } else {
      generateSerialNumber();
    }
  }, [id]);

  const fetchVendors = async () => {
    const data = await handleApiCall(
      () => window.ezsite.apis.tablePage(11729, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "vendor_name",
        IsAsc: true,
        Filters: [
        { name: "is_active", op: "Equal", value: true }]

      }),
      "Failed to load vendors list",
      { action: 'fetchVendors' }
    );

    if (data) {
      setVendors(data.List || []);
    }
  };

  const generateSerialNumber = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(11726, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: "serial_number",
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;
      const lastSerial = data?.List?.[0]?.serial_number || 0;
      setFormData((prev) => ({ ...prev, serial_number: lastSerial + 1 }));
    } catch (error) {
      console.error('Error generating serial number:', error);
      setFormData((prev) => ({ ...prev, serial_number: 1 }));
    }
  };

  const fetchProduct = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage(11726, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: "id",
        IsAsc: true,
        Filters: [
        { name: "id", op: "Equal", value: parseInt(id) }]

      });

      if (error) throw error;

      if (data?.List?.[0]) {
        const product = data.List[0];
        const productData = {
          serial_number: product.serial_number || 0,
          product_name: product.product_name || '',
          weight: product.weight || 0,
          weight_unit: product.weight_unit || 'lb',
          department: product.department || 'Convenience Store',
          merchant_id: product.merchant_id || '',
          bar_code_case: product.bar_code_case || '',
          bar_code_unit: product.bar_code_unit || '',
          last_updated_date: product.last_updated_date ? product.last_updated_date.split('T')[0] : '',
          last_shopping_date: product.last_shopping_date ? product.last_shopping_date.split('T')[0] : '',
          case_price: product.case_price || 0,
          unit_per_case: product.unit_per_case || 1,
          unit_price: product.unit_price || 0,
          retail_price: product.retail_price || 0,
          overdue: product.overdue || false,
          category: product.category || '',
          supplier: product.supplier || '',
          quantity_in_stock: product.quantity_in_stock || 0,
          minimum_stock: product.minimum_stock || 0,
          description: product.description || ''
        };
        setFormData(productData);
        setOriginalData(productData); // Store original data for comparison
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load product data."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!canEdit) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only System Administrator can edit product information."
      });
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-calculate unit price when case price or units per case changes
    if (field === 'case_price' || field === 'unit_per_case') {
      const casePrice = field === 'case_price' ? value : formData.case_price;
      const unitsPerCase = field === 'unit_per_case' ? value : formData.unit_per_case;

      if (casePrice > 0 && unitsPerCase > 0) {
        const calculatedUnitPrice = casePrice / unitsPerCase;
        setFormData((prev) => ({ ...prev, unit_price: Math.round(calculatedUnitPrice * 100) / 100 }));
      }
    }
  };

  const handleBarcodeScanned = (field: string, barcode: string) => {
    setFormData((prev) => ({ ...prev, [field]: barcode }));
  };

  const handleBulkImport = async (importedData: any[]) => {
    if (!canCreateProduct('products')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to import products."
      });
      return;
    }

    setIsLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Get the latest serial number once
      const serialResponse = await window.ezsite.apis.tablePage(11726, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: "serial_number",
        IsAsc: false,
        Filters: []
      });

      let lastSerial = serialResponse.data?.List?.[0]?.serial_number || 0;

      for (const productData of importedData) {
        try {
          // Ensure we have a product name (this should already be validated)
          if (!productData.product_name?.trim()) {
            errors.push(`Row ${successCount + errorCount + 1}: Product name is required`);
            errorCount++;
            continue;
          }

          // Start with required fields and defaults
          const productPayload: any = {
            serial_number: lastSerial + successCount + 1,
            product_name: productData.product_name.trim(),
            last_updated_date: new Date().toISOString(),
            overdue: false
          };

          // Only add fields that have actual values from the import file
          if (productData.weight !== undefined) {
            productPayload.weight = productData.weight;
          }
          if (productData.weight_unit !== undefined) {
            productPayload.weight_unit = productData.weight_unit;
          } else {
            productPayload.weight_unit = 'lb'; // Default if not provided
          }
          if (productData.department !== undefined) {
            productPayload.department = productData.department;
          } else {
            productPayload.department = 'Convenience Store'; // Default if not provided
          }
          if (productData.bar_code_case !== undefined) {
            productPayload.bar_code_case = productData.bar_code_case;
          }
          if (productData.bar_code_unit !== undefined) {
            productPayload.bar_code_unit = productData.bar_code_unit;
          }
          if (productData.last_shopping_date) {
            productPayload.last_shopping_date = new Date(productData.last_shopping_date).toISOString();
          }
          if (productData.case_price !== undefined) {
            productPayload.case_price = productData.case_price;
          }
          if (productData.unit_per_case !== undefined) {
            productPayload.unit_per_case = productData.unit_per_case;
          } else {
            productPayload.unit_per_case = 1; // Default if not provided
          }
          if (productData.unit_price !== undefined) {
            productPayload.unit_price = productData.unit_price;
          }
          if (productData.retail_price !== undefined) {
            productPayload.retail_price = productData.retail_price;
          }
          if (productData.category !== undefined) {
            productPayload.category = productData.category;
          }
          if (productData.supplier !== undefined) {
            productPayload.supplier = productData.supplier;
          }
          if (productData.quantity_in_stock !== undefined) {
            productPayload.quantity_in_stock = productData.quantity_in_stock;
          }
          if (productData.minimum_stock !== undefined) {
            productPayload.minimum_stock = productData.minimum_stock;
          }
          if (productData.description !== undefined) {
            productPayload.description = productData.description;
          }
          if (productData.merchant_id !== undefined) {
            productPayload.merchant_id = parseInt(productData.merchant_id);
          }

          console.log('Creating product:', productPayload);

          const { error } = await window.ezsite.apis.tableCreate(11726, productPayload);

          if (error) {
            console.error('Error creating product:', error);
            errors.push(`${productData.product_name}: ${error}`);
            errorCount++;
          } else {
            console.log('Successfully created product:', productData.product_name);
            successCount++;
          }
        } catch (error) {
          console.error('Error processing product:', error);
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`${productData.product_name || 'Unknown'}: ${errorMsg}`);
          errorCount++;
        }
      }

      // Show detailed results
      if (successCount > 0) {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${successCount} products. ${errorCount > 0 ? `${errorCount} errors occurred.` : ''}`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: `No products were imported. ${errorCount} errors occurred.`
        });
      }

      // Log errors for debugging
      if (errors.length > 0) {
        console.error('Import errors:', errors);
      }

      if (successCount > 0) {
        navigate('/products');
      }
    } catch (error) {
      console.error('Bulk import error:', error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import product data."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [originalData, setOriginalData] = useState<any>(null);

  const logFieldChange = async (productId: number, fieldName: string, oldValue: any, newValue: any, userId: number) => {
    try {
      const { error } = await window.ezsite.apis.tableCreate('11756', {
        product_id: productId,
        field_name: fieldName,
        old_value: oldValue?.toString() || '',
        new_value: newValue?.toString() || '',
        change_date: new Date().toISOString(),
        changed_by: userId
      });
      if (error) {
        console.error('Error logging field change:', error);
      }
    } catch (error) {
      console.error('Error logging field change:', error);
    }
  };

  const calculateProfitMargin = (unitPrice: number, retailPrice: number) => {
    if (unitPrice === 0 || retailPrice === 0) return 0;
    return (retailPrice - unitPrice) / retailPrice * 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to edit product information."
      });
      return;
    }

    processSubmit();
  };

  const processSubmit = async () => {

    if (!formData.product_name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Product name is required."
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        last_updated_date: new Date().toISOString(),
        last_shopping_date: formData.last_shopping_date ? new Date(formData.last_shopping_date).toISOString() : null,
        merchant_id: formData.merchant_id ? parseInt(formData.merchant_id) : null
      };

      const { error } = id ?
      await window.ezsite.apis.tableUpdate(11726, { id: parseInt(id), ...payload }) :
      await window.ezsite.apis.tableCreate(11726, payload);

      if (error) throw error;

      // Log changes for existing products
      if (id && originalData && userProfile) {
        const fieldsToTrack = [
        'last_shopping_date',
        'case_price',
        'unit_per_case',
        'unit_price',
        'retail_price'];


        for (const field of fieldsToTrack) {
          const oldValue = originalData[field];
          const newValue = formData[field];

          if (oldValue !== newValue) {
            await logFieldChange(parseInt(id), field, oldValue, newValue, userProfile.user_id);
          }
        }

        // Calculate and log profit margin changes
        const oldProfitMargin = calculateProfitMargin(originalData.unit_price, originalData.retail_price);
        const newProfitMargin = calculateProfitMargin(formData.unit_price, formData.retail_price);

        if (Math.abs(oldProfitMargin - newProfitMargin) > 0.01) {
          await logFieldChange(parseInt(id), 'profit_margin', oldProfitMargin.toFixed(2), newProfitMargin.toFixed(2), userProfile.user_id);
        }
      }

      toast({
        title: "Success",
        description: `Product ${id ? 'updated' : 'created'} successfully.`
      });

      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${id ? 'update' : 'create'} product.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{id ? 'Edit Product' : 'Create New Product'}</h1>
            <p className="text-muted-foreground">
              {id ? 'Update product information' : 'Add a new product to your inventory'}
            </p>
          </div>
        </div>
        <ProductFileUpload onDataImport={handleBulkImport} disabled={!canEdit} />
      </div>

      {/* Access Warning */}
      {!canEdit &&
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Access Restricted</h3>
              <p className="text-sm text-red-700 mt-1">
                You don't have permission to edit product information.
              </p>
            </div>
            <Lock className="w-5 h-5 text-red-600" />
          </div>
        </div>
      }

      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Edit Product' : 'New Product'}</CardTitle>
          <CardDescription>
            {id ? 'Update the product information below' : 'Enter the product details below'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <FormErrorBoundary
            formName="Product Form"
            showDataRecovery={true}
            onFormReset={() => {
              if (id) {
                fetchProduct();
              } else {
                setFormData({
                  serial_number: 0,
                  product_name: '',
                  weight: 0,
                  weight_unit: 'lb',
                  department: 'Convenience Store',
                  merchant_id: '',
                  bar_code_case: '',
                  bar_code_unit: '',
                  last_updated_date: new Date().toISOString().split('T')[0],
                  last_shopping_date: '',
                  case_price: 0,
                  unit_per_case: 1,
                  unit_price: 0,
                  retail_price: 0,
                  overdue: false,
                  category: '',
                  supplier: '',
                  quantity_in_stock: 0,
                  minimum_stock: 0,
                  description: ''
                });
                generateSerialNumber();
              }
            }}>

            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number</Label>
                <NumberInput
                    id="serial_number"
                    value={formData.serial_number}
                    onChange={(value) => handleInputChange('serial_number', value)}
                    disabled
                    className="bg-muted" />

                <p className="text-xs text-muted-foreground">Auto-generated</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name *</Label>
                <Input
                    id="product_name"
                    placeholder="Enter product name"
                    value={formData.product_name}
                    onChange={(e) => handleInputChange('product_name', e.target.value)}
                    disabled={!canEdit}
                    className={!canEdit ? 'bg-muted' : ''}
                    required />

              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                    id="category"
                    placeholder="Enter product category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    disabled={!canEdit}
                    className={!canEdit ? 'bg-muted' : ''} />

              </div>
            </div>

            {/* Weight and Department */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <NumberInput
                    id="weight"
                    step="0.01"
                    min="0"
                    value={formData.weight}
                    onChange={(value) => handleInputChange('weight', value)}
                    disabled={!canEdit}
                    className={!canEdit ? 'bg-muted' : ''} />

              </div>

              <div className="space-y-2">
                <Label htmlFor="weight_unit">Weight Unit</Label>
                <Select
                    value={formData.weight_unit}
                    onValueChange={(value) => handleInputChange('weight_unit', value)}
                    disabled={!canEdit}>

                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {weightUnits.map((unit) =>
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                    value={formData.department}
                    onValueChange={(value) => handleInputChange('department', value)}
                    disabled={!canEdit}>

                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) =>
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Merchant and Supplier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="merchant_id">Merchant</Label>
                <Select
                    value={formData.merchant_id}
                    onValueChange={(value) => handleInputChange('merchant_id', value)}
                    disabled={!canEdit}>

                  <SelectTrigger>
                    <SelectValue placeholder="Select merchant" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) =>
                      <SelectItem key={vendor.id} value={vendor.id.toString()}>
                        {vendor.vendor_name}
                      </SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                    id="supplier"
                    placeholder="Enter supplier name"
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    disabled={!canEdit}
                    className={!canEdit ? 'bg-muted' : ''} />

              </div>
            </div>

            {/* Barcode Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bar_code_case">Bar Code Case</Label>
                <div className="flex space-x-2">
                  <Input
                      id="bar_code_case"
                      placeholder="Enter or scan barcode"
                      value={formData.bar_code_case}
                      onChange={(e) => handleInputChange('bar_code_case', e.target.value)}
                      disabled={!canEdit}
                      className={`flex-1 ${!canEdit ? 'bg-muted' : ''}`} />

                  <BarcodeScanner
                      onScan={(barcode) => handleBarcodeScanned('bar_code_case', barcode)}
                      triggerText="Scan"
                      disabled={!canEdit} />

                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bar_code_unit">Bar Code Unit</Label>
                <div className="flex space-x-2">
                  <Input
                      id="bar_code_unit"
                      placeholder="Enter or scan barcode"
                      value={formData.bar_code_unit}
                      onChange={(e) => handleInputChange('bar_code_unit', e.target.value)}
                      disabled={!canEdit}
                      className={`flex-1 ${!canEdit ? 'bg-muted' : ''}`} />

                  <BarcodeScanner
                      onScan={(barcode) => handleBarcodeScanned('bar_code_unit', barcode)}
                      triggerText="Scan"
                      disabled={!canEdit} />

                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="case_price">Case Price ($)</Label>
                <NumberInput
                    id="case_price"
                    step="0.01"
                    min="0"
                    value={formData.case_price}
                    onChange={(value) => handleInputChange('case_price', value)}
                    disabled={!canEdit}
                    className={!canEdit ? 'bg-muted' : ''} />

              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_per_case">Units Per Case</Label>
                <NumberInput
                    id="unit_per_case"
                    min="1"
                    value={formData.unit_per_case}
                    onChange={(value) => handleInputChange('unit_per_case', value)}
                    disabled={!canEdit}
                    className={!canEdit ? 'bg-muted' : ''} />

              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price ($)</Label>
                <NumberInput
                    id="unit_price"
                    step="0.01"
                    min="0"
                    value={formData.unit_price}
                    onChange={(value) => handleInputChange('unit_price', value)}
                    disabled={!canEdit}
                    className={!canEdit ? 'bg-muted' : ''} />

                <p className="text-xs text-muted-foreground">Auto-calculated from case price</p>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="retail_price">Retail Price ($)</Label>
                <NumberInput
                    id="retail_price"
                    step="0.01"
                    min="0"
                    value={formData.retail_price}
                    onChange={(value) => handleInputChange('retail_price', value)}
                    disabled={!canEdit}
                    className={!canEdit ? 'bg-muted' : ''} />

              </div>

              <div className="space-y-2">
                <Label htmlFor="last_shopping_date">Last Shopping Date</Label>
                <Input
                    id="last_shopping_date"
                    type="date"
                    value={formData.last_shopping_date}
                    onChange={(e) => handleInputChange('last_shopping_date', e.target.value)}
                    disabled={!canEdit}
                    className={!canEdit ? 'bg-muted' : ''} />

              </div>
            </div>



            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                  id="description"
                  placeholder="Enter product description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={!canEdit}
                  className={!canEdit ? 'bg-muted' : ''} />

            </div>

            <div className="flex items-center justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate('/products')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !canEdit}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </FormErrorBoundary>
        </CardContent>
      </Card>
    </div>);

};

export default ProductForm;