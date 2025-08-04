import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';

const AuthTestComponent: React.FC = () => {
  const [email, setEmail] = useState('admin@dfsmanager.com');
  const [password, setPassword] = useState('Admin123!');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, user, userProfile } = useSupabaseAuth();

  const testDirectLogin = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      console.log('🔐 Testing direct Supabase login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setMessage(`Direct login error: ${error.message}`);
        console.error('Direct login error:', error);
      } else {
        setMessage(`Direct login success: ${data.user?.email}`);
        console.log('Direct login success:', data);
      }
    } catch (err) {
      setMessage(`Direct login exception: ${(err as Error).message}`);
      console.error('Direct login exception:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testContextLogin = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      console.log('🔐 Testing context login...');
      const success = await login(email, password);
      
      if (success) {
        setMessage('Context login success!');
        console.log('Context login success');
      } else {
        setMessage('Context login failed');
        console.log('Context login failed');
      }
    } catch (err) {
      setMessage(`Context login exception: ${(err as Error).message}`);
      console.error('Context login exception:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testSession = async () => {
    setMessage('');
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setMessage(`Session error: ${error.message}`);
      } else if (session) {
        setMessage(`Session exists: ${session.user.email}`);
      } else {
        setMessage('No active session');
      }
    } catch (err) {
      setMessage(`Session exception: ${(err as Error).message}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button onClick={testDirectLogin} disabled={isLoading}>
              Test Direct Login
            </Button>
            <Button onClick={testContextLogin} disabled={isLoading}>
              Test Context Login
            </Button>
            <Button onClick={testSession} disabled={isLoading}>
              Check Session
            </Button>
          </div>
          
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Current Auth State:</h3>
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>User: {user?.email || 'None'}</p>
            <p>Profile: {userProfile?.role || 'None'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthTestComponent;