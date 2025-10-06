/**
 * Customer Type Mapping Utilities
 * Maps between frontend-friendly customer types and Frappe ERP backend types
 */

/**
 * Map frontend customer type to Frappe backend customer type
 * Frontend: "Commercial" -> Backend: "Company"
 * Frontend: "Individual" -> Backend: "Individual"
 */
export const mapCustomerTypeToFrappe = (customerType: string): string => {
  switch (customerType) {
    case 'Commercial':
      return 'Company';
    case 'Individual':
      return 'Individual';
    default:
      return 'Company'; // Default fallback for unknown types
  }
};

/**
 * Map Frappe backend customer type to frontend customer type
 * Backend: "Company" -> Frontend: "Commercial"
 * Backend: "Individual" -> Frontend: "Individual"
 */
export const mapCustomerTypeFromFrappe = (customerType: string): string => {
  switch (customerType) {
    case 'Company':
      return 'Commercial';
    case 'Individual':
      return 'Individual';
    case 'Partnership':
      return 'Commercial'; // Map Partnership to Commercial since we removed it from UI
    default:
      return 'Commercial'; // Default fallback for unknown types
  }
};

/**
 * Validate if customer type is supported by Frappe backend
 */
export const isValidFrappeCustomerType = (customerType: string): boolean => {
  return ['Company', 'Individual', 'Partnership'].includes(customerType);
};

/**
 * Validate if customer type is supported by frontend
 */
export const isValidFrontendCustomerType = (customerType: string): boolean => {
  return ['Commercial', 'Individual'].includes(customerType);
}; 