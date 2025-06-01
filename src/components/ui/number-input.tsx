import * as React from "react"
import { cn } from "@/lib/utils"
import { useSmartZero } from "@/hooks/use-smart-zero"

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number | string
  onChange?: (value: number) => void
  onValueChange?: (value: string) => void
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, type = "number", value: propValue, onChange, onValueChange, ...props }, ref) => {
    const smartZero = useSmartZero(propValue);

    // Update internal value when prop changes
    React.useEffect(() => {
      if (propValue !== undefined && propValue !== smartZero.getNumericValue()) {
        smartZero.resetValue(propValue);
      }
    }, [propValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      smartZero.handleChange(newValue);
      
      // Call onChange with numeric value
      if (onChange) {
        const numericValue = parseFloat(newValue) || 0;
        onChange(numericValue);
      }
      
      // Call onValueChange with string value for more control
      if (onValueChange) {
        onValueChange(newValue);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        value={smartZero.displayValue}
        onChange={handleInputChange}
        onFocus={smartZero.handleFocus}
        onBlur={smartZero.handleBlur}
        {...props}
      />
    )
  }
)
NumberInput.displayName = "NumberInput"

export { NumberInput }