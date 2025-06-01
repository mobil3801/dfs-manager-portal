import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, Truck, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeliveryRecord {
  id: number;
  delivery_date: string;
  bol_number: string;
  station: string;
  regular_tank_volume: number;
  plus_tank_volume: number;
  super_tank_volume: number;
  regular_delivered: number;
  plus_delivered: number;
  super_delivered: number;
  delivery_notes: string;
}

interface AfterDeliveryTankReport {
  id: number;
  delivery_record_id: number;
  bol_number: string;
  station: string;
  regular_tank_final: number;
  plus_tank_final: number;
  super_tank_final: number;
  verification_status: string;
  discrepancy_notes: string;
  report_date: string;
}

interface DiscrepancyAnalysis {
  deliveryRecord: DeliveryRecord;
  afterDeliveryReport?: AfterDeliveryTankReport;
  regularDiscrepancy: number;
  plusDiscrepancy: number;
  superDiscrepancy: number;
  totalDiscrepancy: number;
  hasDiscrepancy: boolean;
  status: 'verified' | 'discrepancy' | 'missing_report';
}

interface DiscrepancyAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DiscrepancyAnalysisDialog: React.FC<DiscrepancyAnalysisDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [analyses, setAnalyses] = useState<DiscrepancyAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalDeliveries: 0,
    verifiedDeliveries: 0,
    discrepancies: 0,
    missingReports: 0,
    totalGallonsDiscrepancy: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadDiscrepancyAnalysis();
    }
  }, [open]);

  const loadDiscrepancyAnalysis = async () => {
    try {
      setLoading(true);

      // Load all delivery records from the last 30 days
      const deliveryEndDate = new Date();
      const deliveryStartDate = new Date();
      deliveryStartDate.setDate(deliveryStartDate.getDate() - 30);

      const { data: deliveryData, error: deliveryError } = await window.ezsite.apis.tablePage(12196, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'delivery_date',
        IsAsc: false,
        Filters: [
          {
            name: 'delivery_date',
            op: 'GreaterThanOrEqual',
            value: deliveryStartDate.toISOString()
          }
        ]
      });

      if (deliveryError) throw deliveryError;

      // Load all after delivery tank reports
      const { data: reportData, error: reportError } = await window.ezsite.apis.tablePage(12331, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'report_date',
        IsAsc: false
      });

      if (reportError) throw reportError;

      const deliveries = deliveryData?.List || [];
      const reports = reportData?.List || [];

      // Create analyses
      const analysisResults: DiscrepancyAnalysis[] = deliveries.map((delivery: DeliveryRecord) => {
        const matchingReport = reports.find((report: AfterDeliveryTankReport) => 
          report.bol_number === delivery.bol_number || 
          report.delivery_record_id === delivery.id
        );

        if (!matchingReport) {
          return {
            deliveryRecord: delivery,
            regularDiscrepancy: 0,
            plusDiscrepancy: 0,
            superDiscrepancy: 0,
            totalDiscrepancy: 0,
            hasDiscrepancy: false,
            status: 'missing_report' as const
          };
        }

        // Calculate expected tank levels after delivery
        const expectedRegular = delivery.regular_tank_volume + delivery.regular_delivered;
        const expectedPlus = delivery.plus_tank_volume + delivery.plus_delivered;
        const expectedSuper = delivery.super_tank_volume + delivery.super_delivered;

        // Calculate discrepancies
        const regularDiscrepancy = matchingReport.regular_tank_final - expectedRegular;
        const plusDiscrepancy = matchingReport.plus_tank_final - expectedPlus;
        const superDiscrepancy = matchingReport.super_tank_final - expectedSuper;
        const totalDiscrepancy = Math.abs(regularDiscrepancy) + Math.abs(plusDiscrepancy) + Math.abs(superDiscrepancy);

        // Threshold for significant discrepancy (5 gallons)
        const discrepancyThreshold = 5;
        const hasDiscrepancy = totalDiscrepancy > discrepancyThreshold;

        return {
          deliveryRecord: delivery,
          afterDeliveryReport: matchingReport,
          regularDiscrepancy,
          plusDiscrepancy,
          superDiscrepancy,
          totalDiscrepancy,
          hasDiscrepancy,
          status: hasDiscrepancy ? 'discrepancy' as const : 'verified' as const
        };
      });

      // Calculate summary
      const newSummary = {
        totalDeliveries: deliveries.length,
        verifiedDeliveries: analysisResults.filter(a => a.status === 'verified').length,
        discrepancies: analysisResults.filter(a => a.status === 'discrepancy').length,
        missingReports: analysisResults.filter(a => a.status === 'missing_report').length,
        totalGallonsDiscrepancy: analysisResults.reduce((sum, a) => sum + a.totalDiscrepancy, 0)
      };

      setAnalyses(analysisResults);
      setSummary(newSummary);

    } catch (error) {
      console.error('Error loading discrepancy analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to load discrepancy analysis',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'discrepancy':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'missing_report':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'discrepancy':
        return <Badge className="bg-red-100 text-red-800">Discrepancy Found</Badge>;
      case 'missing_report':
        return <Badge className="bg-gray-100 text-gray-800">Missing Report</Badge>;
      default:
        return null;
    }
  };

  const formatDiscrepancy = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)} gal`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Analyzing delivery discrepancies...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-600" />
            Delivery Discrepancy Analysis Report
          </DialogTitle>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 my-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{summary.totalDeliveries}</div>
              <p className="text-sm text-gray-600">Total Deliveries</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{summary.verifiedDeliveries}</div>
              <p className="text-sm text-gray-600">Verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">{summary.discrepancies}</div>
              <p className="text-sm text-gray-600">Discrepancies</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-gray-600">{summary.missingReports}</div>
              <p className="text-sm text-gray-600">Missing Reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-orange-600">{summary.totalGallonsDiscrepancy.toFixed(1)}</div>
              <p className="text-sm text-gray-600">Total Discrepancy (gal)</p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Detailed Analysis Table */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-3">Detailed Analysis (Last 30 Days)</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>BOL Number</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Regular Discrepancy</TableHead>
                  <TableHead>Plus Discrepancy</TableHead>
                  <TableHead>Super Discrepancy</TableHead>
                  <TableHead>Total Discrepancy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.map((analysis, index) => (
                  <TableRow key={analysis.deliveryRecord.id} className={
                    analysis.status === 'discrepancy' ? 'bg-red-50' :
                    analysis.status === 'missing_report' ? 'bg-gray-50' : ''
                  }>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(analysis.status)}
                        {getStatusBadge(analysis.status)}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(analysis.deliveryRecord.delivery_date)}</TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {analysis.deliveryRecord.bol_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        analysis.deliveryRecord.station === 'MOBIL' ? 'bg-red-100 text-red-800' :
                        analysis.deliveryRecord.station === 'AMOCO ROSEDALE' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {analysis.deliveryRecord.station}
                      </Badge>
                    </TableCell>
                    <TableCell className={
                      analysis.status === 'missing_report' ? 'text-gray-400' :
                      Math.abs(analysis.regularDiscrepancy) > 2 ? 'text-red-600 font-medium' : 'text-gray-600'
                    }>
                      {analysis.status === 'missing_report' ? 'N/A' : formatDiscrepancy(analysis.regularDiscrepancy)}
                    </TableCell>
                    <TableCell className={
                      analysis.status === 'missing_report' ? 'text-gray-400' :
                      Math.abs(analysis.plusDiscrepancy) > 2 ? 'text-red-600 font-medium' : 'text-gray-600'
                    }>
                      {analysis.status === 'missing_report' ? 'N/A' : formatDiscrepancy(analysis.plusDiscrepancy)}
                    </TableCell>
                    <TableCell className={
                      analysis.status === 'missing_report' ? 'text-gray-400' :
                      Math.abs(analysis.superDiscrepancy) > 2 ? 'text-red-600 font-medium' : 'text-gray-600'
                    }>
                      {analysis.status === 'missing_report' ? 'N/A' : formatDiscrepancy(analysis.superDiscrepancy)}
                    </TableCell>
                    <TableCell className={
                      analysis.status === 'missing_report' ? 'text-gray-400' :
                      analysis.totalDiscrepancy > 5 ? 'text-red-600 font-bold' : 'text-gray-600'
                    }>
                      {analysis.status === 'missing_report' ? 'N/A' : `${analysis.totalDiscrepancy.toFixed(2)} gal`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiscrepancyAnalysisDialog;