import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RealTimeData {
  products: any[];
  employees: any[];
  salesReports: any[];
  vendors: any[];
  licenses: any[];
  orders: any[];
  salaryRecords: any[];
  deliveryRecords: any[];
  auditLogs: any[];
  stations: any[];
  smsAlertSettings: any[];
  userProfiles: any[];
  refreshData: () => void;
  isLoading: boolean;
}

const RealTimeDataContext = createContext<RealTimeData | undefined>(undefined);

export const useRealTimeData = () => {
  const context = useContext(RealTimeDataContext);
  if (!context) {
    throw new Error('useRealTimeData must be used within a RealTimeDataProvider');
  }
  return context;
};

interface RealTimeDataProviderProps {
  children: React.ReactNode;
}

export const RealTimeDataProvider: React.FC<RealTimeDataProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    products: [],
    employees: [],
    salesReports: [],
    vendors: [],
    licenses: [],
    orders: [],
    salaryRecords: [],
    deliveryRecords: [],
    auditLogs: [],
    stations: [],
    smsAlertSettings: [],
    userProfiles: []
  });

  const fetchTableData = async (tableId: string, maxRecords = 100) => {
    try {
      const { data: response, error } = await window.ezsite.apis.tablePage(tableId, {
        PageNo: 1,
        PageSize: maxRecords,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (error) {
        console.error(`Error fetching data from table ${tableId}:`, error);
        return [];
      }

      return response?.List || [];
    } catch (error) {
      console.error(`Error fetching data from table ${tableId}:`, error);
      return [];
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Fetch data from all tables concurrently
      const [
      products,
      employees,
      salesReports,
      vendors,
      licenses,
      orders,
      salaryRecords,
      deliveryRecords,
      auditLogs,
      stations,
      smsAlertSettings,
      userProfiles] =
      await Promise.all([
      fetchTableData('11726'), // products
      fetchTableData('11727'), // employees
      fetchTableData('12356'), // daily_sales_reports_enhanced
      fetchTableData('11729'), // vendors
      fetchTableData('11731'), // licenses_certificates
      fetchTableData('11730'), // orders
      fetchTableData('11788'), // salary_records
      fetchTableData('12196'), // delivery_records
      fetchTableData('12706'), // audit_logs
      fetchTableData('12599'), // stations
      fetchTableData('12611'), // sms_alert_settings
      fetchTableData('11725') // user_profiles
      ]);

      setData({
        products,
        employees,
        salesReports,
        vendors,
        licenses,
        orders,
        salaryRecords,
        deliveryRecords,
        auditLogs,
        stations,
        smsAlertSettings,
        userProfiles
      });

    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        variant: "destructive",
        title: "Data Refresh Error",
        description: "Failed to refresh real-time data. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    refreshData();
  }, []);

  // Set up automatic refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const value: RealTimeData = {
    ...data,
    refreshData,
    isLoading
  };

  return (
    <RealTimeDataContext.Provider value={value}>
      {children}
    </RealTimeDataContext.Provider>);

};

export default RealTimeDataProvider;