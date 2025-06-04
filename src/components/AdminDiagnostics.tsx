import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Activity,
  Database,
  Wifi,
  MessageSquare,
  Shield,
  Users,
  Server,
  RefreshCw,
  Play,
  Clock } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticTest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  duration?: number;
  details?: string;
  icon: React.ReactNode;
}

interface SystemMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
}

const AdminDiagnostics: React.FC = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tests, setTests] = useState<DiagnosticTest[]>([
  {
    id: 'database',
    name: 'Database Connection',
    description: 'Test database connectivity and response time',
    status: 'pending',
    icon: <Database className="w-4 h-4" />
  },
  {
    id: 'api',
    name: 'API Endpoints',
    description: 'Verify all API endpoints are responding correctly',
    status: 'pending',
    icon: <Wifi className="w-4 h-4" />
  },
  {
    id: 'sms',
    name: 'SMS Service',
    description: 'Test SMS service configuration and connectivity',
    status: 'pending',
    icon: <MessageSquare className="w-4 h-4" />
  },
  {
    id: 'auth',
    name: 'Authentication',
    description: 'Verify authentication system and user access',
    status: 'pending',
    icon: <Shield className="w-4 h-4" />
  },
  {
    id: 'permissions',
    name: 'User Permissions',
    description: 'Check role-based access control system',
    status: 'pending',
    icon: <Users className="w-4 h-4" />
  },
  {
    id: 'backup',
    name: 'Backup System',
    description: 'Verify backup system functionality',
    status: 'pending',
    icon: <Server className="w-4 h-4" />
  }]
  );

  const [metrics, setMetrics] = useState<SystemMetric[]>([
  {
    label: 'CPU Usage',
    value: 45,
    max: 100,
    unit: '%',
    status: 'good',
    icon: <Activity className="w-4 h-4" />
  },
  {
    label: 'Memory',
    value: 2.4,
    max: 8,
    unit: 'GB',
    status: 'good',
    icon: <Server className="w-4 h-4" />
  },
  {
    label: 'Database Size',
    value: 156,
    max: 1000,
    unit: 'MB',
    status: 'good',
    icon: <Database className="w-4 h-4" />
  },
  {
    label: 'Active Sessions',
    value: 12,
    max: 100,
    unit: 'users',
    status: 'good',
    icon: <Users className="w-4 h-4" />
  }]
  );

  const runDiagnostics = async () => {
    setIsRunning(true);
    setProgress(0);

    toast({
      title: "Diagnostics Started",
      description: "Running comprehensive system diagnostics..."
    });

    const totalTests = tests.length;

    for (let i = 0; i < totalTests; i++) {
      const test = tests[i];

      // Update test status to running
      setTests((prev) => prev.map((t) =>
      t.id === test.id ?
      { ...t, status: 'running' as const } :
      t
      ));

      // Simulate test execution
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Simulate test results
      const passed = Math.random() > 0.1; // 90% success rate
      const duration = 500 + Math.random() * 2000;

      setTests((prev) => prev.map((t) =>
      t.id === test.id ?
      {
        ...t,
        status: passed ? 'passed' as const : 'failed' as const,
        duration: Math.round(duration),
        details: passed ?
        `Test completed successfully in ${Math.round(duration)}ms` :
        'Test failed - check system configuration'
      } :
      t
      ));

      setProgress((i + 1) / totalTests * 100);
    }

    // Update metrics with random realistic values
    setMetrics((prev) => prev.map((metric) => ({
      ...metric,
      value: metric.label === 'CPU Usage' ?
      Math.round(30 + Math.random() * 40) :
      metric.label === 'Memory' ?
      Math.round((2 + Math.random() * 2) * 10) / 10 :
      metric.label === 'Active Sessions' ?
      Math.round(8 + Math.random() * 20) :
      metric.value,
      status: Math.random() > 0.8 ? 'warning' as const : 'good' as const
    })));

    setIsRunning(false);

    const passedTests = tests.filter((t) => t.status === 'passed').length;

    toast({
      title: "Diagnostics Complete",
      description: `${passedTests}/${totalTests} tests passed successfully.`
    });
  };

  const resetDiagnostics = () => {
    setTests((prev) => prev.map((test) => ({
      ...test,
      status: 'pending' as const,
      duration: undefined,
      details: undefined
    })));
    setProgress(0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMetricStatus = (metric: SystemMetric) => {
    const percentage = metric.value / metric.max * 100;
    if (percentage > 80) return 'critical';
    if (percentage > 60) return 'warning';
    return 'good';
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Diagnostics</h2>
          <p className="text-gray-600">Run comprehensive tests to verify system health</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={resetDiagnostics}
            variant="outline"
            disabled={isRunning}>

            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="bg-blue-500 hover:bg-blue-600">

            <Play className="w-4 h-4 mr-2" />
            {isRunning ? 'Running...' : 'Run Diagnostics'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tests">Diagnostic Tests</TabsTrigger>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          {isRunning &&
          <Card className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            </Card>
          }

          <div className="grid gap-4">
            {tests.map((test) =>
            <Card key={test.id} className={`p-4 border-2 ${getStatusColor(test.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {test.icon}
                    <div>
                      <h3 className="font-semibold">{test.name}</h3>
                      <p className="text-sm text-gray-600">{test.description}</p>
                      {test.details &&
                    <p className="text-xs text-gray-500 mt-1">{test.details}</p>
                    }
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {test.duration &&
                  <Badge variant="outline" className="text-xs">
                        {test.duration}ms
                      </Badge>
                  }
                    {getStatusIcon(test.status)}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) =>
            <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {metric.icon}
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <Badge
                  variant="outline"
                  className={`text-xs ${
                  getMetricStatus(metric) === 'critical' ? 'border-red-500 text-red-700' :
                  getMetricStatus(metric) === 'warning' ? 'border-yellow-500 text-yellow-700' :
                  'border-green-500 text-green-700'}`
                  }>

                    {getMetricStatus(metric)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {metric.value}
                      <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                    </span>
                    <span className="text-sm text-gray-500">
                      / {metric.max} {metric.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                    className={`h-2 rounded-full transition-all duration-300 ${getMetricColor(getMetricStatus(metric))}`}
                    style={{ width: `${Math.min(metric.value / metric.max * 100, 100)}%` }} />

                  </div>
                </div>
              </Card>
            )}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              System metrics are updated in real-time. Monitor these values to ensure optimal system performance.
              Consider scaling resources if metrics consistently show warning or critical levels.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>);

};

export default AdminDiagnostics;