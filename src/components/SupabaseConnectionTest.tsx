
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, Database, Users, Building2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ConnectionStatus {
  database: boolean
  auth: boolean
  storage: boolean
  stations: number
  users: number
}

const SupabaseConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    database: false,
    auth: false,
    storage: false,
    stations: 0,
    users: 0
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    testConnections()
  }, [])

  const testConnections = async () => {
    setLoading(true)
    
    try {
      const newStatus: ConnectionStatus = {
        database: false,
        auth: false,
        storage: false,
        stations: 0,
        users: 0
      }

      // Test Database Connection
      try {
        const { data: stationsData, error: stationsError } = await supabase
          .from('stations')
          .select('id', { count: 'exact' })
        
        if (!stationsError) {
          newStatus.database = true
          newStatus.stations = stationsData?.length || 0
        }
      } catch (error) {
        console.error('Database test failed:', error)
      }

      // Test Auth
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        if (!authError) {
          newStatus.auth = true
        }
      } catch (error) {
        console.error('Auth test failed:', error)
      }

      // Test Storage
      try {
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
        if (!storageError) {
          newStatus.storage = true
        }
      } catch (error) {
        console.error('Storage test failed:', error)
      }

      // Test User Profiles
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id', { count: 'exact' })
        
        if (!profilesError) {
          newStatus.users = profilesData?.length || 0
        }
      } catch (error) {
        console.error('User profiles test failed:', error)
      }

      setStatus(newStatus)
      
      if (newStatus.database && newStatus.auth && newStatus.storage) {
        toast({
          title: "Connection successful",
          description: "All Supabase services are connected and working"
        })
      } else {
        toast({
          title: "Connection issues detected",
          description: "Some services may not be fully configured",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('Connection test error:', error)
      toast({
        title: "Connection test failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const StatusIcon = ({ status }: { status: boolean }) => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin" />
    return status ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Supabase Connection Test
        </CardTitle>
        <CardDescription>
          Test connection to all Supabase services and view database statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <StatusIcon status={status.database} />
            <div>
              <p className="font-medium">Database</p>
              <p className="text-sm text-gray-500">
                {status.database ? 'Connected' : 'Failed'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <StatusIcon status={status.auth} />
            <div>
              <p className="font-medium">Authentication</p>
              <p className="text-sm text-gray-500">
                {status.auth ? 'Ready' : 'Failed'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <StatusIcon status={status.storage} />
            <div>
              <p className="font-medium">Storage</p>
              <p className="text-sm text-gray-500">
                {status.storage ? 'Available' : 'Failed'}
              </p>
            </div>
          </div>
        </div>

        {/* Database Statistics */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Database Statistics</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>Stations</span>
              </div>
              <Badge variant="secondary">{status.stations}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <span>Users</span>
              </div>
              <Badge variant="secondary">{status.users}</Badge>
            </div>
          </div>
        </div>

        {/* Test Button */}
        <Button 
          onClick={testConnections} 
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Testing Connections...' : 'Test Connections Again'}
        </Button>

        {/* Connection Details */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>Database: PostgreSQL via Supabase</p>
          <p>Storage Bucket: dfs-manager-files</p>
          <p>Authentication: Supabase Auth with RLS policies</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default SupabaseConnectionTest
