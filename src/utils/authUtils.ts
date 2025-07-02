// Authentication utilities for database-based auth
export class AuthUtils {
  /**
   * Generate a cryptographically secure salt
   */
  static async generateSalt(): Promise<string> {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash password with salt using PBKDF2
   */
  static async hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);

    // Use crypto.subtle for password hashing
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    );

    const hashArray = Array.from(new Uint8Array(derivedBits));
    return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password, salt);
    return hashedInput === hash;
  }

  /**
   * Generate a secure session token
   */
  static generateSessionToken(): string {
    const array = new Uint8Array(48);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate a verification/reset token
   */
  static generateVerificationToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): {valid: boolean;message: string;} {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/(?=.*\d)/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }

    return { valid: true, message: 'Password is valid' };
  }

  /**
   * Get session expiration time (24 hours from now)
   */
  static getSessionExpiration(): Date {
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 24);
    return expirationTime;
  }

  /**
   * Check if session is expired
   */
  static isSessionExpired(expiresAt: Date): boolean {
    return new Date() > new Date(expiresAt);
  }

  /**
   * Get user's IP address (best effort)
   */
  static async getClientIP(): Promise<string> {
    try {
      // This is a fallback since we can't access real IP in browser
      return 'browser-client';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get user agent
   */
  static getUserAgent(): string {
    return navigator.userAgent || 'unknown';
  }
}

export default AuthUtils;