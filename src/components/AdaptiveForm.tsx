
import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';

interface AdaptiveInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const AdaptiveInput: React.FC<AdaptiveInputProps> = ({
  label,
  id,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  className = ''
}) => {
  const device = useDeviceAdaptive();

  return (
    <motion.div
      className={`space-y-2 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: device.animationDuration / 1000 }}
    >
      <Label htmlFor={id} className={device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          ${device.hasTouch ? 'min-h-[44px]' : 'min-h-[36px]'}
          ${device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'}
        `}
        style={{ fontSize: device.optimalFontSize === 'large' ? '16px' : '14px' }}
      />
    </motion.div>
  );
};

interface AdaptiveTextareaProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}

export const AdaptiveTextarea: React.FC<AdaptiveTextareaProps> = ({
  label,
  id,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 3,
  className = ''
}) => {
  const device = useDeviceAdaptive();

  return (
    <motion.div
      className={`space-y-2 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: device.animationDuration / 1000 }}
    >
      <Label htmlFor={id} className={device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={device.isMobile ? Math.max(2, rows - 1) : rows}
        className={`
          ${device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'}
          resize-none
        `}
        style={{ fontSize: device.optimalFontSize === 'large' ? '16px' : '14px' }}
      />
    </motion.div>
  );
};

interface AdaptiveSelectProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const AdaptiveSelect: React.FC<AdaptiveSelectProps> = ({
  label,
  id,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  className = ''
}) => {
  const device = useDeviceAdaptive();

  return (
    <motion.div
      className={`space-y-2 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: device.animationDuration / 1000 }}
    >
      <Label htmlFor={id} className={device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          id={id}
          className={`
            ${device.hasTouch ? 'min-h-[44px]' : 'min-h-[36px]'}
            ${device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'}
          `}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className={device.hasTouch ? 'min-h-[44px]' : 'min-h-[36px]'}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
};

interface AdaptiveButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const AdaptiveButton: React.FC<AdaptiveButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const device = useDeviceAdaptive();

  const getAdaptiveSize = () => {
    if (device.hasTouch) {
      return size === 'sm' ? 'default' : size === 'default' ? 'lg' : size;
    }
    return size;
  };

  return (
    <motion.div
      whileHover={device.hasTouch ? {} : { scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: device.animationDuration / 1000 }}
    >
      <Button
        type={type}
        variant={variant}
        size={getAdaptiveSize()}
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          ${device.hasTouch ? 'min-h-[44px] px-6' : 'min-h-[36px]'}
          ${device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'}
          ${className}
        `}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </Button>
    </motion.div>
  );
};
