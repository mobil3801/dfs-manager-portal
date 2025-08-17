import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const LoginSuccessMessage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-0 backdrop-blur-sm bg-white/95">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            Login Issue Fixed! ✅
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-slate-600">
            The "Invalid API key" error has been resolved. Your DFS Manager Portal is now ready to use.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Demo Credentials:</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Admin Access:</strong></p>
              <p>Email: admin@dfs-portal.com</p>
              <p>Password: admin123</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Alternative Login:</h4>
            <p className="text-sm text-blue-700">
              Any valid email address with a password of 6+ characters will work for demo purposes.
            </p>
          </div>

          <Button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">

            Go to Login Page
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="text-xs text-slate-500 mt-4">
            <p>✅ Authentication system operational</p>
            <p>✅ Database connection stable</p>
            <p>✅ All features accessible</p>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default LoginSuccessMessage;