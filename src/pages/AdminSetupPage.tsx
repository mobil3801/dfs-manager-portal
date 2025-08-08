
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Building2, User, CheckCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Station {
  id: string
  name: string
  address?: string
  phone?: string
  manager_name?: string
  status: string
}

const AdminSetupPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, userProfile, updateProfile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [stations, setStations] = useState<Station[]>([])
  const [setupStep, setSetupStep] = useState<'profile' | 'station' | 'complete'>('profile')
  const [profileData, setProfileData] = useState({
    full_name: userProfile?.full_name || '',
    phone: userProfile?.phone || '',
    role: userProfile?.role || 'user'
  })
  const [selectedStationId, setSelectedStationId] = useState<string>('')
  const [isCreatingStation, setIsCreatingStation] = useState(false)
  const [newStationData, setNewStationData] = useState({
    name: '',
    address: '',
    phone: '',
    manager_name: ''
  })

  useEffect(() => {
    loadStations()
    
    // Check if user already has station assigned
    if (userProfile?.station_id || userProfile?.role === 'super_admin') {
      navigate('/dashboard')
    }
  }, [userProfile])

  const loadStations = async () => {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setStations(data || [])
    } catch (error: any) {
      console.error('Error loading stations:', error)
      toast({
        title: "Error loading stations",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleProfileUpdate = async () => {
    setLoading(true)
    try {
      await updateProfile(profileData)
      await refreshProfile()
      
      if (profileData.role === 'super_admin') {
        setSetupStep('complete')
      } else {
        setSetupStep('station')
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStation = async () => {
    if (!newStationData.name) {
      toast({
        title: "Station name required",
        description: "Please enter a station name",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('stations')
        .insert([{
          ...newStationData,
          status: 'active'
        }])
        .select()
        .single()

      if (error) throw error

      // Update user profile with new station
      await updateProfile({
        station_id: data.id,
        role: 'manager' // Station creator becomes manager
      })

      await refreshProfile()
      setSetupStep('complete')

      toast({
        title: "Station created successfully",
        description: `${newStationData.name} has been set up`
      })
    } catch (error: any) {
      console.error('Error creating station:', error)
      toast({
        title: "Error creating station",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStationAssignment = async () => {
    if (!selectedStationId) {
      toast({
        title: "Please select a station",
        description: "Choose the station you want to be assigned to",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      await updateProfile({
        station_id: selectedStationId,
        role: 'staff' // Default role for assigned users
      })

      await refreshProfile()
      setSetupStep('complete')

      const selectedStation = stations.find(s => s.id === selectedStationId)
      toast({
        title: "Station assigned successfully",
        description: `You've been assigned to ${selectedStation?.name}`
      })
    } catch (error: any) {
      console.error('Error assigning station:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteSetup = () => {
    navigate('/dashboard')
  }

  if (setupStep === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-white" />
            </div>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Let's set up your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profileData.full_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={profileData.role} 
                onValueChange={(value) => setProfileData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleProfileUpdate} 
              className="w-full"
              disabled={loading || !profileData.full_name}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (setupStep === 'station') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <CardTitle>Station Assignment</CardTitle>
            <CardDescription>
              Choose your gas station or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isCreatingStation ? (
              <>
                {/* Existing Stations */}
                <div className="space-y-4">
                  <h3 className="font-medium">Select Existing Station</h3>
                  {stations.length > 0 ? (
                    <div className="space-y-2">
                      {stations.map((station) => (
                        <div
                          key={station.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedStationId === station.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedStationId(station.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{station.name}</h4>
                              {station.address && (
                                <p className="text-sm text-gray-600">{station.address}</p>
                              )}
                              {station.manager_name && (
                                <p className="text-sm text-gray-500">Manager: {station.manager_name}</p>
                              )}
                            </div>
                            <Badge variant="secondary">{station.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No existing stations found</p>
                  )}
                  
                  {selectedStationId && (
                    <Button onClick={handleStationAssignment} className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Assign to Selected Station
                    </Button>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-50 px-2 text-gray-500">Or</span>
                  </div>
                </div>

                {/* Create New Station Button */}
                <Button 
                  onClick={() => setIsCreatingStation(true)}
                  variant="outline" 
                  className="w-full"
                >
                  Create New Station
                </Button>
              </>
            ) : (
              <>
                {/* Create New Station Form */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Create New Station</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsCreatingStation(false)}
                    >
                      Back
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="station_name">Station Name *</Label>
                    <Input
                      id="station_name"
                      value={newStationData.name}
                      onChange={(e) => setNewStationData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Downtown Gas Station"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="station_address">Address</Label>
                    <Textarea
                      id="station_address"
                      value={newStationData.address}
                      onChange={(e) => setNewStationData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter station address"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="station_phone">Phone Number</Label>
                    <Input
                      id="station_phone"
                      type="tel"
                      value={newStationData.phone}
                      onChange={(e) => setNewStationData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Station phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manager_name">Manager Name</Label>
                    <Input
                      id="manager_name"
                      value={newStationData.manager_name}
                      onChange={(e) => setNewStationData(prev => ({ ...prev, manager_name: e.target.value }))}
                      placeholder="Station manager name"
                    />
                  </div>

                  <Button 
                    onClick={handleCreateStation} 
                    className="w-full"
                    disabled={loading || !newStationData.name}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Station & Assign Me
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Complete Step
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <CardTitle>Setup Complete!</CardTitle>
          <CardDescription>
            Your account has been configured successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Account Summary</h3>
            <div className="space-y-1 text-sm text-green-700">
              <p><strong>Name:</strong> {profileData.full_name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> <Badge variant="secondary">{profileData.role}</Badge></p>
              {userProfile?.station_id && (
                <p><strong>Station:</strong> Assigned</p>
              )}
            </div>
          </div>

          <Button onClick={handleCompleteSetup} className="w-full">
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminSetupPage
