import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Unlock,
  UserCheck,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AdminUser {
  ID: number;
  Name: string;
  Email: string;
  profileId?: number;
  role: string;
  station: string;
  is_active: boolean;
}

interface ProtectionRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  critical: boolean;
}

const AdminProtectionManager: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [protectionRules, setProtectionRules] = useState<ProtectionRule[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const defaultProtectionRules: ProtectionRule[] = [
    {
      id: 'admin_email_protection',
      name: 'Admin Email Protection',
      description: 'Prevent admin@dfs-portal.com from being deleted or having email changed',
      enabled: true,
      critical: true
    },
    {
      id: 'last_admin_protection',
      name: 'Last Administrator Protection',
      description: 'Prevent deletion/deactivation of the last remaining administrator',
      enabled: true,
      critical: true
    },
    {
      id: 'role_change_protection',
      name: 'Admin Role Change Protection',
      description: 'Require confirmation for administrator role changes',
      enabled: true,
      critical: false
    },
    {
      id: 'bulk_admin_protection',
      name: 'Bulk Administrator Protection',
      description: 'Prevent bulk operations that affect multiple administrators',
      enabled: true,
      critical: false
    }
  ];

  useEffect(() => {
    loadAdminUsers();
    loadProtectionRules();
  }, []);

  const loadAdminUsers = async () => {
    try {
      setIsLoading(true);

      // Load user profiles with Administrator role
      const { data, error } = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [
          { name: 'role', op: 'Equal', value: 'Administrator' }
        ]
      });

      if (error) throw error;

      const profiles = data?.List || [];
      const admins: AdminUser[] = [];

      // For each profile, try to get user info if it's the current user
      for (const profile of profiles) {
        let userInfo = null;
        
        // If this is the current user's profile, get their info
        if (user && profile.user_id === user.ID) {
          userInfo = user;
        }

        admins.push({
          ID: profile.user_id,
          Name: userInfo?.Name || `User ${profile.user_id}`,
          Email: userInfo?.Email || `user${profile.user_id}@example.com`,
          profileId: profile.id,
          role: profile.role,
          station: profile.station,
          is_active: profile.is_active
        });
      }

      setAdminUsers(admins);
    } catch (error) {
      console.error('Error loading admin users:', error);
      toast({
        title: "Error",
        description: "Failed to load administrator users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadProtectionRules = () => {
    // In a real implementation, these would be loaded from a database or configuration
    setProtectionRules(defaultProtectionRules);
  };

  const toggleProtectionRule = (ruleId: string) => {
    setProtectionRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );

    const rule = protectionRules.find(r => r.id === ruleId);
    if (rule) {
      toast({
        title: "Protection Rule Updated",
        description: `${rule.name} ${rule.enabled ? 'disabled' : 'enabled'}`,
      });
    }
  };

  const validateAdminOperation = (operationType: string, targetUserId?: number): boolean => {
    const enabledRules = protectionRules.filter(rule => rule.enabled);
    
    // Check admin email protection
    if (enabledRules.some(rule => rule.id === 'admin_email_protection')) {
      const targetAdmin = adminUsers.find(admin => admin.ID === targetUserId);
      if (targetAdmin?.Email === 'admin@dfs-portal.com') {
        toast({
          title: "Operation Blocked",
          description: "Cannot modify the protected admin account (admin@dfs-portal.com)",
          variant: "destructive"
        });
        return false;
      }
    }

    // Check last admin protection
    if (enabledRules.some(rule => rule.id === 'last_admin_protection')) {
      const activeAdmins = adminUsers.filter(admin => admin.is_active);
      if (activeAdmins.length <= 1 && operationType === 'deactivate') {
        toast({
          title: "Operation Blocked",
          description: "Cannot deactivate the last remaining administrator",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const getProtectionStatus = (): { level: string; color: string; message: string } => {
    const enabledCriticalRules = protectionRules.filter(rule => rule.enabled && rule.critical).length;
    const totalCriticalRules = protectionRules.filter(rule => rule.critical).length;
    const activeAdmins = adminUsers.filter(admin => admin.is_active).length;

    if (enabledCriticalRules === totalCriticalRules && activeAdmins > 1) {
      return {
        level: 'HIGH',
        color: 'bg-green-100 text-green-800 border-green-200',
        message: 'All critical protections active with multiple administrators'
      };
    } else if (enabledCriticalRules === totalCriticalRules) {
      return {
        level: 'MEDIUM',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        message: 'Critical protections active but only one administrator'
      };
    } else {
      return {
        level: 'LOW',
        color: 'bg-red-100 text-red-800 border-red-200',
        message: 'Some critical protections are disabled'
      };
    }
  };

  const protectionStatus = getProtectionStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Administrator Protection Manager
            <Badge className={protectionStatus.color}>
              {protectionStatus.level} PROTECTION
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className={`border ${protectionStatus.color.includes('green') ? 'border-green-200 bg-green-50' : 
            protectionStatus.color.includes('yellow') ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
            <Shield className="w-4 h-4" />
            <AlertDescription>{protectionStatus.message}</AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <UserCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-800">{adminUsers.length}</div>
              <div className="text-sm text-blue-600">Total Admins</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-800">
                {adminUsers.filter(admin => admin.is_active).length}
              </div>
              <div className="text-sm text-green-600">Active Admins</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Lock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-800">
                {protectionRules.filter(rule => rule.enabled).length}
              </div>
              <div className="text-sm text-purple-600">Active Rules</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setIsConfigOpen(true)} variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configure Protection Rules
            </Button>
            <Button onClick={loadAdminUsers} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Administrator Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {adminUsers.map(admin => (
              <div key={admin.ID} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">{admin.Name}</div>
                    <div className="text-sm text-gray-500">{admin.Email}</div>
                    <div className="text-xs text-gray-400">Station: {admin.station}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {admin.Email === 'admin@dfs-portal.com' && (
                    <Badge variant="destructive" className="gap-1">
                      <Lock className="w-3 h-3" />
                      Protected
                    </Badge>
                  )}
                  <Badge variant={admin.is_active ? "default" : "secondary"}>
                    {admin.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Protection Configuration Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Protection Rules Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {protectionRules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{rule.name}</h4>
                    {rule.critical && (
                      <Badge variant="destructive" className="text-xs">
                        Critical
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleProtectionRule(rule.id)}
                    disabled={rule.critical} // Critical rules cannot be disabled
                  />
                  <Label className="text-sm">
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </Label>
                </div>
              </div>
            ))}
            
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Critical protection rules cannot be disabled to ensure system security.
                These rules prevent accidental lockout from the admin account.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProtectionManager;