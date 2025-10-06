import { ProductConfig, Product } from '../types';

/**
 * Format number in Indian style (e.g., 5,00,000 instead of 500,000)
 * @param num - The number to format
 * @returns Formatted string in Indian number format
 */
export const formatIndianNumber = (num: number): string => {
  return num.toLocaleString('en-IN');
};

/**
 * Calculate the total price for a product configuration including additional floor costs
 * @param productConfig - The product configuration
 * @returns Object with basePrice, additionalFloorCosts, and totalPrice
 */
export const calculateProductTotalPrice = (productConfig: ProductConfig): {
  basePrice: number;
  additionalFloorCosts: number;
  totalPrice: number;
} => {
  if (!productConfig?.product) {
    return { basePrice: 0, additionalFloorCosts: 0, totalPrice: 0 };
  }

  const product = productConfig.product;
  const numberOfLifts = productConfig.requirements?.lifts 
    ? parseInt(productConfig.requirements.lifts) 
    : 1;
  const numberOfStops = productConfig.requirements?.stops 
    ? parseInt(productConfig.requirements.stops) 
    : 2;

  // Base price includes cost for 2 stops, additional cost for stops beyond 2
  const basePrice = numberOfLifts * product.price;
  const additionalStops = Math.max(0, numberOfStops - 2); // Additional stops beyond base 2 stops
  const additionalFloorCost = product.additionalFloorCost || 65000; // Fallback if undefined
  const additionalFloorCosts = numberOfLifts * additionalStops * additionalFloorCost;
  const totalPrice = basePrice + additionalFloorCosts;

  // Debug logging for price calculation issues (only if base price is 0)
  if (product.name?.includes('Emperor Imperator Series 8 Passenger') && basePrice === 0) {
    console.log('💰 Price calculation issue for Emperor Imperator Series 8 Passenger:', {
      productName: product.name,
      productPrice: product.price,
      basePrice
    });
  }

  return { basePrice, additionalFloorCosts, totalPrice };
};

/**
 * Calculate the total price for a product configuration including package and other options
 * @param productConfig - The product configuration
 * @returns Total price including all options
 */
export const calculateCompleteTotalPrice = (productConfig: ProductConfig): number => {
  if (!productConfig?.product) {
    return 0;
  }

  // Get the base product total (including floor costs)
  const productTotal = calculateProductTotalPrice(productConfig);
  let total = productTotal.totalPrice;

  // Add package price (always add, regardless of isIncluded flag for display purposes)
  if (productConfig.package && productConfig.package.price) {
    const numberOfLifts = productConfig.requirements?.lifts 
      ? parseInt(productConfig.requirements.lifts) 
      : 1;
    total += (productConfig.package.price * numberOfLifts);
  }

  // Add interior options
  if (productConfig.interiorOptions) {
    const numberOfLifts = productConfig.requirements?.lifts 
      ? parseInt(productConfig.requirements.lifts) 
      : 1;
    
    if (productConfig.interiorOptions.cabInteriorFinish?.price) {
      total += (productConfig.interiorOptions.cabInteriorFinish.price * numberOfLifts);
    }
    if (productConfig.interiorOptions.elevatorDoorFinish?.price) {
      total += (productConfig.interiorOptions.elevatorDoorFinish.price * numberOfLifts);
    }
  }

  // Add addons
  if (productConfig.addons && productConfig.addons.length > 0) {
    const numberOfLifts = productConfig.requirements?.lifts 
      ? parseInt(productConfig.requirements.lifts) 
      : 1;
    
    productConfig.addons.forEach(addon => {
      if (addon?.price) {
        total += (addon.price * numberOfLifts);
      }
    });
  }

  return total;
};

/**
 * Calculate product price breakdown for display purposes
 * @param product - The product
 * @param numberOfLifts - Number of lifts
 * @param numberOfStops - Number of stops
 * @returns Price breakdown object
 */
export const calculateProductPriceBreakdown = (
  product: Product, 
  numberOfLifts: number, 
  numberOfStops: number
): {
  basePrice: number;
  additionalFloorCosts: number;
  totalPrice: number;
} => {
  const basePrice = numberOfLifts * product.price;
  const additionalStops = Math.max(0, numberOfStops - 2);
  const additionalFloorCost = product.additionalFloorCost || 65000;
  const additionalFloorCosts = numberOfLifts * additionalStops * additionalFloorCost;
  const totalPrice = basePrice + additionalFloorCosts;

  return { basePrice, additionalFloorCosts, totalPrice };
}; 