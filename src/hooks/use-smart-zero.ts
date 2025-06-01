import { useState, useCallback } from 'react';

export const useSmartZero = (initialValue: number | string = 0) => {
  const [value, setValue] = useState<string>(String(initialValue || 0));
  const [isFocused, setIsFocused] = useState(false);
  const [hasUserInput, setHasUserInput] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // If the value is "0" and user hasn't manually entered it, clear it
    if (value === "0" && !hasUserInput) {
      setValue("");
    }
  }, [value, hasUserInput]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // If empty or just whitespace, default to "0"
    if (!value.trim()) {
      setValue("0");
      setHasUserInput(false);
    }
  }, [value]);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    setHasUserInput(true);
  }, []);

  const getNumericValue = useCallback(() => {
    const numValue = parseFloat(value) || 0;
    return numValue;
  }, [value]);

  const resetValue = useCallback((newValue: number | string = 0) => {
    setValue(String(newValue || 0));
    setHasUserInput(newValue !== 0);
  }, []);

  return {
    value,
    isFocused,
    handleFocus,
    handleBlur,
    handleChange,
    getNumericValue,
    resetValue,
    displayValue: isFocused && value === "" ? "" : value
  };
};