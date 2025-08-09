import { describe, it, expect } from '@jest/globals';
import { formatCurrency, unique, slugify, isValidDate } from './example';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency with default USD', () => {
      expect(formatCurrency(123.45)).toBe('$123.45');
    });

    it('should format currency with custom currency', () => {
      expect(formatCurrency(123.45, 'EUR')).toBe('€123.45');
    });

    it('should handle zero values', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle negative values', () => {
      expect(formatCurrency(-123.45)).toBe('-$123.45');
    });
  });

  describe('unique', () => {
    it('should remove duplicate numbers', () => {
      expect(unique([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
    });

    it('should remove duplicate strings', () => {
      expect(unique(['a', 'b', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('should handle empty array', () => {
      expect(unique([])).toEqual([]);
    });

    it('should handle array with all unique values', () => {
      expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('slugify', () => {
    it('should convert text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should handle special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('Hello    World')).toBe('hello-world');
    });

    it('should trim leading and trailing dashes', () => {
      expect(slugify('---Hello World---')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(slugify('')).toBe('');
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid date', () => {
      expect(isValidDate(new Date())).toBe(true);
    });

    it('should return false for invalid date', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
    });

    it('should return false for non-date objects', () => {
      expect(isValidDate('2023-01-01')).toBe(false);
      expect(isValidDate(123456789)).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
    });
  });
});