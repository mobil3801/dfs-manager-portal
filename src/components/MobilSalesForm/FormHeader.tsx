import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormHeaderProps {
  reportDate: string;
  setReportDate: (date: string) => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({ reportDate, setReportDate }) => {
  return (
    <div className="border border-gray-300 bg-white">
      {/* Header with ATLANTIS and MOBIL branding */}
      <div className="bg-gray-100 border-b border-gray-300 p-2">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <div className="text-sm font-bold">ATLANTIS</div>
            <div className="text-xs">PETROLEUM MARKETING</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold bg-red-600 text-white px-4 py-1 rounded">
              MOBIL
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs">DATE</div>
            <Input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-32 h-8 text-xs border border-gray-300" />

          </div>
        </div>
      </div>
      
      {/* Station identification */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 text-center">
        <div className="text-sm font-semibold">DAILY OPERATIONS REPORT</div>
        <div className="text-xs">MOBIL STATION</div>
      </div>
    </div>);

};

export default FormHeader;