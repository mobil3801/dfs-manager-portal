import { useEffect, useCallback } from 'react';
import { realtimeService } from '@/services/supabaseRealtimeService';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuditEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  recordId?: number;
  userId?: number;
  timestamp: Date;
  data: any;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
  };
}

interface UseRealtimeAuditOptions {
  enabledTables?: string[];
  enableNotifications?: boolean;
  enableLogging?: boolean;
  onAuditEvent?: (event: AuditEvent) => void;
}

export function useRealtimeAudit(options: UseRealtimeAuditOptions = {}) {
  const { toast } = useToast();
  const {
    enabledTables = [
      'products',
      'daily_sales_reports_enhanced',
      'employees',
      'licenses_certificates',
      'user_profiles',
      'vendors',
      'orders',
      'delivery_records',
      'stations'
    ],
    enableNotifications = true,
    enableLogging = true,
    onAuditEvent
  } = options;

  // Create audit log entry
  const createAuditLog = useCallback(async (event: AuditEvent) => {
    if (!enableLogging) return;

    try {
      const auditData = {
        event_type: event.eventType === 'INSERT' ? 'Data Modification' : 
                   event.eventType === 'UPDATE' ? 'Data Modification' : 'Data Modification',
        user_id: event.userId || 0,
        username: 'System',
        ip_address: event.metadata.ipAddress || '127.0.0.1',
        user_agent: event.metadata.userAgent || navigator.userAgent,
        event_timestamp: event.timestamp.toISOString(),
        event_status: 'Success',
        resource_accessed: event.table,
        action_performed: event.eventType.toLowerCase(),
        failure_reason: '',
        session_id: event.metadata.sessionId || '',
        risk_level: 'Low',
        additional_data: JSON.stringify({
          recordId: event.recordId,
          dataSnapshot: event.data,
          timestamp: event.timestamp.toISOString()
        }),
        station: event.data?.station || '',
        geo_location: ''
      };

      const { error } = await window.ezsite.apis.tableCreate(12706, auditData);
      
      if (error) {
        console.error('Failed to create audit log:', error);
      } else {
        console.log('Audit log created for:', event.table, event.eventType);
      }
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }, [enableLogging]);

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    const event: AuditEvent = {
      eventType: payload.eventType,
      table: payload.table,
      recordId: payload.new?.id || payload.old?.id,
      userId: payload.new?.created_by || payload.old?.created_by,
      timestamp: new Date(),
      data: payload.new || payload.old || {},
      metadata: {
        userAgent: navigator.userAgent,
        ipAddress: '127.0.0.1', // This would come from server in real implementation
        sessionId: sessionStorage.getItem('sessionId') || 'unknown'
      }
    };

    // Create audit log
    createAuditLog(event);

    // Call custom handler if provided
    if (onAuditEvent) {
      onAuditEvent(event);
    }

    // Show notification for critical events
    if (enableNotifications) {
      const isCriticalEvent = 
        event.table === 'user_profiles' ||
        event.table === 'licenses_certificates' ||
        (event.table === 'daily_sales_reports_enhanced' && event.eventType === 'INSERT');

      if (isCriticalEvent) {
        const actionText = event.eventType === 'INSERT' ? 'created' : 
                          event.eventType === 'UPDATE' ? 'updated' : 'deleted';
        
        toast({
          title: `${event.table.replace('_', ' ')} ${actionText}`,
          description: `Record ${event.recordId} was ${actionText} in real-time`,
          variant: event.eventType === 'DELETE' ? 'destructive' : 'default'
        });
      }
    }

    console.log('Real-time audit event:', event);
  }, [createAuditLog, onAuditEvent, enableNotifications, toast]);

  // Subscribe to audit logs table for real-time monitoring
  const handleAuditLogUpdate = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    if (payload.eventType === 'INSERT' && enableNotifications) {
      const auditLog = payload.new;
      
      // Show notification for high-risk events
      if (auditLog.risk_level === 'High' || auditLog.risk_level === 'Critical') {
        toast({
          title: 'Security Alert',
          description: `${auditLog.event_type}: ${auditLog.action_performed}`,
          variant: 'destructive'
        });
      }
    }
  }, [enableNotifications, toast]);

  useEffect(() => {
    const subscriptionKeys: string[] = [];

    // Subscribe to enabled tables
    enabledTables.forEach(table => {
      const key = realtimeService.subscribe(table, handleRealtimeUpdate);
      subscriptionKeys.push(key);
    });

    // Subscribe to audit logs for security monitoring
    const auditKey = realtimeService.subscribe('audit_logs', handleAuditLogUpdate);
    subscriptionKeys.push(auditKey);

    console.log('Real-time audit monitoring started for tables:', enabledTables);

    return () => {
      subscriptionKeys.forEach(key => realtimeService.unsubscribe(key));
      console.log('Real-time audit monitoring stopped');
    };
  }, [enabledTables, handleRealtimeUpdate, handleAuditLogUpdate]);

  return {
    createAuditLog,
    isMonitoring: true
  };
}

export default useRealtimeAudit;