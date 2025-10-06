/**
 * GSTIN Utility Functions
 * Provides functionality to extract information from GST numbers
 */

/**
 * Extract customer type from GST number based on PAN number pattern
 * @param gstin - 15-digit GST number
 * @returns customer type: 'Individual' or 'Commercial'
 */
export const getCustomerTypeFromGSTIN = (gstin: string): 'Individual' | 'Commercial' => {
  if (!gstin || gstin.length !== 15) {
    return 'Commercial'; // Default to Commercial for invalid GSTIN
  }

  // Extract PAN from GSTIN (positions 2-11, 0-indexed)
  const pan = gstin.substring(2, 12);
  
  if (pan.length < 4) {
    return 'Commercial'; // Default for invalid PAN
  }

  // Get the 4th character of PAN (position 3, 0-indexed)
  // This indicates the entity type
  const entityTypeChar = pan.charAt(3).toUpperCase();

  switch (entityTypeChar) {
    case 'P': // Person/Individual
      return 'Individual';
    
    case 'C': // Company
    case 'H': // HUF (Hindu Undivided Family)
    case 'A': // Association of Persons
    case 'T': // Trust
    case 'B': // Body of Individuals
    case 'L': // Local Authority
    case 'J': // Artificial Juridical Person
    case 'G': // Government
    case 'F': // Firm/Partnership (mapping to Commercial since Partnership removed)
    default:
      return 'Commercial';
  }
};

/**
 * Validate GSTIN format
 * @param gstin - GST number to validate
 * @returns boolean indicating if GSTIN format is valid
 */
export const isValidGSTINFormat = (gstin: string): boolean => {
  if (!gstin || gstin.length !== 15) {
    return false;
  }

  // Basic format check: first 2 chars should be numbers (state code)
  const stateCode = gstin.substring(0, 2);
  if (!/^\d{2}$/.test(stateCode)) {
    return false;
  }

  // Next 10 chars should be valid PAN format
  const pan = gstin.substring(2, 12);
  if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(pan)) {
    return false;
  }

  // Last 3 chars: entity number, check code, checksum
  const suffix = gstin.substring(12, 15);
  if (!/^[0-9A-Z]{3}$/.test(suffix)) {
    return false;
  }

  return true;
};

/**
 * Get entity type description from GSTIN
 * @param gstin - 15-digit GST number
 * @returns human-readable entity type description
 */
export const getEntityTypeFromGSTIN = (gstin: string): string => {
  if (!gstin || gstin.length !== 15) {
    return 'Unknown';
  }

  const pan = gstin.substring(2, 12);
  if (pan.length < 4) {
    return 'Unknown';
  }

  const entityTypeChar = pan.charAt(3).toUpperCase();

  switch (entityTypeChar) {
    case 'P':
      return 'Individual/Person';
    case 'C':
      return 'Company';
    case 'H':
      return 'Hindu Undivided Family';
    case 'F':
      return 'Firm/Partnership';
    case 'A':
      return 'Association of Persons';
    case 'T':
      return 'Trust';
    case 'B':
      return 'Body of Individuals';
    case 'L':
      return 'Local Authority';
    case 'J':
      return 'Artificial Juridical Person';
    case 'G':
      return 'Government';
    default:
      return 'Other Business Entity';
  }
}; 