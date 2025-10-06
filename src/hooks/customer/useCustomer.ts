// hooks/useCustomer.ts
import { useState } from 'react';
import { MockCustomerService as CustomerService } from '../../mocks/MockCustomerService';
import type { CustomerInfo } from '../../types';

/**
 * Custom hook for customer-related operations
 * Provides state management and error handling for customer data
 */
export const useCustomer = () => {
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simple cache to avoid refetching the same customer
  const [customerCache, setCustomerCache] = useState<Map<string, CustomerInfo>>(new Map());

  /**
   * Search for a customer by various criteria
   * @param searchTerm The term to search for
   * @param searchType The type of search (email, mobile, name, gstin)
   * @returns The found customer or null
   */
  const searchCustomer = async (
    searchTerm: string, 
    searchType: 'email' | 'mobile' | 'name' | 'gstin'
  ): Promise<CustomerInfo | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await CustomerService.searchCustomer(searchTerm, searchType);
      
      if (result) {
        setCustomer(result);
        // Cache the result
        if (result.customerId) {
          setCustomerCache(prev => new Map(prev).set(result.customerId!, result));
        }
      }
      
      return result;
    } catch (err) {
      const errorMessage = 'Failed to search for customer';
      setError(errorMessage);
      console.error(errorMessage, err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Get a customer by ID
   * @param customerId The customer ID
   * @returns The customer or null
   */
  const getCustomerById = async (customerId: string): Promise<CustomerInfo | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check cache first
      const cachedCustomer = customerCache.get(customerId);
      if (cachedCustomer) {
        console.log('Using cached customer data for:', customerId);
        setCustomer(cachedCustomer);
        setIsLoading(false);
        return cachedCustomer;
      }
      
      const result = await CustomerService.getCustomerById(customerId);
      
      if (result) {
        setCustomer(result);
        // Cache the result
        setCustomerCache(prev => new Map(prev).set(customerId, result));
      }
      
      return result;
    } catch (err) {
      const errorMessage = 'Failed to get customer';
      setError(errorMessage);
      console.error(errorMessage, err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Clear the current customer state
   */
  const clearCustomer = () => {
    setCustomer(null);
    setError(null);
  };

  /**
   * Clear the customer cache
   */
  const clearCache = () => {
    setCustomerCache(new Map());
  };
  
  return {
    customer,
    isLoading,
    error,
    searchCustomer,
    getCustomerById,
    clearCustomer,
    clearCache
  };
};

export default useCustomer;