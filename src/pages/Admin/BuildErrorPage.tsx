
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Code,
  Download,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAccess } from '@/hooks/use-admin-access';
import AccessDenied from '@/components/AccessDenied';
import BuildErrorReport from '@/components/BuildErrorReport';
import { buildErrorManager } from '@/services/buildErrorManager';

const BuildErrorPage: React.FC = () => {
  const { hasAdminAccess } = useAdminAccess();
  const { toast } = useToast();

  if (!hasAdminAccess) {
    return <AccessDenied />;
  }

  const handleExportReport = async () => {
    try {
      const report = await buildErrorManager.exportErrorReport();
      const blob = new Blob([report], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `build-error-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Exported",
        description: "Build error report has been downloaded successfully.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export build error report. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Build Error Management
              </CardTitle>
              <CardDescription>
                Comprehensive build error reporting and resolution system
              </CardDescription>
            </div>
            <Button onClick={handleExportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <div className="text-xl font-bold text-red-600">Error Detection</div>
              <div className="text-sm text-gray-600">Real-time error monitoring</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <div className="text-xl font-bold text-yellow-600">Resolution Guidance</div>
              <div className="text-sm text-gray-600">Step-by-step solutions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <div className="text-xl font-bold text-green-600">Publishing Gate</div>
              <div className="text-sm text-gray-600">Prevent broken deployments</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="report" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="report">Error Report</TabsTrigger>
          <TabsTrigger value="history">Build History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="report" className="space-y-4">
          <BuildErrorReport
            onErrorsResolved={() => {
              toast({
                title: "All Errors Resolved! 🎉",
                description: "Your build is now clean and ready for publishing.",
                variant: "default"
              });
            }}
            preventPublishing={true} />

        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Build History</CardTitle>
              <CardDescription>
                Historical view of build results and error trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Build History</h3>
                <p className="text-gray-600">
                  Build history and analytics will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Build Error Settings</CardTitle>
              <CardDescription>
                Configure error reporting and build gate behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Enable Build Gate</h3>
                    <p className="text-sm text-gray-600">
                      Prevent publishing when build errors are present
                    </p>
                  </div>
                  <Badge variant="outline">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Real-time Monitoring</h3>
                    <p className="text-sm text-gray-600">
                      Monitor build errors in real-time
                    </p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Error Notifications</h3>
                    <p className="text-sm text-gray-600">
                      Send notifications when new errors are detected
                    </p>
                  </div>
                  <Badge variant="outline">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

};

export default BuildErrorPage;