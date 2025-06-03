import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  SettingsIcon,
  UsersIcon,
  ClipboardListIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  FileTextIcon,
  TrendingUpIcon,
  ActivityIcon } from
'lucide-react';
import { ReportHeader, MetricCard, ReportSection, DataTable } from '@/components/Reports/ComprehensiveReportLayout';
import DeliveryTrackingSystem from '@/components/Operations/DeliveryTrackingSystem';

interface Station {
  id: number;
  station_name: string;
  address: string;
  phone: string;
  operating_hours: string;
  manager_name: string;
  status: string;
  last_updated: string;
}

interface License {
  id: number;
  license_name: string;
  license_number: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  station: string;
  category: string;
  status: string;
}

interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  position: string;
  station: string;
  hire_date: string;
  is_active: boolean;
}

interface OperationalMetrics {
  totalStations: number;
  activeEmployees: number;
  expiringSoonLicenses: number;
  pendingTasks: number;
  overallEfficiency: number;
  complianceRate: number;
}

const ComprehensiveOperationsManager: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    fetchOperationalData();
  }, []);

  const fetchOperationalData = async () => {
    try {
      setLoading(true);

      const [stationsResponse, licensesResponse, employeesResponse] = await Promise.all([
      window.ezsite.apis.tablePage(12599, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "station_name",
        IsAsc: true,
        Filters: []
      }),
      window.ezsite.apis.tablePage(11731, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "expiry_date",
        IsAsc: true,
        Filters: []
      }),
      window.ezsite.apis.tablePage(11727, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "first_name",
        IsAsc: true,
        Filters: [
        {
          name: "is_active",
          op: "Equal",
          value: true
        }]

      })]
      );

      if (stationsResponse.error) throw stationsResponse.error;
      if (licensesResponse.error) throw licensesResponse.error;
      if (employeesResponse.error) throw employeesResponse.error;

      setStations(stationsResponse.data.List);
      setLicenses(licensesResponse.data.List);
      setEmployees(employeesResponse.data.List);
    } catch (error) {
      console.error('Error fetching operational data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch operational data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateOperationalMetrics = (): OperationalMetrics => {
    const totalStations = stations.length;
    const activeEmployees = employees.filter((emp) => emp.is_active).length;

    // Calculate licenses expiring in next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoonLicenses = licenses.filter((license) => {
      const expiryDate = new Date(license.expiry_date);
      return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
    }).length;

    const pendingTasks = expiringSoonLicenses +
    licenses.filter((l) => l.status === 'Pending Renewal').length;

    const overallEfficiency = Math.round(
      totalStations * activeEmployees / Math.max(totalStations * 3, 1) * 100
    );

    const activeLicenses = licenses.filter((l) => l.status === 'Active').length;
    const complianceRate = licenses.length > 0 ? activeLicenses / licenses.length * 100 : 100;

    return {
      totalStations,
      activeEmployees,
      expiringSoonLicenses,
      pendingTasks,
      overallEfficiency,
      complianceRate
    };
  };

  const getStationOperationalStatus = () => {
    return stations.map((station) => {
      const stationEmployees = employees.filter((emp) => emp.station === station.station_name);
      const stationLicenses = licenses.filter((lic) =>
      lic.station === station.station_name || lic.station === 'ALL'
      );

      const expiredLicenses = stationLicenses.filter((lic) =>
      new Date(lic.expiry_date) < new Date()
      ).length;

      const operationalScore = Math.round(
        (stationEmployees.length * 30 +
        stationLicenses.length * 20 -
        expiredLicenses * 10) / 10
      );

      return {
        station: station.station_name,
        manager: station.manager_name,
        employees: stationEmployees.length,
        licenses: stationLicenses.length,
        expiredLicenses,
        status: station.status,
        operationalScore: Math.max(0, Math.min(100, operationalScore)),
        lastUpdated: station.last_updated
      };
    });
  };

  const getLicenseComplianceTable = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return licenses.
    filter((license) => {
      const expiryDate = new Date(license.expiry_date);
      return expiryDate <= thirtyDaysFromNow;
    }).
    sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()).
    slice(0, 15).
    map((license) => {
      const expiryDate = new Date(license.expiry_date);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return [
      license.license_name,
      license.license_number,
      license.station,
      license.category,
      new Date(license.expiry_date).toLocaleDateString(),
      <Badge
        key={license.id}
        variant={daysUntilExpiry < 0 ? 'destructive' :
        daysUntilExpiry <= 7 ? 'destructive' :
        daysUntilExpiry <= 30 ? 'default' : 'secondary'}>

            {daysUntilExpiry < 0 ? 'Expired' :
        daysUntilExpiry === 0 ? 'Expires Today' :
        `${daysUntilExpiry} days`}
          </Badge>];

    });
  };

  const getEmployeeDistribution = () => {
    const distribution = stations.map((station) => {
      const stationEmployees = employees.filter((emp) => emp.station === station.station_name);
      return {
        station: station.station_name,
        count: stationEmployees.length,
        positions: stationEmployees.reduce((acc: any, emp) => {
          acc[emp.position] = (acc[emp.position] || 0) + 1;
          return acc;
        }, {})
      };
    });

    return distribution.map((item) => [
    item.station,
    item.count,
    Object.keys(item.positions).join(', '),
    item.count >= 3 ? 'Adequate' : 'Understaffed']
    );
  };

  const getUpcomingTasks = () => {
    const tasks = [];

    // License renewals
    licenses.forEach((license) => {
      const expiryDate = new Date(license.expiry_date);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
        tasks.push({
          type: 'License Renewal',
          description: `Renew ${license.license_name}`,
          station: license.station,
          dueDate: license.expiry_date,
          priority: daysUntilExpiry <= 7 ? 'High' : daysUntilExpiry <= 14 ? 'Medium' : 'Low'
        });
      }
    });

    // Station maintenance (simulated based on last updated)
    stations.forEach((station) => {
      const lastUpdated = new Date(station.last_updated);
      const daysSinceUpdate = Math.ceil((new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceUpdate > 30) {
        tasks.push({
          type: 'Station Review',
          description: `Update station information for ${station.station_name}`,
          station: station.station_name,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'Medium'
        });
      }
    });

    return tasks.
    sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).
    slice(0, 10).
    map((task) => [
    task.type,
    task.description,
    task.station,
    new Date(task.dueDate).toLocaleDateString(),
    <Badge
      key={`${task.type}-${task.station}`}
      variant={task.priority === 'High' ? 'destructive' :
      task.priority === 'Medium' ? 'default' : 'secondary'}>

          {task.priority}
        </Badge>]
    );
  };

  const metrics = calculateOperationalMetrics();
  const stationStatus = getStationOperationalStatus();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) =>
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
            )}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>);

  }

  return (
    <div className="p-6 space-y-6">
      <ReportHeader
        title="Comprehensive Operations Manager"
        subtitle="Complete operational oversight and management dashboard"
        reportId={`OPS-${Date.now()}`}
        onPrint={() => window.print()}
        onExport={() => toast({ title: "Export", description: "Export functionality coming soon" })}
        onFilter={() => {}} />


      {/* Key Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Stations"
          value={metrics.totalStations}
          subtitle="Operational locations"
          icon={<MapPinIcon className="w-5 h-5" />} />

        <MetricCard
          title="Active Employees"
          value={metrics.activeEmployees}
          subtitle="Current workforce"
          icon={<UsersIcon className="w-5 h-5" />}
          trend={{ value: 5.2, isPositive: true }} />

        <MetricCard
          title="Compliance Rate"
          value={`${metrics.complianceRate.toFixed(1)}%`}
          subtitle="License compliance"
          icon={<CheckCircleIcon className="w-5 h-5" />}
          trend={{ value: 2.1, isPositive: true }} />

        <MetricCard
          title="Pending Tasks"
          value={metrics.pendingTasks}
          subtitle="Require attention"
          icon={<AlertTriangleIcon className="w-5 h-5" />}
          trend={{ value: -12.3, isPositive: true }} />

      </div>

      {/* Operations Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stations">Stations</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="workforce">Workforce</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Station Operational Status */}
          <ReportSection title="Station Operational Status">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stationStatus.map((station, index) =>
              <Card key={station.station} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        {station.station}
                      </span>
                      <Badge
                      variant={station.operationalScore >= 80 ? 'default' :
                      station.operationalScore >= 60 ? 'secondary' : 'destructive'}>

                        {station.operationalScore}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Manager:</span>
                        <span className="font-medium">{station.manager}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Employees:</span>
                        <span className="font-medium">{station.employees}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Licenses:</span>
                        <span className="font-medium">{station.licenses}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant={station.status === 'Active' ? 'default' : 'secondary'}>
                          {station.status}
                        </Badge>
                      </div>
                      {station.expiredLicenses > 0 &&
                    <div className="flex justify-between text-sm">
                          <span className="text-red-600">Expired Licenses:</span>
                          <span className="font-medium text-red-600">{station.expiredLicenses}</span>
                        </div>
                    }
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ReportSection>

          {/* Upcoming Tasks */}
          <ReportSection title="Upcoming Tasks & Deadlines">
            <DataTable
              headers={['Task Type', 'Description', 'Station', 'Due Date', 'Priority']}
              data={getUpcomingTasks()}
              showRowNumbers={true}
              alternateRows={true} />

          </ReportSection>
        </TabsContent>

        <TabsContent value="stations" className="space-y-6">
          <ReportSection title="Station Management">
            <div className="grid grid-cols-1 gap-6">
              {stations.map((station, index) =>
              <Card key={station.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5 text-blue-600" />
                        {station.station_name}
                      </span>
                      <Badge variant={station.status === 'Active' ? 'default' : 'secondary'}>
                        {station.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Address</h4>
                        <p className="text-sm text-gray-600">{station.address}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Phone</h4>
                        <p className="text-sm text-gray-600">{station.phone}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Manager</h4>
                        <p className="text-sm text-gray-600">{station.manager_name}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Operating Hours</h4>
                        <p className="text-sm text-gray-600">{station.operating_hours}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Last Updated: {new Date(station.last_updated).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Edit Details</Button>
                          <Button size="sm">View Reports</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ReportSection>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ReportSection title="License Compliance Monitoring">
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <h3 className="font-semibold">Active Licenses</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {licenses.filter((l) => l.status === 'Active').length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <AlertTriangleIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <h3 className="font-semibold">Expiring Soon</h3>
                      <p className="text-2xl font-bold text-yellow-600">
                        {metrics.expiringSoonLicenses}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <ClockIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <h3 className="font-semibold">Expired</h3>
                      <p className="text-2xl font-bold text-red-600">
                        {licenses.filter((l) => new Date(l.expiry_date) < new Date()).length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <DataTable
              headers={['License Name', 'Number', 'Station', 'Category', 'Expiry Date', 'Status']}
              data={getLicenseComplianceTable()}
              showRowNumbers={true}
              alternateRows={true} />

          </ReportSection>
        </TabsContent>

        <TabsContent value="workforce" className="space-y-6">
          <ReportSection title="Workforce Distribution">
            <DataTable
              headers={['Station', 'Employee Count', 'Positions', 'Status']}
              data={getEmployeeDistribution()}
              showRowNumbers={true}
              alternateRows={true} />

          </ReportSection>

          <ReportSection title="Employee Details">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.slice(0, 9).map((employee, index) =>
              <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <UsersIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{employee.position}</p>
                      <Badge variant="outline" className="mb-3">{employee.station}</Badge>
                      <div className="text-xs text-gray-500">
                        <p>ID: {employee.employee_id}</p>
                        <p>Hired: {new Date(employee.hire_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ReportSection>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <DeliveryTrackingSystem />
        </TabsContent>
      </Tabs>
    </div>);

};

export default ComprehensiveOperationsManager;