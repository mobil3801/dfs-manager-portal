import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import {
  stationService,
  productService,
  employeeService,
  salesReportService,
  deliveryService,
  licenseService,
  vendorService,
  orderService,
  userProfileService } from
'@/services/databaseService';
import {
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  Loader2,
  Building2,
  Package,
  Users,
  FileText,
  Truck,
  FileX,
  ShoppingCart,
  UserCheck } from
'lucide-react';

interface MigrationStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'completed' | 'error';
  count?: number;
  error?: string;
}

const DataMigrationTool: React.FC = () => {
  const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([
  {
    id: 'stations',
    name: 'Gas Stations',
    description: 'Migrate station information and setup',
    icon: <Building2 className="h-4 w-4" />,
    status: 'pending'
  },
  {
    id: 'user_profiles',
    name: 'User Profiles',
    description: 'Create user profiles for existing users',
    icon: <UserCheck className="h-4 w-4" />,
    status: 'pending'
  },
  {
    id: 'employees',
    name: 'Employee Records',
    description: 'Migrate employee data and documents',
    icon: <Users className="h-4 w-4" />,
    status: 'pending'
  },
  {
    id: 'products',
    name: 'Product Inventory',
    description: 'Transfer product catalog and stock levels',
    icon: <Package className="h-4 w-4" />,
    status: 'pending'
  },
  {
    id: 'vendors',
    name: 'Vendors',
    description: 'Migrate vendor and supplier information',
    icon: <Truck className="h-4 w-4" />,
    status: 'pending'
  },
  {
    id: 'sales_reports',
    name: 'Sales Reports',
    description: 'Transfer historical sales data',
    icon: <FileText className="h-4 w-4" />,
    status: 'pending'
  },
  {
    id: 'deliveries',
    name: 'Delivery Records',
    description: 'Migrate delivery and fuel data',
    icon: <Truck className="h-4 w-4" />,
    status: 'pending'
  },
  {
    id: 'licenses',
    name: 'License Management',
    description: 'Transfer license and compliance data',
    icon: <FileX className="h-4 w-4" />,
    status: 'pending'
  },
  {
    id: 'orders',
    name: 'Purchase Orders',
    description: 'Migrate ordering and procurement data',
    icon: <ShoppingCart className="h-4 w-4" />,
    status: 'pending'
  }]
  );

  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [overallProgress, setOverallProgress] = useState(0);

  const { isAdmin, user } = useSupabaseAuth();

  const updateStepStatus = (stepId: string, status: MigrationStep['status'], count?: number, error?: string) => {
    setMigrationSteps((prev) => prev.map((step) =>
    step.id === stepId ?
    { ...step, status, count, error } :
    step
    ));
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const migrateStations = async (): Promise<boolean> => {
    try {
      // Sample station data - in real implementation, this would come from existing EZSite APIs
      const sampleStations = [
      {
        name: 'MOBIL Downtown',
        address: '123 Main Street, Downtown',
        phone: '(555) 123-4567',
        manager_id: user?.id,
        is_active: true
      },
      {
        name: 'MOBIL Highway',
        address: '456 Highway 101, North Side',
        phone: '(555) 987-6543',
        manager_id: user?.id,
        is_active: true
      }];


      for (const station of sampleStations) {
        const { error } = await stationService.create(station);
        if (error) throw error;
        await sleep(500);
      }

      return true;
    } catch (error) {
      console.error('Station migration error:', error);
      return false;
    }
  };

  const migrateUserProfiles = async (): Promise<boolean> => {
    try {
      if (!user?.id) throw new Error('No user ID available');

      // Create admin profile for current user
      const profileData = {
        role: 'Administrator',
        station_id: null, // Admin has access to all stations
        employee_id: 'ADMIN001',
        phone: '',
        hire_date: new Date().toISOString().split('T')[0],
        is_active: true,
        detailed_permissions: {
          products: { view: true, create: true, edit: true, delete: true },
          employees: { view: true, create: true, edit: true, delete: true },
          sales: { view: true, create: true, edit: true, delete: true },
          reports: { view: true, create: true, edit: true, delete: true }
        }
      };

      const { error } = await userProfileService.createUserProfile(user.id, profileData);
      if (error) throw error;

      return true;
    } catch (error) {
      console.error('User profile migration error:', error);
      return false;
    }
  };

  const migrateEmployees = async (): Promise<boolean> => {
    try {
      // Get created stations
      const { data: stations } = await stationService.getAll();
      if (!stations || stations.length === 0) throw new Error('No stations available');

      const sampleEmployees = [
      {
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '(555) 111-2222',
        position: 'Shift Manager',
        hire_date: '2023-01-15',
        salary: 45000,
        station_id: stations[0].id,
        is_active: true
      },
      {
        employee_id: 'EMP002',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '(555) 333-4444',
        position: 'Cashier',
        hire_date: '2023-03-20',
        salary: 32000,
        station_id: stations[0].id,
        is_active: true
      }];


      for (const employee of sampleEmployees) {
        const { error } = await employeeService.create(employee);
        if (error) throw error;
        await sleep(300);
      }

      return true;
    } catch (error) {
      console.error('Employee migration error:', error);
      return false;
    }
  };

  const migrateProducts = async (): Promise<boolean> => {
    try {
      const { data: stations } = await stationService.getAll();
      if (!stations || stations.length === 0) throw new Error('No stations available');

      const sampleProducts = [
      {
        name: 'Regular Unleaded',
        barcode: '123456789',
        category: 'Fuel',
        price: 3.89,
        cost: 3.20,
        quantity_in_stock: 5000,
        min_stock_level: 1000,
        supplier: 'Shell Distributors',
        station_id: stations[0].id
      },
      {
        name: 'Coca-Cola 20oz',
        barcode: '987654321',
        category: 'Food',
        price: 2.49,
        cost: 1.25,
        quantity_in_stock: 120,
        min_stock_level: 20,
        supplier: 'Coca-Cola Company',
        station_id: stations[0].id
      },
      {
        name: 'Marlboro Red',
        barcode: '456789123',
        category: 'Tobacco',
        price: 8.99,
        cost: 6.50,
        quantity_in_stock: 50,
        min_stock_level: 10,
        supplier: 'Philip Morris',
        station_id: stations[0].id
      }];


      for (const product of sampleProducts) {
        const { error } = await productService.create(product);
        if (error) throw error;
        await sleep(300);
      }

      return true;
    } catch (error) {
      console.error('Product migration error:', error);
      return false;
    }
  };

  const migrateVendors = async (): Promise<boolean> => {
    try {
      const sampleVendors = [
      {
        name: 'Shell Distributors',
        contact_person: 'Mike Johnson',
        email: 'mike@shelldist.com',
        phone: '(555) 777-8888',
        address: '789 Industrial Blvd',
        products_supplied: ['Fuel', 'Oil', 'Automotive']
      },
      {
        name: 'Food Service Co',
        contact_person: 'Sarah Wilson',
        email: 'sarah@foodservice.com',
        phone: '(555) 999-0000',
        address: '321 Commerce St',
        products_supplied: ['Food', 'Beverages', 'Snacks']
      }];


      for (const vendor of sampleVendors) {
        const { error } = await vendorService.create(vendor);
        if (error) throw error;
        await sleep(300);
      }

      return true;
    } catch (error) {
      console.error('Vendor migration error:', error);
      return false;
    }
  };

  const migrateSalesReports = async (): Promise<boolean> => {
    try {
      const { data: stations } = await stationService.getAll();
      const { data: employees } = await employeeService.getAll();

      if (!stations?.length || !employees?.length) {
        throw new Error('Required data not available');
      }

      const sampleReports = [
      {
        report_date: new Date().toISOString().split('T')[0],
        shift: 'Day',
        station_id: stations[0].id,
        employee_id: employees[0].id,
        total_sales: 2450.75,
        cash_sales: 850.25,
        card_sales: 1600.50,
        fuel_sales: 1800.00,
        retail_sales: 650.75,
        status: 'Completed'
      }];


      for (const report of sampleReports) {
        const { error } = await salesReportService.create(report);
        if (error) throw error;
        await sleep(300);
      }

      return true;
    } catch (error) {
      console.error('Sales report migration error:', error);
      return false;
    }
  };

  const migrateDeliveries = async (): Promise<boolean> => {
    try {
      const { data: stations } = await stationService.getAll();
      const { data: employees } = await employeeService.getAll();

      if (!stations?.length || !employees?.length) {
        throw new Error('Required data not available');
      }

      const sampleDeliveries = [
      {
        delivery_date: new Date().toISOString().split('T')[0],
        station_id: stations[0].id,
        supplier: 'Shell Distributors',
        delivery_type: 'Fuel',
        product_name: 'Regular Unleaded',
        quantity: 2000,
        unit_price: 3.20,
        total_cost: 6400,
        invoice_number: 'INV-2024001',
        received_by: employees[0].id,
        status: 'Completed'
      }];


      for (const delivery of sampleDeliveries) {
        const { error } = await deliveryService.create(delivery);
        if (error) throw error;
        await sleep(300);
      }

      return true;
    } catch (error) {
      console.error('Delivery migration error:', error);
      return false;
    }
  };

  const migrateLicenses = async (): Promise<boolean> => {
    try {
      const { data: stations } = await stationService.getAll();
      if (!stations?.length) throw new Error('No stations available');

      const sampleLicenses = [
      {
        license_type: 'Business License',
        license_number: 'BL-2024-001',
        station_id: stations[0].id,
        issue_date: '2024-01-01',
        expiry_date: '2024-12-31',
        issuing_authority: 'City Business Department',
        status: 'Active',
        renewal_cost: 250.00
      },
      {
        license_type: 'Fuel Retail License',
        license_number: 'FR-2024-001',
        station_id: stations[0].id,
        issue_date: '2024-01-01',
        expiry_date: '2025-01-01',
        issuing_authority: 'State Energy Department',
        status: 'Active',
        renewal_cost: 500.00
      }];


      for (const license of sampleLicenses) {
        const { error } = await licenseService.create(license);
        if (error) throw error;
        await sleep(300);
      }

      return true;
    } catch (error) {
      console.error('License migration error:', error);
      return false;
    }
  };

  const migrateOrders = async (): Promise<boolean> => {
    try {
      const { data: stations } = await stationService.getAll();
      const { data: employees } = await employeeService.getAll();
      const { data: vendors } = await vendorService.getAll();

      if (!stations?.length || !employees?.length || !vendors?.length) {
        throw new Error('Required data not available');
      }

      const sampleOrders = [
      {
        order_number: 'ORD-2024-001',
        vendor_id: vendors[0].id,
        station_id: stations[0].id,
        ordered_by: employees[0].id,
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        total_amount: 1250.00,
        status: 'Pending',
        items: [
        { product: 'Motor Oil 5W-30', quantity: 24, unit_price: 25.00 },
        { product: 'Windshield Fluid', quantity: 12, unit_price: 8.50 }]

      }];


      for (const order of sampleOrders) {
        const { error } = await orderService.create(order);
        if (error) throw error;
        await sleep(300);
      }

      return true;
    } catch (error) {
      console.error('Order migration error:', error);
      return false;
    }
  };

  const runMigration = async () => {
    if (!isAdmin()) {
      alert('Only administrators can run data migration');
      return;
    }

    setIsRunning(true);
    let completedSteps = 0;

    const migrationFunctions = {
      stations: migrateStations,
      user_profiles: migrateUserProfiles,
      employees: migrateEmployees,
      products: migrateProducts,
      vendors: migrateVendors,
      sales_reports: migrateSalesReports,
      deliveries: migrateDeliveries,
      licenses: migrateLicenses,
      orders: migrateOrders
    };

    for (const step of migrationSteps) {
      setCurrentStep(step.name);
      updateStepStatus(step.id, 'running');

      try {
        const migrationFunction = migrationFunctions[step.id as keyof typeof migrationFunctions];
        const success = await migrationFunction();

        if (success) {
          updateStepStatus(step.id, 'completed');
          completedSteps++;
        } else {
          updateStepStatus(step.id, 'error', 0, 'Migration failed');
        }
      } catch (error: any) {
        updateStepStatus(step.id, 'error', 0, error.message);
      }

      setOverallProgress(completedSteps / migrationSteps.length * 100);
      await sleep(1000); // Small delay between steps
    }

    setIsRunning(false);
    setCurrentStep('');
  };

  const resetMigration = () => {
    setMigrationSteps((prev) => prev.map((step) => ({ ...step, status: 'pending' as const, count: undefined, error: undefined })));
    setOverallProgress(0);
    setCurrentStep('');
  };

  if (!isAdmin()) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only administrators can access the data migration tool.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>);

  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Migration Tool
          </CardTitle>
          <CardDescription>
            Migrate existing data from EZSite APIs to Supabase database. This will create sample data for testing and development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This tool will create sample data in your Supabase database. Run this only once or reset existing data first.
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button
                onClick={runMigration}
                disabled={isRunning}
                className="flex items-center gap-2">

                {isRunning ?
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running Migration...
                  </> :

                <>
                    <Upload className="h-4 w-4" />
                    Start Migration
                  </>
                }
              </Button>

              <Button
                onClick={resetMigration}
                variant="outline"
                disabled={isRunning}
                className="flex items-center gap-2">

                <RefreshCw className="h-4 w-4" />
                Reset Status
              </Button>
            </div>

            {isRunning &&
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Migration Progress</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
                {currentStep &&
              <p className="text-sm text-gray-600">Currently migrating: {currentStep}</p>
              }
              </div>
            }
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Migration Steps</CardTitle>
          <CardDescription>
            Progress of individual migration components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {migrationSteps.map((step) =>
            <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    {step.status === 'running' ?
                  <Loader2 className="h-4 w-4 animate-spin" /> :
                  step.status === 'completed' ?
                  <CheckCircle className="h-4 w-4 text-green-600" /> :
                  step.status === 'error' ?
                  <AlertCircle className="h-4 w-4 text-red-600" /> :

                  step.icon
                  }
                  </div>
                  <div>
                    <h4 className="font-medium">{step.name}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    {step.error &&
                  <p className="text-sm text-red-600 mt-1">{step.error}</p>
                  }
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {step.count !== undefined &&
                <span className="text-sm text-gray-500">{step.count} items</span>
                }
                  <Badge
                  variant={
                  step.status === 'completed' ? 'default' :
                  step.status === 'running' ? 'secondary' :
                  step.status === 'error' ? 'destructive' :
                  'outline'
                  }>

                    {step.status}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default DataMigrationTool;