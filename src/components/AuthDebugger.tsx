import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, User, Shield, Database, Check, X } from 'lucide-react';

const AuthDebugger: React.FC = () => {
  const { user, userProfile, isAuthenticated, isAdmin } = useAuth();
  const [debugData, setDebugData] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  // Only show to admin users who are already logged in
  if (!isAuthenticated || !isAdmin()) {
    return null;
  }

  const runAuthDebug = async () => {
    setIsDebugging(true);
    try {
      // Get current user info
      const userResponse = await window.ezsite.apis.getUserInfo();
      
      // Get all user profiles
      const allProfilesResponse = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 20,
        Filters: []
      });

      // Get current user profile specifically
      let currentProfileResponse = null;
      if (userResponse.data?.ID) {
        currentProfileResponse = await window.ezsite.apis.tablePage(11725, {
          PageNo: 1,
          PageSize: 1,
          Filters: [
            { name: "user_id", op: "Equal", value: userResponse.data.ID }
          ]
        });
      }

      setDebugData({
        timestamp: new Date().toISOString(),
        currentUser: userResponse,
        allProfiles: allProfilesResponse,
        currentProfile: currentProfileResponse,
        contextUser: user,
        contextProfile: userProfile
      });
    } catch (error) {
      console.error('Debug error:', error);
      setDebugData({
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsDebugging(false);
    }
  };

  const clearDebugData = () => {
    setDebugData(null);
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Authentication Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runAuthDebug}
            disabled={isDebugging}
            size="sm"
            variant="outline"
          >
            <Database className="h-4 w-4 mr-2" />
            {isDebugging ? 'Debugging...' : 'Run Auth Debug'}
          </Button>
          {debugData && (
            <Button 
              onClick={clearDebugData}
              size="sm"
              variant="ghost"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Current Auth State */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Current Auth State:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Authenticated: <Badge variant={isAuthenticated ? "default" : "destructive"}>
              {isAuthenticated ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </Badge></div>
            <div>Is Admin: <Badge variant={isAdmin() ? "default" : "secondary"}>
              {isAdmin() ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </Badge></div>
          </div>
          
          {user && (
            <div className="p-2 bg-white rounded border text-xs">
              <div><strong>User:</strong> {user.Email} (ID: {user.ID})</div>
              <div><strong>Name:</strong> {user.Name}</div>
            </div>
          )}
          
          {userProfile && (
            <div className="p-2 bg-white rounded border text-xs">
              <div><strong>Profile ID:</strong> {userProfile.id}</div>
              <div><strong>User ID:</strong> {userProfile.user_id}</div>
              <div><strong>Role:</strong> {userProfile.role}</div>
              <div><strong>Station:</strong> {userProfile.station}</div>
            </div>
          )}
        </div>

        {debugData && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Debug Results:</h4>
              
              {debugData.error ? (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                  Error: {debugData.error}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Current User API Response */}
                  <div>
                    <h5 className="font-medium text-xs mb-1">Current User API:</h5>
                    <div className="p-2 bg-white rounded border text-xs">
                      <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                        {JSON.stringify(debugData.currentUser, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Current Profile API Response */}
                  <div>
                    <h5 className="font-medium text-xs mb-1">Current Profile API:</h5>
                    <div className="p-2 bg-white rounded border text-xs">
                      <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                        {JSON.stringify(debugData.currentProfile, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* All Profiles */}
                  <div>
                    <h5 className="font-medium text-xs mb-1">All User Profiles:</h5>
                    <div className="p-2 bg-white rounded border text-xs">
                      <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                        {JSON.stringify(debugData.allProfiles?.data?.List || [], null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Context Comparison */}
                  <div>
                    <h5 className="font-medium text-xs mb-1">Context vs API Comparison:</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-blue-50 rounded border text-xs">
                        <div><strong>Context User ID:</strong> {user?.ID}</div>
                        <div><strong>Context Email:</strong> {user?.Email}</div>
                        <div><strong>Context Profile User ID:</strong> {userProfile?.user_id}</div>
                        <div><strong>Context Profile Role:</strong> {userProfile?.role}</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded border text-xs">
                        <div><strong>API User ID:</strong> {debugData.currentUser?.data?.ID}</div>
                        <div><strong>API Email:</strong> {debugData.currentUser?.data?.Email}</div>
                        <div><strong>API Profile User ID:</strong> {debugData.currentProfile?.data?.List?.[0]?.user_id}</div>
                        <div><strong>API Profile Role:</strong> {debugData.currentProfile?.data?.List?.[0]?.role}</div>
                      </div>
                    </div>
                  </div>

                  {/* Mismatch Detection */}
                  {(user?.ID !== debugData.currentUser?.data?.ID || 
                    userProfile?.user_id !== debugData.currentProfile?.data?.List?.[0]?.user_id) && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center gap-2 text-red-800 font-semibold text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        MISMATCH DETECTED!
                      </div>
                      <div className="text-xs text-red-700 mt-1">
                        The context data doesn't match the API response. This indicates an authentication bug.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDebugger;