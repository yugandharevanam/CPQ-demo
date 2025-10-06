/**
 * Comprehensive input sanitization utilities for XSS protection
 * and data validation
 */

// Malicious patterns to detect and remove
const MALICIOUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
  /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
  /data:text\/javascript/gi,
  /data:application\/javascript/gi,
];

// HTML entities for escaping
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

export interface SanitizationOptions {
  allowHTML?: boolean;
  allowedTags?: string[];
  maxLength?: number;
  trimWhitespace?: boolean;
  removeEmptyLines?: boolean;
  preserveNewlines?: boolean;
}

export const inputSanitizer = {
  /**
   * Basic HTML escape for preventing XSS
   */
  escapeHTML: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
  },

  /**
   * Unescape HTML entities
   */
  unescapeHTML: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    const reverseEntities = Object.fromEntries(
      Object.entries(HTML_ENTITIES).map(([key, value]) => [value, key])
    );
    
    return input.replace(/&#?[a-zA-Z0-9]+;/g, (entity) => reverseEntities[entity] || entity);
  },

  /**
   * Remove potentially malicious content
   */
  removeMaliciousContent: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    let sanitized = input;
    
    // Remove malicious patterns
    MALICIOUS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    return sanitized;
  },

  /**
   * Sanitize text input with various options
   */
  sanitizeText: (input: string, options: SanitizationOptions = {}): string => {
    if (!input || typeof input !== 'string') return '';
    
    let sanitized = input;
    
    // Remove malicious content first
    sanitized = inputSanitizer.removeMaliciousContent(sanitized);
    
    // Trim whitespace if requested
    if (options.trimWhitespace !== false) {
      sanitized = sanitized.trim();
    }
    
    // Remove empty lines if requested
    if (options.removeEmptyLines) {
      sanitized = sanitized.replace(/^\s*[\r\n]/gm, '');
    }
    
    // Preserve or normalize newlines
    if (!options.preserveNewlines) {
      sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }
    
    // Escape HTML unless explicitly allowed
    if (!options.allowHTML) {
      sanitized = inputSanitizer.escapeHTML(sanitized);
    }
    
    // Enforce maximum length
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }
    
    return sanitized;
  },

  /**
   * Sanitize email input
   */
  sanitizeEmail: (email: string): string => {
    if (!email || typeof email !== 'string') return '';
    
    // Remove malicious content and trim
    let sanitized = inputSanitizer.sanitizeText(email, {
      trimWhitespace: true,
      maxLength: 254 // RFC 5321 limit
    });
    
    // Remove any remaining HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    return sanitized.toLowerCase();
  },

  /**
   * Sanitize phone number input
   */
  sanitizePhoneNumber: (phone: string): string => {
    if (!phone || typeof phone !== 'string') return '';
    
    // Remove malicious content
    let sanitized = inputSanitizer.removeMaliciousContent(phone);
    
    // Keep only digits, spaces, hyphens, parentheses, and plus sign
    sanitized = sanitized.replace(/[^\d\s\-()+ ]/g, '');
    
    // Trim and limit length
    sanitized = sanitized.trim().substring(0, 20);
    
    return sanitized;
  },

  /**
   * Sanitize GST number input
   */
  sanitizeGSTIN: (gstin: string): string => {
    if (!gstin || typeof gstin !== 'string') return '';
    
    // Remove malicious content and escape HTML
    let sanitized = inputSanitizer.sanitizeText(gstin, {
      trimWhitespace: true,
      maxLength: 15
    });
    
    // Keep only alphanumeric characters
    sanitized = sanitized.replace(/[^A-Za-z0-9]/g, '');
    
    return sanitized.toUpperCase();
  },

  /**
   * Sanitize name input (first name, last name, company name)
   */
  sanitizeName: (name: string): string => {
    if (!name || typeof name !== 'string') return '';
    
    // Remove malicious content and escape HTML
    let sanitized = inputSanitizer.sanitizeText(name, {
      trimWhitespace: true,
      maxLength: 100
    });
    
    // Allow only letters, spaces, hyphens, apostrophes, and dots
    sanitized = sanitized.replace(/[^a-zA-Z\s\-'.]/g, '');
    
    // Remove multiple consecutive spaces
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    return sanitized;
  },

  /**
   * Sanitize address input
   */
  sanitizeAddress: (address: string): string => {
    if (!address || typeof address !== 'string') return '';
    
    return inputSanitizer.sanitizeText(address, {
      trimWhitespace: true,
      maxLength: 500,
      preserveNewlines: true
    });
  },

  /**
   * Sanitize general text input for forms
   */
  sanitizeFormInput: (input: string, fieldType: string = 'text'): string => {
    if (!input || typeof input !== 'string') return '';
    
    switch (fieldType.toLowerCase()) {
      case 'email':
        return inputSanitizer.sanitizeEmail(input);
      case 'phone':
      case 'mobile':
        return inputSanitizer.sanitizePhoneNumber(input);
      case 'gstin':
      case 'gst':
        return inputSanitizer.sanitizeGSTIN(input);
      case 'name':
      case 'firstname':
      case 'lastname':
      case 'companyname':
        return inputSanitizer.sanitizeName(input);
      case 'address':
        return inputSanitizer.sanitizeAddress(input);
      default:
        return inputSanitizer.sanitizeText(input);
    }
  },

  /**
   * Sanitize an entire object's string properties
   */
  sanitizeObject: <T extends Record<string, unknown>>(
    obj: T, 
    fieldMappings?: Record<string, string>
  ): T => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sanitized = { ...obj } as T;
    
    Object.keys(sanitized).forEach(key => {
      const value = sanitized[key];
      
      if (typeof value === 'string') {
        const fieldType = fieldMappings?.[key] || 'text';
        (sanitized as Record<string, unknown>)[key] = inputSanitizer.sanitizeFormInput(value, fieldType);
      } else if (Array.isArray(value)) {
        (sanitized as Record<string, unknown>)[key] = value.map(item => 
          typeof item === 'string' 
            ? inputSanitizer.sanitizeText(item)
            : item
        );
      } else if (value && typeof value === 'object') {
        (sanitized as Record<string, unknown>)[key] = inputSanitizer.sanitizeObject(value as Record<string, unknown>, fieldMappings);
      }
    });
    
    return sanitized;
  },

  /**
   * Validate if input contains malicious content
   */
  containsMaliciousContent: (input: string): boolean => {
    if (!input || typeof input !== 'string') return false;
    
    return MALICIOUS_PATTERNS.some(pattern => pattern.test(input));
  },

  /**
   * Validate input length
   */
  isValidLength: (input: string, min: number = 0, max: number = Infinity): boolean => {
    if (!input || typeof input !== 'string') return min === 0;
    
    return input.length >= min && input.length <= max;
  },

  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  /**
   * Validate phone number format
   */
  isValidPhoneNumber: (phone: string): boolean => {
    if (!phone || typeof phone !== 'string') return false;
    
    // Basic phone validation - at least 10 digits
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  },

  /**
   * Validate GSTIN format
   */
  isValidGSTIN: (gstin: string): boolean => {
    if (!gstin || typeof gstin !== 'string') return false;
    
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  }
};

export default inputSanitizer; 