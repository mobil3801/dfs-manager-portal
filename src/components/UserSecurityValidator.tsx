import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Users, 
  Building2,
  Lock,
  Info,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { userSecurityService } from '@/services/userSecurityService';

interface UserSecurityValidatorProps {
  userData: {
    email: string;
    role: string;
    station: string;
    employee_id: string;
  };
  isUpdate?: boolean;
  currentUserId?: number;
  onValidationChange: (isValid: boolean, errors: string[], warnings: string[]) => void;
  onDataChange: (field: string, value: string) => void;
}

const UserSecurityValidator: React.FC<UserSecurityValidatorProps> = ({
  userData,
  isUpdate = false,
  currentUserId,
  onValidationChange,
  onDataChange
}) => {
  const { toast } = useToast();
  const [validationState, setValidationState] = useState({
    isValid: false,
    errors: [] as string[],
    warnings: [] as string[],
    isValidating: false
  });
  const [emailCheckState, setEmailCheckState] = useState({
    isChecking: false,
    isUnique: true,
    conflictDetails: null as any
  });
  const [roleCheckState, setRoleCheckState] = useState({
    isChecking: false,
    hasConflict: false,
    conflictDetails: null as any
  });

  // Debounced validation
  useEffect(() => {
    const validateUser = async () => {
      if (!userData.email || !userData.role || !userData.station) {
        setValidationState({
          isValid: false,
          errors: ['Email, role, and station are required'],
          warnings: [],
          isValidating: false
        });
        onValidationChange(false, ['Email, role, and station are required'], []);
        return;
      }

      setValidationState(prev => ({ ...prev, isValidating: true }));

      try {
        const validationResult = await userSecurityService.validateUser(
          userData,
          isUpdate,
          currentUserId
        );

        setValidationState({
          isValid: validationResult.isValid,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          isValidating: false
        });

        onValidationChange(
          validationResult.isValid,
          validationResult.errors,
          validationResult.warnings
        );

      } catch (error) {
        console.error('Validation error:', error);
        const errorMsg = 'Validation failed due to system error';
        setValidationState({
          isValid: false,
          errors: [errorMsg],
          warnings: [],
          isValidating: false
        });
        onValidationChange(false, [errorMsg], []);
      }
    };

    const timeoutId = setTimeout(validateUser, 500);
    return () => clearTimeout(timeoutId);
  }, [userData.email, userData.role, userData.station, isUpdate, currentUserId, onValidationChange]);

  const checkEmailUniqueness = async () => {
    if (!userData.email) return;

    setEmailCheckState(prev => ({ ...prev, isChecking: true }));

    try {
      const result = await userSecurityService.checkEmailUniqueness(
        userData.email,
        currentUserId
      );

      setEmailCheckState({
        isChecking: false,
        isUnique: result.isUnique,
        conflictDetails: result.conflictDetails
      });

      if (!result.isUnique) {
        toast({
          title: "Email Conflict",
          description: `Email ${userData.email} is already in use`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Email check error:', error);
      setEmailCheckState({
        isChecking: false,
        isUnique: false,
        conflictDetails: null
      });
    }
  };

  const checkRoleConflicts = async () => {
    if (!userData.role || !userData.station) return;

    setRoleCheckState(prev => ({ ...prev, isChecking: true }));

    try {
      const result = await userSecurityService.checkRoleConflicts(
        userData.role,
        userData.station,
        currentUserId
      );

      setRoleCheckState({
        isChecking: false,
        hasConflict: result.hasConflict,
        conflictDetails: result.conflictDetails
      });

      if (result.hasConflict) {
        toast({
          title: "Role Conflict",
          description: result.conflictDetails?.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Role check error:', error);
      setRoleCheckState({
        isChecking: false,
        hasConflict: true,
        conflictDetails: { message: 'Role validation failed' }
      });
    }
  };

  const generateSecureEmployeeId = () => {
    const newId = userSecurityService.generateSecureEmployeeId(userData.station, userData.role);
    onDataChange('employee_id', newId);
    toast({
      title: "Employee ID Generated",
      description: `Secure employee ID: ${newId}`
    });
  };

  const getSecurityRecommendations = () => {
    return userSecurityService.getSecurityRecommendations(userData.role, userData.station);
  };

  const getValidationIcon = () => {
    if (validationState.isValidating) {
      return <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />;
    }
    if (validationState.isValid) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (validationState.errors.length > 0) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
  };

  const roles = ['Administrator', 'Management', 'Employee'];
  const stations = ['ALL', 'MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      <Card className={`border-2 ${
        validationState.isValid ? 'border-green-200 bg-green-50' : 
        validationState.errors.length > 0 ? 'border-red-200 bg-red-50' :
        'border-yellow-200 bg-yellow-50'
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            {getValidationIcon()}
            <span>Security Validation Status</span>
            <Badge variant={validationState.isValid ? 'default' : 'destructive'}>
              {validationState.isValid ? 'Valid' : 'Invalid'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validationState.errors.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="w-4 h-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationState.errors.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {validationState.warnings.length > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationState.warnings.map((warning, index) => (
                    <div key={index}>⚠️ {warning}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {validationState.isValid && (
            <Alert className="border-green-200">
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                All security validations passed. User data is ready for {isUpdate ? 'update' : 'creation'}.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Email Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span>Email Uniqueness Check</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => onDataChange('email', e.target.value)}
                  placeholder="user@dfs-portal.com"
                  className={!emailCheckState.isUnique ? 'border-red-500' : ''}
                />
              </div>
              <div className="pt-6">
                <Button
                  variant="outline"
                  onClick={checkEmailUniqueness}
                  disabled={emailCheckState.isChecking || !userData.email}
                >
                  {emailCheckState.isChecking ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Check
                </Button>
              </div>
            </div>

            {!emailCheckState.isUnique && emailCheckState.conflictDetails && (
              <Alert variant="destructive">
                <XCircle className="w-4 h-4" />
                <AlertDescription>
                  Email conflict detected with user ID {emailCheckState.conflictDetails.existingUserId} 
                  (Role: {emailCheckState.conflictDetails.existingRole}, 
                  Station: {emailCheckState.conflictDetails.existingStation})
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role and Station Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <span>Role & Station Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={userData.role} onValueChange={(value) => onDataChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span>{role}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="station">Station</Label>
                <Select value={userData.station} onValueChange={(value) => onDataChange('station', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map(station => (
                      <SelectItem key={station} value={station}>
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4" />
                          <span>{station === 'ALL' ? 'ALL STATIONS' : station}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={checkRoleConflicts}
                disabled={roleCheckState.isChecking || !userData.role || !userData.station}
                className="flex items-center space-x-2"
              >
                {roleCheckState.isChecking ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Users className="w-4 h-4" />
                )}
                <span>Check Role Conflicts</span>
              </Button>
            </div>

            {roleCheckState.hasConflict && roleCheckState.conflictDetails && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div>{roleCheckState.conflictDetails.message}</div>
                    <div className="text-sm font-medium">
                      Suggested Action: {roleCheckState.conflictDetails.suggestedAction}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Employee ID Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-orange-600" />
            <span>Secure Employee ID</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  value={userData.employee_id}
                  onChange={(e) => onDataChange('employee_id', e.target.value)}
                  placeholder="Auto-generated secure ID"
                />
              </div>
              <div className="pt-6">
                <Button
                  variant="outline"
                  onClick={generateSecureEmployeeId}
                  disabled={!userData.role || !userData.station}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Secure employee IDs are generated using station, role, and timestamp data for uniqueness and traceability.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      {userData.role && userData.station && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Security Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getSecurityRecommendations().map((recommendation, index) => (
                <Alert key={index} className="border-blue-200">
                  <Info className="w-4 h-4" />
                  <AlertDescription>{recommendation}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Protected Admin Notice */}
      {userData.email === 'admin@dfs-portal.com' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <Lock className="w-5 h-5" />
              <span>Protected Admin Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <Lock className="w-4 h-4" />
              <AlertDescription>
                This is a protected admin account. Email cannot be changed and administrator role cannot be removed to maintain system security.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserSecurityValidator;