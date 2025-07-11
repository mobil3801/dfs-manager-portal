
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  CheckCircle,
  Code,
  ExternalLink,
  TrendingUp,
  Clock,
  Shield } from
'lucide-react';
import { useNavigate } from 'react-router-dom';
import BuildErrorWidget from '@/components/BuildErrorWidget';

interface BuildErrorDashboardProps {
  className?: string;
}

const BuildErrorDashboard: React.FC<BuildErrorDashboardProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Build Quality Dashboard
          </CardTitle>
          <CardDescription>
            Monitor and manage build errors to ensure code quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Code className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <div className="text-xl font-bold text-blue-600">Build Status</div>
              <div className="text-sm text-gray-600">Current build health</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <div className="text-xl font-bold text-yellow-600">Error History</div>
              <div className="text-sm text-gray-600">Track error trends</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <div className="text-xl font-bold text-green-600">Quality Metrics</div>
              <div className="text-sm text-gray-600">Code quality insights</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Build Error Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BuildErrorWidget className="lg:col-span-1" />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Publishing Gate
            </CardTitle>
            <CardDescription>
              Automated quality control for deployments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Gate Status: ACTIVE</strong>
                  <br />
                  Publishing is protected by our build error gate system.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <h4 className="font-medium">Gate Rules:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• No critical build errors allowed</li>
                  <li>• TypeScript compilation must pass</li>
                  <li>• All tests must pass (when implemented)</li>
                  <li>• Code formatting must be consistent</li>
                </ul>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/admin/build-errors')}>

                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common build management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col"
              onClick={() => navigate('/admin/build-errors')}>

              <Code className="h-6 w-6 mb-2" />
              <span className="text-sm">View All Errors</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto py-4 flex-col"
              onClick={() => window.location.reload()}>

              <CheckCircle className="h-6 w-6 mb-2" />
              <span className="text-sm">Run Build Check</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto py-4 flex-col"
              onClick={() => navigate('/admin/navigation-debug')}>

              <Shield className="h-6 w-6 mb-2" />
              <span className="text-sm">Debug Tools</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto py-4 flex-col"
              onClick={() => navigate('/admin')}>

              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="text-sm">Admin Panel</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default BuildErrorDashboard;