/**
 * Utility functions for safe operations to prevent invariant violations
 */

/**
 * Generates a safe key for React list items
 * @param item - The item to generate a key for
 * @param index - The index of the item in the array
 * @param prefix - Optional prefix for the key
 * @returns A safe string key
 */
export const generateSafeKey = (
item: any,
index: number,
prefix: string = 'item')
: string => {
  try {
    // Try to use a unique identifier from the item
    if (item && typeof item === 'object') {
      if (item.ID) return `${prefix}-${item.ID}`;
      if (item.id) return `${prefix}-${item.id}`;
      if (item.key) return `${prefix}-${item.key}`;
    }

    // Fallback to index-based key
    return `${prefix}-${index}`;
  } catch (error) {
    // Ultimate fallback
    return `${prefix}-${index}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

/**
 * Safe array mapping function that handles potential null/undefined values
 * @param array - The array to map over
 * @param callback - The mapping function
 * @returns The mapped array or empty array if input is invalid
 */
export const safeMap = <T, R>(
array: T[] | null | undefined,
callback: (item: T, index: number, array: T[]) => R)
: R[] => {
  try {
    if (!Array.isArray(array)) {
      return [];
    }

    return array.map((item, index, arr) => {
      try {
        return callback(item, index, arr);
      } catch (error) {
        console.error('Error in safeMap callback:', error);
        // Return a safe fallback - this depends on your use case
        // You might want to return null or a default value
        throw error; // Re-throw to maintain error visibility
      }
    });
  } catch (error) {
    console.error('Error in safeMap:', error);
    return [];
  }
};

/**
 * Safe object property access
 * @param obj - The object to access
 * @param path - The property path (e.g., 'user.profile.name')
 * @param defaultValue - Default value if path doesn't exist
 * @returns The value at the path or the default value
 */
export const safeGet = (
obj: any,
path: string,
defaultValue: any = undefined)
: any => {
  try {
    if (!obj || typeof obj !== 'object') {
      return defaultValue;
    }

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return defaultValue;
      }
      current = current[key];
    }

    return current !== undefined ? current : defaultValue;
  } catch (error) {
    console.error('Error in safeGet:', error);
    return defaultValue;
  }
};

/**
 * Safe string operations
 */
export const safeString = {
  /**
   * Safely converts a value to string
   */
  toString: (value: any, defaultValue: string = ''): string => {
    try {
      if (value === null || value === undefined) {
        return defaultValue;
      }
      return String(value);
    } catch (error) {
      return defaultValue;
    }
  },

  /**
   * Safely trims a string
   */
  trim: (value: any, defaultValue: string = ''): string => {
    try {
      const str = safeString.toString(value, defaultValue);
      return str.trim();
    } catch (error) {
      return defaultValue;
    }
  },

  /**
   * Safely converts to lowercase
   */
  toLowerCase: (value: any, defaultValue: string = ''): string => {
    try {
      const str = safeString.toString(value, defaultValue);
      return str.toLowerCase();
    } catch (error) {
      return defaultValue;
    }
  }
};

/**
 * Safe number operations
 */
export const safeNumber = {
  /**
   * Safely converts a value to number
   */
  toNumber: (value: any, defaultValue: number = 0): number => {
    try {
      if (value === null || value === undefined || value === '') {
        return defaultValue;
      }
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    } catch (error) {
      return defaultValue;
    }
  },

  /**
   * Safely formats a number to fixed decimal places
   */
  toFixed: (value: any, decimals: number = 2, defaultValue: string = '0.00'): string => {
    try {
      const num = safeNumber.toNumber(value, 0);
      return num.toFixed(decimals);
    } catch (error) {
      return defaultValue;
    }
  }
};

/**
 * Safe array operations
 */
export const safeArray = {
  /**
   * Safely ensures a value is an array
   */
  ensureArray: <T,>(value: any, defaultValue: T[] = []): T[] => {
    try {
      if (Array.isArray(value)) {
        return value;
      }
      return defaultValue;
    } catch (error) {
      return defaultValue;
    }
  },

  /**
   * Safely gets array length
   */
  getLength: (array: any, defaultValue: number = 0): number => {
    try {
      if (Array.isArray(array)) {
        return array.length;
      }
      return defaultValue;
    } catch (error) {
      return defaultValue;
    }
  },

  /**
   * Safely gets array item at index
   */
  getItem: <T,>(array: any, index: number, defaultValue: T | null = null): T | null => {
    try {
      if (Array.isArray(array) && index >= 0 && index < array.length) {
        return array[index];
      }
      return defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }
};