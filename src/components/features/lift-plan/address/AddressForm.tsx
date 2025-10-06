// 4. AddressForm.tsx - Component for customer and site address with dynamic location data
import { useState, useEffect, useMemo, useCallback } from 'react';
import { State, City, ICity } from 'country-state-city';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
  } from "@/components/ui/form";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { Input } from "@/components/ui/input";
  import { Checkbox } from "@/components/ui/checkbox";
  import { Separator } from '@/components/ui/separator';
  
  interface AddressFormProps {
  control: any;  
  form: any;  
    siteAddressSameAsCustomer: boolean;
  }
  
  const AddressForm = ({ 
    control, 
    form,
    siteAddressSameAsCustomer
  }: AddressFormProps) => {
    // Memoize Indian states to prevent recreation on every render
    const indianStates = useMemo(() => State.getStatesOfCountry('IN'), []); // 'IN' is the country code for India
    const [cities, setCities] = useState<ICity[]>([]);
    const [siteCities, setSiteCities] = useState<ICity[]>([]);
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
    
    // Watch for state changes to update cities (memoized to prevent excessive re-renders)
    const selectedState = form.watch('state');
    const selectedSiteState = form.watch('siteState');
    const selectedCity = form.watch('city');
    const selectedSiteCity = form.watch('siteCity');
    
    // Remove excessive logging that was causing re-renders during typing
    
    // Helper function to find city in the cities array (case-insensitive)
    const findCityInList = useCallback((cityName: string, cityList: ICity[]): string | null => {
      if (!cityName || !cityList.length) return null;
      
      // First try exact match
      const exactMatch = cityList.find(city => city.name === cityName);
      if (exactMatch) return exactMatch.name;
      
      // Then try case-insensitive match
      const caseInsensitiveMatch = cityList.find(city => 
        city.name.toLowerCase() === cityName.toLowerCase()
      );
      if (caseInsensitiveMatch) return caseInsensitiveMatch.name;
      
      // Finally try partial match
      const partialMatch = cityList.find(city => 
        city.name.toLowerCase().includes(cityName.toLowerCase()) ||
        cityName.toLowerCase().includes(city.name.toLowerCase())
      );
      
      return partialMatch ? partialMatch.name : null;
    }, []);
    
    // Memoized function to update cities when state changes
    const updateCitiesForState = useCallback((stateName: string, isForSite: boolean = false) => {
      if (stateName) {
        const stateObj = indianStates.find(state => state.name === stateName);
        if (stateObj) {
          const stateCities = City.getCitiesOfState('IN', stateObj.isoCode);
          
          if (isForSite) {
            setSiteCities(stateCities);
            
            // Validate and adjust site city value if needed
            const currentSiteCity = form.getValues('siteCity');
            if (currentSiteCity && stateCities.length > 0) {
              const validCity = findCityInList(currentSiteCity, stateCities);
              if (validCity && validCity !== currentSiteCity) {
                form.setValue('siteCity', validCity);
              } else if (!validCity) {
                // City not found in the list, keep the value but show warning
                console.warn(`Site city "${currentSiteCity}" not found in ${stateName} cities list`);
              }
            }
          } else {
            setCities(stateCities);
            
            // Validate and adjust city value if needed
            const currentCity = form.getValues('city');
            if (currentCity && stateCities.length > 0) {
              const validCity = findCityInList(currentCity, stateCities);
              
              if (validCity && validCity !== currentCity) {
                form.setValue('city', validCity);
              } else if (!validCity) {
                // City not found in the list, keep the value but show warning
                console.warn(`City "${currentCity}" not found in ${stateName} cities list`);
              }
            }
          }
        }
      } else {
        if (isForSite) {
          setSiteCities([]);
          // Only clear city if it's currently set and we're not on initial load
          if (!isInitialLoad && form.getValues('siteCity')) {
            form.setValue('siteCity', '');
          }
        } else {
          setCities([]);
          // Only clear city if it's currently set and we're not on initial load
          if (!isInitialLoad && form.getValues('city')) {
            form.setValue('city', '');
          }
        }
      }
    }, [indianStates, form, findCityInList, isInitialLoad]);
    
    // Initialize cities when component mounts if state is already selected
    useEffect(() => {
      if (selectedState) {
        updateCitiesForState(selectedState, false);
      }
      if (selectedSiteState) {
        updateCitiesForState(selectedSiteState, true);
      }
      
      // Mark initial load as complete after a short delay
      const timer = setTimeout(() => setIsInitialLoad(false), 100);
      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount
    
    // Update cities when state changes (after initial load) - optimized to prevent excessive re-renders
    useEffect(() => {
      if (!isInitialLoad && selectedState) {
        updateCitiesForState(selectedState, false);
      }
    }, [selectedState, updateCitiesForState, isInitialLoad]);
    
    useEffect(() => {
      if (!isInitialLoad && selectedSiteState) {
        updateCitiesForState(selectedSiteState, true);
      }
    }, [selectedSiteState, updateCitiesForState, isInitialLoad]);

    return (
      <>
        <h3 className="text-lg font-medium pt-4">Customer Address</h3>
  
        <FormField
          control={control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
  
        <FormField
          control={control}
          name="address2"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="Apartment, suite, etc. (optional)" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
  
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} value="India" disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
  
          <FormField
            control={control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    {indianStates.map((state) => (
                      <SelectItem key={state.isoCode} value={state.name}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
  
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={!selectedState}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                          !selectedState 
                            ? "Select State first" 
                            : cities.length === 0 
                              ? "Loading cities..." 
                              : "Select City"
                        } 
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    {/* Show current value even if not in the list */}
                    {selectedCity && !cities.find(city => city.name === selectedCity) && (
                      <SelectItem key={`current-${selectedCity}`} value={selectedCity}>
                        {selectedCity} (Current)
                      </SelectItem>
                    )}
                    {cities.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {selectedState && cities.length === 0 && (
                  <FormDescription className="text-orange-600">
                    Loading cities for {selectedState}...
                  </FormDescription>
                )}
                {selectedState && cities.length > 0 && (
                  <FormDescription>
                    {cities.length} cities available for {selectedState}
                  </FormDescription>
                )}
                {selectedCity && selectedState && cities.length > 0 && !cities.find(city => city.name === selectedCity) && (
                  <FormDescription className="text-amber-600">
                    "{selectedCity}" is not in the standard city list but will be preserved.
                  </FormDescription>
                )}
              </FormItem>
            )}
          />
  
          <FormField
            control={control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip/Postal Code <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
  
        <Separator className="my-8" />
  
        {/* Site Address Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Project Site Address</h3>
          
          <FormField
            control={control}
            name="siteAddressSameAsCustomer"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-5">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Project site address is the same as customer address</FormLabel>
                  <FormDescription>
                    Check this box if the lift installation site is the same as the customer address
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
  
          {!siteAddressSameAsCustomer && (
            <div className="space-y-4">
              <FormField
                control={control}
                name="siteAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Address <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
  
              <FormField
                control={control}
                name="siteAddress2"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Apartment, suite, etc. (optional)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
  
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="siteCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} value="India" disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
  
                <FormField
                  control={control}
                  name="siteState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px]">
                          {indianStates.map((state) => (
                            <SelectItem key={state.isoCode} value={state.name}>
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
  
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="siteCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={!selectedSiteState}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue 
                              placeholder={
                                !selectedSiteState 
                                  ? "Select State first" 
                                  : siteCities.length === 0 
                                    ? "Loading cities..." 
                                    : "Select City"
                              } 
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px]">
                          {/* Show current value even if not in the list */}
                          {selectedSiteCity && !siteCities.find(city => city.name === selectedSiteCity) && (
                            <SelectItem key={`current-site-${selectedSiteCity}`} value={selectedSiteCity}>
                              {selectedSiteCity} (Current)
                            </SelectItem>
                          )}
                          {siteCities.map((city) => (
                            <SelectItem key={city.name} value={city.name}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {selectedSiteState && siteCities.length === 0 && (
                        <FormDescription className="text-orange-600">
                          Loading cities for {selectedSiteState}...
                        </FormDescription>
                      )}
                      {selectedSiteState && siteCities.length > 0 && (
                        <FormDescription>
                          {siteCities.length} cities available for {selectedSiteState}
                        </FormDescription>
                      )}
                      {selectedSiteCity && selectedSiteState && siteCities.length > 0 && !siteCities.find(city => city.name === selectedSiteCity) && (
                        <FormDescription className="text-amber-600">
                          "{selectedSiteCity}" is not in the standard city list but will be preserved.
                        </FormDescription>
                      )}
                    </FormItem>
                  )}
                />
  
                <FormField
                  control={control}
                  name="siteZipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip/Postal Code <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </>
    );
  };
  
  export default AddressForm;