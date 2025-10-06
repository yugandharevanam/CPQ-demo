import { useMemo, useState } from 'react';
import { Package } from '../../types';

interface PackageFilterOptions {
  searchTerm?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  includeOnlyFree?: boolean;
  sortBy?: 'price' | 'name' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

interface UsePackageFilterReturn {
  filteredPackages: Package[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  priceRange: { min: number; max: number } | null;
  setPriceRange: (range: { min: number; max: number } | null) => void;
  includeOnlyFree: boolean;
  setIncludeOnlyFree: (onlyFree: boolean) => void;
  sortBy: 'price' | 'name' | 'popularity';
  setSortBy: (sort: 'price' | 'name' | 'popularity') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  resetFilters: () => void;
  applyFilters: (packages: Package[], options?: PackageFilterOptions) => Package[];
}

/**
 * Custom hook for filtering and searching packages
 * Provides comprehensive filtering capabilities for package lists
 */
export const usePackageFilter = (initialPackages: Package[] = []): UsePackageFilterReturn => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [includeOnlyFree, setIncludeOnlyFree] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'popularity'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  /**
   * Apply filters to a package list
   */
  const applyFilters = useMemo(() => {
    return (packages: Package[], options?: PackageFilterOptions): Package[] => {
      const opts = {
        searchTerm: options?.searchTerm ?? searchTerm,
        priceRange: options?.priceRange ?? priceRange,
        includeOnlyFree: options?.includeOnlyFree ?? includeOnlyFree,
        sortBy: options?.sortBy ?? sortBy,
        sortOrder: options?.sortOrder ?? sortOrder,
      };

      let filtered = [...packages];

      // Search term filter
      if (opts.searchTerm) {
        const term = opts.searchTerm.toLowerCase();
        filtered = filtered.filter(pkg => 
          pkg.name.toLowerCase().includes(term) ||
          pkg.description?.toLowerCase().includes(term) ||
          Object.values(pkg.features || {}).some(feature => 
            feature?.toLowerCase().includes(term)
          )
        );
      }

      // Price range filter
      if (opts.priceRange) {
        filtered = filtered.filter(pkg => {
          const price = pkg.price || 0;
          return price >= opts.priceRange!.min && price <= opts.priceRange!.max;
        });
      }

      // Free packages only filter
      if (opts.includeOnlyFree) {
        filtered = filtered.filter(pkg => pkg.isIncluded || (pkg.price || 0) === 0);
      }

      // Sorting
      filtered.sort((a, b) => {
        let comparison = 0;

        switch (opts.sortBy) {
          case 'price':
            comparison = (a.price || 0) - (b.price || 0);
            break;
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'popularity': {
            // Assume free packages are more popular
            const aPopularity = a.isIncluded ? 1 : 0;
            const bPopularity = b.isIncluded ? 1 : 0;
            comparison = bPopularity - aPopularity;
            break;
          }
        }

        return opts.sortOrder === 'desc' ? -comparison : comparison;
      });

      return filtered;
    };
  }, [searchTerm, priceRange, includeOnlyFree, sortBy, sortOrder]);

  /**
   * Get filtered packages based on current filter state
   */
  const filteredPackages = useMemo(() => {
    return applyFilters(initialPackages);
  }, [initialPackages, applyFilters]);

  /**
   * Reset all filters to default state
   */
  const resetFilters = () => {
    setSearchTerm('');
    setPriceRange(null);
    setIncludeOnlyFree(false);
    setSortBy('price');
    setSortOrder('asc');
  };

  return {
    filteredPackages,
    searchTerm,
    setSearchTerm,
    priceRange,
    setPriceRange,
    includeOnlyFree,
    setIncludeOnlyFree,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resetFilters,
    applyFilters
  };
};

export default usePackageFilter; 