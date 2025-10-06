// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { Product } from '../../types';
import { MockProductService as ProductService } from '../../mocks/MockProductService';
import { toast } from 'sonner';

/**
 * Custom hook to fetch and cache products
 * This helps avoid duplicate API calls across components
 * Now supports filtering by passenger capacity
 */
export const useProducts = (passengerCapacity?: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch products whenever passenger capacity changes or on initial load
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const fetchedProducts = await ProductService.getProducts(passengerCapacity);
        

        
        if (fetchedProducts.length === 0) {
          if (passengerCapacity) {
            setError(`No products found for ${passengerCapacity} passengers. Please try a different passenger count.`);
          } else {
            setError('No products found in the system. Please contact the administrator.');
          }
        } else {
          setProducts(fetchedProducts);
          setError(null);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please try again.');
        toast.error('Error loading products');
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [passengerCapacity]);

  // Function to refresh products if needed
  const refreshProducts = async () => {
    try {
      setIsLoading(true);
      const refreshedProducts = await ProductService.getProducts(passengerCapacity);
      setProducts(refreshedProducts);
      setError(null);
      setIsLoading(false);
      return refreshedProducts;
    } catch (err) {
      void err; // Suppress unused variable warning
      setError('Failed to refresh products. Please try again.');
      setIsLoading(false);
      return [];
    }
  };

  // Function to get a specific product by ID
  const getProductById = (productId: string): Product | undefined => {
    return products.find(product => product.id === productId);
  };

  return { 
    products, 
    isLoading, 
    error, 
    refreshProducts,
    getProductById
  };
};

export default useProducts;