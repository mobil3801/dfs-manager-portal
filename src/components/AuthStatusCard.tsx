import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { CheckCircle2, XCircle, User, Shield, Database, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthStatusCard: React.FC = () => {
  const { user, userProfile, isAuthenticated, session } = useSupabaseAuth();
  const navigate = useNavigate();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Authentication Status
        </CardTitle>
        <CardDescription>
          Current Supabase authentication and user profile information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Authentication Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className="font-medium">Authentication</span>
          </div>
          <Badge variant={isAuthenticated ? 'default' : 'destructive'}>
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </Badge>
        </div>

        {/* User Information */}
        {user && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="font-medium">User Details</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
              <p><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</p>
            </div>
          </div>
        )}

        {/* User Profile */}
        {userProfile && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Profile Information</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
              <p><strong>Role:</strong> <Badge variant="outline">{userProfile.role}</Badge></p>
              {userProfile.station_id && <p><strong>Station:</strong> {userProfile.stations?.name || userProfile.station_id}</p>}
              {userProfile.employee_id && <p><strong>Employee ID:</strong> {userProfile.employee_id}</p>}
              {userProfile.phone && <p><strong>Phone:</strong> {userProfile.phone}</p>}
              <p><strong>Status:</strong> <Badge variant={userProfile.is_active ? 'default' : 'destructive'}>{userProfile.is_active ? 'Active' : 'Inactive'}</Badge></p>
            </div>
          </div>
        )}

        {/* Session Information */}
        {session && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-600" />
              <span className="font-medium">Session Details</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
              <p><strong>Access Token:</strong> {session.access_token.substring(0, 20)}...</p>
              <p><strong>Token Type:</strong> {session.token_type}</p>
              <p><strong>Expires:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Test Buttons */}
        <div className="pt-4 space-y-2">
          <Button 
            onClick={() => navigate('/supabase-test')} 
            variant="outline" 
            className="w-full"
          >
            <Database className="mr-2 h-4 w-4" />
            Test Supabase Connection
          </Button>
          
          {!isAuthenticated && (
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full"
            >
              <Shield className="mr-2 h-4 w-4" />
              Sign In with Supabase
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthStatusCard;