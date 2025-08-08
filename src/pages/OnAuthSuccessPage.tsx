
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const OnAuthSuccessPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, userProfile, loading, refreshProfile } = useAuth()
  const [processing, setProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        // Check for error in URL params
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (errorParam) {
          setError(errorDescription || errorParam)
          setProcessing(false)
          return
        }

        // Wait for auth to load
        if (loading) return

        // If user is not authenticated, redirect to login
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please sign in to continue.",
            variant: "destructive"
          })
          navigate('/login')
          return
        }

        // Refresh user profile to get latest data
        await refreshProfile()

        // Check if user has completed profile setup
        if (!userProfile?.station_id && userProfile?.role !== 'super_admin') {
          toast({
            title: "Welcome to DFS Manager!",
            description: "Please complete your profile setup.",
          })
          navigate('/admin-setup')
          return
        }

        // Success - redirect to dashboard
        toast({
          title: "Authentication successful",
          description: `Welcome back, ${userProfile?.full_name || user.email}!`
        })
        
        navigate('/dashboard')
      } catch (error: any) {
        console.error('Auth success handler error:', error)
        setError(error.message || 'An unexpected error occurred')
      } finally {
        setProcessing(false)
      }
    }

    handleAuthSuccess()
  }, [user, userProfile, loading, navigate, searchParams, refreshProfile])

  if (processing || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              Processing Authentication
            </CardTitle>
            <CardDescription>
              Please wait while we set up your account...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              Authentication Error
            </CardTitle>
            <CardDescription>
              There was a problem with your authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/login')} 
                variant="outline" 
                className="flex-1"
              >
                Back to Login
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            Authentication Successful
          </CardTitle>
          <CardDescription>
            You will be redirected shortly...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate('/dashboard')} 
            className="w-full"
          >
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default OnAuthSuccessPage
