// src/validation/schemas.ts
import { z } from 'zod';
import { inputSanitizer } from '../utils/inputSanitization';


// Create a dynamic schema based on customer type and existing status
export const createCustomerInfoSchema = (customerType: string, isExistingCustomer: boolean) => {
  // Address fields required for all schemas
  const addressFields = {
    address: z.string().min(1, 'Address is required'),
    address2: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    state: z.string().min(1, 'State is required'),
    city: z.string().min(1, 'City is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
  };

  // Site address fields (without refinements for now)
  const siteAddressFields = {
    siteAddressSameAsCustomer: z.boolean(),
    siteAddress: z.string().optional(),
    siteAddress2: z.string().optional(),
    siteCity: z.string().optional(),
    siteState: z.string().optional(),
    siteZipCode: z.string().optional(),
    siteCountry: z.string().optional(),
  };

  // Common fields for all schemas
  const commonFields = {
    customerType: z.string().min(1, 'Customer type is required'),
    // Make salutation mandatory
    salutation: z.string().min(1, 'Salutation is required'),
    email: z.string().email('Please enter a valid email address').optional(),
    // Make phone number mandatory (basic non-empty check)
    phoneNumber: z.string().min(1, 'Phone number is required'),
    title: z.string().optional(),
    customerId: z.string().optional(),
    ...addressFields,
    ...siteAddressFields
  };

  // Base schema to extend with appropriate fields and validations
  let schema;

  // For existing customers
  if (isExistingCustomer) {
    schema = z.object({
      ...commonFields,
      firstName: z.string().min(1, 'Primary contact first name is required'),
      lastName: z.string().min(1, 'Primary contact last name is required'),
      customerName: z.string().optional(),
      gstin: z.string().optional()
    });
  }
  // For new Commercial customers
  else if (customerType === 'Commercial') {
    schema = z.object({
      ...commonFields,
      // GST number should be optional for Commercial as per requirement
      gstin: z.string().optional(),
      customerName: z.string().min(1, 'Company name is required'),
      firstName: z.string().min(1, 'Primary contact first name is required'),
      lastName: z.string().min(1, 'Primary contact last name is required')
    });
    
    // Add GST validation only when provided
    schema = schema.superRefine((data, ctx) => {
      if (data.gstin && !inputSanitizer.isValidGSTIN(data.gstin)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid GST number (e.g., 29ABCDE1234F1Z5)',
          path: ['gstin']
        });
      }
    });
  }
  // For new Individual customers
  else if (customerType === 'Individual') {
    schema = z.object({
      ...commonFields,
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      customerName: z.string().optional(),
      gstin: z.string().optional()
    });
    
    // Add optional GST validation for Individual
    schema = schema.superRefine((data, ctx) => {
      if (data.gstin && !inputSanitizer.isValidGSTIN(data.gstin)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid GST number (e.g., 29ABCDE1234F1Z5)',
          path: ['gstin']
        });
      }
    });
  }
  // For other customer types (default fallback)
  else {
    schema = z.object({
      ...commonFields,
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      customerName: z.string().optional(),
      gstin: z.string().optional()
    });
    
    // Add optional GST validation for other types
    schema = schema.superRefine((data, ctx) => {
      if (data.gstin && !inputSanitizer.isValidGSTIN(data.gstin)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid GST number (e.g., 29ABCDE1234F1Z5)',
          path: ['gstin']
        });
      }
    });
  }
  
  // Add site address validation to all schemas
  return schema.superRefine((data, ctx) => {
    // Only validate site fields if siteAddressSameAsCustomer is false
    if (!data.siteAddressSameAsCustomer) {
      if (!data.siteAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Site address is required when not using customer address",
          path: ['siteAddress']
        });
      }
      
      if (!data.siteCity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Site city is required when not using customer address",
          path: ['siteCity']
        });
      }
      
      if (!data.siteState) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Site state is required when not using customer address",
          path: ['siteState']
        });
      }
      
      if (!data.siteZipCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Site ZIP code is required when not using customer address",
          path: ['siteZipCode']
        });
      }
      
      if (!data.siteCountry) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Site country is required when not using customer address",
          path: ['siteCountry']
        });
      }
    }
  });
};


/**
 * Customer information validation schema
 * Used in the CustomerInfoForm component
 */
export const customerInfoSchema = z.object({
  // Required fields
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().min(1, 'Address is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  siteAddressSameAsCustomer: z.boolean(),

  // Optional fields
  email: z.string().email('Please enter a valid email address').optional(),
  title: z.string().optional(),
  address2: z.string().optional(),
  phoneNumber: z.string().optional(),
  gstin: z.string()
    .optional()
    .refine(val => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(val), {
      message: 'Please enter a valid GST number (e.g., 29ABCDE1234F1Z5)',
    }),
  customerName: z.string().optional(),
  siteAddress: z.string().optional(),
  siteAddress2: z.string().optional(),
  siteCity: z.string().optional(),
  siteState: z.string().optional(),
  siteZipCode: z.string().optional(),
  siteCountry: z.string().optional(),
}).refine(
  (data) => {
    // If site address is same as customer, no additional validation needed
    if (data.siteAddressSameAsCustomer) {
      return true;
    }
    
    // Otherwise check that all required site fields are provided
    return (
      !!data.siteAddress && 
      !!data.siteCity && 
      !!data.siteState && 
      !!data.siteZipCode && 
      !!data.siteCountry
    );
  },
  {
    message: "Site address details are required when different from customer address",
    path: ["siteAddress"] // This will show the error at the siteAddress field
  }
);

/**
 * Requirements validation schema
 * Used in the RequirementsForm component
 */
export const requirementsSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  stops: z.string().min(1, 'Number of stops is required'),
  lifts: z.string().min(1, 'Number of lifts is required'),
  passengers: z.string().min(1, 'Number of passengers is required'),
  buildingType: z.string().min(1, 'Building type is required'),
  // Engineering & Design Details - optional fields
  custom_shaft_depth: z.number().optional(),
  custom_shaft_width: z.number().optional(),
  custom_headroom_allowance: z.number().optional(),
  custom_overhead: z.number().optional(),
  custom_pit_depth: z.number().optional(),
  custom_cabin_width: z.number().optional(),
  custom_cabin_depth: z.number().optional(),
  custom_floor_height_in_ft: z.number().optional(),
  custom_travel_distances_in_ft: z.number().optional(),
  // Requested delivery date (YYYY-MM-DD)
  custom_requested_delivery_date: z.string().optional(),
  // Door opening details moved from interior step
  custom_door_opening_size: z.string().optional(),
  custom_door_opening_style: z.string().optional(),
  // Additional cabin details
  custom_ceiling_finish: z.string().optional(),
  custom_ceiling_type: z.string().optional(),
  custom_handrail_type: z.string().optional()
});

/**
 * Full quotation validation schema
 * Used for final validation before submission
 */
export const quotationSchema = z.object({
  customerInfo: customerInfoSchema,
  productConfigs: z.array(
    z.object({
      product: z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
      }),
      package: z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
      }),
      interiorOptions: z.object({
        cabInteriorFinish: z.object({
          id: z.string(),
          name: z.string(),
          price: z.number(),
        }),
        elevatorDoorFinish: z.object({
          id: z.string(),
          name: z.string(),
          price: z.number(),
        }),
      }),
      addons: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          price: z.number(),
        })
      ),
      requirements: requirementsSchema,
    })
  ).min(1, 'At least one product configuration is required'),
  activeProductIndex: z.number(),
});