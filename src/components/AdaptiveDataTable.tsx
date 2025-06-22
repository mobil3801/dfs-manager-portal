
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: any) => React.ReactNode;
  mobileHidden?: boolean;
}

interface AdaptiveDataTableProps {
  data: any[];
  columns: Column[];
  searchPlaceholder?: string;
  onRowClick?: (item: any) => void;
  actions?: (item: any) => React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  loading?: boolean;
  emptyMessage?: string;
}

const AdaptiveDataTable: React.FC<AdaptiveDataTableProps> = ({
  data,
  columns,
  searchPlaceholder = 'Search...',
  onRowClick,
  actions,
  pagination,
  loading = false,
  emptyMessage = 'No data available'
}) => {
  const device = useDeviceAdaptive();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredData = data.filter((item) =>
  Object.values(item).some((value) =>
  String(value).toLowerCase().includes(searchTerm.toLowerCase())
  )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    const direction = sortDirection === 'asc' ? 1 : -1;
    return aValue > bValue ? direction : -direction;
  });

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Mobile Card View
  if (device.isMobile) {
    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 min-h-[44px]" />

        </div>

        {/* Data Cards */}
        <div className="space-y-3">
          {loading ?
          Array.from({ length: 3 }).map((_, index) =>
          <Card key={index} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
          ) :
          sortedData.length === 0 ?
          <Card>
              <CardContent className="p-8 text-center text-gray-500">
                {emptyMessage}
              </CardContent>
            </Card> :

          sortedData.map((item, index) =>
          <motion.div
            key={item.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}>

                <Card
              className={`${onRowClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow`}
              onClick={() => onRowClick?.(item)}>

                  <CardContent className="p-4">
                    {columns.filter((col) => !col.mobileHidden).slice(0, 3).map((column) =>
                <div key={column.key} className="mb-2 last:mb-0">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {column.label}
                          </span>
                          {actions && column === columns[0] &&
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                    }
                        </div>
                        <div className="text-sm font-medium mt-1">
                          {column.render ?
                    column.render(item[column.key], item) :
                    item[column.key]
                    }
                        </div>
                      </div>
                )}
                  </CardContent>
                </Card>
              </motion.div>
          )
          }
        </div>

        {/* Mobile Pagination */}
        {pagination &&
        <div className="flex items-center justify-between">
            <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}>

              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}>

              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        }
      </div>);

  }

  // Desktop Table View
  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10" />

        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) =>
              <TableHead
                key={column.key}
                className={`${column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={() => column.sortable && handleSort(column.key)}>

                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && sortColumn === column.key &&
                  <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                  }
                  </div>
                </TableHead>
              )}
              {actions && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ?
            Array.from({ length: 5 }).map((_, index) =>
            <TableRow key={index}>
                  {columns.map((column) =>
              <TableCell key={column.key}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
              )}
                  {actions && <TableCell></TableCell>}
                </TableRow>
            ) :
            sortedData.length === 0 ?
            <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8">
                  {emptyMessage}
                </TableCell>
              </TableRow> :

            sortedData.map((item, index) =>
            <motion.tr
              key={item.id || index}
              className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
              onClick={() => onRowClick?.(item)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.02 }}>

                  {columns.map((column) =>
              <TableCell key={column.key}>
                      {column.render ?
                column.render(item[column.key], item) :
                item[column.key]
                }
                    </TableCell>
              )}
                  {actions &&
              <TableCell>
                      {actions(item)}
                    </TableCell>
              }
                </motion.tr>
            )
            }
          </TableBody>
        </Table>
      </Card>

      {/* Desktop Pagination */}
      {pagination &&
      <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {Math.min((pagination.currentPage - 1) * 10 + 1, sortedData.length)} to {Math.min(pagination.currentPage * 10, sortedData.length)} of {sortedData.length} results
          </span>
          <div className="flex items-center space-x-2">
            <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}>

              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).
          filter((page) =>
          page === 1 ||
          page === pagination.totalPages ||
          Math.abs(page - pagination.currentPage) <= 1
          ).
          map((page, index, array) =>
          <React.Fragment key={page}>
                  {index > 0 && array[index - 1] < page - 1 &&
            <span className="px-2">...</span>
            }
                  <Button
              variant={page === pagination.currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => pagination.onPageChange(page)}>

                    {page}
                  </Button>
                </React.Fragment>
          )
          }
            <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}>

              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      }
    </div>);

};

export default AdaptiveDataTable;