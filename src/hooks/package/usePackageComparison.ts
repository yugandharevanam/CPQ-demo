import { useMemo } from 'react';
import { Package } from '../../types';

interface PackageComparison {
  package: Package;
  savings: number;
  isRecommended: boolean;
  priceCategory: 'free' | 'premium' | 'luxury';
}

interface UsePackageComparisonReturn {
  comparePackages: (packages: Package[]) => PackageComparison[];
  getBestValue: (packages: Package[]) => Package | null;
  getCheapest: (packages: Package[]) => Package | null;
  getMostExpensive: (packages: Package[]) => Package | null;
  calculateSavings: (selectedPackage: Package, packages: Package[]) => number;
  getPriceCategory: (packagePrice: number, allPackages: Package[]) => 'free' | 'premium' | 'luxury';
}

/**
 * Custom hook for comparing packages
 * Provides utilities for package analysis and recommendations
 */
export const usePackageComparison = (): UsePackageComparisonReturn => {
  
  /**
   * Compare packages and provide analysis
   */
  const comparePackages = useMemo(() => {
    return (packages: Package[]): PackageComparison[] => {
      if (packages.length === 0) return [];

      return packages.map(pkg => {
        const savings = Math.max(...packages.map(p => p.price || 0)) - (pkg.price || 0);
        const isRecommended = pkg.isIncluded || (pkg.price || 0) === 0; // Free packages are recommended
        const priceCategory = getPriceCategory(pkg.price || 0, packages);

        return {
          package: pkg,
          savings,
          isRecommended,
          priceCategory
        };
      });
    };
  }, []);

  /**
   * Get the best value package (free or lowest price)
   */
  const getBestValue = (packages: Package[]): Package | null => {
    if (packages.length === 0) return null;

    // First priority: free packages (isIncluded)
    const freePackages = packages.filter(p => p.isIncluded);
    if (freePackages.length > 0) {
      return freePackages[0];
    }

    // Second priority: lowest price
    return packages.reduce((cheapest, current) => {
      const cheapestPrice = cheapest.price || 0;
      const currentPrice = current.price || 0;
      return currentPrice < cheapestPrice ? current : cheapest;
    });
  };

  /**
   * Get the cheapest package
   */
  const getCheapest = (packages: Package[]): Package | null => {
    if (packages.length === 0) return null;
    
    return packages.reduce((cheapest, current) => {
      const cheapestPrice = cheapest.price || 0;
      const currentPrice = current.price || 0;
      return currentPrice < cheapestPrice ? current : cheapest;
    });
  };

  /**
   * Get the most expensive package
   */
  const getMostExpensive = (packages: Package[]): Package | null => {
    if (packages.length === 0) return null;
    
    return packages.reduce((expensive, current) => {
      const expensivePrice = expensive.price || 0;
      const currentPrice = current.price || 0;
      return currentPrice > expensivePrice ? current : expensive;
    });
  };

  /**
   * Calculate savings compared to most expensive package
   */
  const calculateSavings = (selectedPackage: Package, packages: Package[]): number => {
    const mostExpensive = getMostExpensive(packages);
    if (!mostExpensive) return 0;
    
    const selectedPrice = selectedPackage.price || 0;
    const maxPrice = mostExpensive.price || 0;
    
    return maxPrice - selectedPrice;
  };

  /**
   * Categorize package by price range
   */
  const getPriceCategory = (packagePrice: number, allPackages: Package[]): 'free' | 'premium' | 'luxury' => {
    if (packagePrice === 0) return 'free';
    
    const prices = allPackages.map(p => p.price || 0).filter(p => p > 0);
    if (prices.length === 0) return 'free';
    
            // const maxPrice = Math.max(...prices); // Unused variable
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    if (packagePrice <= avgPrice) return 'premium';
    return 'luxury';
  };

  return {
    comparePackages,
    getBestValue,
    getCheapest,
    getMostExpensive,
    calculateSavings,
    getPriceCategory
  };
};

export default usePackageComparison; 