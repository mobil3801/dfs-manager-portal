import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Database, Play, CheckCircle, AlertCircle, Users, Building2 } from 'lucide-react';
import { vendorService } from '@/services/vendorService';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

const VendorDatabaseTestPanel: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const sampleVendorData = {
    vendor_name: `Test Vendor ${Date.now()}`,
    contact_person: 'John Test',
    email: 'john.test@example.com',
    phone: '555-TEST-001',
    address: '123 Test Street, Test City, TX 12345',
    category: 'Technology',
    payment_terms: 'Net 30',
    is_active: true,
    station_id: 'DT001',
    documents: []
  };

  const runDatabaseTests = async () => {
    setTesting(true);
    setTestResults([]);

    const tests: TestResult[] = [
      { test: 'Table Connection', status: 'pending', message: 'Checking vendors table...' },
      { test: 'Read Data', status: 'pending', message: 'Reading existing vendors...' },
      { test: 'Create Vendor', status: 'pending', message: 'Creating test vendor...' },
      { test: 'Update Vendor', status: 'pending', message: 'Updating test vendor...' },
      { test: 'Delete Vendor', status: 'pending', message: 'Cleaning up test data...' },
      { test: 'Real-time Subscription', status: 'pending', message: 'Testing real-time updates...' }
    ];

    setTestResults([...tests]);

    let createdVendorId: string | null = null;

    try {
      // Test 1: Table Connection
      try {
        await vendorService.checkTableExists();
        tests[0] = { test: 'Table Connection', status: 'success', message: 'Vendors table is accessible' };
      } catch (error: any) {
        tests[0] = { test: 'Table Connection', status: 'error', message: error.message };
        setTestResults([...tests]);
        return;
      }
      setTestResults([...tests]);

      // Test 2: Read Data
      try {
        const result = await vendorService.getVendors({ limit: 5 });
        tests[1] = { 
          test: 'Read Data', 
          status: 'success', 
          message: `Found ${result.totalCount} vendors in database`,
          data: result.vendors.slice(0, 3).map(v => v.vendor_name)
        };
      } catch (error: any) {
        tests[1] = { test: 'Read Data', status: 'error', message: error.message };
      }
      setTestResults([...tests]);

      // Test 3: Create Vendor
      try {
        const newVendor = await vendorService.createVendor(sampleVendorData);
        createdVendorId = newVendor.id;
        tests[2] = { 
          test: 'Create Vendor', 
          status: 'success', 
          message: `Created vendor: ${newVendor.vendor_name}`,
          data: { id: newVendor.id, name: newVendor.vendor_name }
        };
      } catch (error: any) {
        tests[2] = { test: 'Create Vendor', status: 'error', message: error.message };
      }
      setTestResults([...tests]);

      // Test 4: Update Vendor
      if (createdVendorId) {
        try {
          const updatedVendor = await vendorService.updateVendor(createdVendorId, {
            vendor_name: `${sampleVendorData.vendor_name} - UPDATED`,
            is_active: false
          });
          tests[3] = { 
            test: 'Update Vendor', 
            status: 'success', 
            message: `Updated vendor successfully`,
            data: { name: updatedVendor.vendor_name, active: updatedVendor.is_active }
          };
        } catch (error: any) {
          tests[3] = { test: 'Update Vendor', status: 'error', message: error.message };
        }
      } else {
        tests[3] = { test: 'Update Vendor', status: 'error', message: 'No vendor to update' };
      }
      setTestResults([...tests]);

      // Test 5: Delete Vendor
      if (createdVendorId) {
        try {
          await vendorService.deleteVendor(createdVendorId);
          tests[4] = { test: 'Delete Vendor', status: 'success', message: 'Test vendor deleted successfully' };
        } catch (error: any) {
          tests[4] = { test: 'Delete Vendor', status: 'error', message: error.message };
        }
      } else {
        tests[4] = { test: 'Delete Vendor', status: 'error', message: 'No vendor to delete' };
      }
      setTestResults([...tests]);

      // Test 6: Real-time Subscription
      try {
        const subscription = vendorService.subscribeToVendors(() => {
          console.log('Real-time update received');
        });
        
        if (subscription) {
          setTimeout(() => {
            vendorService.unsubscribeFromVendors(subscription);
          }, 1000);
          
          tests[5] = { test: 'Real-time Subscription', status: 'success', message: 'Real-time subscription working' };
        } else {
          tests[5] = { test: 'Real-time Subscription', status: 'error', message: 'Failed to create subscription' };
        }
      } catch (error: any) {
        tests[5] = { test: 'Real-time Subscription', status: 'error', message: error.message };
      }
      setTestResults([...tests]);

      // Summary toast
      const successCount = tests.filter(t => t.status === 'success').length;
      const totalTests = tests.length;

      toast({
        title: 'Database Tests Complete',
        description: `${successCount}/${totalTests} tests passed successfully`,
        variant: successCount === totalTests ? 'default' : 'destructive'
      });

    } catch (error: any) {
      console.error('Test suite error:', error);
      toast({
        title: 'Test Suite Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const createSampleData = async () => {
    try {
      setTesting(true);
      
      const sampleVendors = [
        {
          vendor_name: 'Metro Fuel Distributors',
          contact_person: 'Sarah Connor',
          email: 'sarah@metrofuel.com',
          phone: '555-METRO-01',
          address: '456 Distribution Ave, Metro City, TX 75101',
          category: 'Fuel Supplier',
          payment_terms: 'Net 30',
          is_active: true,
          station_id: 'DT001'
        },
        {
          vendor_name: 'Snack World Suppliers',
          contact_person: 'Mike Johnson',
          email: 'mike@snackworld.com',
          phone: '555-SNACK-02',
          address: '789 Snack Boulevard, Food City, TX 75102',
          category: 'Food & Beverages',
          payment_terms: 'Net 15',
          is_active: true,
          station_id: 'HW002'
        },
        {
          vendor_name: 'Crystal Clean Services',
          contact_person: 'Anna Martinez',
          email: 'anna@crystalclean.com',
          phone: '555-CLEAN-03',
          address: '321 Clean Street, Sparkle Town, TX 75103',
          category: 'Cleaning Services',
          payment_terms: 'Payment on Delivery',
          is_active: true,
          station_id: 'ALL'
        }
      ];

      let created = 0;
      for (const vendorData of sampleVendors) {
        try {
          await vendorService.createVendor(vendorData);
          created++;
        } catch (error) {
          console.error('Error creating sample vendor:', error);
        }
      }

      toast({
        title: 'Sample Data Created',
        description: `Successfully created ${created}/${sampleVendors.length} sample vendors`,
        variant: 'default'
      });

    } catch (error: any) {
      console.error('Error creating sample data:', error);
      toast({
        title: 'Error',
        description: 'Failed to create sample data',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Database Connection Test Panel</span>
        </CardTitle>
        <CardDescription>
          Test the Supabase database connection and CRUD operations for vendors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Controls */}
        <div className="flex items-center space-x-4">
          <Button 
            onClick={runDatabaseTests} 
            disabled={testing}
            className="flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>{testing ? 'Running Tests...' : 'Run Full Test Suite'}</span>
          </Button>
          
          <Button 
            onClick={createSampleData} 
            disabled={testing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Create Sample Data</span>
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Test Results:</h4>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0 mt-1">
                    {result.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {result.status === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                    {result.status === 'pending' && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{result.test}</span>
                      <Badge 
                        variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    
                    {result.data && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <strong>Data:</strong> {JSON.stringify(result.data, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Testing Instructions</span>
          </h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Run Full Test Suite:</strong> Tests all CRUD operations and real-time features</p>
            <p>• <strong>Create Sample Data:</strong> Adds realistic sample vendors to test forms</p>
            <p>• Check the Vendor List page to see real-time data updates</p>
            <p>• Try creating, editing, and deleting vendors through the forms</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorDatabaseTestPanel;