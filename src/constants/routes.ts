// constants/routes.ts

/**
 * Centralized route definitions for the application
 * Use these constants instead of hardcoded strings to avoid typos
 * and make route changes easier
 */
export const ROUTES = {
    // Authentication
    LOGIN: '/login',
    OAUTH_CALLBACK: '/oauth-callback',
    
    // Main pages
    // DASHBOARD: '/', // Commented out - users go directly to lift-plan
    LIFT_PLAN: '/lift-plan',
    
    // DocType routes
    DOCTYPE: '/doctype/:doctype',
    DOCTYPE_DETAIL: '/doctype/:doctype/:name',
    
    // Customer routes
    CUSTOMER_LIST: '/customers',
    CUSTOMER_DETAIL: '/customers/:customerId',
    
    // Product routes
    PRODUCT_LIST: '/products',
    PRODUCT_DETAIL: '/products/:productId',
    
    // Quotation routes
    QUOTATION_LIST: '/quotations',
    QUOTATION_DETAIL: '/quotations/:quotationId',
  };
  
  /**
   * Helper functions to generate route paths with parameters
   */
  export const ROUTE_HELPERS = {
    // DocType routes
    getDocTypePath: (doctype: string) => `/doctype/${doctype}`,
    getDocTypeDetailPath: (doctype: string, name: string) => `/doctype/${doctype}/${name}`,
    
    // Customer routes
    getCustomerDetailPath: (customerId: string) => `/customers/${customerId}`,
    
    // Product routes
    getProductDetailPath: (productId: string) => `/products/${productId}`,
    
    // Quotation routes
    getQuotationDetailPath: (quotationId: string) => `/quotations/${quotationId}`,
  };
  
  export default ROUTES;