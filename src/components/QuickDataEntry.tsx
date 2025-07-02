import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Plus, Eye } from 'lucide-react';
import DataManager from './DataManager';
import DataViewer from './DataViewer';

const QuickDataEntry: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [activeTab, setActiveTab] = useState('add');

  // Define the most commonly used tables with their field definitions
  const tableDefinitions = {
    products: {
      id: '11726',
      name: 'Products',
      fields: [
      { name: 'product_name', type: 'String' as const, defaultValue: '', description: 'Name of the product' },
      { name: 'product_code', type: 'String' as const, defaultValue: '', description: 'Unique product identification code' },
      { name: 'category', type: 'String' as const, defaultValue: '', description: 'Product category' },
      { name: 'price', type: 'Number' as const, defaultValue: 0, description: 'Product price' },
      { name: 'quantity_in_stock', type: 'Integer' as const, defaultValue: 0, description: 'Current stock quantity' },
      { name: 'minimum_stock', type: 'Integer' as const, defaultValue: 0, description: 'Minimum stock level for reordering' },
      { name: 'supplier', type: 'String' as const, defaultValue: '', description: 'Product supplier name' },
      { name: 'description', type: 'String' as const, defaultValue: '', description: 'Product description' },
      { name: 'weight', type: 'Number' as const, defaultValue: 0, description: 'Product weight in selected unit' },
      { name: 'weight_unit', type: 'String' as const, defaultValue: 'lb', description: 'Unit of measurement for weight' },
      { name: 'case_price', type: 'Number' as const, defaultValue: 0, description: 'Price per case/bulk unit' },
      { name: 'unit_per_case', type: 'Integer' as const, defaultValue: 1, description: 'Number of individual units in one case' },
      { name: 'unit_price', type: 'Number' as const, defaultValue: 0, description: 'Price per individual unit' },
      { name: 'retail_price', type: 'Number' as const, defaultValue: 0, description: 'Selling price to customers' }]

    },
    employees: {
      id: '11727',
      name: 'Employees',
      fields: [
      { name: 'employee_id', type: 'String' as const, defaultValue: '', description: 'Unique employee identification number' },
      { name: 'first_name', type: 'String' as const, defaultValue: '', description: 'Employee first name' },
      { name: 'last_name', type: 'String' as const, defaultValue: '', description: 'Employee last name' },
      { name: 'email', type: 'String' as const, defaultValue: '', description: 'Employee email address' },
      { name: 'phone', type: 'String' as const, defaultValue: '', description: 'Employee phone number' },
      { name: 'position', type: 'String' as const, defaultValue: '', description: 'Employee job position' },
      { name: 'station', type: 'String' as const, defaultValue: '', description: 'Assigned station: MOBIL, AMOCO ROSEDALE, or AMOCO BROOKLYN' },
      { name: 'hire_date', type: 'DateTime' as const, defaultValue: '', description: 'Date when employee was hired' },
      { name: 'salary', type: 'Number' as const, defaultValue: 0, description: 'Employee salary' },
      { name: 'date_of_birth', type: 'DateTime' as const, defaultValue: '', description: 'Employee date of birth' },
      { name: 'current_address', type: 'String' as const, defaultValue: '', description: 'Employee current residential address' },
      { name: 'is_active', type: 'Bool' as const, defaultValue: true, description: 'Whether the employee is currently active' }]

    },
    vendors: {
      id: '11729',
      name: 'Vendors',
      fields: [
      { name: 'vendor_name', type: 'String' as const, defaultValue: '', description: 'Name of the vendor company' },
      { name: 'contact_person', type: 'String' as const, defaultValue: '', description: 'Primary contact person at vendor' },
      { name: 'email', type: 'String' as const, defaultValue: '', description: 'Vendor email address' },
      { name: 'phone', type: 'String' as const, defaultValue: '', description: 'Vendor phone number' },
      { name: 'address', type: 'String' as const, defaultValue: '', description: 'Vendor physical address' },
      { name: 'category', type: 'String' as const, defaultValue: '', description: 'Type of products/services provided' },
      { name: 'payment_terms', type: 'String' as const, defaultValue: '', description: 'Payment terms and conditions' },
      { name: 'station', type: 'String' as const, defaultValue: '', description: 'Associated station: MOBIL, AMOCO ROSEDALE, or AMOCO BROOKLYN' },
      { name: 'is_active', type: 'Bool' as const, defaultValue: true, description: 'Whether the vendor is currently active' }]

    },
    licenses_certificates: {
      id: '11731',
      name: 'Licenses & Certificates',
      fields: [
      { name: 'license_name', type: 'String' as const, defaultValue: '', description: 'Name of the license or certificate' },
      { name: 'license_number', type: 'String' as const, defaultValue: '', description: 'Official license or certificate number' },
      { name: 'issuing_authority', type: 'String' as const, defaultValue: '', description: 'Organization that issued the license' },
      { name: 'issue_date', type: 'DateTime' as const, defaultValue: '', description: 'Date when license was issued' },
      { name: 'expiry_date', type: 'DateTime' as const, defaultValue: '', description: 'Date when license expires' },
      { name: 'station', type: 'String' as const, defaultValue: '', description: 'Associated station: MOBIL, AMOCO ROSEDALE, AMOCO BROOKLYN, or ALL' },
      { name: 'category', type: 'String' as const, defaultValue: '', description: 'Type of license: Business, Environmental, Safety, etc.' },
      { name: 'status', type: 'String' as const, defaultValue: 'Active', description: 'License status: Active, Expired, Pending Renewal' }]

    },
    stations: {
      id: '12599',
      name: 'Stations',
      fields: [
      { name: 'station_name', type: 'String' as const, defaultValue: '', description: 'Name of the gas station' },
      { name: 'address', type: 'String' as const, defaultValue: '', description: 'Physical address of the station' },
      { name: 'phone', type: 'String' as const, defaultValue: '', description: 'Contact phone number for the station' },
      { name: 'operating_hours', type: 'String' as const, defaultValue: '', description: 'Station operating hours' },
      { name: 'manager_name', type: 'String' as const, defaultValue: '', description: 'Name of the station manager' },
      { name: 'status', type: 'String' as const, defaultValue: 'Active', description: 'Current operational status of the station' }]

    }
  };

  const getCurrentTableData = () => {
    return selectedTable ? tableDefinitions[selectedTable as keyof typeof tableDefinitions] : null;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Database Management</h1>
        <p className="text-lg text-muted-foreground">
          Save and manage your business data efficiently
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Select Table
          </CardTitle>
          <CardDescription>
            Choose which table you want to work with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedTable} onValueChange={setSelectedTable}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a table to manage data" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(tableDefinitions).map(([key, table]) =>
              <SelectItem key={key} value={key}>
                  {table.name}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedTable && getCurrentTableData() &&
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Data
            </TabsTrigger>
            <TabsTrigger value="view" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Data
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="mt-6">
            <DataManager
            tableName={getCurrentTableData()!.name}
            tableId={getCurrentTableData()!.id}
            fields={getCurrentTableData()!.fields}
            onDataSaved={() => {




























              // Optionally switch to view tab after saving
              // setActiveTab('view');
            }} />
          </TabsContent>
          
          <TabsContent value="view" className="mt-6">
            <DataViewer tableName={getCurrentTableData()!.name} tableId={getCurrentTableData()!.id} fields={getCurrentTableData()!.fields} />

          </TabsContent>
        </Tabs>}

      {!selectedTable && <Card className="text-center py-12">
          <CardContent>
            <Database className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Table</h3>
            <p className="text-muted-foreground">
              Choose a table from the dropdown above to start managing your data
            </p>
          </CardContent>
        </Card>}
    </div>);};export default QuickDataEntry;