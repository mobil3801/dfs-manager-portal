import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2, Shield } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { createAdminUser } from '@/utils/createAdminUser';
import { useNavigate } from 'react-router-dom';

const AdminSetup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkForExistingAdmin();
  }, []);

  const checkForExistingAdmin = async () => {
    try {
      setIsLoading(true);
      const { data: users, error } = await window.ezsite.apis.tablePage(
        '24015', // users table
        {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'email', op: 'Equal', value: 'admin@dfsmanager.com' }]
        }
      );

      if (!error && users?.List?.length) {
        setMessage('Admin user already exists. You can proceed to login.');
        setMessageType('success');
      } else {
        setMessage('No admin user found. Click below to create the initial admin user.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error checking for admin user.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
      setHasChecked(true);
    }
  };

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    setMessage('');

    const result = await createAdminUser();

    if (result.error) {
      setMessage(result.error);
      setMessageType('error');
    } else {
      setMessage(result.message || 'Admin user created successfully!');
      setMessageType('success');
      if (result.credentials) {
        setCredentials(result.credentials);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md">
          {/* Logo and Company Name */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center">
              <div className="mb-4 transform hover:scale-105 transition-transform duration-200">
                <Logo className="mb-4" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                DFS Manager Portal
              </h1>
              <p className="text-slate-600 font-medium">Admin Setup</p>
            </div>
          </div>

          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-slate-800 flex items-center justify-center">
                <Shield className="mr-2 h-6 w-6 text-blue-600" />
                Admin Setup
              </CardTitle>
              <CardDescription className="text-center text-slate-600">
                Initialize the system with an administrator account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <Alert className={`mb-4 ${messageType === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  {messageType === 'success' ?
                    <CheckCircle2 className="h-4 w-4 text-green-600" /> :
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  }
                  <AlertDescription className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              {credentials && (
                <Alert className="mb-4 border-blue-200 bg-blue-50">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <div className="space-y-2">
                      <p className="font-medium">Default Admin Credentials:</p>
                      <p><strong>Email:</strong> {credentials.email}</p>
                      <p><strong>Password:</strong> {credentials.password}</p>
                      <p className="text-sm text-blue-600 mt-2">
                        ⚠️ Please change the password after first login!
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {!hasChecked ? (
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-slate-600">Checking system status...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {!credentials && messageType === 'error' && (
                    <Button
                      onClick={handleCreateAdmin}
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Admin User...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Create Admin User
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    onClick={() => navigate('/login')}
                    variant="outline"
                    className="w-full h-11"
                  >
                    Go to Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-slate-500">
            <p>&copy; 2024 DFS Management Systems. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
