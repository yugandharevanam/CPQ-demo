import { useState, useCallback } from 'react';
import { FormData } from '../../types';
import QuotationService from '../../mocks/MockQuotationService';

interface UseQuotationReturn {
  loading: boolean;
  error: string | null;
  quotationId: string | null;
  customerId: string | null;
  pdfUrl: string | null;
  submitQuotation: (formData: FormData) => Promise<{ quotationId: string; customerId?: string }>;
  getQuotationPDF: (quotationId: string) => Promise<Blob>;
  calculateProductTotal: (config: any) => number;
  generateFloorDesignation: (stops: number) => string;
  reset: () => void;
}

export const useQuotation = (): UseQuotationReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [quotationId, setQuotationId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const submitQuotation = useCallback(async (formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await QuotationService.submitQuotation(formData);
      setQuotationId(result.quotationId);
      if (result.customerId) setCustomerId(result.customerId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit quotation';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getQuotationPDF = useCallback(async (quotationId: string) => {
    try {
      const pdfBlob = await QuotationService.getQuotationPDF(quotationId);
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      return pdfBlob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch PDF';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const calculateProductTotal = useCallback((config: any) => {
    return QuotationService.calculateProductTotal(config);
  }, []);

  const generateFloorDesignation = useCallback((stops: number) => {
    return `G+${Math.max(0, stops - 1)}`;
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setQuotationId(null);
    setCustomerId(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }, [pdfUrl]);

  return {
    loading,
    error,
    quotationId,
    customerId,
    pdfUrl,
    submitQuotation,
    getQuotationPDF,
    calculateProductTotal,
    generateFloorDesignation,
    reset
  };
};
