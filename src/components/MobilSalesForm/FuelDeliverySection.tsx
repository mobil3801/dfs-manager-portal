import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FuelDeliverySectionProps {
  formData: any;
  updateFormData: (field: string, value: string | number) => void;
}

const FuelDeliverySection: React.FC<FuelDeliverySectionProps> = ({ formData, updateFormData }) => {
  return (
    <div className="border border-gray-300 bg-white">
      <div className="bg-gray-100 border-b border-gray-300 p-2">
        <div className="text-sm font-semibold text-center">FUEL DELIVERY</div>
      </div>
      
      <div className="p-3 space-y-3">
        {/* BOL Number */}
        <div className="grid grid-cols-2 gap-2 items-center">
          <Label className="text-xs font-medium">BOL #:</Label>
          <Input
            type="text"
            value={formData.bolNumber || ''}
            onChange={(e) => updateFormData('bolNumber', e.target.value)}
            className="h-8 text-xs border border-gray-300"
            placeholder="Bill of Lading #"
          />
        </div>

        {/* Tank readings before delivery */}
        <div className="space-y-2">
          <div className="text-xs font-medium border-b border-gray-200 pb-1">TANK READINGS (Before Delivery)</div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Regular:</Label>
            <Input
              type="number"
              value={formData.regularTankBefore || ''}
              onChange={(e) => updateFormData('regularTankBefore', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="Gallons"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Plus:</Label>
            <Input
              type="number"
              value={formData.plusTankBefore || ''}
              onChange={(e) => updateFormData('plusTankBefore', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="Gallons"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Super:</Label>
            <Input
              type="number"
              value={formData.superTankBefore || ''}
              onChange={(e) => updateFormData('superTankBefore', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="Gallons"
            />
          </div>
        </div>

        {/* Delivery amounts */}
        <div className="space-y-2">
          <div className="text-xs font-medium border-b border-gray-200 pb-1">DELIVERED GALLONS</div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Regular:</Label>
            <Input
              type="number"
              value={formData.regularDelivered || ''}
              onChange={(e) => updateFormData('regularDelivered', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="Gallons"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Plus:</Label>
            <Input
              type="number"
              value={formData.plusDelivered || ''}
              onChange={(e) => updateFormData('plusDelivered', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="Gallons"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Super:</Label>
            <Input
              type="number"
              value={formData.superDelivered || ''}
              onChange={(e) => updateFormData('superDelivered', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="Gallons"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuelDeliverySection;