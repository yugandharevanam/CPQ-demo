import { useState, useEffect } from 'react';
import { FormData, Package, ProductConfig } from '../../../../types';
import { MockPackageService } from '../../../../mocks/MockPackageService';
import { ArrowLeft, ArrowRight, CheckCircleIcon } from 'lucide-react';
import { Image } from "@/components/ui/image"
import { Button } from '@/components/ui/button.tsx';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import parse from 'html-react-parser';
import { calculateCompleteTotalPrice, formatIndianNumber } from '../../../../utils/priceCalculator';

interface PackageSelectionFormProps {
  formData: FormData;
  updateActiveProductConfig: (data: Partial<ProductConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const PackageSelectionForm = ({
  formData,
  updateActiveProductConfig,
  nextStep,
  prevStep
}: PackageSelectionFormProps) => {
  // State for packages
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get the active product configuration
  const activeProductConfig = formData.productConfigs[formData.activeProductIndex] || null;
  const selectedProductId = activeProductConfig?.product?.id || '';

  // Get number of lifts from requirements
  const numberOfLifts = activeProductConfig?.requirements?.lifts
    ? parseInt(activeProductConfig.requirements.lifts)
    : 1;

  // Load packages for the selected product
  useEffect(() => {
    const fetchPackages = async () => {
      if (!selectedProductId) {
        setError('No product selected. Please go back and select a product.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch packages from mock service
        const fetchedPackages = await MockPackageService.getPackagesForProduct(selectedProductId);

                  // Packages fetched successfully
        
        // Sort packages by price (low to high)
        const sortedPackages = fetchedPackages.sort((a, b) => {
          const priceA = a.price || 0;
          const priceB = b.price || 0;
          return priceA - priceB;
        });
        
                  // Packages sorted by price
        setPackages(sortedPackages);

        // If package already selected in form data, set it as selected
        if (activeProductConfig?.package?.id) {
          const existingPackage = fetchedPackages.find((p: Package) => p.id === activeProductConfig.package.id);
          if (existingPackage) {
            setSelectedPackage(existingPackage);
          } else if (fetchedPackages.length > 0) {
            // Default to first package if previously selected one not found
            setSelectedPackage(fetchedPackages[0]);
          }
        } else if (fetchedPackages.length > 0) {
          // Default to first package if none selected
          setSelectedPackage(fetchedPackages[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Package loading error:', err);
        setError('Failed to load packages from Frappe API');
        setLoading(false);
      }
    };

    fetchPackages();
  }, [selectedProductId, activeProductConfig, numberOfLifts]);

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    updateActiveProductConfig({ package: pkg });
  };

  const handleNext = () => {
    if (selectedPackage) {
      updateActiveProductConfig({ package: selectedPackage });
      nextStep();
    }
  };

  const calculateTotalPrice = (): number => {
    if (!activeProductConfig) return 0;
    
    // Use the complete total price calculation that includes floor costs
    return calculateCompleteTotalPrice(activeProductConfig);
  };

  if (loading && !packages.length) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-black rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-red-500 dark:text-red-400">{error}</div>
        <button onClick={prevStep} className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-sm p-4 sm:p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black max-w-7xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-medium mb-4 sm:mb-5 text-gray-900 dark:text-white">Select your package</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`border rounded-lg overflow-hidden transition-all cursor-pointer min-h-fit bg-white dark:bg-black ${
              selectedPackage?.id === pkg.id ? 'border-red-500 border-2' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => handlePackageSelect(pkg)}
          >
            <div className="overflow-hidden mt-3 mx-3">
              <Image
                src={pkg.image}
                alt={pkg.name}
                className="w-full h-40 sm:h-48 object-cover"
                fallbackClassName='w-full h-40 sm:h-48 bg-gray-100 dark:bg-gray-800'
              />
            </div>
            <div className="p-3 sm:p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">{pkg.name}</h3>
              
              {pkg.description && (
                <div className="mb-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 [&_strong]:font-medium [&_strong]:text-gray-800 dark:[&_strong]:text-gray-200 flex-1">
                  {parse(pkg.description)}
                </div>
              )}

              <div className="flex justify-between items-center mt-auto pt-3">
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {pkg.isIncluded ? 'Included' : (
                    pkg.price ? (
                      <>
                        +₹{formatIndianNumber(pkg.price)}
                        {numberOfLifts > 1 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            (₹{formatIndianNumber(pkg.price * numberOfLifts)} for {numberOfLifts} lifts)
                          </div>
                        )}
                      </>
                    ) : 'Included'
                  )}
                </div>

                {selectedPackage?.id === pkg.id && (
                  <Button
                    variant='outline'
                    className="bg-red-500 text-white px-2 sm:px-4 py-1 text-xs rounded"
                  >
                    <span className='flex items-center'>
                      <CheckCircleIcon className="w-4 h-4 sm:w-6 sm:h-6 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">SELECTED</span>
                      <span className="sm:hidden">✓</span>
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    

      {/* Order Summary & Navigation */}
      <div className="mt-8 space-y-4">
        {/* Order Total Card */}
        <div className="rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-3 sm:mb-0">

              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300">ORDER TOTAL</span>
                <span className="text-lg sm:text-xl font-bold text-black dark:text-white">
                  ₹{formatIndianNumber(calculateTotalPrice())}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Button
            variant='outline'
            onClick={prevStep}
            className="w-full sm:w-auto px-6 py-3 rounded-md border border-gray-300 dark:border-gray-600 flex items-center justify-center"
          >
            <ArrowLeft size={20} className="mr-2" />
            Previous
          </Button>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={!selectedPackage}
            className={`w-full sm:w-auto ${
              !selectedPackage
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400'
                : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
            } text-white px-6 py-3 rounded-md flex items-center justify-center transition-colors`}
          >
            Next / Interior Options
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PackageSelectionForm; 