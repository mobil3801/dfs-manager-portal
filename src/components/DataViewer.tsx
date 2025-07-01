import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, RefreshCw, Eye, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TableField {
  name: string;
  type: 'String' | 'Number' | 'Integer' | 'Bool' | 'DateTime';
  defaultValue: any;
  description: string;
}

interface DataViewerProps {
  tableName: string;
  tableId: string;
  fields: TableField[];
}

const DataViewer: React.FC<DataViewerProps> = ({ tableName, tableId, fields }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = {
        PageNo: currentPage,
        PageSize: pageSize,
        OrderByField: "id",
        IsAsc: false,
        Filters: searchTerm ? [
        {
          name: "id",
          op: "GreaterThan" as const,
          value: 0
        }] :
        []
      };

      const { data: response, error } = await window.ezsite.apis.tablePage(tableId, queryParams);

      if (error) {
        throw new Error(error);
      }

      setData(response?.List || []);
      setTotalCount(response?.VirtualCount || 0);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, tableId]);

  const formatCellValue = (value: any, field: TableField) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground">-</span>;
    }

    switch (field.type) {
      case 'Bool':
        return (
          <Badge variant={value ? "default" : "secondary"}>
            {value ? 'Yes' : 'No'}
          </Badge>);


      case 'DateTime':
        try {
          const date = new Date(value);
          return (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(date, 'MMM dd, yyyy')}
            </div>);

        } catch {
          return <span className="text-muted-foreground">Invalid date</span>;
        }

      case 'Number':
        return typeof value === 'number' ? value.toFixed(2) : value;

      case 'Integer':
        return typeof value === 'number' ? value.toString() : value;

      default:
        return typeof value === 'string' && value.length > 50 ?
        `${value.substring(0, 50)}...` :
        value;
    }
  };

  const getDisplayFields = () => {
    // Show the most important fields first, exclude system fields
    return fields.
    filter((field) =>
    field.name !== 'created_by' &&
    !field.name.includes('_file_id') &&
    field.name !== 'id'
    ).
    slice(0, 8); // Limit to 8 fields for better display
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          {tableName} Data
        </CardTitle>
        <CardDescription>
          View and search through your {tableName.toLowerCase()} records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8" />

          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {loading ?
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 5 }).map((_, i) =>
          <Skeleton key={i} className="h-12 w-full" />
          )}
          </div> :

        <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ID</TableHead>
                    {getDisplayFields().map((field) =>
                  <TableHead key={field.name}>
                        {field.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </TableHead>
                  )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ?
                <TableRow>
                      <TableCell colSpan={getDisplayFields().length + 1} className="text-center py-8">
                        <div className="text-muted-foreground">
                          No records found
                        </div>
                      </TableCell>
                    </TableRow> :

                data.map((row) =>
                <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.id}</TableCell>
                        {getDisplayFields().map((field) =>
                  <TableCell key={field.name}>
                            {formatCellValue(row[field.name], field)}
                          </TableCell>
                  )}
                      </TableRow>
                )
                }
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 &&
          <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}>

                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}>

                    Next
                  </Button>
                </div>
              </div>
          }
          </>
        }
      </CardContent>
    </Card>);

};

export default DataViewer;