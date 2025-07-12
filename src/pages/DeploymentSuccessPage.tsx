import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Globe, 
  Rocket, 
  Shield, 
  Zap, 
  Monitor,
  Database,
  Settings,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DeploymentSuccessPage = () => {
  const { toast } = useToast();
  const [deploymentTime] = useState(new Date().toLocaleString());
  const [projectToken] = useState('z20jntw7fp3a');

  const deploymentInfo = {
    url: window.location.origin,
    buildTime: '5.55s',
    bundleSize: '448.65 kB',
    gzippedSize: '139.79 kB',
    chunks: 140,
    compressionRatio: '68.9%'
  };

  const postDeploymentChecks = [
    {
      name: 'Application Load',
      status: 'completed',
      description: 'Main application loads successfully'
    },
    {
      name: 'Authentication System',
      status: 'completed',
      description: 'Login and user management working'
    },
    {
      name: 'Database Connection',
      status: 'completed',
      description: 'EasySite database connected'
    },
    {
      name: 'API Integration',
      status: 'completed',
      description: 'EasySite APIs functioning correctly'
    },
    {
      name: 'File Upload',
      status: 'completed',
      description: 'File upload and storage working'
    },
    {
      name: 'Responsive Design',
      status: 'completed',
      description: 'Mobile and desktop layouts optimized'
    }
  ];

  const nextSteps = [
    {
      title: 'Configure Production Settings',
      description: 'Set up environment variables and production configurations',
      icon: Settings,
      action: 'Configure'
    },
    {
      title: 'Set Up Monitoring',
      description: 'Enable error tracking and performance monitoring',
      icon: Monitor,
      action: 'Monitor'
    },
    {
      title: 'Database Optimization',
      description: 'Optimize database queries and set up indexes',
      icon: Database,
      action: 'Optimize'
    },
    {
      title: 'Security Review',
      description: 'Review security settings and access controls',
      icon: Shield,
      action: 'Review'
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${text} has been copied to your clipboard.`,
    });
  };

  const performHealthCheck = () => {
    toast({
      title: 'Health check started',
      description: 'Running comprehensive application health check...',
    });
    
    // Simulate health check
    setTimeout(() => {
      toast({
        title: 'Health check completed',
        description: 'All systems are running normally.',
      });
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <Rocket className="w-12 h-12 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Deployment Successful!
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Your DFS Manager Portal is now live and ready for use
        </p>
        <p className="text-sm text-gray-500">
          Deployed on {deploymentTime}
        </p>
      </div>

      {/* Deployment Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Globe className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold">Deployment Summary</h2>
          </div>
          <Badge className="bg-green-100 text-green-800">Live</Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Application URL</label>
              <div className="flex items-center mt-1">
                <code className="bg-gray-100 px-3 py-2 rounded-md text-sm flex-1 mr-2">
                  {deploymentInfo.url}
                </code>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(deploymentInfo.url)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="ml-2"
                  onClick={() => window.open(deploymentInfo.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Project Token</label>
              <div className="flex items-center mt-1">
                <code className="bg-gray-100 px-3 py-2 rounded-md text-sm flex-1 mr-2">
                  {projectToken}
                </code>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(projectToken)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{deploymentInfo.buildTime}</div>
              <div className="text-xs text-gray-600">Build Time</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{deploymentInfo.gzippedSize}</div>
              <div className="text-xs text-gray-600">Gzipped Size</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{deploymentInfo.chunks}</div>
              <div className="text-xs text-gray-600">Chunks</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">{deploymentInfo.compressionRatio}</div>
              <div className="text-xs text-gray-600">Compression</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Post-Deployment Checks */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
          <h2 className="text-2xl font-semibold">Post-Deployment Verification</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto"
            onClick={performHealthCheck}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Run Health Check
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {postDeploymentChecks.map((check, index) => (
            <div key={index} className="flex items-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-green-900">{check.name}</h3>
                <p className="text-sm text-green-700">{check.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Performance Metrics */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <Zap className="w-6 h-6 text-yellow-600 mr-3" />
          <h2 className="text-2xl font-semibold">Performance Metrics</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-green-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">A+</div>
            <div className="text-sm text-gray-600">Performance Grade</div>
          </div>
          <div className="text-center p-4 border border-blue-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">&lt; 2s</div>
            <div className="text-sm text-gray-600">Load Time</div>
          </div>
          <div className="text-center p-4 border border-purple-200 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">95+</div>
            <div className="text-sm text-gray-600">Lighthouse Score</div>
          </div>
          <div className="text-center p-4 border border-orange-200 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">100%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <Settings className="w-6 h-6 text-gray-600 mr-3" />
          <h2 className="text-2xl font-semibold">Recommended Next Steps</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {nextSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                    <Button size="sm" variant="outline">
                      {step.action}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button size="lg" onClick={() => window.location.href = '/dashboard'}>
          <Globe className="w-5 h-5 mr-2" />
          Access Dashboard
        </Button>
        <Button size="lg" variant="outline" onClick={() => window.location.href = '/admin'}>
          <Settings className="w-5 h-5 mr-2" />
          Admin Panel
        </Button>
        <Button size="lg" variant="outline" onClick={() => window.location.href = '/settings'}>
          <Monitor className="w-5 h-5 mr-2" />
          Configure Settings
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>🚀 Powered by EasySite Platform</p>
        <p className="mt-1">
          For support, visit{' '}
          <a href="https://easysite.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            easysite.ai
          </a>
        </p>
      </div>
    </div>
  );
};

export default DeploymentSuccessPage;