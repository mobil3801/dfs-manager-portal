import React, { ReactNode } from 'react';
import { useResponsiveLayout } from '@/contexts/ResponsiveLayoutContext';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';

interface TableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: any) => ReactNode;
  mobileHide?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

interface TableAction {
  label: string;
  icon?: React.ComponentType<any>;
  onClick: (row: any) => void;
  variant?: 'default' | 'destructive' | 'outline';
  visible?: (row: any) => boolean;
}

interface ResponsiveTableProps {
  data: any[];
  columns: TableColumn[];
  actions?: TableAction[];
  className?: string;
  onRowClick?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  cardTitle?: string;
  variant?: 'table' | 'cards' | 'compact' | 'auto';
}

export function ResponsiveTable({
  data,
  columns,
  actions,
  className = '',
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  cardTitle,
  variant = 'auto'
}: ResponsiveTableProps) {
  const { device, layoutConfig } = useResponsiveLayout();

  // Determine the display variant
  const displayVariant = React.useMemo(() => {
    if (variant !== 'auto') return variant;
    
    // Auto-detect based on device and layout config
    if (device.isMobile || layoutConfig.tableLayout === 'card-list') {
      return 'cards';
    }
    if (device.isTablet || layoutConfig.tableLayout === 'compact-table') {
      return 'compact';
    }
    return 'table';
  }, [variant, device, layoutConfig]);

  // Filter columns based on device and priority
  const visibleColumns = React.useMemo(() => {
    if (displayVariant === 'table') {
      return columns;
    }
    
    // For mobile/card view, prioritize columns
    if (device.isMobile) {
      return columns.filter(col => !col.mobileHide && col.priority !== 'low');
    }
    
    if (device.isTablet) {
      return columns.filter(col => col.priority !== 'low');
    }
    
    return columns;
  }, [columns, device, displayVariant]);

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {displayVariant === 'cards' ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.map((col) => (
                    <TableHead key={col.key} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-16"></div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {visibleColumns.map((col) => (
                      <TableCell key={col.key} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-20"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="text-muted-foreground">{emptyMessage}</div>
      </div>
    );
  }

  // Card View (Mobile/Tablet)
  if (displayVariant === 'cards') {
    return (
      <div className={cn('space-y-4', className)}>
        {cardTitle && (
          <div className="text-lg font-semibold mb-4">{cardTitle}</div>
        )}
        {data.map((row, index) => (
          <Card 
            key={index} 
            className={cn(
              'transition-all duration-200',
              onRowClick && 'cursor-pointer hover:shadow-md',
              device.brand === 'Samsung' && 'rounded-xl' // Samsung One UI style
            )}
            onClick={() => onRowClick?.(row)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {visibleColumns.map((column) => {
                  const value = row[column.key];
                  const displayValue = column.render ? column.render(value, row) : value;
                  
                  return (
                    <div key={column.key} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        {column.label}
                      </span>
                      <span className="text-sm font-medium">
                        {displayValue}
                      </span>
                    </div>
                  );
                })}
                
                {actions && actions.length > 0 && (
                  <div className="flex justify-end space-x-2 pt-2 border-t">
                    {actions.map((action, actionIndex) => {
                      if (action.visible && !action.visible(row)) return null;
                      
                      return (
                        <Button
                          key={actionIndex}
                          variant={action.variant || 'outline'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                          className="h-8 px-3"
                        >
                          {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                          {device.screenWidth > 375 && action.label}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Compact Table View (Tablet)
  if (displayVariant === 'compact') {
    return (
      <div className={cn('rounded-md border', className)}>
        {cardTitle && (
          <div className="p-4 border-b">
            <div className="text-lg font-semibold">{cardTitle}</div>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHead 
                  key={column.key} 
                  className="text-xs font-medium"
                  style={{ width: column.width }}
                >
                  {column.label}
                </TableHead>
              ))}
              {actions && actions.length > 0 && (
                <TableHead className="w-20">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow 
                key={index}
                className={cn(
                  onRowClick && 'cursor-pointer hover:bg-muted/50',
                  'transition-colors'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {visibleColumns.map((column) => {
                  const value = row[column.key];
                  const displayValue = column.render ? column.render(value, row) : value;
                  
                  return (
                    <TableCell key={column.key} className="text-sm py-2">
                      {displayValue}
                    </TableCell>
                  );
                })}
                
                {actions && actions.length > 0 && (
                  <TableCell className="py-2">
                    <div className="flex items-center space-x-1">
                      {actions.slice(0, device.isTablet ? 2 : 3).map((action, actionIndex) => {
                        if (action.visible && !action.visible(row)) return null;
                        
                        return (
                          <Button
                            key={actionIndex}
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            {action.icon ? (
                              <action.icon className="h-3 w-3" />
                            ) : (
                              <MoreHorizontal className="h-3 w-3" />
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Full Table View (Desktop)
  return (
    <div className={cn('rounded-md border', className)}>
      {cardTitle && (
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">{cardTitle}</div>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column.key}
                className={cn(
                  'font-medium',
                  column.sortable && 'cursor-pointer hover:bg-muted/50'
                )}
                style={{ width: column.width }}
              >
                {column.label}
              </TableHead>
            ))}
            {actions && actions.length > 0 && (
              <TableHead className="w-32">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow 
              key={index}
              className={cn(
                onRowClick && 'cursor-pointer hover:bg-muted/50',
                'transition-colors'
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => {
                const value = row[column.key];
                const displayValue = column.render ? column.render(value, row) : value;
                
                return (
                  <TableCell key={column.key}>
                    {displayValue}
                  </TableCell>
                );
              })}
              
              {actions && actions.length > 0 && (
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {actions.map((action, actionIndex) => {
                      if (action.visible && !action.visible(row)) return null;
                      
                      return (
                        <Button
                          key={actionIndex}
                          variant={action.variant || 'outline'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                        >
                          {action.icon && <action.icon className="h-4 w-4 mr-1" />}
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Common table actions
export const tableActions = {
  view: (onClick: (row: any) => void): TableAction => ({
    label: 'View',
    icon: Eye,
    onClick,
    variant: 'outline'
  }),
  edit: (onClick: (row: any) => void): TableAction => ({
    label: 'Edit',
    icon: Edit,
    onClick,
    variant: 'default'
  }),
  delete: (onClick: (row: any) => void): TableAction => ({
    label: 'Delete',
    icon: Trash2,
    onClick,
    variant: 'destructive'
  })
};

export default ResponsiveTable;
