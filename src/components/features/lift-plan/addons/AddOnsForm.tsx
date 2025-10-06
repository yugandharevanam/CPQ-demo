import { useState, useEffect } from 'react';
import { FormData, Addon, ProductConfig } from '../../../../types';
import { useAddons } from '@/hooks';
import { ArrowLeft, ArrowRight, CheckCircleIcon } from 'lucide-react';

import { Image as AntImage } from 'antd';
import { Button } from "@/components/ui/button"
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { calculateCompleteTotalPrice } from '../../../../utils/priceCalculator';

interface AddOnsFormProps {
  formData: FormData;
  updateActiveProductConfig: (data: Partial<ProductConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const AddOnsForm = ({
  formData,
  updateActiveProductConfig,
  nextStep,
  prevStep
}: AddOnsFormProps) => {
  const { addons, loading, error } = useAddons();
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  // Get the active product configuration
  const activeProductConfig = formData.productConfigs[formData.activeProductIndex] || null;

  // Get number of lifts from requirements
  const numberOfLifts = activeProductConfig?.requirements?.lifts
    ? parseInt(activeProductConfig.requirements.lifts)
    : 1;



  // Load selected add-ons from form data
  useEffect(() => {
    if (activeProductConfig?.addons && activeProductConfig.addons.length > 0 && addons.length > 0) {
      const previouslySelectedAddons = addons.filter(addon =>
        activeProductConfig.addons.some((selected: Addon) => selected.id === addon.id)
          );
          setSelectedAddons(previouslySelectedAddons);
        }
  }, [activeProductConfig, addons]);

  const toggleAddon = (addon: Addon) => {
    let updatedAddons;

    if (selectedAddons.some(a => a.id === addon.id)) {
      // Remove addon if already selected
      updatedAddons = selectedAddons.filter(a => a.id !== addon.id);
    } else {
      // Add addon if not already selected
      updatedAddons = [...selectedAddons, addon];
    }

    setSelectedAddons(updatedAddons);
  };

  const handleNext = () => {
    updateActiveProductConfig({ addons: selectedAddons });
    nextStep();
  };

  const calculateTotalPrice = (): number => {
    if (!activeProductConfig) return 0;
    
    // Create a temporary config with current addon selections for price calculation
    const tempConfig = {
      ...activeProductConfig,
      addons: selectedAddons
    };
    
    return calculateCompleteTotalPrice(tempConfig);
  };

  // Split add-ons by category
  const designAddons = addons.filter(a => a.category?.toUpperCase() === 'DESIGN');
  const securityAddons = addons.filter(a => a.category?.toUpperCase() === 'SECURITY');
  const comfortAddons = addons.filter(a => a.category?.toUpperCase() === 'COMFORT');

  if (loading && !addons.length) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 border">
        <div className="text-red-500">{error}</div>
        <button onClick={prevStep} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-sm p-5 border">
      <h2 className="text-xl font-medium mb-5">Add-ons (Select any)</h2>

      {/* Design Add-ons */}
      <h3 className="text-lg font-semibold mb-3 mt-6 text-center text-red-500">Design Add-ons</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {designAddons.map((addon) => (
          <div key={addon.id} className="flex">
            <div className="w-1/3">
              <div className="relative w-full h-32">
                <AntImage
                  src={`${import.meta.env.VITE_API_BASE_URL}${addon.image}`}
                  alt={addon.name}
                  className="w-full h-32 object-cover rounded-md"
                  style={{ width: '100%', height: '128px' }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                  preview={{
                    mask: 'Click to preview',
                    maskClassName: 'rounded-md'
                  }}
                />
              </div>
            </div>
            <div className="w-2/3 pl-4">
              <h3 className="text-base font-medium">{addon.name}</h3>
              <p className="text-sm text-gray-600 my-2">{addon.description}</p>
              <div className="text-lg font-bold mb-3">
                ₹{addon.price.toLocaleString()}
                {numberOfLifts > 1 && (
                  <span className="text-sm text-gray-500 ml-2">
                    (₹{(addon.price * numberOfLifts).toLocaleString()} for {numberOfLifts} lifts)
                  </span>
                )}
              </div>
              <Button
                variant='outline'
                onClick={() => toggleAddon(addon)}
                className={`w-full py-2 text-center border ${selectedAddons.some(a => a.id === addon.id)
                  ? 'bg-red-500 text-white'
                  : 'border-gray-300'
                  }`}
              >
                {selectedAddons.some(a => a.id === addon.id) ? (
                  <span className='flex items-center'>
                    <CheckCircleIcon className="w-6 h-6 mr-2" />
                    SELECTED
                  </span>
                ) : 'SELECT'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Security Add-ons */}
      <h3 className="text-lg font-semibold mb-3 mt-6 text-center text-red-500">Security Add-ons</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {securityAddons.map((addon) => (
          <div key={addon.id} className="flex">
            <div className="w-1/3">
              <div className="relative w-full h-32">
                <AntImage
                  src={`${import.meta.env.VITE_API_BASE_URL}${addon.image}`}
                  alt={addon.name}
                  className="w-full h-32 object-cover rounded-md"
                  style={{ width: '100%', height: '128px' }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                  preview={{
                    mask: 'Click to preview',
                    maskClassName: 'rounded-md'
                  }}
                />
              </div>
            </div>
            <div className="w-2/3 pl-4">
              <h3 className="text-base font-medium">{addon.name}</h3>
              <p className="text-sm text-gray-600 my-2">{addon.description}</p>
              <div className="text-lg font-bold mb-3">
                ₹{addon.price.toLocaleString()}
                {numberOfLifts > 1 && (
                  <span className="text-sm text-gray-500 ml-2">
                    (₹{(addon.price * numberOfLifts).toLocaleString()} for {numberOfLifts} lifts)
                  </span>
                )}
              </div>
              <Button
                variant='outline'
                onClick={() => toggleAddon(addon)}
                className={`w-full py-2 text-center border ${selectedAddons.some(a => a.id === addon.id)
                  ? 'bg-red-500 text-white'
                  : 'border-gray-300'
                  }`}
              >
                {selectedAddons.some(a => a.id === addon.id) ? (
                  <span className='flex items-center'>
                    <CheckCircleIcon className="w-6 h-6 mr-2" />
                    SELECTED
                  </span>
                ) : 'SELECT'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Comfort Add-ons */}
      <h3 className="text-lg font-semibold mb-3 mt-6 text-center text-red-500">Comfort Add-ons</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {comfortAddons.map((addon) => (
          <div key={addon.id} className="flex">
            <div className="w-1/3">
              <div className="relative w-full h-32">
                <AntImage
                  src={`${import.meta.env.VITE_API_BASE_URL}${addon.image}`}
                  alt={addon.name}
                  className="w-full h-32 object-cover rounded-md"
                  style={{ width: '100%', height: '128px' }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                  preview={{
                    mask: 'Click to preview',
                    maskClassName: 'rounded-md'
                  }}
                />
              </div>
            </div>
            <div className="w-2/3 pl-4">
              <h3 className="text-base font-medium">{addon.name}</h3>
              <p className="text-sm text-gray-600 my-2">{addon.description}</p>
              <div className="text-lg font-bold mb-3">
                ₹{addon.price.toLocaleString()}
                {numberOfLifts > 1 && (
                  <span className="text-sm text-gray-500 ml-2">
                    (₹{(addon.price * numberOfLifts).toLocaleString()} for {numberOfLifts} lifts)
                  </span>
                )}
              </div>
              <Button
                variant='outline'
                onClick={() => toggleAddon(addon)}
                className={`w-full py-2 text-center border ${selectedAddons.some(a => a.id === addon.id)
                  ? 'bg-red-500 text-white'
                  : 'border-gray-300'
                  }`}
              >
                {selectedAddons.some(a => a.id === addon.id) ? (
                  <span className='flex items-center'>
                    <CheckCircleIcon className="w-6 h-6 mr-2" />
                    SELECTED
                  </span>
                ) : 'SELECT'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary & Navigation - Mobile First Design */}
      <div className="mt-8 space-y-4">
        {/* Order Total Card - Always Visible */}
        <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-3 sm:mb-0">

              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300">ORDER TOTAL</span>
                <span className="text-lg sm:text-xl font-bold text-black dark:text-white">
                  ₹{calculateTotalPrice().toLocaleString()}
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
            variant='outline'
            onClick={handleNext}
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-6 py-3 rounded-md flex items-center justify-center transition-colors"
          >
            Next / Summary
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
};

export default AddOnsForm;