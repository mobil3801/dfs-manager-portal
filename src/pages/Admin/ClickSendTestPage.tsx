import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClickSendTestDemo from '@/components/ClickSendTestDemo';
import ClickSendConfigManager from '@/components/ClickSendConfigManager';

const ClickSendTestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Panel
        </Button>
        <div>
          <h1 className="text-2xl font-bold">ClickSend SMS Integration</h1>
          <p className="text-muted-foreground">
            Test and manage your ClickSend SMS integration
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ClickSendTestDemo />
        </div>
        
        <div className="space-y-6">
          <ClickSendConfigManager />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Summary</CardTitle>
          <CardDescription>
            Your ClickSend SMS integration status and next steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800">✅ Integration Complete</h3>
                <p className="text-sm text-green-600">
                  ClickSend is now the exclusive SMS provider for your DFS Manager application
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800">🔧 Ready to Use</h3>
                <p className="text-sm text-blue-600">
                  All SMS features will automatically use your ClickSend credentials
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800">📱 Test Available</h3>
                <p className="text-sm text-purple-600">
                  Use the test form to verify SMS functionality anytime
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">What's Been Updated:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• ClickSend SMS service configured with your credentials</li>
                <li>• Legacy SMS services redirected to use ClickSend</li>
                <li>• All existing SMS functionality preserved</li>
                <li>• Configuration manager updated for ClickSend</li>
                <li>• Test interface created for validation</li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Your Credentials in Use:</h3>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                <div>Username: mobil3801beach@gmail.com</div>
                <div>API Key: 54DC23E4-34D7-C6B1-0601-112E36A46B49</div>
                <div>Source: DFS</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClickSendTestPage;
