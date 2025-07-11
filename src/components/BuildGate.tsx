
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  AlertTriangle,
  Lock,
  CheckCircle,
  RefreshCw,
  X } from
'lucide-react';

interface BuildGateProps {
  errorCount: number;
  onResolveAll: () => void;
  className?: string;
}

const BuildGate: React.FC<BuildGateProps> = ({
  errorCount,
  onResolveAll,
  className = ''
}) => {
  const getGateStatus = () => {
    if (errorCount === 0) {
      return {
        status: 'pass',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: CheckCircle,
        title: 'Build Gate: PASSED ✅',
        description: 'All errors resolved. Ready for publishing!'
      };
    }

    return {
      status: 'fail',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: Lock,
      title: 'Build Gate: BLOCKED 🚫',
      description: 'Publishing is blocked due to build errors.'
    };
  };

  const gate = getGateStatus();
  const IconComponent = gate.icon;

  return (
    <div className={`space-y-4 ${className}`}>
      <Alert className={`${gate.bgColor} ${gate.borderColor}`}>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-start justify-between">
            <div>
              <strong className={gate.color}>Publishing Gate Active</strong>
              <p className="text-sm mt-1">
                This system prevents deployment when build errors are present.
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Card className={`${gate.bgColor} ${gate.borderColor}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconComponent className={`h-5 w-5 ${gate.color}`} />
            {gate.title}
          </CardTitle>
          <CardDescription>
            {gate.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${gate.color}`}>
                  {errorCount}
                </div>
                <div className="text-sm text-gray-600">
                  Blocking Errors
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${errorCount === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {errorCount === 0 ? '✅' : '❌'}
                </div>
                <div className="text-sm text-gray-600">
                  Gate Status
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Resolution Progress</span>
                <span>{errorCount === 0 ? '100%' : '0%'}</span>
              </div>
              <Progress
                value={errorCount === 0 ? 100 : 0}
                className="w-full" />

            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={onResolveAll}
                variant={errorCount === 0 ? "default" : "destructive"}
                className="flex-1">

                <RefreshCw className="h-4 w-4 mr-2" />
                {errorCount === 0 ? 'Verify Build' : 'Resolve All Errors'}
              </Button>
            </div>

            {/* Gate Rules */}
            <div className="bg-white bg-opacity-50 rounded-lg p-3 text-sm">
              <h4 className="font-medium mb-2">Gate Rules:</h4>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${errorCount === 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                  No build errors allowed
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  Warnings are permitted but discouraged
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  All tests must pass
                </li>
              </ul>
            </div>

            {/* Next Steps */}
            {errorCount > 0 &&
            <div className="bg-white bg-opacity-50 rounded-lg p-3 text-sm">
                <h4 className="font-medium mb-2">Next Steps:</h4>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>Review error details above</li>
                  <li>Fix each error following the provided guidance</li>
                  <li>Run build check to verify fixes</li>
                  <li>Repeat until all errors are resolved</li>
                </ol>
              </div>
            }
          </div>
        </CardContent>
      </Card>
    </div>);

};

export { BuildGate };