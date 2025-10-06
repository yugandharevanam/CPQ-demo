// CustomerSearchSection.tsx - Enhanced with GSTIN lookup
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { SearchIcon, CheckCircleIcon, UserIcon, MailIcon, PhoneIcon, BuildingIcon, MapPinIcon, XIcon, FileTextIcon } from 'lucide-react';
import { CustomerInfo } from '../../../../types';
import { MockCustomerService as CustomerService } from '../../../../mocks/MockCustomerService';
import type { CustomerSuggestion } from '../../../../services/customer/CustomerService';
import { useDebounce } from '../../../../hooks/core/useDebounce';
import { validateCityMapping } from '../../../../utils/addressLogger';
import { getCustomerTypeFromGSTIN, getEntityTypeFromGSTIN } from '../../../../utils/gstinUtils';
// import { useGSTIN } from '../../../hooks/useGSTIN';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Add development helper in non-production environments
if (process.env.NODE_ENV === 'development') {
  // Add global function to check address mapping stats
  (window as any).getAddressMappingStats = () => {  
    import('../../../../utils/addressLogger').then(({ addressLogger }) => {
      const stats = addressLogger.getStats();
      console.log('Address mapping statistics:', stats);
      
      const failures = addressLogger.getFailures();
      console.log('Recent failures:', failures);
    });
  };
  
  (window as any).exportAddressLogs = () => {  
    import('../../../../utils/addressLogger').then(({ addressLogger }) => {
      const logs = addressLogger.exportLogs();
      // Address mapping logs exported
      
      // Download as file for analysis
      const blob = new Blob([logs], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `address-mapping-logs-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };
  
  (window as any).debugCityDropdown = () => {  
            // City dropdown debug helpers available
  };
}

interface CustomerSearchSectionProps {
  onCustomerFound: (customer: CustomerInfo) => void;
  onCreateNew: () => void;
}

const CustomerSearchSection = ({ 
  onCustomerFound,
  onCreateNew
}: CustomerSearchSectionProps) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [suggestions, setSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  
  // GSTIN lookup state
  const [gstinInput, setGstinInput] = useState<string>('');
  const [gstinInfo, setGstinInfo] = useState<any>(null);  
  const [isGstinLoading, setIsGstinLoading] = useState<boolean>(false);
  const [gstinError, setGstinError] = useState<string | null>(null);

  const lookupGSTIN = async (gstin: string) => {
    if (!gstin || gstin.length !== 15) {
      setGstinError('Please enter a valid 15-digit GSTIN number');
      return;
    }

    setIsGstinLoading(true);
    setGstinError(null);
    setGstinInfo(null);

    try {
      const result = await CustomerService.lookupGSTIN(gstin);
      
      if (result) {
        setGstinInfo(result);
        setGstinError(null);
      } else {
        setGstinError('GSTIN not found. Please check the GSTIN number.');
      }
    } catch (err: any) {  
      setGstinError(err.message || 'Failed to lookup GSTIN. Please try again.');
      setGstinInfo(null);
    } finally {
      setIsGstinLoading(false);
    }
  };

  const clearGSTIN = () => {
    setGstinInput('');
    setGstinInfo(null);
    setGstinError(null);
    setIsGstinLoading(false);
  };

  // Helper function to extract address from any response structure
  const extractAddressFromResponse = useCallback((responseData: any) => {  
    let address = null;
    let source = 'unknown';
    
    // Priority 1: Check for 'data' array (GSTIN API response)
    if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
      address = responseData.data[0];
      source = 'data_array';
    } 
    // Priority 2: Check for 'permanent_address' (Internal customer DB)
    else if (responseData.permanent_address) {
      address = responseData.permanent_address;
      source = 'permanent_address';
    }
    // Priority 3: Check for 'all_addresses' array (Alternative GSTIN format)
    else if (responseData.all_addresses && Array.isArray(responseData.all_addresses) && responseData.all_addresses.length > 0) {
      address = responseData.all_addresses[0];
      source = 'all_addresses';
    }
    // Priority 4: Direct address fields in response
    else if (responseData.city && responseData.state) {
      address = responseData;
      source = 'direct_fields';
    }
    
    return { address, source };
  }, []);

  // Helper function to extract business name from any response structure
  const extractBusinessNameFromResponse = useCallback((responseData: any, addressData: any) => {  
    return responseData.business_name ||           // Standard GSTIN field
           responseData.customer_name ||           // Internal customer field
           responseData.company_name ||            // Alternative field
           responseData.data?.[0]?.name ||         // GSTIN data array name
           responseData.data?.[0]?.address_title || // GSTIN data array title
           addressData?.name ||                    // Address level name
           addressData?.address_title ||           // Address level title
           responseData.name ||                    // Direct name field
           'Unknown Business';
  }, []);
  
  // Refs for handling clicks outside and keyboard navigation
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Function to fetch suggestions
  const fetchSuggestions = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    
    try {
      const results = await CustomerService.searchCustomerSuggestions(term);
      
      setSuggestions(results);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
      toast.error('Error searching customers');
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Effect to fetch suggestions when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      fetchSuggestions(debouncedSearchTerm.trim());
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearchTerm, fetchSuggestions]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = useCallback(async (suggestion: CustomerSuggestion) => {
    try {
      setIsLoadingCustomer(true);
      setShowSuggestions(false);
      
      const customer = await CustomerService.getCustomerById(suggestion.id);
      
      if (customer) {
        // Log city mapping success/failure for monitoring
        validateCityMapping(customer, 'customer_search', 'suggestion_select');
        
        onCustomerFound(customer);
        setSearchTerm(''); // Clear search to prevent further searches
      } else {
        toast.error('Failed to load customer details');
      }
    } catch {
      toast.error('Error loading customer details');
    } finally {
      setIsLoadingCustomer(false);
    }
  }, [onCustomerFound]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else if (suggestions.length === 1) {
          handleSuggestionSelect(suggestions[0]);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // GSTIN lookup handlers
  const handleGstinLookup = async () => {
    if (!gstinInput || gstinInput.length !== 15) {
      toast.error('Please enter a valid 15-digit GSTIN');
      return;
    }
    
    await lookupGSTIN(gstinInput);
  };

  const handleGstinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 15) {
      setGstinInput(value);
    }
  };

  // Convert GSTIN/Customer info to CustomerInfo format
  const handleGstinSuccess = useCallback(async (gstinData: typeof gstinInfo) => {
    if (gstinData) {
      const { address, source } = extractAddressFromResponse(gstinData);
      
      // Ensure we have address data
      if (!address || !address.city || !address.state) {
        const errorMsg = `Incomplete address information. Source: ${source}`;
        toast.error(errorMsg);
        return;
      }
      
      // Extract business name using helper function
      const businessName = extractBusinessNameFromResponse(gstinData, address);
      
      // Determine customer type from GSTIN
      const gstinNumber = gstinData.gstin || '';
      const customerType = getCustomerTypeFromGSTIN(gstinNumber);
      const entityType = getEntityTypeFromGSTIN(gstinNumber);
      console.log('Entity type from GSTIN:', entityType);
      
      // GSTIN type detected

      const customerData: CustomerInfo = {
        // For GSTIN lookup, names are typically empty since it's a business
        firstName: customerType === 'Individual' ? '' : '',
        lastName: customerType === 'Individual' ? '' : '',
        salutation: '', // GSTIN lookup typically doesn't provide salutation
        customerName: businessName,
        customerType: customerType,
        gstin: gstinNumber,
        email: '',
        phoneNumber: '',
        address: address.address_line1 || '',
        address2: address.address_line2 || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.pincode || '',
        country: address.country || 'India',
        customerId: '',
        siteAddressSameAsCustomer: true,
        siteAddress: address.address_line1 || '',
        siteAddress2: address.address_line2 || '',
        siteCity: address.city || '',
        siteState: address.state || '',
        siteZipCode: address.pincode || '',
        siteCountry: address.country || 'India',
      };

      // Log city mapping success/failure for monitoring
      validateCityMapping(customerData, 'gstin_lookup', source);
      
      onCustomerFound(customerData);
    }
  }, [onCustomerFound, extractAddressFromResponse, extractBusinessNameFromResponse]);

  useEffect(() => {
    if (gstinInfo) {
      handleGstinSuccess(gstinInfo);
    }
  }, [gstinInfo, handleGstinSuccess]);

  const renderSuggestionItem = (suggestion: CustomerSuggestion, index: number) => {
    const isSelected = index === selectedIndex;
    
    return (
      <div
        key={suggestion.id}
        className={`flex items-start space-x-3 p-3 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
          isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
        onClick={() => handleSuggestionSelect(suggestion)}
        onMouseEnter={() => setSelectedIndex(index)}
      >
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            suggestion.customerType === 'Commercial' 
              ? 'bg-blue-100 dark:bg-blue-900/30' 
              : 'bg-green-100 dark:bg-green-900/30'
          }`}>
            {suggestion.customerType === 'Commercial' ? (
              <BuildingIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <UserIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900 dark:text-white truncate">{suggestion.name}</span>
            <Badge variant={suggestion.customerType === 'Commercial' ? 'default' : 'secondary'} className="text-xs dark:bg-gray-700 dark:text-gray-200">
              {suggestion.customerType}
            </Badge>
          </div>
          
          <div className="space-y-1">
            {suggestion.email && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <MailIcon className="w-3 h-3 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                <span className="truncate">{suggestion.email}</span>
              </div>
            )}
            
            {suggestion.phone && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <PhoneIcon className="w-3 h-3 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                <span>{suggestion.phone}</span>
              </div>
            )}
            
            {suggestion.city && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <MapPinIcon className="w-3 h-3 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                <span>{suggestion.city}</span>
              </div>
            )}
          </div>
          
          <div className="mt-2">
            <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 dark:border-blue-600">
              {suggestion.matchReason}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-0">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start space-x-3 p-3 border-b border-gray-100 dark:border-gray-700">
          <Skeleton className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
            <Skeleton className="h-3 w-48 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-3 w-24 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-5 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="mb-6 dark:bg-neutral-900 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg dark:text-white">Find Existing Customer</CardTitle>
        <CardDescription className="dark:text-gray-400">
          Search by name, email, phone, or GST number - or use GSTIN lookup for instant business details
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                ref={inputRef}
                placeholder="Search by name, email, phone, or GST number..."
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                className="pl-10 pr-10 dark:bg-neutral-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 [-webkit-appearance:none] [appearance:none] [text-decoration:none] [outline:none] [&::-webkit-search-decoration]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
                disabled={isLoadingCustomer}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Loading indicator */}
            {isLoadingCustomer && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 dark:border-blue-400 rounded-full border-t-transparent"></div>
              </div>
            )}
            
            {/* Suggestions Dropdown */}
            {showSuggestions && searchTerm.length >= 2 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {isLoadingSuggestions ? (
                  renderLoadingSkeleton()
                ) : suggestions.length > 0 ? (
                  <div>
                    {suggestions.map((suggestion, index) => 
                      renderSuggestionItem(suggestion, index)
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center space-y-2">
                      <SearchIcon className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm dark:text-gray-300">No customers found matching "{searchTerm}"</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Try searching with a different name, email, or phone number
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* GSTIN Lookup Section */}
          <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <div className="flex items-center space-x-2">
              <FileTextIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">New Customer - GSTIN Lookup</h3>
            </div>
            
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter 15-digit GSTIN"
                  value={gstinInput}
                  onChange={handleGstinInputChange}
                  className="font-mono text-sm dark:bg-neutral-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:dark:ring-blue-500"
                  maxLength={15}
                  disabled={isGstinLoading}
                />
              </div>
              <Button
                onClick={handleGstinLookup}
                disabled={gstinInput.length !== 15 || isGstinLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isGstinLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    <span>Looking up...</span>
                  </div>
                ) : (
                  'Lookup'
                )}
              </Button>
            </div>

            {/* GSTIN Error */}
            {gstinError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-600 dark:text-red-400">
                <div className="flex items-center space-x-2">
                  <XIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{gstinError}</span>
                </div>
              </div>
            )}

            {/* GSTIN Success */}
            {gstinInfo && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800 dark:text-green-200">
                      {extractBusinessNameFromResponse(gstinInfo, extractAddressFromResponse(gstinInfo).address)}
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      GSTIN: {gstinInfo.gstin || 'N/A'}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      {(() => {
                        const { address } = extractAddressFromResponse(gstinInfo);
                        return address ? 
                          `${address.address_line1 || ''}, ${address.city || ''}, ${address.state || ''}` :
                          'Address information not available';
                      })()}
                    </p>
                    <p className="text-xs text-green-500 dark:text-green-400 mt-1">✓ Business details loaded successfully</p>
                  </div>
                  <Button
                    variant="link"
                    onClick={() => {
                      clearGSTIN();
                      setGstinInput('');
                      onCreateNew();
                    }}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    Clear & New
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Helper Text */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p>💡 <strong className="dark:text-white">Search Tips:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• Search by name, email, phone, or existing GST number</li>
              <li>• Use GSTIN lookup for instant business details</li>
              <li>• Arrow keys to navigate, Enter to select</li>
            </ul>
          </div>
        </div>


      </CardContent>
    </Card>
  );
};

export default CustomerSearchSection;