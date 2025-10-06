import { useState, useEffect, useCallback } from 'react';
import { Package } from '../../types';
import { MockPackageService } from '../../mocks/MockPackageService';

interface UsePackagesOptions {
  productId?: string;
  autoFetch?: boolean;
  sortByPrice?: boolean;
}

interface UsePackagesReturn {
  packages: Package[];
  selectedPackage: Package | null;
  loading: boolean;
  error: string | null;
  fetchPackages: (productId?: string) => Promise<void>;
  setSelectedPackage: (pkg: Package | null) => void;
  selectPackageById: (packageId: string) => boolean;
  refreshPackages: () => Promise<void>;
}

/**
 * Custom hook for managing packages
 * Handles fetching, sorting, selection, and state management
 */
export const usePackages = (options: UsePackagesOptions = {}): UsePackagesReturn => {
  const { productId, autoFetch: _autoFetch = true, sortByPrice = true } = options;

  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch packages from the API
   */
  const fetchPackages = useCallback(async (): Promise<void> => {
    if (!productId) {
      console.warn('No product ID provided for package fetching');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      
      let fetchedPackages: Package[];
      
      fetchedPackages = await MockPackageService.getPackagesForProduct(productId);


      // Sort packages by price if requested
      if (sortByPrice) {
        fetchedPackages.sort((a, b) => (a.price || 0) - (b.price || 0));
      }

      setPackages(fetchedPackages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch packages';
      console.error('Error fetching packages:', err);
      setError(errorMessage);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, [productId, sortByPrice]);

  /**
   * Select a package by ID
   */
  const selectPackageById = (packageId: string): boolean => {
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      setSelectedPackage(pkg);
      return true;
    }
    return false;
  };

  /**
   * Refresh packages (re-fetch)
   */
  const refreshPackages = async (): Promise<void> => {
    await fetchPackages();
  };

  // Auto-fetch packages when productId changes
  useEffect(() => {
    if (productId) {
      fetchPackages();
    }
  }, [productId, fetchPackages]);

  return {
    packages,
    selectedPackage,
    loading,
    error,
    fetchPackages,
    setSelectedPackage,
    selectPackageById,
    refreshPackages
  };
};

export default usePackages; 