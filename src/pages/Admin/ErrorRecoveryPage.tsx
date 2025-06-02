import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorRecovery } from '@/components/ErrorBoundary';
import ErrorBoundaryDemo from '@/components/ErrorBoundaryDemo';
import { AlertTriangle, Shield, Bug, TestTube } from 'lucide-react';

const ErrorRecoveryPage: React.FC = () => {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-red-100 rounded-full">
          <Bug className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Error Recovery Center</h1>
          <p className="text-lg text-gray-600">
            Monitor and manage application errors for better stability
          </p>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Boundaries</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">
              Protecting critical components
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Logging</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Enabled</div>
            <p className="text-xs text-muted-foreground">
              Capturing detailed error information
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovery Tools</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Available</div>
            <p className="text-xs text-muted-foreground">
              Export, clear, and analyze errors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demo Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Error Boundary Testing
              </CardTitle>
              <CardDescription>
                Interactive demo to test error boundary functionality
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowDemo(!showDemo)}
              variant={showDemo ? 'secondary' : 'default'}>

              {showDemo ? 'Hide Demo' : 'Show Demo'}
            </Button>
          </div>
        </CardHeader>
        {showDemo &&
        <CardContent>
            <ErrorBoundaryDemo />
          </CardContent>
        }
      </Card>

      {/* Error Recovery Component */}
      <ErrorRecovery />

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Error Boundary Implementation</CardTitle>
          <CardDescription>
            This DFS Manager Portal includes comprehensive error handling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Implemented Error Boundaries:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>Global Error Boundary:</strong> Catches all unhandled errors</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span><strong>Page Error Boundary:</strong> Isolates page-level errors</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span><strong>Form Error Boundary:</strong> Protects critical form components</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span><strong>Component Error Boundary:</strong> Guards individual components</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Error Handling Features:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Graceful fallback UI components</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Detailed error logging and reporting</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Form data recovery capabilities</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>User-friendly error messages</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Error export and analysis tools</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default ErrorRecoveryPage;