import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TableField {
  name: string;
  type: 'String' | 'Number' | 'Integer' | 'Bool' | 'DateTime';
  defaultValue: any;
  description: string;
}

interface DataManagerProps {
  tableName: string;
  tableId: string;
  fields: TableField[];
  onDataSaved?: () => void;
}

const DataManager: React.FC<DataManagerProps> = ({ tableName, tableId, fields, onDataSaved }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    fields.forEach((field) => {
      const value = formData[field.name];

      if (field.type === 'Number' || field.type === 'Integer') {
        if (value !== undefined && value !== '' && isNaN(Number(value))) {
          errors.push(`${field.name} must be a valid number`);
        }
      }

      if (field.type === 'DateTime' && value && !(value instanceof Date)) {
        errors.push(`${field.name} must be a valid date`);
      }
    });

    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare data for saving
      const dataToSave = { ...formData };

      // Convert data types
      fields.forEach((field) => {
        const value = dataToSave[field.name];
        if (value !== undefined && value !== '') {
          switch (field.type) {
            case 'Number':
              dataToSave[field.name] = parseFloat(value);
              break;
            case 'Integer':
              dataToSave[field.name] = parseInt(value, 10);
              break;
            case 'Bool':
              dataToSave[field.name] = Boolean(value);
              break;
            case 'DateTime':
              if (value instanceof Date) {
                dataToSave[field.name] = value.toISOString();
              }
              break;
          }
        } else if (field.defaultValue !== undefined && field.defaultValue !== '' && field.defaultValue !== 0) {
          dataToSave[field.name] = field.defaultValue;
        }
      });

      const { error } = await window.ezsite.apis.tableCreate(tableId, dataToSave);

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Success",
        description: `Data saved to ${tableName} successfully!`
      });

      // Reset form
      setFormData({});

      if (onDataSaved) {
        onDataSaved();
      }

    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: TableField) => {
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'Bool':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.name}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleInputChange(field.name, checked)} />

            <Label htmlFor={field.name}>{field.name.replace(/_/g, ' ')}</Label>
          </div>);


      case 'DateTime':
        return (
          <div className="space-y-2">
            <Label>{field.name.replace(/_/g, ' ')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !value && "text-muted-foreground"
                  )}>

                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(value, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value}
                  onSelect={(date) => handleInputChange(field.name, date)}
                  initialFocus />

              </PopoverContent>
            </Popover>
          </div>);


      case 'Number':
      case 'Integer':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>{field.name.replace(/_/g, ' ')}</Label>
            <Input
              id={field.name}
              type="number"
              step={field.type === 'Number' ? "0.01" : "1"}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={`Enter ${field.name.replace(/_/g, ' ')}`} />

          </div>);


      default: // String
        if (field.description && field.description.length > 100) {
          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>{field.name.replace(/_/g, ' ')}</Label>
              <Textarea
                id={field.name}
                value={value}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={`Enter ${field.name.replace(/_/g, ' ')}`}
                rows={3} />

            </div>);

        }

        // Special handling for select fields based on field names
        if (field.name === 'station') {
          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Station</Label>
              <Select value={value} onValueChange={(val) => handleInputChange(field.name, val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOBIL">MOBIL</SelectItem>
                  <SelectItem value="AMOCO ROSEDALE">AMOCO ROSEDALE</SelectItem>
                  <SelectItem value="AMOCO BROOKLYN">AMOCO BROOKLYN</SelectItem>
                </SelectContent>
              </Select>
            </div>);

        }

        if (field.name === 'status' && tableName === 'licenses_certificates') {
          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Status</Label>
              <Select value={value} onValueChange={(val) => handleInputChange(field.name, val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Pending Renewal">Pending Renewal</SelectItem>
                </SelectContent>
              </Select>
            </div>);

        }

        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>{field.name.replace(/_/g, ' ')}</Label>
            <Input
              id={field.name}
              type="text"
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={`Enter ${field.name.replace(/_/g, ' ')}`} />

          </div>);

    }
  };

  // Filter out ID field and system fields
  const editableFields = fields.filter((field) =>
  field.name !== 'id' &&
  field.name !== 'created_by' &&
  !field.name.includes('_file_id') // Skip file fields for this basic form
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New {tableName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</CardTitle>
        <CardDescription>
          Fill in the form below to add new data to the {tableName} table.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {editableFields.map((field) =>
          <div key={field.name}>
              {renderField(field)}
              {field.description &&
            <p className="text-sm text-muted-foreground mt-1">
                  {field.description}
                </p>
            }
            </div>
          )}
        </div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ?
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </> :

            <>
                <Save className="mr-2 h-4 w-4" />
                Save Data
              </>
            }
          </Button>
        </div>
      </CardContent>
    </Card>);

};

export default DataManager;