import { describe, it, expect } from '@jest/globals';

/**
 * Example utility functions to demonstrate testing setup
 */

// Simple utility function
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Array utility function
export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

// String utility function
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Date utility function
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};