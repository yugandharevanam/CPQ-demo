import { useState } from 'react';
import { FormData } from '../../../../types';
import { ArrowRight, ArrowLeft, PencilIcon, CheckCircleIcon, Loader2 } from 'lucide-react';
import { Image as AntImage } from 'antd';
import { Button } from '@/components/ui/button.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import QuotationService from '../../../../mocks/MockQuotationService';
import { calculateProductTotalPrice, calculateCompleteTotalPrice, formatIndianNumber } from '../../../../utils/priceCalculator';

interface ConfirmationFormProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  prevStep: () => void;
  goToCustomerStep: () => void;
  addNewProduct: () => void;
  onSubmitSuccess?: () => void;
}

const ConfirmationForm = ({
  formData,
  updateFormData,
  prevStep,
  goToCustomerStep,
  addNewProduct: _addNewProduct,
  onSubmitSuccess
}: ConfirmationFormProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [quotationId, setQuotationId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number>(formData.additional_discount_percentage || 0);

  const calculateProductTotal = (index: number): number => {
    const config = formData.productConfigs[index];
    if (!config) return 0;
    
    return QuotationService.calculateProductTotal(config);
  };

  const calculateOrderTotal = (): number => {
    const subtotal = formData.productConfigs.reduce((sum: number, _, index: number) => {
      return sum + calculateProductTotal(index);
    }, 0);
    
    // Apply discount for display purposes
    const discountAmount = (subtotal * discountPercentage) / 100;
    return subtotal - discountAmount;
  };

  const calculateSubtotal = (): number => {
    return formData.productConfigs.reduce((sum: number, _, index: number) => {
      return sum + calculateProductTotal(index);
    }, 0);
  };

  const calculateDiscountAmount = (): number => {
    const subtotal = calculateSubtotal();
    return (subtotal * discountPercentage) / 100;
  };



  const validateForm = (): boolean => {
    // Validate customer information
    const { firstName, lastName } = formData.customerInfo;
    if (!firstName || !lastName) {
      toast.error("Customer's first and last name are required");
      return false;
    }
    
    // Validate products
    if (formData.productConfigs.length === 0) {
      toast.error("At least one product configuration is required");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    // Validate form data
    if (!validateForm()) {
      return;
    }
    
    // Update form data with discount and GST
    const updatedFormData = {
      ...formData,
      additional_discount_percentage: discountPercentage,
      taxes_and_charges: 'Output GST In-state - SE', // Default GST template
      tax_category: 'In-State' // Default tax category
    };
    // Debug: expose and log the exact payload being submitted
    try {
      (window as any).lastQuotationData = updatedFormData;
    } catch { /* no-op */ }
    console.log('[Quotation] Submitting payload:', updatedFormData);
    
    // Submit order
    try {
      setLoading(true);
      setSubmitError(null);

      // Submit to Frappe backend using our service
      const result = await QuotationService.submitQuotation(updatedFormData);
      
      // Set success message with quotation ID
      setQuotationId(result.quotationId);
      try {
        (window as any).lastQuotationId = result.quotationId;
      } catch { /* no-op */ }
      if (result.customerId) {
        setSuccessMessage(`New customer created (ID: ${result.customerId}) and quotation submitted! Your quotation ID is ${result.quotationId}`);
      } else {
        setSuccessMessage(`Quotation successfully submitted! Your quotation ID is ${result.quotationId}`);
      }
      
      toast.success("Quotation submitted successfully!");
      
      // Call onSubmitSuccess callback to clear saved data
      onSubmitSuccess?.();
      
      // Fetch filled HTML after successful creation for preview/print
      try {
        const htmlBlob = await QuotationService.getQuotationHTML(result.quotationId);
        const url = URL.createObjectURL(htmlBlob);
        setPdfUrl(url);
        try {
          (window as any).lastQuotationPreviewUrl = url;
        } catch { /* no-op */ }
        console.log('[Quotation] Preview URL:', url);
        // Open preview in new tab so the user can see all data and print to PDF
        window.open(url, '_blank');
      } catch {
        toast.error('Could not generate quotation preview');
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to submit quotation:', error);
      setSubmitError('Failed to submit quotation. Please try again later.');
      toast.error('Failed to submit quotation');
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg shadow-sm p-5">
      <div className="grid grid-cols-1 gap-8">
        {/* Order Summary */}
        <div>
          <h2 className="text-2xl font-medium mb-5">Review Order</h2>
            
          {/* Customer Information Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* For Individual customers - show only name */}
                {formData.customerInfo.customerType === 'Individual' ? (
                  <>
                    <div>
                      <p className="font-medium">Customer Name:</p>
                      <p>
                        {formData.customerInfo.salutation && `${formData.customerInfo.salutation} `}
                        {formData.customerInfo.firstName} {formData.customerInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Customer Type:</p>
                      <p className="capitalize">{formData.customerInfo.customerType || "Not provided"}</p>
                    </div>
                  </>
                ) : (
                  /* For Commercial customers - show both company name and contact person */
                  <>
                    {formData.customerInfo.customerName && (
                      <div>
                        <p className="font-medium">Company Name:</p>
                        <p>{formData.customerInfo.customerName}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">Primary Contact:</p>
                      <p>
                        {formData.customerInfo.salutation && `${formData.customerInfo.salutation} `}
                        {formData.customerInfo.firstName} {formData.customerInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Customer Type:</p>
                      <p className="capitalize">{formData.customerInfo.customerType || "Not provided"}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="font-medium">Email:</p>
                  <p>{formData.customerInfo.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium">Phone:</p>
                  <p>{formData.customerInfo.phoneNumber || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium">Title/Role:</p>
                  <p>{formData.customerInfo.title || "Not provided"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="font-medium">Address:</p>
                  {formData.customerInfo.address ? (
                    <p>
                      {formData.customerInfo.address}
                      {formData.customerInfo.address2 ? `, ${formData.customerInfo.address2}` : ''}
                    </p>
                  ) : (
                    <p>Not provided</p>
                  )}
                  {formData.customerInfo.city && formData.customerInfo.state && (
                    <p>
                      {formData.customerInfo.city}, {formData.customerInfo.state}, {formData.customerInfo.zipCode}
                    </p>
                  )}
                  <p>{formData.customerInfo.country}</p>
                </div>
                {formData.customerInfo.gstin && (
                  <div className="md:col-span-2">
                    <p className="font-medium">GST Number:</p>
                    <p className="font-mono text-sm">{formData.customerInfo.gstin}</p>
                  </div>
                )}
                {!formData.customerInfo.siteAddressSameAsCustomer && formData.customerInfo.siteAddress && (
                  <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-blue-600 dark:text-blue-400">Site Address (Installation Location):</p>
                    <p className="mt-1">
                      {formData.customerInfo.siteAddress}
                      {formData.customerInfo.siteAddress2 ? `, ${formData.customerInfo.siteAddress2}` : ''}
                    </p>
                    {formData.customerInfo.siteCity && formData.customerInfo.siteState && (
                      <p>
                        {formData.customerInfo.siteCity}, {formData.customerInfo.siteState}, {formData.customerInfo.siteZipCode}
                      </p>
                    )}
                    <p>{formData.customerInfo.siteCountry}</p>
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                className="mt-4 w-full sm:w-auto text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 border-blue-200 dark:border-blue-700" 
                onClick={() => goToCustomerStep()}
              >
                <PencilIcon size={16} className="mr-2" /> Edit Customer Information
              </Button>
            </CardContent>
          </Card>

          {/* Requirements Summary */}
          {formData.productConfigs.map((config, index: number) => (
            <Card key={`requirements-${index}`} className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Requirements & Engineering Details - Product {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Mobile: Improved responsive layout */}
                <div className="block lg:hidden">
                  {/* Mobile Layout: Single column with better spacing */}
                  <div className="space-y-6 text-sm">
                    {/* Basic Requirements Section */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 text-sm">Basic Requirements</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Location:</p>
                          <p className="text-sm font-medium">{config.requirements.location || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Stops:</p>
                          <p className="text-sm font-medium">{config.requirements.stops} stops</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Lifts:</p>
                          <p className="text-sm font-medium">{config.requirements.lifts} lift(s)</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Capacity:</p>
                          <p className="text-sm font-medium">{config.requirements.passengers} persons</p>
                        </div>
                        <div className="col-span-2">
                          <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Building Type:</p>
                          <p className="text-sm font-medium capitalize">{config.requirements.buildingType}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Engineering Details Section */}
                    {(config.requirements.custom_shaft_depth || 
                      config.requirements.custom_shaft_width || 
                      config.requirements.custom_cabin_width ||
                      config.requirements.custom_cabin_depth ||
                      config.requirements.custom_overhead ||
                      config.requirements.custom_pit_depth ||
                      config.requirements.custom_floor_height_in_ft ||
                      config.requirements.custom_travel_distances_in_ft ||
                      config.requirements.custom_requested_delivery_date) && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 text-sm">Engineering Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {config.requirements.custom_shaft_depth && (
                            <div>
                              <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Shaft Depth:</p>
                              <p className="text-sm font-medium">{config.requirements.custom_shaft_depth} mm</p>
                            </div>
                          )}
                          {config.requirements.custom_shaft_width && (
                            <div>
                              <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Shaft Width:</p>
                              <p className="text-sm font-medium">{config.requirements.custom_shaft_width} mm</p>
                            </div>
                          )}
                          {config.requirements.custom_cabin_width && (
                            <div>
                              <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Cabin Width:</p>
                              <p className="text-sm font-medium">{config.requirements.custom_cabin_width} mm</p>
                            </div>
                          )}
                          {config.requirements.custom_cabin_depth && (
                            <div>
                              <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Cabin Depth:</p>
                              <p className="text-sm font-medium">{config.requirements.custom_cabin_depth} mm</p>
                            </div>
                          )}
                          {config.requirements.custom_overhead && (
                            <div>
                              <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Overhead:</p>
                              <p className="text-sm font-medium">{config.requirements.custom_overhead} mm</p>
                            </div>
                          )}
                          {config.requirements.custom_pit_depth && (
                            <div>
                              <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Pit Depth:</p>
                              <p className="text-sm font-medium">{config.requirements.custom_pit_depth} mm</p>
                            </div>
                          )}
                          {config.requirements.custom_floor_height_in_ft && (
                            <div>
                              <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Floor Height:</p>
                              <p className="text-sm font-medium">{config.requirements.custom_floor_height_in_ft} ft</p>
                            </div>
                          )}
                          {config.requirements.custom_travel_distances_in_ft && (
                            <div>
                              <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Travel Distance:</p>
                              <p className="text-sm font-medium">{config.requirements.custom_travel_distances_in_ft} ft</p>
                            </div>
                          )}
                          {config.requirements.custom_requested_delivery_date && (
                            <div className="col-span-2">
                              <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Requested Delivery Date:</p>
                              <p className="text-sm font-medium">{config.requirements.custom_requested_delivery_date}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Additional Interior Options Section */}
                    {(config.requirements?.custom_door_opening_size || 
                      config.requirements?.custom_door_opening_style || 
                      config.interiorOptions?.custom_cabin_false_ceiling) && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 text-sm">Additional Interior Options</h4>
                        <div className="space-y-3">
                          {config.requirements?.custom_door_opening_size && (
                            <div>
                              <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Door Opening Size:</p>
                              <p className="text-sm font-medium">{config.requirements.custom_door_opening_size} mm</p>
                            </div>
                          )}
                          {config.requirements?.custom_door_opening_style && (
                            <div>
                              <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Door Opening Style:</p>
                              <p className="text-sm font-medium">{config.requirements.custom_door_opening_style}</p>
                            </div>
                          )}
                          {config.interiorOptions?.custom_cabin_false_ceiling && (
                            <div>
                              <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Cabin False Ceiling:</p>
                              <p className="text-sm font-medium">{config.interiorOptions.custom_cabin_false_ceiling}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cabin Details Section */}
                    {(config.requirements?.custom_ceiling_finish || 
                      config.requirements?.custom_ceiling_type || 
                      config.requirements?.custom_handrail_type) && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 text-sm">Cabin Details</h4>
                        <div className="space-y-3">
                          {config.requirements?.custom_ceiling_finish && (
                            <div>
                              <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Ceiling Finish:</p>
                              <p className="text-sm font-medium">{config.requirements.custom_ceiling_finish}</p>
                            </div>
                          )}
                          {config.requirements?.custom_ceiling_type && (
                            <div>
                              <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Ceiling Type:</p>
                              <p className="text-sm font-medium">{config.requirements.custom_ceiling_type}</p>
                            </div>
                          )}
                          {config.requirements?.custom_handrail_type && (
                            <div>
                              <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mb-1">Handrail Type:</p>
                              <p className="text-sm font-medium">{config.requirements.custom_handrail_type}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Layout: Original Grid (unchanged) */}
                <div className="hidden lg:block">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {/* Basic Requirements */}
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Location:</p>
                      <p>{config.requirements.location || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Number of Stops:</p>
                      <p>{config.requirements.stops} stops</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Number of Lifts:</p>
                      <p>{config.requirements.lifts} lift(s)</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Passenger Capacity:</p>
                      <p>{config.requirements.passengers} persons</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Building Type:</p>
                      <p className="capitalize">{config.requirements.buildingType}</p>
                    </div>
                    
                    {/* Engineering & Design Details */}
                    {(config.requirements.custom_shaft_depth || 
                      config.requirements.custom_shaft_width || 
                      config.requirements.custom_cabin_width ||
                      config.requirements.custom_cabin_depth ||
                      config.requirements.custom_headroom_allowance || 
                      config.requirements.custom_pit_depth) && (
                      <>
                        <div className="col-span-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Engineering & Design Details:</h4>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {config.requirements.custom_shaft_depth && (
                              <div>
                                <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Shaft Depth:</p>
                                <p className="text-sm">{config.requirements.custom_shaft_depth} mm</p>
                              </div>
                            )}
                            {config.requirements.custom_shaft_width && (
                              <div>
                                <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Shaft Width:</p>
                                <p className="text-sm">{config.requirements.custom_shaft_width} mm</p>
                              </div>
                            )}
                            {config.requirements.custom_cabin_width && (
                              <div>
                                <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Cabin Width:</p>
                                <p className="text-sm">{config.requirements.custom_cabin_width} mm</p>
                              </div>
                            )}
                            {config.requirements.custom_cabin_depth && (
                              <div>
                                <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Cabin Depth:</p>
                                <p className="text-sm">{config.requirements.custom_cabin_depth} mm</p>
                              </div>
                            )}
                            {config.requirements.custom_headroom_allowance && (
                              <div>
                                <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Headroom Allowance:</p>
                                <p className="text-sm">{config.requirements.custom_headroom_allowance}</p>
                              </div>
                            )}
                            {config.requirements.custom_overhead && (
                              <div>
                                <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Overhead:</p>
                                <p className="text-sm">{config.requirements.custom_overhead} mm</p>
                              </div>
                            )}
                            {config.requirements.custom_pit_depth && (
                              <div>
                                <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Pit Depth:</p>
                                <p className="text-sm">{config.requirements.custom_pit_depth} mm</p>
                              </div>
                            )}
                            {config.requirements.custom_floor_height_in_ft && (
                              <div>
                                <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Floor Height:</p>
                                <p className="text-sm">{config.requirements.custom_floor_height_in_ft} ft</p>
                              </div>
                            )}
                            {config.requirements.custom_travel_distances_in_ft && (
                              <div>
                                <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Travel Distance:</p>
                                <p className="text-sm">{config.requirements.custom_travel_distances_in_ft} ft</p>
                              </div>
                            )}
                            {config.requirements.custom_requested_delivery_date && (
                              <div>
                                <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Requested Delivery Date:</p>
                                <p className="text-sm">{config.requirements.custom_requested_delivery_date}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* Additional Interior Options */}
                    {(config.requirements?.custom_door_opening_size || 
                      config.requirements?.custom_door_opening_style || 
                      config.interiorOptions?.custom_cabin_false_ceiling) && (
                      <div className="col-span-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Additional Interior Options:</h4>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                          {config.requirements?.custom_door_opening_size && (
                            <div>
                              <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Door Opening Size:</p>
                              <p className="text-sm">{config.requirements.custom_door_opening_size} mm</p>
                            </div>
                          )}
                          {config.requirements?.custom_door_opening_style && (
                            <div>
                              <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Door Opening Style:</p>
                              <p className="text-sm">{config.requirements.custom_door_opening_style}</p>
                            </div>
                          )}
                          {config.interiorOptions?.custom_cabin_false_ceiling && (
                            <div>
                              <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Cabin False Ceiling:</p>
                              <p className="text-sm">{config.interiorOptions.custom_cabin_false_ceiling}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cabin Details */}
                    {(config.requirements?.custom_ceiling_finish || 
                      config.requirements?.custom_ceiling_type || 
                      config.requirements?.custom_handrail_type) && (
                      <div className="col-span-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Cabin Details:</h4>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                          {config.requirements?.custom_ceiling_finish && (
                            <div>
                              <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Ceiling Finish:</p>
                              <p className="text-sm">{config.requirements.custom_ceiling_finish}</p>
                            </div>
                          )}
                          {config.requirements?.custom_ceiling_type && (
                            <div>
                              <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Ceiling Type:</p>
                              <p className="text-sm">{config.requirements.custom_ceiling_type}</p>
                            </div>
                          )}
                          {config.requirements?.custom_handrail_type && (
                            <div>
                              <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Handrail Type:</p>
                              <p className="text-sm">{config.requirements.custom_handrail_type}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Product Configurations */}
          {formData.productConfigs.map((config, index: number) => {
            const quantity = config.requirements?.lifts ? parseInt(config.requirements.lifts) : 1;
            const productBreakdown = calculateProductTotalPrice(config);
            const total = calculateCompleteTotalPrice(config);
            return (
            <div key={index} className="border-b pb-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-full sm:w-28 flex-shrink-0">
                  <AntImage
                    src={config.product.image}
                    alt={config.product.name}
                    className="w-full h-32 sm:h-full object-cover rounded"
                    style={{ width: '100%', height: '128px' }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    preview={{
                      mask: 'Click to preview',
                      maskClassName: 'rounded'
                    }}
                  />
                </div>
                <div className="flex-grow">
                    {/* Product Title and Price */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                    <h4 className="text-lg font-medium">{config.product.name}</h4>
                      <span className="font-bold text-lg text-black dark:text-white">₹{formatIndianNumber(productBreakdown.basePrice)}</span>
                      </div>

                    {/* Breakdown rows, grouped by section with labels */}
                    <div className="space-y-1 mt-4">
                      {/* PACKAGES */}
                      {config.package && (
                        <div>
                          <div className="font-bold text-xs  tracking-widest mb-1 mt-2">PACKAGES</div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-400">{config.package.name}</span>
                            <span className="font-bold text-blue-600">+₹{formatIndianNumber(config.package.price * quantity)}</span>
                    </div>
                  </div>
                      )}
                      {/* INTERIOR */}
                      {(config.interiorOptions?.cabInteriorFinish || config.interiorOptions?.elevatorDoorFinish) && (
                        <div>
                          <div className="font-bold text-xs tracking-widest mb-1 mt-2">INTERIOR</div>
                          {config.interiorOptions?.cabInteriorFinish && (
                            <div className="flex justify-between items-center text-sm text-gray-400">
                              <span>Cab interior finish: <span className="font-medium">{config.interiorOptions.cabInteriorFinish.name}</span></span>
                              {config.interiorOptions.cabInteriorFinish.price > 0 && <span className="font-bold text-blue-600">+₹{formatIndianNumber(config.interiorOptions.cabInteriorFinish.price * quantity)}</span>}
                            </div>
                          )}
                          {config.interiorOptions?.elevatorDoorFinish && (
                            <div className="flex justify-between items-center text-sm text-gray-400">
                              <span>Elevator door finish: <span className="font-medium">{config.interiorOptions.elevatorDoorFinish.name}</span></span>
                              {config.interiorOptions.elevatorDoorFinish.price > 0 && <span className="font-bold text-blue-600">+₹{formatIndianNumber(config.interiorOptions.elevatorDoorFinish.price * quantity)}</span>}
                            </div>
                          )}
                  </div>
                      )}
                      {/* ADD-ONS */}
                  {config.addons && config.addons.length > 0 && (
                        <div>
                          <div className="font-bold text-xs tracking-widest mb-1 mt-2">ADD-ONS</div>
                          {config.addons.map((addon, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm text-gray-400">
                              <span>Add-on: <span className="font-medium">{addon.name}</span></span>
                              <span className="font-bold text-blue-600">+₹{formatIndianNumber(addon.price * quantity)}</span>
                            </div>
                        ))}
                        </div>
                      )}
                    </div>
                    {/* Single Total at the bottom */}
                    <div className="flex justify-between text-base mt-3 border-t pt-2 font-bold">
                      <span>Total</span>
                      <span>₹{formatIndianNumber(total)}</span>
                    </div>
                  </div>
                </div>
                {/* Only one total per product config, no duplicate totals */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-sm font-medium">Number of elevators:</span>
                    <Select 
                      value={config.requirements.lifts} 
                      onValueChange={(value) => {
                        const updatedConfigs = [...formData.productConfigs];
                        updatedConfigs[index] = {
                          ...config,
                          requirements: {
                            ...config.requirements,
                            lifts: value
                          }
                        };
                        updateFormData({ productConfigs: updatedConfigs });
                      }}
                    >
                      <SelectTrigger className="w-24 sm:w-32">
                        <SelectValue placeholder="Qty" />
                      </SelectTrigger>
                      <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((num: number) => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Taxes and Charges Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Taxes and Charges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Discount Percentage (Max 10%)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={discountPercentage}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        const clampedValue = Math.min(value, 10); // Ensure max 10%
                        setDiscountPercentage(clampedValue);
                        // Update form data immediately
                        updateFormData({ additional_discount_percentage: clampedValue });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      placeholder="0"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maximum discount allowed: 10%
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tax Category
                  </label>
                  <Select 
                    value={formData.tax_category || "In-State"} 
                    onValueChange={(value) => {
                      // Update form data with selected tax category
                      updateFormData({ tax_category: value });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Tax Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In-State">In-State</SelectItem>
                      <SelectItem value="Out-State">Out-State</SelectItem>
                      <SelectItem value="Registered Composition">Registered Composition</SelectItem>
                      <SelectItem value="Reverse Charge In-State">Reverse Charge In-State</SelectItem>
                      <SelectItem value="Reverse Charge Out-State">Reverse Charge Out-State</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sales Taxes and Charges Template
                  </label>
                  <Select 
                    value={formData.taxes_and_charges || "Output GST In-state - SE"} 
                    onValueChange={(value) => {
                      // Update form data with selected GST template
                      updateFormData({ taxes_and_charges: value });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select GST Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Output GST In-state - SE">Output GST In-state - SE</SelectItem>
                      <SelectItem value="Output GST Out-state - SE">Output GST Out-state - SE</SelectItem>
                      <SelectItem value="Output GST RCM In-state - SE">Output GST RCM In-state - SE</SelectItem>
                      <SelectItem value="Output GST RCM Out-state - SE">Output GST RCM Out-state - SE</SelectItem>
                      <SelectItem value="No GST">No GST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> GST will be calculated automatically by Frappe based on the selected Tax Category and Sales Taxes and Charges Template. 
                  The final quotation will include all applicable taxes and charges.
                </p>
              </div>
            </CardContent>
          </Card>

          {submitError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mt-4">
              {submitError}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg mt-4">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    Success! Quotation submitted.
                  </h3>
                  
                  {quotationId && (
                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                      <strong>Quotation ID:</strong> {quotationId}
                    </p>
                  )}
                  
                  <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                    Your quotation has been sent to our sales team. We'll contact you shortly to finalize the order.
                  </p>
                  
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      download={`Quotation-${quotationId}.pdf`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
                    >
                      Download PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

                      {/* Order Summary & Navigation - Mobile First Design */}
            <div className="mt-8 space-y-4">
              {/* Order Total Card - Always Visible */}
              <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Subtotal</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ₹{formatIndianNumber(calculateSubtotal())}
                    </span>
                  </div>
                  
                  {/* Discount */}
                  {discountPercentage > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Additional Discount ({discountPercentage}%)
                      </span>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        -₹{formatIndianNumber(calculateDiscountAmount())}
                      </span>
                    </div>
                  )}
                  
                  {/* Total */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-base font-bold text-gray-900 dark:text-white">ORDER TOTAL</span>
                    <span className="text-lg font-bold text-black dark:text-white">
                      ₹{formatIndianNumber(calculateOrderTotal())}
                    </span>
                  </div>
                  
                  {/* Note */}
                  {discountPercentage > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Final amount will be calculated by Frappe including GST
                    </div>
                  )}
                  
                  {formData.productConfigs.length > 1 && (
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {formData.productConfigs.length} product configurations
                    </div>
                  )}
                </div>
              </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
              <Button
                variant='outline'
                type="button"
                onClick={prevStep}
                className="w-full sm:w-auto px-6 py-3 rounded-md border border-gray-300 dark:border-gray-600 flex items-center justify-center"
                disabled={loading}
              >
                <ArrowLeft size={20} className="mr-2" />
                Previous
              </Button>

              <Button
                variant='outline'
                type="button"
                disabled={loading || formData.productConfigs.length === 0 || !!successMessage}
                className={`w-full sm:w-auto ${
                  loading || formData.productConfigs.length === 0 || !!successMessage 
                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400' 
                    : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                } text-white px-6 py-3 rounded-md flex items-center justify-center transition-colors`}
                onClick={handleSubmit}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Booking
                    <ArrowRight size={20} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationForm;