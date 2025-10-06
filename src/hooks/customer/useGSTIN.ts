import { useState } from 'react';
import { MockCustomerService } from '../../mocks/MockCustomerService';

interface UseGSTINReturn {
  gstinInfo: any | null;
  isLoading: boolean;
  error: string | null;
  lookupGSTIN: (gstin: string) => Promise<void>;
  clearGSTIN: () => void;
}

export const useGSTIN = (): UseGSTINReturn => {
  const [gstinInfo, setGstinInfo] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const lookupGSTIN = async (gstin: string): Promise<void> => {
    if (!gstin || gstin.length !== 15) {
      setError('Please enter a valid 15-digit GSTIN number');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGstinInfo(null);

    try {
      const result = await MockCustomerService.lookupGSTIN(gstin);
      if (result) {
        setGstinInfo(result);
        setError(null);
      } else {
        setError('GSTIN not found. Please check the GSTIN number.');
      }
    } catch (err: unknown) {
      console.error('GSTIN lookup error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to lookup GSTIN. Please try again.';
      setError(errorMessage);
      setGstinInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearGSTIN = (): void => {
    setGstinInfo(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    gstinInfo,
    isLoading,
    error,
    lookupGSTIN,
    clearGSTIN,
  };
}; 