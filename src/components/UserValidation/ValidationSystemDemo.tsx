import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Users, 
  Mail,
  TestTube,
  Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserValidation } from '@/hooks/use-user-validation';

const ValidationSystemDemo: React.FC = () => {
  const [testData, setTestData] = useState({
    email: '',
    role: 'Employee',
    station: 'MOBIL',
    user_id: 999
  });
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const { toast } = useToast();
  const { 
    validateUser, 
    validateEmail, 
    checkRoleConflicts, 
    canDeleteUser,
    validationErrors,
    hasValidationErrors 
  } = useUserValidation({ showToasts: false });

  const runDemo = async () => {
    setIsRunning(true);
    setResults([]);

    const demoResults = [];

    try {
      // Test 1: Email Uniqueness
      const emailResult = await validateEmail(testData.email || 'test@example.com');
      demoResults.push({
        test: 'Email Uniqueness',
        passed: emailResult,
        message: emailResult ? 'Email is unique' : 'Email already exists',
        icon: emailResult ? CheckCircle : XCircle,
        color: emailResult ? 'text-green-600' : 'text-red-600'
      });

      // Test 2: Role Validation
      const roleErrors = await validateUser(testData);
      const roleValid = roleErrors.length === 0;
      demoResults.push({
        test: 'Role Validation',
        passed: roleValid,
        message: roleValid ? 'Role assignment valid' : 'Role conflicts detected',
        icon: roleValid ? CheckCircle : XCircle,
        color: roleValid ? 'text-green-600' : 'text-red-600'
      });

      // Test 3: Admin Protection (with admin@dfs-portal.com)
      const adminCanDelete = await canDeleteUser(1, 'admin@dfs-portal.com');
      demoResults.push({
        test: 'Admin Protection',
        passed: !adminCanDelete,
        message: !adminCanDelete ? 'Admin account protected' : 'Admin protection failed',
        icon: !adminCanDelete ? Shield : AlertTriangle,
        color: !adminCanDelete ? 'text-green-600' : 'text-orange-600'
      });

      // Test 4: Role Conflicts
      const conflicts = await checkRoleConflicts(testData.role, testData.station, testData.user_id);
      const noConflicts = conflicts.length === 0;
      demoResults.push({
        test: 'Role Conflicts',
        passed: noConflicts,
        message: noConflicts ? 'No role conflicts' : `${conflicts.length} conflicts found`,
        icon: noConflicts ? CheckCircle : XCircle,
        color: noConflicts ? 'text-green-600' : 'text-red-600'
      });

      setResults(demoResults);

      const passedTests = demoResults.filter(r => r.passed).length;
      toast({
        title: "Demo Complete",
        description: `${passedTests}/${demoResults.length} validation checks passed`,
        variant: passedTests === demoResults.length ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Demo error:', error);
      toast({
        title: "Demo Error",
        description: "Failed to run validation demo",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <TestTube className="h-6 w-6" />
          Live Validation System Demo
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Interactive
          </Badge>
        </CardTitle>
        <p className="text-blue-700">
          Test the user validation system with real-time feedback and protection mechanisms.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Test Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
          <div className="space-y-2">
            <Label htmlFor="demo-email">Test Email</Label>
            <Input
              id="demo-email"
              type="email"
              value={testData.email}
              onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email to test"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="demo-role">Test Role</Label>
            <Select 
              value={testData.role} 
              onValueChange={(value) => setTestData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger id="demo-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Administrator">Administrator</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="demo-station">Test Station</Label>
            <Select 
              value={testData.station} 
              onValueChange={(value) => setTestData(prev => ({ ...prev, station: value }))}
            >
              <SelectTrigger id="demo-station">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MOBIL">MOBIL</SelectItem>
                <SelectItem value="AMOCO ROSEDALE">AMOCO ROSEDALE</SelectItem>
                <SelectItem value="AMOCO BROOKLYN">AMOCO BROOKLYN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={runDemo}
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <TestTube className="h-4 w-4 animate-pulse mr-2" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Validation Demo
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Validation Errors Display */}
        {hasValidationErrors && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              Real-time validation detected {validationErrors.length} issue(s) with current input.
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Validation Results
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.map((result, index) => (
                <Card key={index} className={`p-3 ${result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <result.icon className={`h-4 w-4 ${result.color}`} />
                      <span className="font-medium">{result.test}</span>
                    </div>
                    <Badge variant={result.passed ? "default" : "destructive"}>
                      {result.passed ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* System Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-green-200 bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Email Protection</span>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Duplicate email prevention</li>
              <li>• Real-time validation</li>
              <li>• Cross-table checking</li>
            </ul>
          </Card>

          <Card className="p-4 border-blue-200 bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Role Management</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Conflict detection</li>
              <li>• Single admin enforcement</li>
              <li>• Station-based validation</li>
            </ul>
          </Card>

          <Card className="p-4 border-orange-200 bg-orange-50">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-orange-600" />
              <span className="font-semibold text-orange-800">Admin Security</span>
            </div>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Deletion protection</li>
              <li>• Role change blocking</li>
              <li>• System integrity</li>
            </ul>
          </Card>
        </div>

        {/* Quick Test Buttons */}
        <div className="p-4 bg-white rounded-lg border space-y-3">
          <h4 className="font-semibold">Quick Tests</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setTestData({ ...testData, email: 'admin@dfs-portal.com' });
                setTimeout(runDemo, 100);
              }}
            >
              Test Admin Email
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setTestData({ ...testData, role: 'Administrator' });
                setTimeout(runDemo, 100);
              }}
            >
              Test Admin Role
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setTestData({ 
                  email: `unique-${Date.now()}@test.com`,
                  role: 'Employee',
                  station: 'MOBIL',
                  user_id: 999
                });
                setTimeout(runDemo, 100);
              }}
            >
              Test Valid User
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationSystemDemo;
