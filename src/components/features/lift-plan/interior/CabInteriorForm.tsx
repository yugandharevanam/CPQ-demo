import { useState, useEffect } from 'react';
import { FormData, InteriorOption, ProductConfig } from '../../../../types';
// Removed backend interior fetch; using interior options from selected package
import { ArrowLeft, ArrowRight, CheckCircle2Icon } from 'lucide-react';
import { Image } from "@/components/ui/image"
import { Button } from '@/components/ui/button.tsx';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import LoadingSpinner from '@/components/common/LoadingSpinner';
import parse from 'html-react-parser';
import { calculateCompleteTotalPrice, formatIndianNumber } from '../../../../utils/priceCalculator';

interface CabInteriorFormProps {
  formData: FormData;
  updateActiveProductConfig: (data: Partial<ProductConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CabInteriorForm = ({
  formData,
  updateActiveProductConfig,
  nextStep,
  prevStep
}: CabInteriorFormProps) => {

  // State for interior options
  const [interiorOptions, setInteriorOptions] = useState<{
    cabFinishes: InteriorOption[];
    elevatorDoorFinishes: InteriorOption[];
  }>({
    cabFinishes: [],
    elevatorDoorFinishes: []
  });

  const [selectedCabFinish, setSelectedCabFinish] = useState<InteriorOption | null>(null);
  const [selectedElevatorDoorFinish, setSelectedElevatorDoorFinish] = useState<InteriorOption | null>(null);
  
  // Additional interior option (remaining in this step)
  const [cabinFalseCeiling, setCabinFalseCeiling] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get the active product configuration
  const activeProductConfig = formData.productConfigs[formData.activeProductIndex] || null;
  const selectedProductId = activeProductConfig?.product?.id || '';
  const selectedPackage = activeProductConfig?.package || null;

  // Get number of lifts from requirements
  const numberOfLifts = activeProductConfig?.requirements?.lifts
    ? parseInt(activeProductConfig.requirements.lifts)
    : 1;

  // Load interior options when component mounts
  useEffect(() => {
    const fetchInteriorOptions = async () => {
      if (!selectedProductId || !selectedPackage?.id) {
        setError('No product or package selected. Please go back and complete previous steps.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        let interiorOptionsData: { cabFinishes: InteriorOption[]; elevatorDoorFinishes: InteriorOption[] } = {
          cabFinishes: [],
          elevatorDoorFinishes: []
        };
        
        // Check if the selected package already has interior options (from main API call)
        if (selectedPackage.interiorOptions) {
          // Using interior options from package data
          interiorOptionsData = selectedPackage.interiorOptions;
        }

        setInteriorOptions(interiorOptionsData);

        // Only load from existing selection, NO auto-selection
        if (activeProductConfig?.interiorOptions) {
          // Cab finish - only set if previously selected
          if (activeProductConfig.interiorOptions.cabInteriorFinish?.id) {
            const existingCabFinish = interiorOptionsData.cabFinishes.find(
              (f: InteriorOption) => f.id === activeProductConfig.interiorOptions.cabInteriorFinish.id
            );
            if (existingCabFinish) {
              setSelectedCabFinish(existingCabFinish);
            }
          }

          // Door finish - only set if previously selected
          if (activeProductConfig.interiorOptions.elevatorDoorFinish?.id) {
            const existingElevatorFinish = interiorOptionsData.elevatorDoorFinishes.find(
              (f: InteriorOption) => f.id === activeProductConfig.interiorOptions.elevatorDoorFinish.id
            );
            if (existingElevatorFinish) {
              setSelectedElevatorDoorFinish(existingElevatorFinish);
            }
          }
          
          if (activeProductConfig.interiorOptions.custom_cabin_false_ceiling) {
            setCabinFalseCeiling(activeProductConfig.interiorOptions.custom_cabin_false_ceiling);
          }
        }
        
        // NO automatic selection - user must choose

        setLoading(false);
      } catch (err) {
        void err; // Suppress unused variable warning
        setError('Failed to load interior options. Please try again.');
        setLoading(false);
      }
    };

    fetchInteriorOptions();
  }, [selectedProductId, selectedPackage, activeProductConfig, numberOfLifts]);

  const handleFinishSelection = (type: 'cab' | 'lobby', option: InteriorOption) => {
    if (type === 'cab') {
      setSelectedCabFinish(option);
    } else if (type === 'lobby') {
      setSelectedElevatorDoorFinish(option);
    } 
  };

  const handleNext = () => {
    if (selectedCabFinish && selectedElevatorDoorFinish) {
      updateActiveProductConfig({
        interiorOptions: {
          cabInteriorFinish: selectedCabFinish,
          elevatorDoorFinish: selectedElevatorDoorFinish,
          custom_cabin_false_ceiling: cabinFalseCeiling
        }
      });
      nextStep();
    }
  };

  const calculateTotalPrice = (): number => {
    if (!activeProductConfig) return 0;
    
    // Create a temporary config with current selections for price calculation
    const tempConfig = {
      ...activeProductConfig,
      interiorOptions: {
        cabInteriorFinish: selectedCabFinish || activeProductConfig.interiorOptions?.cabInteriorFinish,
        elevatorDoorFinish: selectedElevatorDoorFinish || activeProductConfig.interiorOptions?.elevatorDoorFinish
      }
    };
    
    return calculateCompleteTotalPrice(tempConfig);
  };

  if (loading) {
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
      <h2 className="text-xl sm:text-2xl font-medium mb-4 sm:mb-6 text-gray-900 dark:text-white">Select your cab interior options</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column - Package Info */}
            <div className="col-span-1">
              <h3 className="text-lg sm:text-xl font-medium mb-3 text-gray-900 dark:text-white">Evanam Lift Packages</h3>
              <h4 className="text-base sm:text-lg mb-3 text-gray-900 dark:text-white">{selectedPackage?.name}</h4>

              {selectedPackage?.description && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border-l-4 border-red-500">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {parse(selectedPackage.description)}
                </div>
                </div>
              )}

              <div className="text-xs sm:text-sm space-y-4 text-gray-600 dark:text-gray-400">
                <div className="border-t pt-3">
                  <p className="text-gray-500 dark:text-gray-400">Selected package details displayed above. Continue to customize your interior finishes.</p>
                </div>
              </div>

            </div>

            {/* Middle Column - Preview */}
            <div className="col-span-1">
              <Tabs defaultValue="cab" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="cab">CAB VIEW</TabsTrigger>
                  <TabsTrigger value="lobby">LOBBY VIEW</TabsTrigger>
                </TabsList>
                <TabsContent value="cab">
                  <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg">
                    <Image
                      src='/cab-view.jpg'
                      alt='cab view'
                      className="w-full h-full object-cover"
                      fallbackClassName='w-full h-80 bg-gray-100 dark:bg-gray-800'
                    />
                  </div>
                </TabsContent>
                <TabsContent value="lobby">
                  <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg">
                    <Image
                      src='/lobby-view.jpg'
                      alt='lobby view'
                      className="w-full h-full object-cover"
                      fallbackClassName='w-full h-80 bg-gray-100 dark:bg-gray-800'
                    />
                  </div>
                </TabsContent>
              </Tabs>

            </div>
            {/* Right Column - Finish Options */}
            <div className="col-span-1">
              <h3 className="text-lg sm:text-xl font-medium mb-4 text-gray-900 dark:text-white">Select your finishes</h3>
              {/* Cab Interior Finish */}
              <div className="mb-6">
                <h4 className="text-sm sm:text-base mb-2 text-gray-900 dark:text-white">
                  Cab interior finish
                  <span className="text-gray-400 dark:text-gray-500 text-xs ml-2">(included in price)</span>
                  {selectedCabFinish ? (
                    <span className="text-green-600 dark:text-green-400 text-xs ml-2">✓ {selectedCabFinish.name}</span>
                  ) : (
                    <span className="text-red-400 dark:text-red-400 text-xs ml-2">• Please select</span>
                  )}
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {interiorOptions.cabFinishes.map((option: InteriorOption) => {
                    const isSelected = selectedCabFinish?.id === option.id;
                    return (
                    <div
                      key={option.id}
                      className={`relative rounded cursor-pointer p-1 ${
                        isSelected
                          ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'hover:ring-1 hover:ring-gray-300'
                        }`}
                      onClick={() => handleFinishSelection('cab', option)}
                    >
                      <div className="aspect-w-1 aspect-h-1">
                        <Image
                          src={`${import.meta.env.VITE_API_BASE_URL}${option.primaryImage}`}
                          alt={option.name}
                          className="w-full h-full object-cover rounded"
                          fallbackClassName='h-8 bg-gray-100 dark:bg-gray-800'
                          desc1FallbackClassName='h-1 w-[3.5rem] bg-gray-200 dark:bg-gray-700'
                          desc2FallbackClassName='hidden'
                        />
                      </div>
                      <div className="text-xs mt-1 text-center text-gray-700 dark:text-gray-300">{option.name}</div>

                      {/* Always show price for cab interior finish */}
                      <div className="text-xs text-center">
                        {option.price > 0 ? (
                          <span className="text-red-500">+₹{formatIndianNumber(option.price)}</span>
                        ) : (
                          <span className="text-green-600">Included</span>
                        )}
                      </div>

                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                          <CheckCircle2Icon className="text-white w-3 h-3" />
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              </div>

              {/* Elevator Door Finish */}
              <div className="mb-6">
                <h4 className="text-sm sm:text-base mb-2 text-gray-900 dark:text-white">
                  Elevator door finish
                  <span className="text-gray-400 dark:text-gray-500 text-xs ml-2">(prices listed below)</span>
                  {selectedElevatorDoorFinish ? (
                    <span className="text-green-600 dark:text-green-400 text-xs ml-2">✓ {selectedElevatorDoorFinish.name}</span>
                  ) : (
                    <span className="text-red-400 dark:text-red-400 text-xs ml-2">• Please select</span>
                  )}
                </h4>

                <div className="grid grid-cols-4 gap-2">
                  {interiorOptions.elevatorDoorFinishes.map((option: InteriorOption) => {
                    const isSelected = selectedElevatorDoorFinish?.id === option.id;
                    return (
                    <div
                      key={option.id}
                      className={`relative rounded cursor-pointer p-1 ${
                        isSelected
                          ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'hover:ring-1 hover:ring-gray-300'
                        }`}
                      onClick={() => handleFinishSelection('lobby', option)}
                    >
                      <div className="aspect-w-1 aspect-h-1">
                        <Image
                          src={`${import.meta.env.VITE_API_BASE_URL}${option.primaryImage}`}
                          alt={option.name}
                          className="w-full h-full object-cover rounded"
                          fallbackClassName='h-8 bg-gray-100 dark:bg-gray-800'
                          desc1FallbackClassName='h-1 w-[3.5rem] bg-gray-200 dark:bg-gray-700'
                          desc2FallbackClassName='hidden'
                        />
                      </div>
                      <div className="text-xs mt-1 text-center text-gray-700 dark:text-gray-300">{option.name}</div>
                      {option.price > 0 && (
                        <div className="text-xs text-red-500 text-center">
                          +₹{formatIndianNumber(option.price)}
                          {numberOfLifts > 1 && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                              (₹{formatIndianNumber(option.price * numberOfLifts)} for {numberOfLifts} lifts)
                            </div>
                          )}
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                          <CheckCircle2Icon className="text-white w-3 h-3" />
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              </div>


            </div>
          </div>

      {/* Additional Interior Options - Below Overall Section */}


      {/* Order Summary & Navigation - Mobile First Design */}
      <div className="mt-8 space-y-4">
        {/* Order Total Card - Always Visible */}
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
            disabled={!(selectedCabFinish && selectedElevatorDoorFinish)}
            className={`w-full sm:w-auto ${
              !(selectedCabFinish && selectedElevatorDoorFinish)
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400'
                : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
            } text-white px-6 py-3 rounded-md flex items-center justify-center transition-colors`}
          >
            {!(selectedCabFinish && selectedElevatorDoorFinish) 
              ? 'Select both finishes to continue' 
              : 'Next / Add-ons'
            }
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CabInteriorForm;