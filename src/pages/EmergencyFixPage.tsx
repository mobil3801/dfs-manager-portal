import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Wrench, CheckCircle, ArrowRight } from 'lucide-react';
import FixedAdminSetup from '@/components/FixedAdminSetup';

const EmergencyFixPage: React.FC = () => {
  const [showFix, setShowFix] = React.useState(false);

  const criticalErrors = [
  {
    error: "Could not find the 'role' column of 'user_profiles' in the schema cache",
    impact: "Admin profile creation fails",
    status: "CRITICAL"
  },
  {
    error: "K.from(\"module_access\").delete().eq is not a function",
    impact: "Module access setup fails",
    status: "CRITICAL"
  },
  {
    error: "re.from(\"user_profiles\").upsert is not a function",
    impact: "User profile updates fail",
    status: "CRITICAL"
  }];


  if (showFix) {
    return <FixedAdminSetup />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency Database Fix</h1>
          <p className="text-gray-600">
            Critical database and authentication errors detected. Fix required immediately.
          </p>
        </div>

        {/* Error Summary */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Critical Errors Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalErrors.map((error, index) =>
            <Alert key={index} className="border-red-300 bg-red-100">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium text-red-800">{error.error}</p>
                    <p className="text-sm text-red-700">Impact: {error.impact}</p>
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-red-200 text-red-800 rounded">
                      {error.status}
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Fix Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Automated Fix Solution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Fix Database Schema</p>
                  <p className="text-sm text-green-700">Update user_profiles table structure and column names</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Fix Supabase Client</p>
                  <p className="text-sm text-green-700">Resolve client initialization and method call issues</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Setup Admin Access</p>
                  <p className="text-sm text-green-700">Create admin profile and configure module access</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={() => setShowFix(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                size="lg">

                <Wrench className="h-5 w-5 mr-2" />
                Start Emergency Fix Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This emergency fix will update your database schema and 
            create necessary admin configurations. Make sure you're ready to proceed.
          </AlertDescription>
        </Alert>
      </div>
    </div>);

};

export default EmergencyFixPage;