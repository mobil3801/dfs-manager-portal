import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useRoleManagement } from '@/hooks/use-role-management';

interface RoleSelectorProps {
  value?: string | number;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Select a role",
  label,
  className,
  disabled = false
}) => {
  const { roles, loading } = useRoleManagement();

  const getRoleBadgeColor = (roleCode: string) => {
    switch (roleCode) {
      case 'Administrator':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Employee':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div className="h-10 w-full animate-pulse bg-muted rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select
        value={value?.toString() || ''}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder}>
            {value && roles.find(role => role.id.toString() === value?.toString()) && (
              <div className="flex items-center">
                <Badge 
                  className={`mr-2 ${getRoleBadgeColor(
                    roles.find(role => role.id.toString() === value?.toString())?.role_code || ''
                  )}`}
                >
                  {roles.find(role => role.id.toString() === value?.toString())?.role_name}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id.toString()}>
              <div className="flex items-center">
                <Badge className={`mr-2 ${getRoleBadgeColor(role.role_code)}`}>
                  {role.role_name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {role.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoleSelector;