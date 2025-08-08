import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility functions for Supabase authentication
export function formatUserDisplayName(user: any): string {
  if (!user) return 'Unknown User';

  return user.user_metadata?.full_name ||
  user.user_metadata?.display_name ||
  user.email?.split('@')[0] ||
  'User';
}

export function generateNumericId(uuid: string): number {
  // Convert UUID to a numeric ID for legacy compatibility
  // Take the first 10 digits from the UUID (removing hyphens)
  const numericString = uuid.replace(/\D/g, '').substring(0, 10);
  return parseInt(numericString) || 1;
}

export function formatDate(date: string | Date | null): string {
  if (!date) return '';

  try {
    return new Date(date).toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';

  // Remove all non-numeric characters except + for international numbers
  return phone.replace(/[^\d+]/g, '');
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;

  return text.substring(0, maxLength) + '...';
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

// Supabase specific utilities
export function isSupabaseError(error: any): boolean {
  return error?.code || error?.message?.includes?.('supabase') || false;
}

export function handleSupabaseError(error: any): string {
  if (!error) return 'Unknown error occurred';

  // Handle common Supabase error codes
  const errorMessage = error.message || error.toString();

  if (error.code === 'PGRST116') {
    return 'No data found';
  }

  if (errorMessage.includes('duplicate key')) {
    return 'This record already exists';
  }

  if (errorMessage.includes('foreign key')) {
    return 'Cannot complete operation due to related data';
  }

  if (errorMessage.includes('not null')) {
    return 'Required field is missing';
  }

  return errorMessage;
}