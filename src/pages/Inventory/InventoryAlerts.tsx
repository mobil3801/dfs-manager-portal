import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Package, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle,
  Bell,
  Eye,
  Archive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InventoryAlert {
  id: string;
  productName: string;
  productId: string;
  alertType: 'low_stock' | 'out_of_stock' | 'expiring' | 'expired';
  currentStock: number;
  minThreshold: number;
  expiryDate?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  isRead: boolean;
  isResolved: boolean;
}

const InventoryAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    const mockAlerts: InventoryAlert[] = [
      {
        id: '1',
        productName: 'Regular Gasoline',
        productId: 'GAS001',
        alertType: 'low_stock',
        currentStock: 5,
        minThreshold: 10,
        priority: 'high',
        createdAt: new Date().toISOString(),
        isRead: false,
        isResolved: false
      },
      {
        id: '2',
        productName: 'Motor Oil 5W-30',
        productId: 'OIL001',
        alertType: 'out_of_stock',
        currentStock: 0,
        minThreshold: 20,
        priority: 'high',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
        isResolved: false
      },
      {
        id: '3',
        productName: 'Energy Drink',
        productId: 'BEV001',
        alertType: 'expiring',
        currentStock: 50,
        minThreshold: 25,
        expiryDate: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
        priority: 'medium',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        isRead: false,
        isResolved: false
      },
      {
        id: '4',
        productName: 'Snack Bar',
        productId: 'SNK001',
        alertType: 'expired',
        currentStock: 15,
        minThreshold: 10,
        expiryDate: new Date(Date.now() - 24 * 3600000).toISOString(),
        priority: 'high',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isRead: true,
        isResolved: true
      }
    ];

    setTimeout(() => {
      setAlerts(mockAlerts);
      setLoading(false);
    }, 1000);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <TrendingDown className="h-4 w-4" />;
      case 'out_of_stock':
        return <XCircle className="h-4 w-4" />;
      case 'expiring':
        return <Clock className="h-4 w-4" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: string, priority: string) => {
    if (type === 'expired' || type === 'out_of_stock') return 'destructive';
    if (priority === 'high') return 'destructive';
    if (priority === 'medium') return 'default';
    return 'secondary';
  };

  const getAlertTitle = (type: string) => {
    switch (type) {
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      case 'expiring':
        return 'Expiring Soon';
      case 'expired':
        return 'Expired';
      default:
        return 'Alert';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    switch (activeTab) {
      case 'unread':
        return !alert.isRead;
      case 'resolved':
        return alert.isResolved;
      case 'high':
        return alert.priority === 'high' && !alert.isResolved;
      default:
        return true;
    }
  });

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
    toast({
      title: "Alert marked as read",
      description: "The alert has been marked as read."
    });
  };

  const markAsResolved = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isResolved: true, isRead: true } : alert
    ));
    toast({
      title: "Alert resolved",
      description: "The alert has been marked as resolved."
    });
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const highPriorityCount = alerts.filter(alert => alert.priority === 'high' && !alert.isResolved).length;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and manage inventory alerts for your gas station
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Bell className="h-3 w-3" />
            <span>{unreadCount} Unread</span>
          </Badge>
          {highPriorityCount > 0 && (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3" />
              <span>{highPriorityCount} High Priority</span>
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="high">High Priority ({highPriorityCount})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({alerts.filter(a => a.isResolved).length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
                <p className="text-muted-foreground text-center">
                  {activeTab === 'all' ? 'All inventory levels are within normal ranges.' : 
                   activeTab === 'unread' ? 'All alerts have been read.' :
                   activeTab === 'high' ? 'No high priority alerts at this time.' :
                   'No resolved alerts to display.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAlerts.map(alert => (
                <Card key={alert.id} className={`${!alert.isRead ? 'border-l-4 border-l-primary' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          alert.alertType === 'expired' || alert.alertType === 'out_of_stock' 
                            ? 'bg-destructive/10 text-destructive' 
                            : alert.priority === 'high' 
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-warning/10 text-warning'
                        }`}>
                          {getAlertIcon(alert.alertType)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{alert.productName}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <span>Product ID: {alert.productId}</span>
                            <Badge variant={getAlertColor(alert.alertType, alert.priority)} size="sm">
                              {getAlertTitle(alert.alertType)}
                            </Badge>
                            <Badge variant="outline" size="sm">
                              {alert.priority.toUpperCase()}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!alert.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsRead(alert.id)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Mark Read</span>
                          </Button>
                        )}
                        {!alert.isResolved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsResolved(alert.id)}
                            className="flex items-center space-x-1"
                          >
                            <Archive className="h-3 w-3" />
                            <span>Resolve</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Alert>
                        <AlertDescription>
                          {alert.alertType === 'low_stock' && 
                            `Current stock (${alert.currentStock}) is below minimum threshold (${alert.minThreshold})`}
                          {alert.alertType === 'out_of_stock' && 
                            `Product is out of stock. Minimum threshold: ${alert.minThreshold}`}
                          {alert.alertType === 'expiring' && alert.expiryDate &&
                            `Product expires on ${new Date(alert.expiryDate).toLocaleDateString()}`}
                          {alert.alertType === 'expired' && alert.expiryDate &&
                            `Product expired on ${new Date(alert.expiryDate).toLocaleDateString()}`}
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>Current Stock: {alert.currentStock}</span>
                          <span>Min Threshold: {alert.minThreshold}</span>
                          {alert.expiryDate && (
                            <span>Expiry: {new Date(alert.expiryDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        <span>
                          Created: {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryAlerts;