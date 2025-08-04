
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Shield, 
  Users, 
  Key,
  Clock,
  Database,
  Globe,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';

const AuthTestingGuide: React.FC = () => {
  const testScenarios = [
    {
      category: "Login Testing",
      icon: <Shield className="h-5 w-5" />,
      tests: [
        {
          name: "Valid Credentials Login",
          description: "Test login with correct email and password",
          steps: ["Enter valid email", "Enter correct password", "Click login", "Verify successful authentication"],
          expectedResult: "User should be logged in and redirected to dashboard",
          priority: "Critical"
        },
        {
          name: "Invalid Credentials Login",
          description: "Test login with incorrect credentials",
          steps: ["Enter invalid email or password", "Click login", "Verify error handling"],
          expectedResult: "Should display appropriate error message without revealing security details",
          priority: "High"
        },
        {
          name: "Empty Fields Validation",
          description: "Test form validation with empty fields",
          steps: ["Leave email empty", "Leave password empty", "Attempt login"],
          expectedResult: "Should show field validation errors",
          priority: "Medium"
        },
        {
          name: "Rate Limiting",
          description: "Test multiple failed login attempts",
          steps: ["Attempt multiple failed logins", "Check if rate limiting kicks in"],
          expectedResult: "Should implement rate limiting after multiple failures",
          priority: "High"
        }
      ]
    },
    {
      category: "Session Management",
      icon: <Clock className="h-5 w-5" />,
      tests: [
        {
          name: "Session Creation",
          description: "Verify session is created on successful login",
          steps: ["Login successfully", "Check session data", "Verify session tokens"],
          expectedResult: "Valid session with proper expiration time should be created",
          priority: "Critical"
        },
        {
          name: "Session Persistence",
          description: "Test session across page refreshes",
          steps: ["Login", "Refresh page", "Verify user remains logged in"],
          expectedResult: "User should remain authenticated after page refresh",
          priority: "Critical"
        },
        {
          name: "Session Expiration",
          description: "Test session expiration handling",
          steps: ["Wait for session to expire", "Attempt authenticated action"],
          expectedResult: "Should redirect to login when session expires",
          priority: "High"
        },
        {
          name: "Session Refresh",
          description: "Test automatic session token refresh",
          steps: ["Wait near session expiry", "Check if token refreshes automatically"],
          expectedResult: "Session should refresh automatically before expiration",
          priority: "High"
        }
      ]
    },
    {
      category: "Logout Testing",
      icon: <Unlock className="h-5 w-5" />,
      tests: [
        {
          name: "Standard Logout",
          description: "Test normal logout functionality",
          steps: ["Click logout button", "Verify session termination", "Check redirect to login"],
          expectedResult: "User should be logged out and redirected to login page",
          priority: "Critical"
        },
        {
          name: "Session Invalidation",
          description: "Verify session is properly invalidated on logout",
          steps: ["Logout", "Try to access protected routes", "Check session tokens"],
          expectedResult: "All session data should be cleared and protected routes inaccessible",
          priority: "Critical"
        },
        {
          name: "Multiple Device Logout",
          description: "Test logout behavior across multiple devices",
          steps: ["Login on multiple devices", "Logout from one device", "Check other devices"],
          expectedResult: "Behavior depends on implementation - single or multi-device logout",
          priority: "Medium"
        }
      ]
    },
    {
      category: "Security Testing",
      icon: <Lock className="h-5 w-5" />,
      tests: [
        {
          name: "Protected Route Access",
          description: "Test access to protected routes without authentication",
          steps: ["Logout", "Try to access protected routes directly"],
          expectedResult: "Should redirect to login page",
          priority: "Critical"
        },
        {
          name: "Token Validation",
          description: "Test with invalid or tampered tokens",
          steps: ["Modify session tokens", "Try to access protected resources"],
          expectedResult: "Should reject invalid tokens and redirect to login",
          priority: "High"
        },
        {
          name: "CSRF Protection",
          description: "Test cross-site request forgery protection",
          steps: ["Attempt cross-site requests", "Check CSRF token validation"],
          expectedResult: "Should block unauthorized cross-site requests",
          priority: "High"
        }
      ]
    },
    {
      category: "User Management",
      icon: <Users className="h-5 w-5" />,
      tests: [
        {
          name: "User Registration",
          description: "Test new user signup process",
          steps: ["Fill registration form", "Submit form", "Check email verification"],
          expectedResult: "Should create user account and send verification email",
          priority: "Critical"
        },
        {
          name: "Email Verification",
          description: "Test email verification process",
          steps: ["Register new user", "Click verification link", "Try to login"],
          expectedResult: "Account should be verified and login should work",
          priority: "High"
        },
        {
          name: "Password Reset",
          description: "Test password reset functionality",
          steps: ["Request password reset", "Check email", "Reset password", "Login with new password"],
          expectedResult: "Should successfully reset password and allow login",
          priority: "High"
        },
        {
          name: "Role-Based Access",
          description: "Test different user roles and permissions",
          steps: ["Login as different roles", "Try to access role-specific features"],
          expectedResult: "Should grant/deny access based on user roles",
          priority: "Critical"
        }
      ]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'destructive';
      case 'High':
        return 'default';
      case 'Medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return <AlertTriangle className="h-3 w-3" />;
      case 'High':
        return <CheckCircle className="h-3 w-3" />;
      case 'Medium':
        return <Info className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Authentication Testing Guide</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive guide for testing authentication flows, session management, and security features
        </p>
      </div>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Quick Testing Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold">Critical Tests</h3>
              <p className="text-sm text-muted-foreground">Must pass for production</p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold">High Priority</h3>
              <p className="text-sm text-muted-foreground">Important for security</p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mx-auto">
                <Info className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="font-semibold">Medium Priority</h3>
              <p className="text-sm text-muted-foreground">Good to have features</p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto">
                <RefreshCw className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold">Automated</h3>
              <p className="text-sm text-muted-foreground">Can be automated</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Environment Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Testing Environment Setup
          </CardTitle>
          <CardDescription>
            Prerequisites and setup requirements for authentication testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Globe className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Testing URL:</strong> <code>/auth-flow-test</code> - Access the authentication flow tester
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Test Accounts Required:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Valid user account (for positive testing)</li>
                <li>• Invalid credentials (for negative testing)</li>
                <li>• Admin account (for role testing)</li>
                <li>• Regular user account (for permission testing)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Tools Needed:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Browser developer tools</li>
                <li>• Network monitoring</li>
                <li>• Multiple browser tabs/sessions</li>
                <li>• Timer for session expiration tests</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Scenarios */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Test Scenarios</h2>
        
        {testScenarios.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category.icon}
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {category.tests.map((test, testIndex) => (
                  <div key={testIndex} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{test.name}</h4>
                          <Badge 
                            variant={getPriorityColor(test.priority) as any}
                            className="text-xs flex items-center gap-1"
                          >
                            {getPriorityIcon(test.priority)}
                            {test.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Test Steps:</h5>
                        <ol className="text-sm space-y-1">
                          {test.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start gap-2">
                              <span className="text-muted-foreground">{stepIndex + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Expected Result:</h5>
                        <p className="text-sm text-muted-foreground">{test.expectedResult}</p>
                      </div>
                    </div>
                    
                    {testIndex < category.tests.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600 dark:text-green-400">✓ Do:</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Test in incognito/private browsing mode</li>
                <li>• Clear browser cache between tests</li>
                <li>• Test with different user roles</li>
                <li>• Monitor network requests in DevTools</li>
                <li>• Test session expiration thoroughly</li>
                <li>• Verify error messages are user-friendly</li>
                <li>• Test on different devices/browsers</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-red-600 dark:text-red-400">✗ Don't:</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Use production data for testing</li>
                <li>• Skip negative test cases</li>
                <li>• Ignore browser console errors</li>
                <li>• Test only happy path scenarios</li>
                <li>• Forget to test logout functionality</li>
                <li>• Overlook mobile responsiveness</li>
                <li>• Skip accessibility testing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthTestingGuide;
