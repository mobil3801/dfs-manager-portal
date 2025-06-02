import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { AccessDenied } from '@/components/AccessDenied';
import AuditLogDashboard from '@/components/AuditLogDashboard';
import AuditLogViewer from '@/components/AuditLogViewer';
import { Shield, Eye, BarChart3, Download, AlertTriangle, Settings } from 'lucide-react';

const AuditMonitoringPage: React.FC = () =&gt; {
  const hasAdminAccess = useAdminAccess();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!hasAdminAccess) {
    return &lt;AccessDenied /&gt;;
  }

  return (
    &lt;div className="space-y-6"&gt;
      {/* Header */}
      &lt;div className="flex items-center justify-between"&gt;
        &lt;div className="flex items-center space-x-2"&gt;
          &lt;Shield className="h-6 w-6 text-blue-600" /&gt;
          &lt;h1 className="text-2xl font-bold"&gt;Audit &amp; Security Monitoring&lt;/h1&gt;
        &lt;/div&gt;
        &lt;div className="flex items-center space-x-2"&gt;
          &lt;Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"&gt;
            &lt;Shield className="h-3 w-3 mr-1" /&gt;
            Active Monitoring
          &lt;/Badge&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {/* Security Overview Cards */}
      &lt;div className="grid grid-cols-1 md:grid-cols-3 gap-6"&gt;
        &lt;Card className="border-blue-200 bg-blue-50"&gt;
          &lt;CardContent className="p-6"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm font-medium text-blue-700"&gt;Monitoring Status&lt;/p&gt;
                &lt;p className="text-2xl font-bold text-blue-800"&gt;Active&lt;/p&gt;
              &lt;/div&gt;
              &lt;Shield className="h-8 w-8 text-blue-600" /&gt;
            &lt;/div&gt;
            &lt;p className="text-xs text-blue-600 mt-2"&gt;
              All access attempts are being logged
            &lt;/p&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        &lt;Card className="border-orange-200 bg-orange-50"&gt;
          &lt;CardContent className="p-6"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm font-medium text-orange-700"&gt;Security Level&lt;/p&gt;
                &lt;p className="text-2xl font-bold text-orange-800"&gt;High&lt;/p&gt;
              &lt;/div&gt;
              &lt;Eye className="h-8 w-8 text-orange-600" /&gt;
            &lt;/div&gt;
            &lt;p className="text-xs text-orange-600 mt-2"&gt;
              Enhanced monitoring enabled
            &lt;/p&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        &lt;Card className="border-green-200 bg-green-50"&gt;
          &lt;CardContent className="p-6"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm font-medium text-green-700"&gt;Compliance&lt;/p&gt;
                &lt;p className="text-2xl font-bold text-green-800"&gt;100%&lt;/p&gt;
              &lt;/div&gt;
              &lt;BarChart3 className="h-8 w-8 text-green-600" /&gt;
            &lt;/div&gt;
            &lt;p className="text-xs text-green-600 mt-2"&gt;
              Meeting security standards
            &lt;/p&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;
      &lt;/div&gt;

      {/* Main Content Tabs */}
      &lt;Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6"&gt;
        &lt;TabsList className="grid w-full grid-cols-4"&gt;
          &lt;TabsTrigger value="dashboard" className="flex items-center space-x-2"&gt;
            &lt;BarChart3 className="h-4 w-4" /&gt;
            &lt;span&gt;Dashboard&lt;/span&gt;
          &lt;/TabsTrigger&gt;
          &lt;TabsTrigger value="logs" className="flex items-center space-x-2"&gt;
            &lt;Eye className="h-4 w-4" /&gt;
            &lt;span&gt;Audit Logs&lt;/span&gt;
          &lt;/TabsTrigger&gt;
          &lt;TabsTrigger value="alerts" className="flex items-center space-x-2"&gt;
            &lt;AlertTriangle className="h-4 w-4" /&gt;
            &lt;span&gt;Security Alerts&lt;/span&gt;
          &lt;/TabsTrigger&gt;
          &lt;TabsTrigger value="settings" className="flex items-center space-x-2"&gt;
            &lt;Settings className="h-4 w-4" /&gt;
            &lt;span&gt;Settings&lt;/span&gt;
          &lt;/TabsTrigger&gt;
        &lt;/TabsList&gt;

        &lt;TabsContent value="dashboard"&gt;
          &lt;AuditLogDashboard /&gt;
        &lt;/TabsContent&gt;

        &lt;TabsContent value="logs"&gt;
          &lt;AuditLogViewer /&gt;
        &lt;/TabsContent&gt;

        &lt;TabsContent value="alerts"&gt;
          &lt;Card&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle className="flex items-center space-x-2"&gt;
                &lt;AlertTriangle className="h-5 w-5 text-orange-500" /&gt;
                &lt;span&gt;Security Alerts Configuration&lt;/span&gt;
              &lt;/CardTitle&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
              &lt;div className="space-y-4"&gt;
                &lt;div className="grid grid-cols-1 md:grid-cols-2 gap-4"&gt;
                  &lt;Card className="border-yellow-200"&gt;
                    &lt;CardContent className="p-4"&gt;
                      &lt;div className="flex items-center justify-between mb-2"&gt;
                        &lt;h4 className="font-medium"&gt;Failed Login Threshold&lt;/h4&gt;
                        &lt;Badge className="bg-yellow-500 text-white"&gt;Active&lt;/Badge&gt;
                      &lt;/div&gt;
                      &lt;p className="text-sm text-muted-foreground"&gt;
                        Alert when more than 5 failed login attempts occur within 15 minutes
                      &lt;/p&gt;
                    &lt;/CardContent&gt;
                  &lt;/Card&gt;

                  &lt;Card className="border-red-200"&gt;
                    &lt;CardContent className="p-4"&gt;
                      &lt;div className="flex items-center justify-between mb-2"&gt;
                        &lt;h4 className="font-medium"&gt;Suspicious Activity Detection&lt;/h4&gt;
                        &lt;Badge className="bg-red-500 text-white"&gt;Active&lt;/Badge&gt;
                      &lt;/div&gt;
                      &lt;p className="text-sm text-muted-foreground"&gt;
                        Monitor for unusual access patterns and data modification attempts
                      &lt;/p&gt;
                    &lt;/CardContent&gt;
                  &lt;/Card&gt;

                  &lt;Card className="border-blue-200"&gt;
                    &lt;CardContent className="p-4"&gt;
                      &lt;div className="flex items-center justify-between mb-2"&gt;
                        &lt;h4 className="font-medium"&gt;Data Access Monitoring&lt;/h4&gt;
                        &lt;Badge className="bg-blue-500 text-white"&gt;Active&lt;/Badge&gt;
                      &lt;/div&gt;
                      &lt;p className="text-sm text-muted-foreground"&gt;
                        Track all sensitive data access and modifications
                      &lt;/p&gt;
                    &lt;/CardContent&gt;
                  &lt;/Card&gt;

                  &lt;Card className="border-purple-200"&gt;
                    &lt;CardContent className="p-4"&gt;
                      &lt;div className="flex items-center justify-between mb-2"&gt;
                        &lt;h4 className="font-medium"&gt;Permission Changes&lt;/h4&gt;
                        &lt;Badge className="bg-purple-500 text-white"&gt;Active&lt;/Badge&gt;
                      &lt;/div&gt;
                      &lt;p className="text-sm text-muted-foreground"&gt;
                        Monitor all user permission and role modifications
                      &lt;/p&gt;
                    &lt;/CardContent&gt;
                  &lt;/Card&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/TabsContent&gt;

        &lt;TabsContent value="settings"&gt;
          &lt;Card&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle className="flex items-center space-x-2"&gt;
                &lt;Settings className="h-5 w-5" /&gt;
                &lt;span&gt;Audit Logging Settings&lt;/span&gt;
              &lt;/CardTitle&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
              &lt;div className="space-y-6"&gt;
                &lt;div&gt;
                  &lt;h4 className="font-medium mb-3"&gt;Logging Configuration&lt;/h4&gt;
                  &lt;div className="grid grid-cols-1 md:grid-cols-2 gap-4"&gt;
                    &lt;div className="space-y-2"&gt;
                      &lt;label className="text-sm font-medium"&gt;Log Retention Period&lt;/label&gt;
                      &lt;div className="p-3 border rounded-md bg-gray-50"&gt;
                        &lt;span className="text-sm"&gt;90 days (recommended)&lt;/span&gt;
                      &lt;/div&gt;
                    &lt;/div&gt;
                    &lt;div className="space-y-2"&gt;
                      &lt;label className="text-sm font-medium"&gt;Log Level&lt;/label&gt;
                      &lt;div className="p-3 border rounded-md bg-gray-50"&gt;
                        &lt;span className="text-sm"&gt;Detailed (All Events)&lt;/span&gt;
                      &lt;/div&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;
                &lt;/div&gt;

                &lt;div&gt;
                  &lt;h4 className="font-medium mb-3"&gt;Monitored Events&lt;/h4&gt;
                  &lt;div className="grid grid-cols-2 md:grid-cols-4 gap-2"&gt;
                    {[
                      'Login Attempts',
                      'Logout Events',
                      'Registration',
                      'Password Resets',
                      'Data Access',
                      'Data Modifications',
                      'Permission Changes',
                      'Admin Actions',
                      'File Uploads',
                      'Report Generation',
                      'System Errors',
                      'Suspicious Activity'
                    ].map((event) =&gt; (
                      &lt;div key={event} className="flex items-center space-x-2 p-2 border rounded-md"&gt;
                        &lt;div className="w-2 h-2 bg-green-500 rounded-full" /&gt;
                        &lt;span className="text-xs"&gt;{event}&lt;/span&gt;
                      &lt;/div&gt;
                    ))}
                  &lt;/div&gt;
                &lt;/div&gt;

                &lt;div&gt;
                  &lt;h4 className="font-medium mb-3"&gt;Export &amp; Compliance&lt;/h4&gt;
                  &lt;div className="flex flex-wrap gap-2"&gt;
                    &lt;Button variant="outline" size="sm"&gt;
                      &lt;Download className="h-4 w-4 mr-2" /&gt;
                      Export Weekly Report
                    &lt;/Button&gt;
                    &lt;Button variant="outline" size="sm"&gt;
                      &lt;Download className="h-4 w-4 mr-2" /&gt;
                      Export Monthly Report
                    &lt;/Button&gt;
                    &lt;Button variant="outline" size="sm"&gt;
                      &lt;Download className="h-4 w-4 mr-2" /&gt;
                      Compliance Report
                    &lt;/Button&gt;
                  &lt;/div&gt;
                &lt;/div&gt;

                &lt;div className="border-t pt-4"&gt;
                  &lt;div className="flex items-center justify-between"&gt;
                    &lt;div&gt;
                      &lt;h4 className="font-medium"&gt;Audit Logging Status&lt;/h4&gt;
                      &lt;p className="text-sm text-muted-foreground"&gt;
                        All security events are being monitored and logged
                      &lt;/p&gt;
                    &lt;/div&gt;
                    &lt;Badge className="bg-green-500 text-white"&gt;
                      &lt;Shield className="h-3 w-3 mr-1" /&gt;
                      Active
                    &lt;/Badge&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/TabsContent&gt;
      &lt;/Tabs&gt;
    &lt;/div&gt;
  );
};

export default AuditMonitoringPage;