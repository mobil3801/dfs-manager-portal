
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from 'react-router-dom'
import { 
  Building2, 
  Users, 
  Package, 
  TrendingUp, 
  FileText, 
  Truck, 
  AlertTriangle,
  DollarSign,
  Calendar,
  Activity,
  Plus,
  Settings,
  LogOut,
  Bell,
  User
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface DashboardStats {
  totalEmployees: number
  totalProducts: number
  todaySales: number
  pendingDeliveries: number
  expiringLicenses: number
  lowStockItems: number
}

const Dashboard: React.FC = () => {
  const { user, userProfile, signOut } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalProducts: 0,
    todaySales: 0,
    pendingDeliveries: 0,
    expiringLicenses: 0,
    lowStockItems: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [userProfile])

  const loadDashboardData = async () => {
    if (!userProfile?.station_id && userProfile?.role !== 'super_admin') {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const stationFilter = userProfile.role === 'super_admin' ? {} : { station_id: userProfile.station_id }

      // Load statistics
      const [employeesRes, productsRes, salesRes, deliveriesRes, licensesRes] = await Promise.all([
        supabase.from('employees').select('id', { count: 'exact' }).match(stationFilter),
        supabase.from('products').select('id, quantity_in_stock, minimum_stock_level', { count: 'exact' }).match(stationFilter),
        supabase.from('sales_reports').select('total_sales').match({
          ...stationFilter,
          report_date: new Date().toISOString().split('T')[0]
        }),
        supabase.from('deliveries').select('id', { count: 'exact' }).match({
          ...stationFilter,
          status: 'pending'
        }),
        supabase.from('licenses').select('id, expiry_date').match(stationFilter)
      ])

      // Calculate low stock items
      const lowStock = productsRes.data?.filter(p => 
        p.quantity_in_stock <= p.minimum_stock_level
      ).length || 0

      // Calculate expiring licenses (within 30 days)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      const expiring = licensesRes.data?.filter(l => 
        new Date(l.expiry_date) <= thirtyDaysFromNow
      ).length || 0

      // Calculate today's sales total
      const todaySales = salesRes.data?.reduce((sum, report) => sum + (report.total_sales || 0), 0) || 0

      setStats({
        totalEmployees: employeesRes.count || 0,
        totalProducts: productsRes.count || 0,
        todaySales,
        pendingDeliveries: deliveriesRes.count || 0,
        expiringLicenses: expiring,
        lowStockItems: lowStock
      })

      // Load recent activity (audit logs)
      const { data: auditData } = await supabase
        .from('audit_logs')
        .select('*')
        .match(stationFilter)
        .order('created_at', { ascending: false })
        .limit(10)

      setRecentActivity(auditData || [])
    } catch (error: any) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const quickActions = [
    { label: 'Add Employee', icon: Users, to: '/employees/new' },
    { label: 'Add Product', icon: Package, to: '/products/new' },
    { label: 'New Sales Report', icon: FileText, to: '/sales/new' },
    { label: 'Record Delivery', icon: Truck, to: '/deliveries/new' },
  ]

  const menuItems = [
    { label: 'Employees', icon: Users, to: '/employees' },
    { label: 'Products', icon: Package, to: '/products' },
    { label: 'Sales Reports', icon: TrendingUp, to: '/sales' },
    { label: 'Deliveries', icon: Truck, to: '/deliveries' },
    { label: 'Licenses', icon: FileText, to: '/licenses' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DFS</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">DFS Manager</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Alerts
              </Button>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {userProfile?.full_name || user?.email}
                </span>
                <Badge variant={userProfile?.role === 'admin' ? 'default' : 'secondary'}>
                  {userProfile?.role}
                </Badge>
              </div>
              
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {userProfile?.full_name || 'User'}!
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your gas station today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.todaySales.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              {stats.lowStockItems > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  {stats.lowStockItems} low stock
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingDeliveries}</div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(stats.lowStockItems > 0 || stats.expiringLicenses > 0) && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.lowStockItems > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    Low Stock
                  </Badge>
                  <span className="text-sm text-orange-700">
                    {stats.lowStockItems} products need restocking
                  </span>
                </div>
              )}
              {stats.expiringLicenses > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    Expiring Soon
                  </Badge>
                  <span className="text-sm text-orange-700">
                    {stats.expiringLicenses} licenses expire within 30 days
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to manage your gas station
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.to}>
                      <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                        <action.icon className="h-6 w-6" />
                        <span className="text-sm">{action.label}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation Menu */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Management Tools</CardTitle>
                <CardDescription>
                  Access all your business management features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {menuItems.map((item, index) => (
                    <Link key={index} to={item.to}>
                      <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                        <item.icon className="h-5 w-5 text-gray-500" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent activity to display
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Admin Panel Link */}
            {['admin', 'super_admin'].includes(userProfile?.role || '') && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Administration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link to="/admin">
                    <Button className="w-full">
                      Access Admin Panel
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
