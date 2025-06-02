import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  TrendingUp, 
  Activity, 
  Users, 
  RefreshCw,
  BarChart3
} from 'lucide-react';
import AuditLoggerService from '@/services/auditLogger';

interface AuditStatistics {
  totalEvents: number;
  failedAttempts: number;
  suspiciousActivity: number;
  topEventTypes: Array<{ type: string; count: number }>;
  riskDistribution: Array<{ level: string; count: number }>;
}

const AuditLogDashboard: React.FC = () => {
  const [statistics, setStatistics] = useState&lt;AuditStatistics&gt;({
    totalEvents: 0,
    failedAttempts: 0,
    suspiciousActivity: 0,
    topEventTypes: [],
    riskDistribution: []
  });
  const [timeRange, setTimeRange] = useState&lt;'day' | 'week' | 'month'&gt;('week');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const auditLogger = AuditLoggerService.getInstance();

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const stats = await auditLogger.getStatistics(timeRange);
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching audit statistics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch audit statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStatistics();
    setRefreshing(false);
    toast({
      title: "Success",
      description: "Statistics refreshed"
    });
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical': return 'bg-red-500 hover:bg-red-600';
      case 'High': return 'bg-orange-500 hover:bg-orange-600';
      case 'Medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Low': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const calculatePercentage = (value: number, total: number) => {
    return total &gt; 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  };

  return (
    &lt;div className="space-y-6"&gt;
      {/* Header */}
      &lt;div className="flex items-center justify-between"&gt;
        &lt;div className="flex items-center space-x-2"&gt;
          &lt;Shield className="h-6 w-6 text-blue-600" /&gt;
          &lt;h1 className="text-2xl font-bold"&gt;Security Audit Dashboard&lt;/h1&gt;
        &lt;/div&gt;
        &lt;div className="flex items-center space-x-2"&gt;
          &lt;Select value={timeRange} onValueChange={(value: 'day' | 'week' | 'month') =&gt; setTimeRange(value)}&gt;
            &lt;SelectTrigger className="w-32"&gt;
              &lt;SelectValue /&gt;
            &lt;/SelectTrigger&gt;
            &lt;SelectContent&gt;
              &lt;SelectItem value="day"&gt;Last 24h&lt;/SelectItem&gt;
              &lt;SelectItem value="week"&gt;Last Week&lt;/SelectItem&gt;
              &lt;SelectItem value="month"&gt;Last Month&lt;/SelectItem&gt;
            &lt;/SelectContent&gt;
          &lt;/Select&gt;
          &lt;Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          &gt;
            &lt;RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /&gt;
            Refresh
          &lt;/Button&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {loading ? (
        &lt;div className="flex justify-center py-12"&gt;
          &lt;div className="text-muted-foreground"&gt;Loading audit statistics...&lt;/div&gt;
        &lt;/div&gt;
      ) : (
        &lt;&gt;
          {/* Overview Cards */}
          &lt;div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"&gt;
            &lt;Card&gt;
              &lt;CardContent className="p-6"&gt;
                &lt;div className="flex items-center justify-between"&gt;
                  &lt;div&gt;
                    &lt;p className="text-sm font-medium text-muted-foreground"&gt;Total Events&lt;/p&gt;
                    &lt;p className="text-3xl font-bold"&gt;{statistics.totalEvents.toLocaleString()}&lt;/p&gt;
                  &lt;/div&gt;
                  &lt;Activity className="h-8 w-8 text-blue-600" /&gt;
                &lt;/div&gt;
                &lt;p className="text-xs text-muted-foreground mt-2"&gt;
                  Last {timeRange === 'day' ? '24 hours' : timeRange === 'week' ? 'week' : 'month'}
                &lt;/p&gt;
              &lt;/CardContent&gt;
            &lt;/Card&gt;

            &lt;Card&gt;
              &lt;CardContent className="p-6"&gt;
                &lt;div className="flex items-center justify-between"&gt;
                  &lt;div&gt;
                    &lt;p className="text-sm font-medium text-muted-foreground"&gt;Failed Attempts&lt;/p&gt;
                    &lt;p className="text-3xl font-bold text-red-600"&gt;{statistics.failedAttempts}&lt;/p&gt;
                  &lt;/div&gt;
                  &lt;AlertTriangle className="h-8 w-8 text-red-600" /&gt;
                &lt;/div&gt;
                &lt;p className="text-xs text-muted-foreground mt-2"&gt;
                  {calculatePercentage(statistics.failedAttempts, statistics.totalEvents)}% of total events
                &lt;/p&gt;
              &lt;/CardContent&gt;
            &lt;/Card&gt;

            &lt;Card&gt;
              &lt;CardContent className="p-6"&gt;
                &lt;div className="flex items-center justify-between"&gt;
                  &lt;div&gt;
                    &lt;p className="text-sm font-medium text-muted-foreground"&gt;Suspicious Activity&lt;/p&gt;
                    &lt;p className="text-3xl font-bold text-orange-600"&gt;{statistics.suspiciousActivity}&lt;/p&gt;
                  &lt;/div&gt;
                  &lt;Eye className="h-8 w-8 text-orange-600" /&gt;
                &lt;/div&gt;
                &lt;p className="text-xs text-muted-foreground mt-2"&gt;
                  Requires immediate attention
                &lt;/p&gt;
              &lt;/CardContent&gt;
            &lt;/Card&gt;

            &lt;Card&gt;
              &lt;CardContent className="p-6"&gt;
                &lt;div className="flex items-center justify-between"&gt;
                  &lt;div&gt;
                    &lt;p className="text-sm font-medium text-muted-foreground"&gt;Security Score&lt;/p&gt;
                    &lt;p className="text-3xl font-bold text-green-600"&gt;
                      {statistics.totalEvents &gt; 0 
                        ? Math.max(0, 100 - Math.round((statistics.failedAttempts + statistics.suspiciousActivity * 2) / statistics.totalEvents * 100))
                        : 100}%
                    &lt;/p&gt;
                  &lt;/div&gt;
                  &lt;TrendingUp className="h-8 w-8 text-green-600" /&gt;
                &lt;/div&gt;
                &lt;p className="text-xs text-muted-foreground mt-2"&gt;
                  Based on security events
                &lt;/p&gt;
              &lt;/CardContent&gt;
            &lt;/Card&gt;
          &lt;/div&gt;

          {/* Event Types Distribution */}
          &lt;div className="grid grid-cols-1 lg:grid-cols-2 gap-6"&gt;
            &lt;Card&gt;
              &lt;CardHeader&gt;
                &lt;CardTitle className="flex items-center space-x-2"&gt;
                  &lt;BarChart3 className="h-5 w-5" /&gt;
                  &lt;span&gt;Top Event Types&lt;/span&gt;
                &lt;/CardTitle&gt;
              &lt;/CardHeader&gt;
              &lt;CardContent&gt;
                {statistics.topEventTypes.length === 0 ? (
                  &lt;p className="text-center text-muted-foreground py-8"&gt;No events recorded&lt;/p&gt;
                ) : (
                  &lt;div className="space-y-4"&gt;
                    {statistics.topEventTypes.map((eventType, index) =&gt; (
                      &lt;div key={eventType.type} className="flex items-center justify-between"&gt;
                        &lt;div className="flex items-center space-x-2"&gt;
                          &lt;div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-yellow-500' :
                            index === 3 ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`} /&gt;
                          &lt;span className="text-sm font-medium"&gt;{eventType.type}&lt;/span&gt;
                        &lt;/div&gt;
                        &lt;div className="flex items-center space-x-2"&gt;
                          &lt;span className="text-sm text-muted-foreground"&gt;{eventType.count}&lt;/span&gt;
                          &lt;Badge variant="outline"&gt;
                            {calculatePercentage(eventType.count, statistics.totalEvents)}%
                          &lt;/Badge&gt;
                        &lt;/div&gt;
                      &lt;/div&gt;
                    ))}
                  &lt;/div&gt;
                )}
              &lt;/CardContent&gt;
            &lt;/Card&gt;

            &lt;Card&gt;
              &lt;CardHeader&gt;
                &lt;CardTitle className="flex items-center space-x-2"&gt;
                  &lt;AlertTriangle className="h-5 w-5" /&gt;
                  &lt;span&gt;Risk Level Distribution&lt;/span&gt;
                &lt;/CardTitle&gt;
              &lt;/CardHeader&gt;
              &lt;CardContent&gt;
                {statistics.riskDistribution.length === 0 ? (
                  &lt;p className="text-center text-muted-foreground py-8"&gt;No events recorded&lt;/p&gt;
                ) : (
                  &lt;div className="space-y-4"&gt;
                    {statistics.riskDistribution
                      .sort((a, b) =&gt; {
                        const order = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
                        return (order[a.level as keyof typeof order] || 4) - (order[b.level as keyof typeof order] || 4);
                      })
                      .map((risk) =&gt; (
                        &lt;div key={risk.level} className="flex items-center justify-between"&gt;
                          &lt;div className="flex items-center space-x-2"&gt;
                            &lt;Badge className={`text-white ${getRiskBadgeColor(risk.level)}`}&gt;
                              {risk.level}
                            &lt;/Badge&gt;
                            &lt;span className="text-sm font-medium"&gt;Risk Level&lt;/span&gt;
                          &lt;/div&gt;
                          &lt;div className="flex items-center space-x-2"&gt;
                            &lt;span className="text-sm text-muted-foreground"&gt;{risk.count}&lt;/span&gt;
                            &lt;Badge variant="outline"&gt;
                              {calculatePercentage(risk.count, statistics.totalEvents)}%
                            &lt;/Badge&gt;
                          &lt;/div&gt;
                        &lt;/div&gt;
                      ))}
                  &lt;/div&gt;
                )}
              &lt;/CardContent&gt;
            &lt;/Card&gt;
          &lt;/div&gt;

          {/* Security Alerts */}
          {(statistics.failedAttempts &gt; 10 || statistics.suspiciousActivity &gt; 0) && (
            &lt;Card className="border-red-200 bg-red-50"&gt;
              &lt;CardHeader&gt;
                &lt;CardTitle className="flex items-center space-x-2 text-red-700"&gt;
                  &lt;AlertTriangle className="h-5 w-5" /&gt;
                  &lt;span&gt;Security Alerts&lt;/span&gt;
                &lt;/CardTitle&gt;
              &lt;/CardHeader&gt;
              &lt;CardContent&gt;
                &lt;div className="space-y-2"&gt;
                  {statistics.failedAttempts &gt; 10 && (
                    &lt;div className="flex items-center space-x-2 text-red-700"&gt;
                      &lt;AlertTriangle className="h-4 w-4" /&gt;
                      &lt;span className="text-sm"&gt;
                        High number of failed login attempts detected: {statistics.failedAttempts}
                      &lt;/span&gt;
                    &lt;/div&gt;
                  )}
                  {statistics.suspiciousActivity &gt; 0 && (
                    &lt;div className="flex items-center space-x-2 text-red-700"&gt;
                      &lt;Eye className="h-4 w-4" /&gt;
                      &lt;span className="text-sm"&gt;
                        Suspicious activities detected: {statistics.suspiciousActivity}
                      &lt;/span&gt;
                    &lt;/div&gt;
                  )}
                &lt;/div&gt;
              &lt;/CardContent&gt;
            &lt;/Card&gt;
          )}
        &lt;/&gt;
      )}
    &lt;/div&gt;
  );
};

export default AuditLogDashboard;