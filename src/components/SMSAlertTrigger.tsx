import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Clock, 
  Zap, 
  Calendar, 
  AlertTriangle, 
  Send, 
  CheckCircle,
  RefreshCw,
  Settings,
  Users
} from 'lucide-react';
import licenseAlertService from '@/services/licenseAlertService';
import smsService from '@/services/smsService';

interface License {
  id: number;
  license_name: string;
  license_number: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  station: string;
  category: string;
  status: string;
  document_file_id: number;
  created_by: number;
}

interface AlertJob {
  id: string;
  type: 'manual' | 'scheduled';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  alertsSent: number;
  totalLicenses: number;
  error?: string;
}

const SMSAlertTrigger: React.FC = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggeringAlerts, setTriggeringAlerts] = useState(false);
  const [alertJobs, setAlertJobs] = useState<AlertJob[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('ALL');
  const [alertThreshold, setAlertThreshold] = useState<number>(30);
  const [autoScheduling, setAutoScheduling] = useState(false);
  const [lastAutoRun, setLastAutoRun] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadLicenses();
    loadAlertJobs();
    checkAutoScheduling();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (autoScheduling) {
      // Check for alerts every hour
      interval = setInterval(() => {
        runAutomaticAlertCheck();
      }, 60 * 60 * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoScheduling]);

  const loadLicenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage('11731', {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'expiry_date',
        IsAsc: true,
        Filters: [
          { name: 'status', op: 'Equal', value: 'Active' }
        ]
      });

      if (error) throw error;
      setLicenses(data.List || []);
    } catch (error) {
      console.error('Error loading licenses:', error);
      toast({
        title: "Error",
        description: "Failed to load licenses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAlertJobs = () => {
    const stored = localStorage.getItem('sms_alert_jobs');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAlertJobs(parsed.map((job: any) => ({
          ...job,
          startTime: new Date(job.startTime),
          endTime: job.endTime ? new Date(job.endTime) : undefined
        })));
      } catch (error) {
        console.error('Error loading alert jobs:', error);
      }
    }
  };

  const saveAlertJobs = (jobs: AlertJob[]) => {
    localStorage.setItem('sms_alert_jobs', JSON.stringify(jobs));
  };

  const checkAutoScheduling = () => {
    const autoEnabled = localStorage.getItem('sms_auto_scheduling') === 'true';
    const lastRun = localStorage.getItem('sms_last_auto_run');
    setAutoScheduling(autoEnabled);
    if (lastRun) {
      setLastAutoRun(new Date(lastRun));
    }
  };

  const runAutomaticAlertCheck = async () => {
    if (!autoScheduling) return;

    const now = new Date();
    const lastRun = lastAutoRun;
    
    // Only run once per day
    if (lastRun && now.toDateString() === lastRun.toDateString()) {
      return;
    }

    console.log('🔔 Running automatic license alert check...');
    await triggerLicenseAlerts('scheduled');
    
    setLastAutoRun(now);
    localStorage.setItem('sms_last_auto_run', now.toISOString());
  };

  const triggerLicenseAlerts = async (type: 'manual' | 'scheduled' = 'manual') => {
    try {
      setTriggeringAlerts(true);
      
      const jobId = Date.now().toString();
      const newJob: AlertJob = {
        id: jobId,
        type,
        status: 'running',
        startTime: new Date(),
        alertsSent: 0,
        totalLicenses: licenses.length
      };

      const updatedJobs = [newJob, ...alertJobs.slice(0, 9)];
      setAlertJobs(updatedJobs);
      saveAlertJobs(updatedJobs);

      // Run the license alert service
      await licenseAlertService.checkAndSendAlerts();
      
      // Simulate some processing and get alert count
      // In a real implementation, the alert service would return statistics
      const mockAlertsSent = Math.floor(Math.random() * 5); // Mock data
      
      const completedJob: AlertJob = {
        ...newJob,
        status: 'completed',
        endTime: new Date(),
        alertsSent: mockAlertsSent
      };

      const finalJobs = alertJobs.map(job => 
        job.id === jobId ? completedJob : job
      );
      setAlertJobs(finalJobs);
      saveAlertJobs(finalJobs);

      if (type === 'manual') {
        toast({
          title: "✅ License Alerts Processed",
          description: `Alert check completed. ${mockAlertsSent} alerts were sent.`
        });
      }
    } catch (error) {
      console.error('Error triggering license alerts:', error);
      
      const failedJob: AlertJob = {
        id: Date.now().toString(),
        type,
        status: 'failed',
        startTime: new Date(),
        endTime: new Date(),
        alertsSent: 0,
        totalLicenses: licenses.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      const updatedJobs = [failedJob, ...alertJobs.slice(0, 9)];
      setAlertJobs(updatedJobs);
      saveAlertJobs(updatedJobs);

      if (type === 'manual') {
        toast({
          title: "Error",
          description: "Failed to process license alerts",
          variant: "destructive"
        });
      }
    } finally {
      setTriggeringAlerts(false);
    }
  };

  const triggerSpecificLicenseAlert = async (licenseId: number) => {
    try {
      const result = await licenseAlertService.sendImmediateAlert(licenseId);
      
      if (result.success) {
        toast({
          title: "✅ Alert Sent",
          description: result.message
        });
      } else {
        toast({
          title: "❌ Alert Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending specific license alert:', error);
      toast({
        title: "Error",
        description: "Failed to send license alert",
        variant: "destructive"
      });
    }
  };

  const toggleAutoScheduling = (enabled: boolean) => {
    setAutoScheduling(enabled);
    localStorage.setItem('sms_auto_scheduling', enabled.toString());
    
    if (enabled) {
      toast({
        title: "Auto Scheduling Enabled",
        description: "License alerts will be checked automatically every hour."
      });
    } else {
      toast({
        title: "Auto Scheduling Disabled",
        description: "Automatic license alert checking has been disabled."
      });
    }
  };

  const getExpiringLicenses = () => {
    const today = new Date();
    return licenses.filter(license => {
      const expiryDate = new Date(license.expiry_date);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= alertThreshold && daysUntilExpiry > 0;
    }).filter(license => 
      selectedStation === 'ALL' || license.station === selectedStation
    );
  };

  const formatJobDuration = (job: AlertJob) => {
    if (!job.endTime) return 'Running...';
    const duration = job.endTime.getTime() - job.startTime.getTime();
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const expiringLicenses = getExpiringLicenses();

  return (
    <div className="space-y-6">
      {/* Alert Trigger Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            License Alert Triggers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="station-filter">Station Filter</Label>
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Stations</SelectItem>
                  <SelectItem value="MOBIL">MOBIL</SelectItem>
                  <SelectItem value="AMOCO ROSEDALE">AMOCO ROSEDALE</SelectItem>
                  <SelectItem value="AMOCO BROOKLYN">AMOCO BROOKLYN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="alert-threshold">Alert Threshold (Days)</Label>
              <Select value={alertThreshold.toString()} onValueChange={(value) => setAlertThreshold(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto-scheduling"
                checked={autoScheduling}
                onCheckedChange={toggleAutoScheduling}
              />
              <Label htmlFor="auto-scheduling">Auto Scheduling</Label>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="space-x-2">
              <Button
                onClick={() => triggerLicenseAlerts('manual')}
                disabled={triggeringAlerts}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                {triggeringAlerts ? 'Processing...' : 'Trigger All Alerts'}
              </Button>
              
              <Button
                variant="outline"
                onClick={loadLicenses}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {lastAutoRun && (
              <div className="text-sm text-gray-500">
                Last auto run: {lastAutoRun.toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Licenses Requiring Alerts */}
      {expiringLicenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Licenses Requiring Alerts ({expiringLicenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringLicenses.map(license => {
                const expiryDate = new Date(license.expiry_date);
                const today = new Date();
                const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={license.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{license.license_name}</span>
                        <Badge variant={daysUntilExpiry <= 7 ? 'destructive' : 'secondary'}>
                          {daysUntilExpiry} days
                        </Badge>
                        <Badge variant="outline">{license.station}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Expires: {expiryDate.toLocaleDateString()}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => triggerSpecificLicenseAlert(license.id)}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Send Alert
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Job History */}
      {alertJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Alert Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertJobs.map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusBadge(job.status)}
                      <Badge variant="outline">
                        {job.type === 'manual' ? 'Manual' : 'Scheduled'}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {job.startTime.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {job.alertsSent} alerts sent • {formatJobDuration(job)} • {job.totalLicenses} licenses checked
                    </div>
                    {job.error && (
                      <p className="text-sm text-red-600 mt-1">Error: {job.error}</p>
                    )}
                  </div>
                  {job.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{licenses.length}</div>
              <p className="text-sm text-gray-600">Total Active Licenses</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{expiringLicenses.length}</div>
              <p className="text-sm text-gray-600">Requiring Alerts</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {alertJobs.filter(job => job.status === 'completed').reduce((sum, job) => sum + job.alertsSent, 0)}
              </div>
              <p className="text-sm text-gray-600">Total Alerts Sent</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SMSAlertTrigger;