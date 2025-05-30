import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { TrendingUp, Save, ArrowLeft, Calculator } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface SalesReportFormData {
  report_date: string;
  station: string;
  total_sales: number;
  cash_sales: number;
  credit_card_sales: number;
  fuel_sales: number;
  convenience_sales: number;
  employee_id: string;
  notes: string;
}

const SalesReportForm: React.FC = () => {
  const [formData, setFormData] = useState<SalesReportFormData>({
    report_date: new Date().toISOString().split('T')[0],
    station: '',
    total_sales: 0,
    cash_sales: 0,
    credit_card_sales: 0,
    fuel_sales: 0,
    convenience_sales: 0,
    employee_id: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const stations = [
  { value: 'MOBIL', label: 'MOBIL (Far Rockaway)' },
  { value: 'AMOCO ROSEDALE', label: 'AMOCO (Rosedale)' },
  { value: 'AMOCO BROOKLYN', label: 'AMOCO (Brooklyn)' }];


  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadReport(parseInt(id));
    }
  }, [id]);

  // Auto-calculate totals when payment methods change
  useEffect(() => {
    const calculatedTotal = formData.cash_sales + formData.credit_card_sales;
    if (Math.abs(calculatedTotal - formData.total_sales) > 0.01) {
      console.log('Auto-calculating total:', { cash: formData.cash_sales, credit: formData.credit_card_sales, calculated: calculatedTotal });
      setFormData((prev) => ({ ...prev, total_sales: calculatedTotal }));
    }
  }, [formData.cash_sales, formData.credit_card_sales]);
  
  // Auto-validate category totals
  useEffect(() => {
    const categoryTotal = formData.fuel_sales + formData.convenience_sales;
    if (categoryTotal > formData.total_sales + 0.01) {
      console.warn('Category total exceeds total sales:', { fuel: formData.fuel_sales, convenience: formData.convenience_sales, total: formData.total_sales });
    }
  }, [formData.fuel_sales, formData.convenience_sales, formData.total_sales]);

  const loadReport = async (reportId: number) => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage('11728', {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'ID', op: 'Equal', value: reportId }]
      });

      if (error) throw error;

      if (data && data.List && data.List.length > 0) {
        const report = data.List[0];
        setFormData({
          report_date: report.report_date ? report.report_date.split('T')[0] : '',
          station: report.station || '',
          total_sales: report.total_sales || 0,
          cash_sales: report.cash_sales || 0,
          credit_card_sales: report.credit_card_sales || 0,
          fuel_sales: report.fuel_sales || 0,
          convenience_sales: report.convenience_sales || 0,
          employee_id: report.employee_id || '',
          notes: report.notes || ''
        });
      }
    } catch (error) {
      console.error('Error loading sales report:', error);
      toast({
        title: "Error",
        description: "Failed to load sales report details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enhanced validation with better error messages
    const categoryTotal = formData.fuel_sales + formData.convenience_sales;
    const paymentTotal = formData.cash_sales + formData.credit_card_sales;
    
    console.log('Form validation:', {
      categoryTotal,
      paymentTotal,
      totalSales: formData.total_sales,
      categoryValid: categoryTotal <= formData.total_sales + 0.01,
      paymentValid: Math.abs(paymentTotal - formData.total_sales) <= 0.01
    });
    
    if (categoryTotal > formData.total_sales + 0.01) {
      toast({
        title: "Validation Error",
        description: `Category breakdown (${formatCurrency(categoryTotal)}) exceeds total sales (${formatCurrency(formData.total_sales)}). Please adjust the amounts.`,
        variant: "destructive"
      });
      return;
    }

    if (Math.abs(paymentTotal - formData.total_sales) > 0.01) {
      toast({
        title: "Validation Error",
        description: `Payment methods total (${formatCurrency(paymentTotal)}) must equal total sales (${formatCurrency(formData.total_sales)}).`,
        variant: "destructive"
      });
      return;
    }
    
    // Additional validation checks
    if (formData.total_sales <= 0) {
      toast({
        title: "Validation Error",
        description: "Total sales must be greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.cash_sales < 0 || formData.credit_card_sales < 0 || formData.fuel_sales < 0 || formData.convenience_sales < 0) {
      toast({
        title: "Validation Error",
        description: "All sales amounts must be non-negative.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const dataToSubmit = {
        ...formData,
        report_date: formData.report_date ? new Date(formData.report_date).toISOString() : '',
        created_by: 1
      };

      if (isEditing && id) {
        const { error } = await window.ezsite.apis.tableUpdate('11728', {
          ID: parseInt(id),
          ...dataToSubmit
        });
        if (error) throw error;

        toast({
          title: "Success",
          description: "Sales report updated successfully"
        });
      } else {
        const { error } = await window.ezsite.apis.tableCreate('11728', dataToSubmit);
        if (error) throw error;

        toast({
          title: "Success",
          description: "Sales report created successfully"
        });
      }

      navigate('/sales');
    } catch (error) {
      console.error('Error saving sales report:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} sales report`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SalesReportFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateMissingValue = () => {
    const calculatedConvenience = formData.total_sales - formData.fuel_sales;
    if (calculatedConvenience >= 0) {
      console.log('Auto-calculating convenience sales:', { total: formData.total_sales, fuel: formData.fuel_sales, calculated: calculatedConvenience });
      setFormData((prev) => ({ ...prev, convenience_sales: calculatedConvenience }));
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6" />
                <span>{isEditing ? 'Edit Sales Report' : 'Add Daily Sales Report'}</span>
              </CardTitle>
              <CardDescription>
                {isEditing ? 'Update daily sales information' : 'Record daily sales performance'}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('/sales')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="report_date">Report Date *</Label>
                <Input
                  id="report_date"
                  type="date"
                  value={formData.report_date}
                  onChange={(e) => handleInputChange('report_date', e.target.value)}
                  required />

              </div>

              <div className="space-y-2">
                <Label htmlFor="station">Station *</Label>
                <Select value={formData.station} onValueChange={(value) => handleInputChange('station', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) =>
                    <SelectItem key={station.value} value={station.value}>
                        {station.label}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => handleInputChange('employee_id', e.target.value)}
                  placeholder="Enter employee ID" />

              </div>
            </div>

            {/* Sales Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sales Breakdown</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4 bg-green-50 border-green-200">
                  <h4 className="font-medium text-green-800 mb-3">Payment Methods</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="cash_sales">Cash Sales ($) *</Label>
                      <Input
                        id="cash_sales"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.cash_sales}
                        onChange={(e) => handleInputChange('cash_sales', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        required />

                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="credit_card_sales">Credit Card Sales ($) *</Label>
                      <Input
                        id="credit_card_sales"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.credit_card_sales}
                        onChange={(e) => handleInputChange('credit_card_sales', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        required />

                    </div>
                    
                    <div className="pt-2 border-t border-green-200">
                      <Label>Total Sales (Auto-calculated)</Label>
                      <div className="flex items-center space-x-2">
                        <div className="text-lg font-bold text-green-800">
                          ${formData.total_sales.toFixed(2)}
                        </div>
                        <span className="text-green-600 text-sm">✓ Accurate</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Cash + Credit = {formatCurrency(formData.cash_sales + formData.credit_card_sales)}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3">Sales Categories</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="fuel_sales">Fuel Sales ($) *</Label>
                      <Input
                        id="fuel_sales"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.fuel_sales}
                        onChange={(e) => handleInputChange('fuel_sales', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        required />

                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="convenience_sales">Convenience Sales ($) *</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="convenience_sales"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.convenience_sales}
                          onChange={(e) => handleInputChange('convenience_sales', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          required />

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={calculateMissingValue}
                          title="Auto-calculate convenience sales">

                          <Calculator className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-blue-200">
                      <Label>Category Total</Label>
                      <div className="flex items-center space-x-2">
                        <div className="text-lg font-bold text-blue-800">
                          ${(formData.fuel_sales + formData.convenience_sales).toFixed(2)}
                        </div>
                        {(() => {
                          const categoryTotal = formData.fuel_sales + formData.convenience_sales;
                          const isValid = categoryTotal <= formData.total_sales + 0.01;
                          const remaining = formData.total_sales - categoryTotal;
                          
                          return isValid ? 
                            <span className="text-green-600 text-sm">✓ Valid</span> :
                            <span className="text-red-600 text-sm">⚠️ Exceeds total</span>;
                        })()} 
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {(() => {
                          const remaining = formData.total_sales - (formData.fuel_sales + formData.convenience_sales);
                          return remaining >= 0 ? 
                            `Remaining: ${formatCurrency(remaining)}` :
                            `Overrun: ${formatCurrency(Math.abs(remaining))}`;
                        })()} 
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any additional notes about the day's sales..."
                rows={4} />

            </div>

            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/sales')}>

                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ?
                'Saving...' :

                <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Update Report' : 'Create Report'}
                  </>
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>);

};

export default SalesReportForm;