import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, Zap, Bell, Database, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImageCompressionSettings from '@/components/ImageCompressionSettings';
import CompressionDemo from '@/components/CompressionDemo';

const AppSettings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2">

          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">App Settings</h1>
          <p className="text-gray-600">Configure system preferences and optimize performance</p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-2">
          <ImageCompressionSettings />
        </div>
        
        <div className="xl:col-span-1">
          <CompressionDemo />
        </div>
        
        <div className="xl:col-span-1 space-y-4">
          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                About Image Compression
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Automatic compression</strong> helps reduce file sizes for faster uploads and better storage efficiency.
                </p>
                <p>
                  Large images are automatically optimized while maintaining visual quality, making your application faster and more responsive.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Benefits:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Faster upload times</li>
                  <li>• Reduced bandwidth usage</li>
                  <li>• Better storage efficiency</li>
                  <li>• Improved app performance</li>
                  <li>• Maintained image quality</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-green-600" />
                Compression Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Files Compressed Today</span>
                  <Badge variant="secondary">0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Storage Saved</span>
                  <Badge variant="secondary">0 MB</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Compression</span>
                  <Badge variant="secondary">N/A</Badge>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Statistics will update as you upload and compress images.
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full text-sm" disabled>
                <Bell className="h-4 w-4 mr-2" />
                Notification Settings
                <Badge variant="secondary" className="ml-auto">Soon</Badge>
              </Button>
              <Button variant="outline" className="w-full text-sm" disabled>
                <Shield className="h-4 w-4 mr-2" />
                Security Settings
                <Badge variant="secondary" className="ml-auto">Soon</Badge>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);

};

export default AppSettings;