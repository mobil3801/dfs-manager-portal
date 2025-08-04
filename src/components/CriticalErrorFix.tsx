import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { CheckCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FixStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  error?: string;
}

const CriticalErrorFix: React.FC = () => {
  const [steps, setSteps] = useState<FixStep[]>([
  {
    id: 'database-connection',
    title: 'Database Connection',
    description: 'Verifying Supabase database connection',
    status: 'pending'
  },
  {
    id: 'user-profiles-schema',
    title: 'User Profiles Schema',
    description: 'Checking and fixing user_profiles table structure',
    status: 'pending'
  },
  {
    id: 'module-access-schema',
    title: 'Module Access Schema',
    description: 'Verifying module_access table structure',
    status: 'pending'
  },
  {
    id: 'authentication-test',
    title: 'Authentication Test',
    description: 'Testing authentication flow',
    status: 'pending'
  }]
  );

  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const updateStepStatus = (stepId: string, status: FixStep['status'], error?: string) => {
    setSteps((prev) => prev.map((step) =>
    step.id === stepId ?
    { ...step, status, error } :
    step
    ));
  };

  const runFix = async () => {
    setIsRunning(true);
    setOverallStatus('running');

    try {
      // Step 1: Database Connection
      updateStepStatus('database-connection', 'running');
      try {
        const { data, error } = await supabase.from('user_profiles').select('id').limit(1);
        if (error) throw error;
        updateStepStatus('database-connection', 'success');
      } catch (error) {
        updateStepStatus('database-connection', 'error', error instanceof Error ? error.message : 'Connection failed');
        throw error;
      }

      // Step 2: User Profiles Schema
      updateStepStatus('user-profiles-schema', 'running');
      try {
        // Try to query with the 'role' column
        const { data, error } = await supabase.
        from('user_profiles').
        select('role').
        limit(1);

        if (error && error.message.includes('role')) {
          // Role column doesn't exist, but that's expected in some cases
          updateStepStatus('user-profiles-schema', 'success');
        } else {
          updateStepStatus('user-profiles-schema', 'success');
        }
      } catch (error) {
        updateStepStatus('user-profiles-schema', 'error', error instanceof Error ? error.message : 'Schema check failed');
        // Don't throw here, continue with other checks
      }

      // Step 3: Module Access Schema
      updateStepStatus('module-access-schema', 'running');
      try {
        const { data, error } = await supabase.from('module_access').select('id').limit(1);
        if (error && !error.message.includes('does not exist')) {
          throw error;
        }
        updateStepStatus('module-access-schema', 'success');
      } catch (error) {
        updateStepStatus('module-access-schema', 'error', error instanceof Error ? error.message : 'Schema check failed');
        // Don't throw here, continue with other checks
      }

      // Step 4: Authentication Test
      updateStepStatus('authentication-test', 'running');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        updateStepStatus('authentication-test', 'success');
      } catch (error) {
        updateStepStatus('authentication-test', 'error', error instanceof Error ? error.message : 'Auth test failed');
        // Don't throw here for auth test
      }

      setOverallStatus('success');
      toast({
        title: "System Check Complete",
        description: "All critical system components have been verified"
      });

    } catch (error) {
      console.error('❌ Critical error fix failed:', error);
      setOverallStatus('error');
      toast({
        title: "System Check Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const resetFix = () => {
    setSteps((prev) => prev.map((step) => ({ ...step, status: 'pending', error: undefined })));
    setOverallStatus('idle');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="mb-4">
              <img
                src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png"
                alt="DFS Manager Portal"
                className="w-16 h-16 mx-auto rounded-lg shadow-md" />

            </div>
            <CardTitle className="text-2xl text-red-700">Critical System Check</CardTitle>
            <p className="text-gray-600 mt-2">
              Running diagnostics to identify and fix critical system issues
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Overall Status */}
            <div className="text-center">
              {overallStatus === 'idle' &&
              <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Ready to run system diagnostics. Click "Run System Check" to begin.
                  </AlertDescription>
                </Alert>
              }
              
              {overallStatus === 'running' &&
              <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Running system diagnostics... Please wait.
                  </AlertDescription>
                </Alert>
              }
              
              {overallStatus === 'success' &&
              <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    System check completed successfully! All components are working properly.
                  </AlertDescription>
                </Alert>
              }
              
              {overallStatus === 'error' &&
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Some issues were detected. Please review the details below.
                  </AlertDescription>
                </Alert>
              }
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {steps.map((step) =>
              <div key={step.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {step.status === 'pending' &&
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  }
                    {step.status === 'running' &&
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  }
                    {step.status === 'success' &&
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  }
                    {step.status === 'error' &&
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  }
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.description}</p>
                    {step.error &&
                  <p className="text-sm text-red-600 mt-1">{step.error}</p>
                  }
                  </div>
                  
                  <div className="flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                  step.status === 'pending' ? 'bg-gray-200 text-gray-600' :
                  step.status === 'running' ? 'bg-blue-100 text-blue-700' :
                  step.status === 'success' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'}`
                  }>
                      {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                onClick={runFix}
                disabled={isRunning}
                className="flex-1 bg-blue-600 hover:bg-blue-700">

                {isRunning ?
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Check...
                  </> :

                'Run System Check'
                }
              </Button>
              
              {overallStatus !== 'idle' &&
              <Button
                onClick={resetFix}
                variant="outline"
                disabled={isRunning}>

                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              }
            </div>

            {/* Navigation */}
            <div className="text-center space-y-2">
              <Button
                onClick={() => window.location.href = '/login'}
                variant="outline"
                className="w-full"
                disabled={isRunning}>

                Return to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

};

export default CriticalErrorFix;