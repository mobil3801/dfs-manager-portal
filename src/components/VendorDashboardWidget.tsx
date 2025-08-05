import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, TrendingUp, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { vendorService } from '@/services/vendorService';
import { motion } from 'motion/react';

interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  inactiveVendors: number;
  categoryBreakdown: Record<string, number>;
  recentVendors: any[];
}

const VendorDashboardWidget: React.FC = () => {
  const [stats, setStats] = useState<VendorStats>({
    totalVendors: 0,
    activeVendors: 0,
    inactiveVendors: 0,
    categoryBreakdown: {},
    recentVendors: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadVendorStats();
  }, []);

  const loadVendorStats = async () => {
    try {
      setLoading(true);

      // Get all vendors to calculate statistics
      const allVendorsResult = await vendorService.getVendors({ limit: 1000 });
      const vendors = allVendorsResult.vendors;

      // Calculate basic stats
      const totalVendors = vendors.length;
      const activeVendors = vendors.filter(v => v.is_active).length;
      const inactiveVendors = totalVendors - activeVendors;

      // Calculate category breakdown
      const categoryBreakdown: Record<string, number> = {};
      vendors.forEach(vendor => {
        categoryBreakdown[vendor.category] = (categoryBreakdown[vendor.category] || 0) + 1;
      });

      // Get recent vendors (last 5)
      const recentVendors = vendors
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 5);

      setStats({
        totalVendors,
        activeVendors,
        inactiveVendors,
        categoryBreakdown,
        recentVendors
      });
    } catch (error) {
      console.error('Error loading vendor stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      'Fuel Supplier': 'bg-blue-500',
      'Food & Beverages': 'bg-green-500',
      'Automotive': 'bg-orange-500',
      'Maintenance': 'bg-purple-500',
      'Office Supplies': 'bg-gray-500',
      'Technology': 'bg-indigo-500',
      'Insurance': 'bg-yellow-500',
      'Legal Services': 'bg-red-500',
      'Marketing': 'bg-pink-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const topCategories = Object.entries(stats.categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Vendor Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Vendor Overview</span>
            </CardTitle>
            <CardDescription>Manage your vendor relationships</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/vendors')}
            className="text-blue-600 hover:text-blue-700"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-2xl font-bold text-blue-600">{stats.totalVendors}</div>
            <div className="text-xs text-gray-500">Total Vendors</div>
          </motion.div>
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-2xl font-bold text-green-600">{stats.activeVendors}</div>
            <div className="text-xs text-gray-500">Active</div>
          </motion.div>
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-2xl font-bold text-gray-600">{stats.inactiveVendors}</div>
            <div className="text-xs text-gray-500">Inactive</div>
          </motion.div>
        </div>

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Top Categories</h4>
            <div className="space-y-2">
              {topCategories.map(([category, count], index) => (
                <motion.div
                  key={category}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="flex items-center space-x-2">
                    <Badge className={`text-white text-xs ${getCategoryBadgeColor(category)}`}>
                      {category}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Vendors */}
        {stats.recentVendors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Recent Vendors
            </h4>
            <div className="space-y-2">
              {stats.recentVendors.slice(0, 3).map((vendor, index) => (
                <motion.div
                  key={vendor.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate('/vendors')}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{vendor.vendor_name}</p>
                    <p className="text-xs text-gray-500 truncate">{vendor.contact_person}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={vendor.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {vendor.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            onClick={() => navigate('/vendors/new')}
            className="flex-1"
          >
            Add Vendor
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/vendors')}
            className="flex-1"
          >
            Manage All
          </Button>
        </div>

        {/* Status Indicators */}
        {stats.inactiveVendors > 0 && (
          <motion.div 
            className="flex items-center space-x-2 p-2 bg-amber-50 border border-amber-200 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-amber-700">
              {stats.inactiveVendors} inactive vendor{stats.inactiveVendors > 1 ? 's' : ''} need attention
            </span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorDashboardWidget;