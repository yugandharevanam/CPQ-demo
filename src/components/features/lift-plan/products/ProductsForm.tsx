import { useState, useEffect } from 'react';
import { FormData, Product, ProductConfig } from '../../../../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card"
import { Image } from "@/components/ui/image"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { CheckCircleIcon } from 'lucide-react';
import useProducts from '../../../../hooks/product/useProducts';
import LoadingSpinner from '@/components/common/LoadingSpinner';

import { calculateProductPriceBreakdown, formatIndianNumber } from '../../../../utils/priceCalculator';

interface ProductsFormProps {
  formData: FormData;
  updateActiveProductConfig: (data: Partial<ProductConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const ProductsForm = ({
  formData,
  updateActiveProductConfig,
  nextStep,
  prevStep
}: ProductsFormProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Get active product config
  const activeProductIndex = formData.activeProductIndex;
  const activeProductConfig = formData.productConfigs[activeProductIndex];
  const selectedPassengers = activeProductConfig?.requirements?.passengers;
  const selectedPassengerCount = selectedPassengers ? parseInt(selectedPassengers) : undefined;

  // Use the enhanced useProducts hook with passenger capacity filtering
  const { products, isLoading, error } = useProducts(selectedPassengerCount);

  // Initialize selected product
  useEffect(() => {
    if (products.length === 0) return;

    // Initialize with the active product if it exists in filtered products
    const activeConfig = formData.productConfigs[formData.activeProductIndex];
    if (activeConfig?.product?.id) {
      const existingProduct = products.find(p => p.id === activeConfig.product.id);
      if (existingProduct) {
        setSelectedProduct(existingProduct);
        return;
      }
    }

    // Default to first product if no active product found
    if (!selectedProduct || !products.find(p => p.id === selectedProduct.id)) {
      setSelectedProduct(products[0]);
    }
  }, [products, formData.activeProductIndex, formData.productConfigs, selectedProduct]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    updateActiveProductConfig({ product });
  };

  const handleNext = () => {
    if (selectedProduct) {
      updateActiveProductConfig({ product: selectedProduct });
      nextStep();
    }
  };

  // Calculate the total price including additional floor costs
  const calculateTotalPrice = (): { basePrice: number; additionalFloorCosts: number; totalPrice: number } => {
    if (!selectedProduct) return { basePrice: 0, additionalFloorCosts: 0, totalPrice: 0 };
    
    const numberOfLifts = activeProductConfig?.requirements?.lifts ? parseInt(activeProductConfig.requirements.lifts) : 1;
    const numberOfStops = activeProductConfig?.requirements?.stops ? parseInt(activeProductConfig.requirements.stops) : 2;
    
    return calculateProductPriceBreakdown(selectedProduct, numberOfLifts, numberOfStops);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 border">
        <h2 className="text-2xl font-medium mb-5">Select your product</h2>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">{error}</div>
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={prevStep}
              className="px-6 py-3 rounded-md border border-gray-300 flex items-center"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Requirements
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no products match the passenger selection
  if (!isLoading && products.length === 0 && selectedPassengers) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 border">
        <h2 className="text-2xl font-medium mb-5">Select your product</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            No products available for {selectedPassengers} passengers.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Please go back and select a different passenger count or check your requirements.
          </p>
          <Button
            variant="outline"
            onClick={prevStep}
            className="px-6 py-3 rounded-md border border-gray-300 flex items-center"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Requirements
          </Button>
        </div>
      </div>
    );
  }


    
  // Calculate pricing breakdown
  const pricingBreakdown = calculateTotalPrice();
  


  return (
    <div className="rounded-lg shadow-sm p-8 border">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5">
          <h2 className="text-2xl font-medium">Select your product</h2>
          {selectedPassengers && (
            <div className="text-sm text-gray-500 mt-2 sm:mt-0">
              Showing products for {selectedPassengers} passengers
            </div>
          )}
        </div>

      {/* Products carousel */}
      <div className="mx-auto max-w-6xl">
        <Carousel 
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            {products.map((product) => (
              <CarouselItem key={product.id} className="pl-0 basis-full">
                <Card className={`border rounded-lg transition-all min-h-[450px] md:min-h-[500px] ${
                  selectedProduct?.id === product.id ? 'border-[#dc2626] border-2' : 'border-[#404040]'
                } bg-white dark:bg-[#1a1a1a]`}> 
                  <CardContent className="p-0">
                    <div className="p-6 w-full">
                      
                      {/* Mobile Layout - Professional Design */}
                      <div className="block md:hidden">
                        <div className="space-y-4">
                          {/* Header Section */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-black dark:text-[#ffffff] mb-1">{product.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-[#a3a3a3] leading-relaxed">
                                {product.description.toString().replace(/<[^>]*>?/gm, '')}
                              </p>
                            </div>
                            {/* Small Product Image */}
                            <div className="w-16 h-16 ml-3 flex-shrink-0">
                          <Image
                            src={`${import.meta.env.VITE_API_BASE_URL}${product.image}`}
                            alt={product.name}
                                className="w-full h-full rounded-lg bg-gray-100 dark:bg-[#262626] object-cover"
                                fallbackClassName='w-full h-full object-cover rounded-lg bg-gray-100 dark:bg-[#262626]'
                          />
                            </div>
                          </div>

                          {/* Specifications Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-[#1f1f1f] p-4 rounded-lg">
                              <p className="text-xs font-medium text-gray-500 dark:text-[#a3a3a3] mb-1">Capacity</p>
                              <p className="text-base font-semibold text-black dark:text-[#ffffff]">{product.capacity} Passengers</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1f1f1f] p-4 rounded-lg">
                              <p className="text-xs font-medium text-gray-500 dark:text-[#a3a3a3] mb-1">Max Stops</p>
                              <p className="text-base font-semibold text-black dark:text-[#ffffff]">{product.maxStops}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1f1f1f] p-4 rounded-lg">
                              <p className="text-xs font-medium text-gray-500 dark:text-[#a3a3a3] mb-1">Speed</p>
                              <p className="text-base font-semibold text-black dark:text-[#ffffff]">{product.maxSpeed}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1f1f1f] p-4 rounded-lg">
                              <p className="text-xs font-medium text-gray-500 dark:text-[#a3a3a3] mb-1">Building</p>
                              <p className="text-base font-semibold text-black dark:text-[#ffffff]">{activeProductConfig?.requirements?.buildingType || 'Not specified'}</p>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="bg-gray-50 dark:bg-[#1f1f1f] p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-500 dark:text-[#a3a3a3] mb-2">Key Features</p>
                            <div className="flex flex-wrap gap-2">
                              {product.features.slice(0, 4).map((feature, idx) => (
                                <span key={idx} className="text-xs bg-white dark:bg-[#262626] text-gray-700 dark:text-[#d4d4d4] px-3 py-1 rounded-full">
                                  {feature}
                                </span>
                              ))}
                              {product.features.length > 4 && (
                                <span className="text-xs bg-gray-200 dark:bg-[#404040] text-gray-600 dark:text-[#a3a3a3] px-3 py-1 rounded-full">
                                  +{product.features.length - 4}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price & Action */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[#404040]">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Starting from</p>
                              <p className="text-xl font-bold text-black dark:text-[#ffffff]">₹{formatIndianNumber(pricingBreakdown.totalPrice)}</p>
                            </div>
                            <Button
                              variant='outline'
                              className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
                                selectedProduct?.id === product.id 
                                  ? 'bg-[#dc2626] text-white border-[#dc2626]' 
                                  : 'bg-[#dc2626] hover:bg-red-700 text-white border-[#dc2626]'
                              }`}
                              onClick={() => handleProductSelect(product)}
                            >
                              {selectedProduct?.id === product.id ? (
                                <span className='flex items-center'>
                                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                                  SELECTED
                                </span>
                              ) : "SELECT"}
                          </Button>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden md:block">
                        <h3 className="text-xl font-semibold mb-4 text-black dark:text-[#ffffff]">{product.name}</h3>
                        <div className="flex gap-6">
                          <div className="w-1/2">
                            <Image
                              src={`${import.meta.env.VITE_API_BASE_URL}${product.image}`}
                              alt={product.name}
                              className="w-full rounded-lg bg-gray-100 dark:bg-[#262626]"
                              fallbackClassName='w-full h-64 object-cover rounded-lg bg-gray-100 dark:bg-[#262626]'
                            />
                            <div className="mt-6">
                              <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Starting from</p>
                              <p className="text-2xl font-bold text-black dark:text-[#ffffff]">₹{formatIndianNumber(pricingBreakdown.totalPrice)}</p>
                          </div>
                        </div>

                          <div className="w-1/2 space-y-4">
                            <p className="text-base text-gray-700 dark:text-[#d4d4d4] leading-relaxed">
                              {product.description.toString().replace(/<[^>]*>?/gm, '')}
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gray-50 dark:bg-[#1f1f1f] p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 dark:text-[#a3a3a3] mb-1">Capacity</p>
                                <p className="text-lg font-semibold text-black dark:text-[#ffffff]">{product.capacity} Passengers</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-[#1f1f1f] p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 dark:text-[#a3a3a3] mb-1">Max Stops</p>
                                <p className="text-lg font-semibold text-black dark:text-[#ffffff]">{product.maxStops}</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-[#1f1f1f] p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 dark:text-[#a3a3a3] mb-1">Max Speed</p>
                                <p className="text-lg font-semibold text-black dark:text-[#ffffff]">{product.maxSpeed}</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-[#1f1f1f] p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 dark:text-[#a3a3a3] mb-1">Building Type</p>
                                <p className="text-lg font-semibold text-black dark:text-[#ffffff]">{activeProductConfig?.requirements?.buildingType || 'Not specified'}</p>
                              </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-[#1f1f1f] p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-500 dark:text-[#a3a3a3] mb-3">Features</p>
                              <div className="flex flex-wrap gap-2">
                                {product.features.map((feature, idx) => (
                                  <span key={idx} className="text-sm bg-white dark:bg-[#262626] text-gray-700 dark:text-[#d4d4d4] px-3 py-1 rounded-full">
                                    {feature}
                                  </span>
                                ))}
                            </div>
                          </div>

                          <Button
                            variant='outline'
                              className={`px-8 py-3 text-base font-medium rounded-lg transition-all ${
                                selectedProduct?.id === product.id 
                                  ? 'bg-[#dc2626] text-white border-[#dc2626]' 
                                  : 'bg-[#dc2626] hover:bg-red-700 text-white border-[#dc2626]'
                              }`}
                            onClick={() => handleProductSelect(product)}
                          >
                            {selectedProduct?.id === product.id ? (
                              <span className='flex items-center'>
                                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                                SELECTED
                              </span>
                            ) : "SELECT"}
                          </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Carousel Navigation */}
          {products.length > 1 && (
            <>
              <CarouselPrevious className="left-1 sm:left-2 h-8 w-8 sm:h-10 sm:w-10" />
              <CarouselNext className="right-1 sm:right-2 h-8 w-8 sm:h-10 sm:w-10" />
            </>
          )}
        </Carousel>
      </div>

      {/* Order Summary - Mobile First Design */}
      <div className="mt-8 space-y-4">
        {/* Order Total Card - Always Visible */}
        <div className="rounded-lg p-6 border border-gray-200 dark:border-[#404040] bg-white dark:bg-[#1a1a1a]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-3 sm:mb-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-medium text-gray-600 dark:text-[#737373]">ORDER TOTAL</span>
                {/* Price Breakdown Tooltip - Commented out as requested
                {(numberOfLifts > 1 || pricingBreakdown.additionalFloorCosts > 0) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <Info className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-sm">
                        <div className="text-sm space-y-2">
                          <p className="font-semibold text-gray-800">Price Breakdown:</p>
                          <div className="space-y-1">
                            <p>Base price: ₹{selectedProduct?.price.toLocaleString()}</p>
                            {numberOfLifts > 1 && (
                              <p>Quantity: {numberOfLifts} lifts = ₹{pricingBreakdown.basePrice.toLocaleString()}</p>
                            )}
                            {pricingBreakdown.additionalFloorCosts > 0 && (
                              <p>Extra floors: +₹{pricingBreakdown.additionalFloorCosts.toLocaleString()} 
                                <span className="text-xs text-gray-600"> ({numberOfStops - 2} stops @ ₹{selectedProduct?.additionalFloorCost.toLocaleString()}/stop)</span>
                              </p>
                            )}
                          </div>
                          <div className="border-t pt-2 font-semibold">
                            <p>Total: ₹{pricingBreakdown.totalPrice.toLocaleString()}</p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                */}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-black dark:text-[#ffffff] mt-1">
                ₹{formatIndianNumber(pricingBreakdown.totalPrice)}
              </div>
            </div>
            
            {/* Progress Indicator - Mobile */}
            <div className="text-xs text-gray-500 dark:text-[#737373] sm:hidden">
              Step 3 of 7: Product Selection
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-md border border-gray-300 dark:border-[#404040] flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#262626] text-black dark:text-[#ffffff] text-sm sm:text-base"
          >
            <ArrowLeft size={16} className="mr-2 sm:mr-2" />
            Previous
          </Button>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={!selectedProduct}
            className={`w-full sm:w-auto transition-all duration-200 ${
              !selectedProduct 
                ? 'bg-gray-300 dark:bg-[#737373] cursor-not-allowed text-gray-500 dark:text-[#1a1a1a] border-gray-300' 
                : 'bg-[#dc2626] hover:bg-red-600 dark:bg-[#dc2626] dark:hover:bg-red-700 border-[#dc2626] hover:border-red-600'
            } text-white px-4 sm:px-6 py-3 rounded-md flex items-center justify-center border-2 text-sm sm:text-base`}
          >
            Next / Packages
            <ArrowRight size={16} className="ml-2 sm:ml-2" />
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProductsForm;