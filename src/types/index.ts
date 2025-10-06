// Product interface
export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  capacity: number;
  additionalFloorCost: number; // Cost per additional floor beyond base
  features: string[];
  maxStops: number;
  maxSpeed: string;
  recommendedBuildingTypes: string[];
}

// Package interface
export interface Package {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  isIncluded?: boolean;
  features: {
    wallMaterial: string;
    handrailPosition: string;
    handrailBarFinish: string;
  };
  interiorOptions?: {
    cabFinishes: InteriorOption[];
    elevatorDoorFinishes: InteriorOption[];
  };
}

// Interior option interface
export interface InteriorOption {
  id: string;
  name: string;
  primaryImage: string;
  cabViewImage: string;
  lobbyViewImage: string;
  price: number;
  isSelected?: boolean;
  image?: string; // Add image property for compatibility
}

// Addon interface
export interface Addon {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  isSelected?: boolean;
}

// Requirements interface
export interface Requirements {
  location: string;
  stops: string;
  lifts: string;
  passengers: string;
  buildingType: string;
  // Engineering & Design Details in millimeters (required through validation, optional in interface)
  custom_shaft_depth?: number;
  custom_shaft_width?: number;
  custom_headroom_allowance?: number;
  custom_overhead?: number;
  custom_pit_depth?: number;
  custom_cabin_width?: number;
  custom_cabin_depth?: number;
  custom_floor_height_in_ft?: number;
  custom_travel_distances_in_ft?: number;
  // Requested delivery date (YYYY-MM-DD)
  custom_requested_delivery_date?: string;
  // Door opening details (moved from interior options)
  custom_door_opening_size?: string;
  custom_door_opening_style?: string;
  // Additional cabin details
  custom_ceiling_finish?: string;
  custom_ceiling_type?: string;
  custom_handrail_type?: string;
}

// Selected product configuration
export interface ProductConfig {
  product: Product;
  package: Package;
  interiorOptions: {
    cabInteriorFinish: InteriorOption;
    elevatorDoorFinish: InteriorOption;
    custom_cabin_false_ceiling?: string;
  };
  addons: Addon[];
  requirements: Requirements;
}

export interface CustomerSuggestion {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gstin?: string;
  customerType: string;
  city?: string;
  matchReason: string; // Why this customer matched the search
}

export interface CustomerInfo {
  title?: string;
  customerId: string;
  customerType: string;
  salutation?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  gstin?: string;
  customerName?: string;
  siteAddressSameAsCustomer: boolean;
  siteAddress?: string;
  siteAddress2?: string;
  siteCity?: string;
  siteState?: string;
  siteZipCode?: string;
  siteCountry?: string;
}

// Complete form data interface
export interface FormData {
  // Customer information is now required
  customerInfo: CustomerInfo;
  
  // Step 2-5: Product configurations
  productConfigs: ProductConfig[];
  
  // Current active product being configured
  activeProductIndex: number;
  
  // Discount and GST information
  additional_discount_percentage?: number; // Percentage discount (0-10)
  taxes_and_charges?: string; // GST template name
  tax_category?: string; // Tax category (In-State, Out-State, etc.)
}