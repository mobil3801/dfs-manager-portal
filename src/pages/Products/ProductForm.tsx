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
import { ArrowLeft, Save, Calendar, Lock, AlertTriangle, Upload, Eye, Plus, Calculator, Camera, XCircle } from 'lucide-react';
import BarcodeScanner from '@/components/BarcodeScanner';
import ProductFileUpload from '@/components/ProductFileUpload';
import { useAuth } from '@/contexts/AuthContext';
import { FormErrorBoundary } from '@/components/ErrorBoundary';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
  const [bulkUploadData, setBulkUploadData] = useState<any[]>([]);
  const [showBulkPreview, setShowBulkPreview] = useState(false);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
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
    profit_margin: 0,
    overdue: false,
    category: '',
    supplier: '',
    quantity_in_stock: 0,
    minimum_stock: 0,
    description: '',
    product_image_id: ''
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
  'Office Supplies',
  'Snacks & Candy',
  'Hot Foods & Coffee',
  'Cold Beverages',
  'Energy Drinks',
  'Beer & Wine',
  'Ice & Frozen',
  'Phone Cards & Prepaid',
  'Car Accessories',
  'Gift Cards',
  'Pharmacy & Medicine',
  'Household Items',
  'Safety & Emergency',
  'Tools & Hardware',
  'Sporting Goods',
  'Pet Supplies'];

  const categories = [
  'Food Items',
  'Beverages',
  'Tobacco',
  'Automotive',
  'Personal Care',
  'Electronics',
  'Household',
  'Office Supplies',
  'Health & Medicine',
  'Fuel Products',
  'Motor Oil',
  'Car Care',
  'Snacks',
  'Candy & Gum',
  'Energy Drinks',
  'Soft Drinks',
  'Water & Juice',
  'Beer & Wine',
  'Cigarettes',
  'Cigars',
  'Vaping Products',
  'Lottery Tickets',
  'Scratch Cards',
  'Phone Cards',
  'Gift Cards',
  'Ice Products',
  'Hot Food',
  'Coffee & Tea',
  'Dairy Products',
  'Frozen Foods',
  'Emergency Supplies',
  'Pet Food',
  'Cleaning Products',
  'Paper Products',
  'Batteries',
  'Phone Accessories',
  'Sunglasses',
  'Travel Items',
  'Maps & Guides'];


  useEffect(() => {
    fetchVendors();
    if (id) {
      fetchProduct();
    } else {
      generateSerialNumber();
    }
  }, [id]);

  // Auto-calculate profit margin when unit price or retail price changes
  useEffect(() => {
    if (formData.unit_price > 0 && formData.retail_price > 0) {
      const margin = (formData.retail_price - formData.unit_price) / formData.retail_price * 100;
      setFormData((prev) => ({ ...prev, profit_margin: Math.round(margin * 100) / 100 }));
    } else {
      setFormData((prev) => ({ ...prev, profit_margin: 0 }));
    }
  }, [formData.unit_price, formData.retail_price]);

  // Cleanup image preview on unmount
  useEffect(() => {
    return () => {
      if (productImagePreview) {
        URL.revokeObjectURL(productImagePreview);
      }
    };
  }, [productImagePreview]);

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
          profit_margin: 0, // Will be calculated by useEffect
          overdue: product.overdue || false,
          category: product.category || '',
          supplier: product.supplier || '',
          quantity_in_stock: product.quantity_in_stock || 0,
          minimum_stock: product.minimum_stock || 0,
          description: product.description || '',
          product_image_id: product.product_image_id || ''
        };
        setFormData(productData);
        setOriginalData(productData);

        // Load existing product image if available
        if (product.product_image_id) {
          // Note: In a real implementation, you'd fetch the image URL from the file service
          // For now, we'll just store the image ID
          console.log('Product has image with ID:', product.product_image_id);
        }
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

  // Calculate suggested retail price based on unit price
  const calculateSuggestedRetailPrice = (unitPrice: number) => {
    if (unitPrice === 0) return 0;

    let markupPercentage = 0;
    if (unitPrice < 4) {
      markupPercentage = 65;
    } else if (unitPrice >= 4 && unitPrice < 6) {
      markupPercentage = 55;
    } else if (unitPrice >= 6 && unitPrice < 8) {
      markupPercentage = 45;
    } else if (unitPrice >= 8 && unitPrice < 10) {
      markupPercentage = 35;
    } else {
      markupPercentage = 25;
    }

    const suggestedPrice = unitPrice * (1 + markupPercentage / 100);

    // Round to closest .25, .49, .75, or .99
    const roundingTargets = [0.25, 0.49, 0.75, 0.99];
    const wholeNumber = Math.floor(suggestedPrice);
    const decimal = suggestedPrice - wholeNumber;

    let closestRounding = 0.99;
    let minDifference = Math.abs(decimal - 0.99);

    roundingTargets.forEach((target) => {
      const difference = Math.abs(decimal - target);
      if (difference < minDifference) {
        minDifference = difference;
        closestRounding = target;
      }
    });

    return wholeNumber + closestRounding;
  };

  const handleInputChange = (field: string, value: any) => {
    if (!canEdit && field !== 'retail_price') {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only System Administrator can edit product information."
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-suggest category and department when product name changes
    if (field === 'product_name' && value.trim()) {
      const suggestedCategory = suggestCategory(value);
      if (suggestedCategory && !formData.category) {
        setFormData((prev) => ({ ...prev, category: suggestedCategory }));

        const suggestedDepartment = suggestDepartment(suggestedCategory);
        if (suggestedDepartment && formData.department === 'Convenience Store') {
          setFormData((prev) => ({ ...prev, department: suggestedDepartment }));
        }
      }
    }

    // Auto-suggest department when category changes
    if (field === 'category' && value) {
      const suggestedDepartment = suggestDepartment(value);
      if (suggestedDepartment && formData.department === 'Convenience Store') {
        setFormData((prev) => ({ ...prev, department: suggestedDepartment }));
      }
    }

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

  // Auto-suggest category based on product name
  const suggestCategory = (productName: string): string => {
    const name = productName.toLowerCase();

    // Beverages
    if (name.includes('coke') || name.includes('pepsi') || name.includes('sprite') || name.includes('soda')) return 'Soft Drinks';
    if (name.includes('water') || name.includes('juice') || name.includes('tea') || name.includes('coffee')) return 'Water & Juice';
    if (name.includes('energy') || name.includes('red bull') || name.includes('monster')) return 'Energy Drinks';
    if (name.includes('beer') || name.includes('wine') || name.includes('alcohol')) return 'Beer & Wine';

    // Food
    if (name.includes('chip') || name.includes('doritos') || name.includes('lays')) return 'Snacks';
    if (name.includes('candy') || name.includes('chocolate') || name.includes('gum')) return 'Candy & Gum';
    if (name.includes('hot dog') || name.includes('pizza') || name.includes('sandwich')) return 'Hot Food';
    if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt')) return 'Dairy Products';
    if (name.includes('ice cream') || name.includes('frozen')) return 'Frozen Foods';

    // Tobacco
    if (name.includes('cigarette') || name.includes('marlboro') || name.includes('camel')) return 'Cigarettes';
    if (name.includes('cigar') || name.includes('pipe')) return 'Cigars';
    if (name.includes('vape') || name.includes('juul') || name.includes('e-cig')) return 'Vaping Products';

    // Automotive
    if (name.includes('oil') || name.includes('motor') || name.includes('5w30')) return 'Motor Oil';
    if (name.includes('gas') || name.includes('fuel') || name.includes('diesel')) return 'Fuel Products';
    if (name.includes('tire') || name.includes('wiper') || name.includes('brake')) return 'Car Accessories';

    // Other
    if (name.includes('lottery') || name.includes('powerball') || name.includes('mega')) return 'Lottery Tickets';
    if (name.includes('scratch') || name.includes('instant')) return 'Scratch Cards';
    if (name.includes('phone card') || name.includes('prepaid')) return 'Phone Cards';
    if (name.includes('gift card')) return 'Gift Cards';
    if (name.includes('battery') || name.includes('batteries')) return 'Batteries';
    if (name.includes('ice') && !name.includes('ice cream')) return 'Ice Products';

    return '';
  };

  // Auto-suggest department based on category
  const suggestDepartment = (category: string): string => {
    const categoryToDepartment: {[key: string]: string;} = {
      'Soft Drinks': 'Cold Beverages',
      'Water & Juice': 'Cold Beverages',
      'Energy Drinks': 'Energy Drinks',
      'Beer & Wine': 'Beer & Wine',
      'Snacks': 'Snacks & Candy',
      'Candy & Gum': 'Snacks & Candy',
      'Hot Food': 'Hot Foods & Coffee',
      'Coffee & Tea': 'Hot Foods & Coffee',
      'Dairy Products': 'Cold Beverages',
      'Frozen Foods': 'Ice & Frozen',
      'Cigarettes': 'Tobacco Products',
      'Cigars': 'Tobacco Products',
      'Vaping Products': 'Tobacco Products',
      'Motor Oil': 'Fuel & Oil',
      'Fuel Products': 'Fuel & Oil',
      'Car Accessories': 'Automotive',
      'Lottery Tickets': 'Lottery & Gaming',
      'Scratch Cards': 'Lottery & Gaming',
      'Phone Cards': 'Phone Cards & Prepaid',
      'Gift Cards': 'Gift Cards',
      'Batteries': 'Electronics & Accessories',
      'Ice Products': 'Ice & Frozen'
    };

    return categoryToDepartment[category] || 'Convenience Store';
  };

  // Handle product image upload
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select an image file."
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const { data: fileId, error } = await window.ezsite.apis.upload({
        filename: file.name,
        file: file
      });

      if (error) throw error;

      setFormData((prev) => ({ ...prev, product_image_id: fileId }));
      setProductImageFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProductImagePreview(previewUrl);

      toast({
        title: "Success",
        description: "Product image uploaded successfully."
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image."
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageRemove = () => {
    setFormData((prev) => ({ ...prev, product_image_id: '' }));
    setProductImageFile(null);
    setProductImagePreview('');
    if (productImagePreview) {
      URL.revokeObjectURL(productImagePreview);
    }
  };

  // Bulk upload functions
  const handleBulkFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter((line) => line.trim());
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',');
          const product: any = {};

          headers.forEach((header, i) => {
            let value = values[i]?.trim() || '';

            // Map CSV headers to database fields
            const fieldMapping: {[key: string]: string;} = {
              'product name': 'product_name',
              'product_name': 'product_name',
              'weight': 'weight',
              'weight unit': 'weight_unit',
              'weight_unit': 'weight_unit',
              'department': 'department',
              'merchant': 'merchant_id',
              'merchant_id': 'merchant_id',
              'last shopping date': 'last_shopping_date',
              'last_shopping_date': 'last_shopping_date',
              'case price': 'case_price',
              'case_price': 'case_price',
              'unit per case': 'unit_per_case',
              'unit_per_case': 'unit_per_case',
              'unit price': 'unit_price',
              'unit_price': 'unit_price',
              'retail price': 'retail_price',
              'retail_price': 'retail_price',
              'category': 'category',
              'supplier': 'supplier',
              'description': 'description'
            };

            const dbField = fieldMapping[header] || header;

            // Convert numeric fields
            if (['weight', 'case_price', 'unit_per_case', 'unit_price', 'retail_price', 'merchant_id'].includes(dbField)) {
              value = value ? parseFloat(value) || 0 : 0;
            }

            product[dbField] = value;
          });

          // Auto-calculate unit price if case price and unit per case are provided
          if (product.case_price > 0 && product.unit_per_case > 0 && !product.unit_price) {
            product.unit_price = Math.round(product.case_price / product.unit_per_case * 100) / 100;
          }

          // Calculate suggested retail price if unit price is available
          if (product.unit_price > 0 && !product.retail_price) {
            product.retail_price = calculateSuggestedRetailPrice(product.unit_price);
          }

          return product;
        });

        setBulkUploadData(data);
        setShowBulkPreview(true);

      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to parse CSV file. Please check the format."
        });
      }
    };

    reader.readAsText(file);
  };

  const handleBulkSubmit = async () => {
    if (!canCreateProduct('products')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to create products."
      });
      return;
    }

    setIsLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Get the latest serial number
      const serialResponse = await window.ezsite.apis.tablePage(11726, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: "serial_number",
        IsAsc: false,
        Filters: []
      });

      let lastSerial = serialResponse.data?.List?.[0]?.serial_number || 0;

      for (const productData of bulkUploadData) {
        try {
          if (!productData.product_name?.trim()) {
            errors.push(`Row ${successCount + errorCount + 1}: Product name is required`);
            errorCount++;
            continue;
          }

          const productPayload: any = {
            serial_number: lastSerial + successCount + 1,
            product_name: productData.product_name.trim(),
            last_updated_date: new Date().toISOString(),
            overdue: false,
            weight: productData.weight || 0,
            weight_unit: productData.weight_unit || 'lb',
            department: productData.department || 'Convenience Store',
            case_price: productData.case_price || 0,
            unit_per_case: productData.unit_per_case || 1,
            unit_price: productData.unit_price || 0,
            retail_price: productData.retail_price || 0,
            category: productData.category || '',
            supplier: productData.supplier || '',
            description: productData.description || ''
          };

          if (productData.merchant_id) {
            productPayload.merchant_id = parseInt(productData.merchant_id);
          }

          if (productData.last_shopping_date) {
            productPayload.last_shopping_date = new Date(productData.last_shopping_date).toISOString();
          }

          const { error } = await window.ezsite.apis.tableCreate(11726, productPayload);

          if (error) {
            errors.push(`${productData.product_name}: ${error}`);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`${productData.product_name || 'Unknown'}: ${errorMsg}`);
          errorCount++;
        }
      }

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

      if (errors.length > 0) {
        console.error('Import errors:', errors);
      }

      if (successCount > 0) {
        setShowBulkPreview(false);
        setBulkUploadData([]);
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

  const suggestedRetailPrice = calculateSuggestedRetailPrice(formData.unit_price);

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
        
        {/* Bulk Upload Dialog */}
        <Dialog open={showBulkPreview} onOpenChange={setShowBulkPreview}>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={!canEdit}>
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Bulk Product Upload</DialogTitle>
              <DialogDescription>
                Upload a CSV file with product data. Required columns: Product Name. Optional: Weight, Weight Unit, Department, Merchant, Case Price, Unit Per Case, Unit Price, Retail Price, Category, Supplier, Description.
              </DialogDescription>
            </DialogHeader>
            
            {bulkUploadData.length === 0 ?
            <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Upload CSV File</h3>
                    <p className="text-sm text-gray-500">Select a CSV file containing product data</p>
                    <Input
                    type="file"
                    accept=".csv"
                    onChange={handleBulkFileUpload}
                    className="max-w-xs mx-auto" />

                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">CSV Format Example:</h4>
                  <code className="text-sm text-blue-700 block">
                    Product Name,Weight,Weight Unit,Department,Case Price,Unit Per Case,Unit Price,Retail Price<br />
                    Coca Cola 12oz,12,oz,Food & Beverages,24.00,24,1.00,1.99
                  </code>
                </div>
              </div> :

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Preview Import Data ({bulkUploadData.length} products)</h3>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => {
                    setBulkUploadData([]);
                    setShowBulkPreview(false);
                  }}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkSubmit} disabled={isLoading}>
                      {isLoading ? 'Importing...' : 'Import Products'}
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Case Price</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Retail Price</TableHead>
                        <TableHead>Profit %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bulkUploadData.map((product, index) => {
                      const profit = product.unit_price > 0 && product.retail_price > 0 ?
                      ((product.retail_price - product.unit_price) / product.retail_price * 100).toFixed(1) :
                      '0';

                      return (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{product.product_name}</TableCell>
                            <TableCell>{product.weight} {product.weight_unit}</TableCell>
                            <TableCell>{product.department}</TableCell>
                            <TableCell>${product.case_price?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell>${product.unit_price?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell>${product.retail_price?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell>
                              <Badge variant={parseFloat(profit) > 20 ? 'default' : 'secondary'}>
                                {profit}%
                              </Badge>
                            </TableCell>
                          </TableRow>);

                    })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            }
          </DialogContent>
        </Dialog>
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
                  profit_margin: 0,
                  overdue: false,
                  category: '',
                  supplier: '',
                  quantity_in_stock: 0,
                  minimum_stock: 0,
                  description: '',
                  product_image_id: ''
                });
                setProductImageFile(null);
                setProductImagePreview('');
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
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                    disabled={!canEdit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) =>
                      <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {formData.product_name && !formData.category &&
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Calculator className="w-4 h-4" />
                      <span>Auto-suggestion available when you type product name</span>
                    </div>
                  }
                </div>
              </div>

              {/* Category and Supplier */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                
                <div className="space-y-2">
                  <Label htmlFor="stock-info">Stock Information</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <NumberInput
                      placeholder="Current Stock"
                      value={formData.quantity_in_stock}
                      onChange={(value) => handleInputChange('quantity_in_stock', value)}
                      disabled={!canEdit}
                      className={!canEdit ? 'bg-muted' : ''}
                      min="0" />
                    <NumberInput
                      placeholder="Min Stock"
                      value={formData.minimum_stock}
                      onChange={(value) => handleInputChange('minimum_stock', value)}
                      disabled={!canEdit}
                      className={!canEdit ? 'bg-muted' : ''}
                      min="0" />
                  </div>
                  <p className="text-xs text-muted-foreground">Current stock / Minimum stock level</p>
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
                  <Label htmlFor="weight_unit">Weight Unit (USA Measurements)</Label>
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

              {/* Merchant and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <Label htmlFor="last_updated_date">Last Updated Date</Label>
                  <Input
                    id="last_updated_date"
                    type="date"
                    value={formData.last_updated_date}
                    onChange={(e) => handleInputChange('last_updated_date', e.target.value)}
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
                  <Label htmlFor="unit_per_case">Unit Per Case</Label>
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

              {/* Retail Price and Profit Margin */}
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
                  
                  {/* Retail Price Suggestion */}
                  {formData.unit_price > 0 &&
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Calculator className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Suggested: ${suggestedRetailPrice.toFixed(2)}</span>
                        <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleInputChange('retail_price', suggestedRetailPrice)}
                        disabled={!canEdit}
                        className="text-xs h-6 px-2">

                          Apply
                        </Button>
                      </div>
                    </div>
                  }
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profit_margin">Profit Margin (%)</Label>
                  <div className="flex items-center space-x-2">
                    <NumberInput
                      id="profit_margin"
                      step="0.01"
                      value={formData.profit_margin}
                      disabled
                      className="bg-muted" />
                    <Badge variant={formData.profit_margin > 20 ? 'default' : 'secondary'}>
                      {formData.profit_margin > 20 ? 'Good' : 'Low'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Auto-calculated from cost and retail price</p>
                </div>
              </div>

              {/* Description */}
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

              {/* Product Image Upload */}
              <div className="space-y-4">
                <Label>Product Image</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      {productImagePreview ?
                      <div className="space-y-4">
                          <img
                          src={productImagePreview}
                          alt="Product preview"
                          className="mx-auto max-h-40 rounded-lg shadow-sm" />

                          <div className="flex justify-center space-x-2">
                            <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleImageRemove}
                            disabled={!canEdit}>

                              <XCircle className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                            <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                            disabled={!canEdit || isUploadingImage}
                            className="hidden"
                            id="replace-image" />

                            <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('replace-image')?.click()}
                            disabled={!canEdit || isUploadingImage}>

                              <Upload className="w-4 h-4 mr-2" />
                              Replace
                            </Button>
                          </div>
                        </div> :

                      <div className="space-y-4">
                          <Upload className="w-12 h-12 mx-auto text-gray-400" />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">Upload Product Image</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Add a photo to help identify this product
                            </p>
                          </div>
                          <div className="flex flex-col items-center space-y-2">
                            <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                            disabled={!canEdit || isUploadingImage}
                            className="hidden"
                            id="product-image" />

                            <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('product-image')?.click()}
                            disabled={!canEdit || isUploadingImage}>

                              {isUploadingImage ?
                            <>
                                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                                  Uploading...
                                </> :

                            <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Choose Image
                                </>
                            }
                            </Button>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                  
                  {/* Image Guidelines */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Image Guidelines</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Use clear, well-lit photos</li>
                        <li>• Recommended size: 800x600 pixels</li>
                        <li>• Supported formats: JPG, PNG, WebP</li>
                        <li>• Maximum file size: 5MB</li>
                        <li>• Square images work best</li>
                      </ul>
                    </div>
                    
                    {/* Camera option for mobile */}
                    <div className="md:hidden">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.capture = 'environment';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleImageUpload(file);
                          };
                          input.click();
                        }}
                        disabled={!canEdit || isUploadingImage}>

                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                  </div>
                </div>
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