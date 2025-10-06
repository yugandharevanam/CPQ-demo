// Updated CustomerInfoForm.tsx with better handling of existing customers
import { useState, useEffect, useCallback } from 'react';
import { CustomerInfo, FormData } from '../../../../types';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from "@/components/ui/form";

// Import subcomponents
import CustomerSearchSection from './CustomerSearchSection';
import ExistingCustomerForm from './ExistingCustomerForm';
import NewCustomerForm from './NewCustomerForm';
import AddressForm from '../address/AddressForm';

// Import schema
import { createCustomerInfoSchema } from '../../../../validation/schemas';

interface CustomerInfoFormProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextStep: () => void;
}

const CustomerInfoForm = ({
  formData,
  updateFormData,
  nextStep
}: CustomerInfoFormProps) => {
  const [isExistingCustomer, setIsExistingCustomer] = useState<boolean>(false);
  const [customerType, setCustomerType] = useState<string>(formData.customerInfo?.customerType || '');
  const [currentCustomer, setCurrentCustomer] = useState<CustomerInfo | null>(null);
  
  // Create a dynamic schema based on customer type
  const schema = createCustomerInfoSchema(customerType, isExistingCustomer);

  // Initialize the form with react-hook-form and zod validation
  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: {
      customerId: formData.customerInfo?.customerId || '',
      customerType: formData.customerInfo?.customerType || '',
      salutation: formData.customerInfo?.salutation || '',
      email: formData.customerInfo?.email || '',
      firstName: formData.customerInfo?.firstName || '',
      lastName: formData.customerInfo?.lastName || '',
      title: formData.customerInfo?.title || '',
      address: formData.customerInfo?.address || '',
      address2: formData.customerInfo?.address2 || '',
      country: formData.customerInfo?.country || 'India',
      state: formData.customerInfo?.state || '',
      city: formData.customerInfo?.city || '',
      zipCode: formData.customerInfo?.zipCode || '',
      phoneNumber: formData.customerInfo?.phoneNumber || '',
      gstin: formData.customerInfo?.gstin || '',
      customerName: formData.customerInfo?.customerName || '',
      siteAddressSameAsCustomer: formData.customerInfo?.siteAddressSameAsCustomer !== false, // Default to true
      siteAddress: formData.customerInfo?.siteAddress || '',
      siteAddress2: formData.customerInfo?.siteAddress2 || '',
      siteCity: formData.customerInfo?.siteCity || '',
      siteState: formData.customerInfo?.siteState || '',
      siteZipCode: formData.customerInfo?.siteZipCode || '',
      siteCountry: formData.customerInfo?.siteCountry || 'India',
    },
  });

  // Watch for important form field changes
  const siteAddressSameAsCustomer = form.watch('siteAddressSameAsCustomer');
  const watchedCustomerType = form.watch('customerType');

  // Initialize currentCustomer from existing form data (from localStorage)
  useEffect(() => {
    if (formData.customerInfo?.customerId && !currentCustomer) {
      setCurrentCustomer(formData.customerInfo);
      setIsExistingCustomer(true);
    }
  }, [formData.customerInfo, currentCustomer]);

  // Update customer type when it changes in the form
  useEffect(() => {
    if (watchedCustomerType !== customerType) {
      setCustomerType(watchedCustomerType);
    }
  }, [watchedCustomerType, customerType]);

  // Copy customer address to site address when checkbox is checked
  // Function to copy address fields to site address fields
  const copyAddressToSiteAddress = useCallback(() => {
    const customerAddress = form.getValues('address');
    const customerAddress2 = form.getValues('address2');
    const customerCity = form.getValues('city');
    const customerState = form.getValues('state');
    const customerZipCode = form.getValues('zipCode');
    const customerCountry = form.getValues('country');

    form.setValue('siteAddress', customerAddress);
    form.setValue('siteAddress2', customerAddress2 || '');
    form.setValue('siteCity', customerCity);
    form.setValue('siteState', customerState);
    form.setValue('siteZipCode', customerZipCode);
    form.setValue('siteCountry', customerCountry);
  }, [form]);

  // Copy customer address to site address when checkbox is checked
  useEffect(() => {
    if (siteAddressSameAsCustomer) {
      copyAddressToSiteAddress();
    }
  }, [siteAddressSameAsCustomer, copyAddressToSiteAddress]);

  const onSubmit = (data: any) => {  
    // Check if customer name has changed from original - if so, treat as new customer
    const originalCustomerName = currentCustomer 
      ? (currentCustomer.customerType === 'Individual' 
          ? `${currentCustomer.firstName} ${currentCustomer.lastName}`.trim()
          : currentCustomer.customerName)
      : '';
      
    const newCustomerName = data.customerType === 'Individual'
      ? `${data.firstName} ${data.lastName}`.trim()
      : (data.customerName || '');
      
    const customerNameChanged = originalCustomerName && originalCustomerName !== newCustomerName;
    

    
    // For Individual customers, ensure customerName matches firstName + lastName
    const finalCustomerName = data.customerType === 'Individual'
      ? `${data.firstName} ${data.lastName}`.trim()
      : (data.customerName || '');
    
    // Prepare customer data with all required fields
    const customerData: CustomerInfo = {
      // Required fields from the form
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      address: data.address,
      country: data.country,
      state: data.state,
      city: data.city,
      zipCode: data.zipCode,
      siteAddressSameAsCustomer: data.siteAddressSameAsCustomer,
      
      // Fields that can be empty strings
      email: data.email || '',
      title: data.title || '',
      phoneNumber: data.phoneNumber || '',
      customerType: data.customerType || '',
      salutation: data.salutation || '',
      
      // Optional fields
      address2: data.address2,
      gstin: data.gstin || '',
      customerName: finalCustomerName, // Use calculated name for Individual customers
      // Clear customerId if name changed to force new customer creation
      customerId: customerNameChanged ? '' : (data.customerId || ''),
      
      // Site address fields - use customer address if same, otherwise use site fields
      siteAddress: data.siteAddressSameAsCustomer ? data.address : (data.siteAddress || ''),
      siteAddress2: data.siteAddressSameAsCustomer ? data.address2 : data.siteAddress2,
      siteCity: data.siteAddressSameAsCustomer ? data.city : (data.siteCity || ''),
      siteState: data.siteAddressSameAsCustomer ? data.state : (data.siteState || ''),
      siteZipCode: data.siteAddressSameAsCustomer ? data.zipCode : (data.siteZipCode || ''),
      siteCountry: data.siteAddressSameAsCustomer ? data.country : (data.siteCountry || '')
    };
    
    updateFormData({ customerInfo: customerData });
    
    nextStep();
  };

  // Handler for when a customer is found via search
  const handleCustomerFound = useCallback((customer: CustomerInfo) => {
    // Store the current customer for display
    setCurrentCustomer(customer);
    
    // Enhanced form filling with better error handling
    try {
      // Force update all important fields explicitly 
      form.setValue('customerName', customer.customerName || '');
      form.setValue('customerType', customer.customerType || '');
      form.setValue('gstin', customer.gstin || '');
      form.setValue('customerId', customer.customerId || '');
      
      // Also update the local customerType state
      setCustomerType(customer.customerType || '');
      
      // Handle salutation - it should be parsed from the customer name or firstName
      form.setValue('salutation', customer.salutation || '');
      form.setValue('email', customer.email || '');
      form.setValue('phoneNumber', customer.phoneNumber || '');
      form.setValue('title', customer.title || '');
      
      // For existing customers, the salutation might be embedded in firstName or customerName
      // Extract clean firstName and lastName
      form.setValue('firstName', customer.firstName || '');
      form.setValue('lastName', customer.lastName || '');
      
      // Set address fields with validation
      if (customer.address) {
        form.setValue('address', customer.address);
      }
      if (customer.address2) {
        form.setValue('address2', customer.address2);
      }
      
      // Set state first, then city with a small delay to allow state processing
      if (customer.state) {
        form.setValue('state', customer.state);
      }
      
      if (customer.country) {
        form.setValue('country', customer.country);
      }
      
      if (customer.zipCode) {
        form.setValue('zipCode', customer.zipCode);
      }
      
      // Set city after state with a small delay to ensure proper synchronization
      if (customer.city) {
        // Set immediately first
        form.setValue('city', customer.city);
        
        // Then set again after a short delay to ensure AddressForm has processed the state
        setTimeout(() => {
          const currentCity = form.getValues('city');
          if (!currentCity || currentCity !== customer.city) {
            form.setValue('city', customer.city);
          }
        }, 150);
      }
      
    } catch (error) {
      console.error('Error setting form values:', error);
    }

    // Set site address same as customer by default
    form.setValue('siteAddressSameAsCustomer', true);
    copyAddressToSiteAddress();

    setIsExistingCustomer(true);
  }, [form, copyAddressToSiteAddress]);

  // Reset the form to create a new customer
  const handleCreateNewCustomer = useCallback(() => {
    setIsExistingCustomer(false);
    setCurrentCustomer(null);
    
    // Reset only specific fields but keep others like address
    form.setValue('customerId', '');
    form.setValue('customerName', '');
    form.setValue('salutation', '');
    form.setValue('firstName', '');
    form.setValue('lastName', '');
    form.setValue('email', '');
    form.setValue('phoneNumber', '');
    form.setValue('gstin', '');
    form.setValue('customerType', '');
    
    // Re-focus on the customer type field
    setTimeout(() => {
      const customerTypeElement = document.getElementById('customer-type-select');
      if (customerTypeElement) {
        customerTypeElement.focus();
      }
    }, 100);
  }, [form]);

  return (
    <div className="rounded-lg shadow-sm p-5">
      <h2 className="text-2xl font-medium mb-5">Customer Information</h2>

      {/* Customer Search Section */}
      <CustomerSearchSection 
        onCustomerFound={handleCustomerFound}
        onCreateNew={handleCreateNewCustomer}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Customer Information Section - Existing or New */}
          {isExistingCustomer && currentCustomer ? (
            <ExistingCustomerForm 
              control={form.control} 
              customer={currentCustomer}
              watchedCustomerType={watchedCustomerType}
            />
          ) : (
            <NewCustomerForm 
              control={form.control} 
              watchedCustomerType={watchedCustomerType}
            />
          )}

          {/* Address Section */}
          <AddressForm 
            control={form.control} 
            form={form}
            siteAddressSameAsCustomer={siteAddressSameAsCustomer}
          />

          <div className="mt-8 text-xs">
            <p><span className='text-red-500'>*Required</span></p>
            <p className="mt-1">
              The completion of online forms does not imply a binding contract between Emperor Lifts and consumer
              or that the order is confirmed by Emperor Lifts. A sales rep is required to review and finalize all
              orders and the contract.
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              variant="outline"
              type="submit"
              className="bg-red-500 text-white px-6 py-6 rounded-md flex items-center"
            >
              Next / Requirements
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CustomerInfoForm;