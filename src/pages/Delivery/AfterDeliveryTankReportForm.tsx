import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, ArrowLeft, Thermometer, CheckCircle } from 'lucide-react';

interface AfterDeliveryTankReport {
  id?: number;
  report_date: string;
  station: string;
  delivery_record_id: number | '';
  bol_number: string;
  regular_tank_final: number;
  plus_tank_final: number;
  super_tank_final: number;
  tank_temperature: number;
  verification_status: string;
  discrepancy_notes: string;
  reported_by: string;
  supervisor_approval: boolean;
  additional_notes: string;
  created_by: number;
}

const AfterDeliveryTankReportForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<AfterDeliveryTankReport>({
    report_date: new Date().toISOString().split('T')[0],
    station: '',
    delivery_record_id: '',
    bol_number: '',
    regular_tank_final: 0,
    plus_tank_final: 0,
    super_tank_final: 0,
    tank_temperature: 70,
    verification_status: 'Pending Review',
    discrepancy_notes: '',
    reported_by: '',
    supervisor_approval: false,
    additional_notes: '',
    created_by: 0
  });

  useEffect(() => {
    if (id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage(12331, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'id', op: 'Equal', value: parseInt(id!) }]
      });

      if (error) throw error;

      if (data?.List?.[0]) {
        const report = data.List[0];
        setFormData({
          ...report,
          report_date: report.report_date ? new Date(report.report_date).toISOString().split('T')[0] : ''
        });
      }
    } catch (error) {
      console.error('Error loading report:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tank report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.station || !formData.bol_number || !formData.reported_by) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);

      const submitData = {
        ...formData,
        report_date: new Date(formData.report_date).toISOString(),
        created_by: 1 // This should be the current user ID
      };

      let error;
      if (id) {
        ({ error } = await window.ezsite.apis.tableUpdate(12331, submitData));
      } else {
        ({ error } = await window.ezsite.apis.tableCreate(12331, submitData));
      }

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Tank report ${id ? 'updated' : 'created'} successfully.`
      });

      navigate('/delivery/after-tank-reports');
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: 'Error',
        description: 'Failed to save tank report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof AfterDeliveryTankReport, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tank report...</p>
        </div>
      </div>);

  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/delivery/after-tank-reports')}>

          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit' : 'New'} After Delivery Tank Report
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Report Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report_date">Report Date *</Label>
              <Input
                id="report_date"
                type="date"
                value={formData.report_date}
                onChange={(e) => updateField('report_date', e.target.value)}
                required />

            </div>

            <div className="space-y-2">
              <Label htmlFor="station">Station *</Label>
              <Select value={formData.station} onValueChange={(value) => updateField('station', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOBIL">MOBIL</SelectItem>
                  <SelectItem value="AMOCO ROSEDALE">AMOCO ROSEDALE</SelectItem>
                  <SelectItem value="AMOCO BROOKLYN">AMOCO BROOKLYN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bol_number">BOL Number *</Label>
              <Input
                id="bol_number"
                value={formData.bol_number}
                onChange={(e) => updateField('bol_number', e.target.value)}
                placeholder="Enter BOL number"
                required />

            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_record_id">Delivery Record ID</Label>
              <NumberInput
                id="delivery_record_id"
                value={formData.delivery_record_id}
                onChange={(value) => updateField('delivery_record_id', value)}
                placeholder="Enter delivery record ID" />

            </div>

            <div className="space-y-2">
              <Label htmlFor="reported_by">Reported By *</Label>
              <Input
                id="reported_by"
                value={formData.reported_by}
                onChange={(e) => updateField('reported_by', e.target.value)}
                placeholder="Enter reporter name/ID"
                required />

            </div>

            <div className="space-y-2">
              <Label htmlFor="verification_status">Verification Status</Label>
              <Select value={formData.verification_status} onValueChange={(value) => updateField('verification_status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending Review">Pending Review</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Discrepancy Found">Discrepancy Found</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-orange-600" />
              Tank Measurements
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regular_tank_final">Regular Tank Final Volume (gal)</Label>
              <NumberInput
                id="regular_tank_final"
                value={formData.regular_tank_final}
                onChange={(value) => updateField('regular_tank_final', value)}
                placeholder="0.00"
                step="0.01" />

            </div>

            <div className="space-y-2">
              <Label htmlFor="plus_tank_final">Plus Tank Final Volume (gal)</Label>
              <NumberInput
                id="plus_tank_final"
                value={formData.plus_tank_final}
                onChange={(value) => updateField('plus_tank_final', value)}
                placeholder="0.00"
                step="0.01" />

            </div>

            <div className="space-y-2">
              <Label htmlFor="super_tank_final">Super Tank Final Volume (gal)</Label>
              <NumberInput
                id="super_tank_final"
                value={formData.super_tank_final}
                onChange={(value) => updateField('super_tank_final', value)}
                placeholder="0.00"
                step="0.01" />

            </div>

            <div className="space-y-2">
              <Label htmlFor="tank_temperature">Tank Temperature (°F)</Label>
              <NumberInput
                id="tank_temperature"
                value={formData.tank_temperature}
                onChange={(value) => updateField('tank_temperature', value)}
                placeholder="70"
                step="0.1" />

            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="discrepancy_notes">Discrepancy Notes</Label>
              <Textarea
                id="discrepancy_notes"
                value={formData.discrepancy_notes}
                onChange={(e) => updateField('discrepancy_notes', e.target.value)}
                placeholder="Note any discrepancies found..."
                rows={3} />

            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_notes">Additional Notes</Label>
              <Textarea
                id="additional_notes"
                value={formData.additional_notes}
                onChange={(e) => updateField('additional_notes', e.target.value)}
                placeholder="Any additional observations..."
                rows={3} />

            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="supervisor_approval"
                checked={formData.supervisor_approval}
                onCheckedChange={(checked) => updateField('supervisor_approval', checked)} />

              <Label htmlFor="supervisor_approval">Supervisor Approval</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/delivery/after-tank-reports')}>

            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Report'}
          </Button>
        </div>
      </form>
    </div>);

};

export default AfterDeliveryTankReportForm;