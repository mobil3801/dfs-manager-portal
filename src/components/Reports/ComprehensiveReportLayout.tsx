import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PrinterIcon, DownloadIcon, ShareIcon, FilterIcon } from 'lucide-react';

interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  station?: string;
  dateRange?: string;
  reportId?: string;
  onPrint?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  onFilter?: () => void;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  title,
  subtitle,
  station,
  dateRange,
  reportId,
  onPrint,
  onExport,
  onShare,
  onFilter
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          {subtitle && <p className="text-blue-100 text-sm">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          {onFilter && (
            <Button variant="secondary" size="sm" onClick={onFilter}>
              <FilterIcon className="w-4 h-4 mr-1" />
              Filter
            </Button>
          )}
          {onPrint && (
            <Button variant="secondary" size="sm" onClick={onPrint}>
              <PrinterIcon className="w-4 h-4 mr-1" />
              Print
            </Button>
          )}
          {onExport && (
            <Button variant="secondary" size="sm" onClick={onExport}>
              <DownloadIcon className="w-4 h-4 mr-1" />
              Export
            </Button>
          )}
          {onShare && (
            <Button variant="secondary" size="sm" onClick={onShare}>
              <ShareIcon className="w-4 h-4 mr-1" />
              Share
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        {station && (
          <div>
            <span className="text-blue-200">Station:</span>
            <Badge variant="secondary" className="ml-2">{station}</Badge>
          </div>
        )}
        {dateRange && (
          <div>
            <span className="text-blue-200">Period:</span>
            <span className="ml-2 text-white">{dateRange}</span>
          </div>
        )}
        {reportId && (
          <div>
            <span className="text-blue-200">Report ID:</span>
            <span className="ml-2 text-white">{reportId}</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  className = ""
}) => {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {icon && <div className="text-blue-600">{icon}</div>}
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <Badge 
              variant={trend.isPositive ? "default" : "destructive"}
              className="text-xs"
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </Badge>
          )}
        </div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

interface ReportSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const ReportSection: React.FC<ReportSectionProps> = ({
  title,
  children,
  className = "",
  collapsible = false,
  defaultExpanded = true
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return (
    <Card className={`mb-6 ${className}`}>
      <CardHeader 
        className={`pb-3 ${collapsible ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={collapsible ? () => setExpanded(!expanded) : undefined}
      >
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
          {title}
          {collapsible && (
            <span className="text-sm text-gray-500">
              {expanded ? '−' : '+'}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      {expanded && (
        <>
          <Separator />
          <CardContent className="pt-4">
            {children}
          </CardContent>
        </>
      )}
    </Card>
  );
};

interface DataTableProps {
  headers: string[];
  data: (string | number | React.ReactNode)[][];
  showRowNumbers?: boolean;
  alternateRows?: boolean;
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  headers,
  data,
  showRowNumbers = false,
  alternateRows = true,
  className = ""
}) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {showRowNumbers && <th className="border border-gray-300 px-3 py-2 text-left font-semibold">#</th>}
            {headers.map((header, index) => (
              <th key={index} className="border border-gray-300 px-3 py-2 text-left font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={alternateRows && rowIndex % 2 === 1 ? 'bg-gray-25' : 'bg-white'}
            >
              {showRowNumbers && (
                <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600">
                  {rowIndex + 1}
                </td>
              )}
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border border-gray-300 px-3 py-2 text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface ReportFooterProps {
  generatedBy?: string;
  generatedAt?: string;
  notes?: string[];
  className?: string;
}

export const ReportFooter: React.FC<ReportFooterProps> = ({
  generatedBy,
  generatedAt,
  notes,
  className = ""
}) => {
  return (
    <div className={`bg-gray-50 p-4 rounded-b-lg text-sm text-gray-600 ${className}`}>
      <Separator className="mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {generatedBy && <p><strong>Generated by:</strong> {generatedBy}</p>}
          {generatedAt && <p><strong>Generated at:</strong> {generatedAt}</p>}
        </div>
        {notes && notes.length > 0 && (
          <div>
            <p className="font-semibold mb-2">Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              {notes.map((note, index) => (
                <li key={index} className="text-xs">{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  ReportHeader,
  MetricCard,
  ReportSection,
  DataTable,
  ReportFooter
};