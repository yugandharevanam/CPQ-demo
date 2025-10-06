import { Home, Building, Hospital, Hotel, MoreHorizontal, ArrowRight, ArrowLeft, Layers, Users } from 'lucide-react';
import { FormData, ProductConfig, Requirements } from '../../../../types';
import { requirementsSchema } from '../../../../validation/schemas';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"

interface RequirementsFormProps {
  formData: FormData;
  updateActiveProductConfig: (data: Partial<ProductConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const RequirementsForm = ({
  formData,
  updateActiveProductConfig,
  nextStep,
  prevStep
}: RequirementsFormProps) => {
  const stops: string[] = ['2', '3', '4', '5', '6', '7', '8'];
  const passengerOptions: string[] = ['6', '8']; // Limited to available products
  const buildingOptions: { type: string; icon: React.ReactElement }[] = [
    {
      type: 'Residential',
      icon: <Home />
    },
    {
      type: 'Office',
      icon: <Building />
    },
    {
      type: 'Hospital',
      icon: <Hospital />
    },
    {
      type: 'Hotel',
      icon: <Hotel />
    },
    {
      type: 'Government',
      icon: <Building />
    },
    {
      type: 'Industrial',
      icon: <Building />
    },
    {
      type: 'Other',
      icon: <MoreHorizontal />
    }
  ];

  // Calculate SOPD and COPD values based on shaft dimensions
  const calculateSOPD = (shaftWidth: number, shaftDepth: number) => {
    const cabinWidth = shaftWidth - 400;
    const cabinDepth = shaftDepth - 570;
    
    let clrOpening;
    if (shaftWidth >= 1470 && shaftWidth <= 1490) {
      clrOpening = 700;
    } else if (shaftWidth >= 1495 && shaftWidth <= 1690) {
      clrOpening = 800;
    } else if (shaftWidth >= 1700 && shaftWidth <= 1825) {
      clrOpening = 900;
    } else if (shaftWidth >= 1830) {
      clrOpening = 1000;
    } else {
      clrOpening = null;
    }
    
    return { cabinWidth, cabinDepth, clrOpening };
  };

  const calculateCOPD = (shaftWidth: number, shaftDepth: number) => {
    const cabinWidth = shaftWidth - 400;
    const cabinDepth = shaftDepth - 500;
    
    let clrOpening;
    if (shaftWidth >= 1580 && shaftWidth <= 1775) {
      clrOpening = 700;
    } else if (shaftWidth >= 1780 && shaftWidth <= 1830) {
      clrOpening = 800;
    } else {
      clrOpening = null;
    }
    
    return { cabinWidth, cabinDepth, clrOpening };
  };

  // Get the active product configuration
  const activeProductConfig = formData.productConfigs[formData.activeProductIndex] || null;
  const currentRequirements = activeProductConfig?.requirements || {
    location: 'Chennai',
    stops: '2',
    lifts: '1',
    passengers: '6',
    buildingType: 'Residential',
    custom_shaft_depth: undefined,
    custom_shaft_width: undefined,
    custom_headroom_allowance: undefined,
    custom_overhead: undefined,
    custom_pit_depth: undefined,
    custom_cabin_width: undefined,
    custom_cabin_depth: undefined,
    custom_floor_height_in_ft: undefined,
    custom_travel_distances_in_ft: undefined,
    custom_requested_delivery_date: undefined,
    custom_door_opening_size: undefined,
    custom_door_opening_style: undefined,
    custom_ceiling_finish: undefined,
    custom_ceiling_type: undefined,
    custom_handrail_type: undefined
  };

  // Initialize the form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof requirementsSchema>>({
    resolver: zodResolver(requirementsSchema),
    mode: 'onChange',
    defaultValues: {
      location: currentRequirements.location,
      stops: currentRequirements.stops,
      lifts: currentRequirements.lifts,
      passengers: currentRequirements.passengers,
      buildingType: currentRequirements.buildingType,
      custom_shaft_depth: currentRequirements.custom_shaft_depth,
      custom_shaft_width: currentRequirements.custom_shaft_width,
      custom_headroom_allowance: currentRequirements.custom_headroom_allowance,
      custom_overhead: currentRequirements.custom_overhead,
      custom_pit_depth: currentRequirements.custom_pit_depth,
      custom_cabin_width: currentRequirements.custom_cabin_width,
      custom_cabin_depth: currentRequirements.custom_cabin_depth,
      custom_floor_height_in_ft: currentRequirements.custom_floor_height_in_ft,
      custom_travel_distances_in_ft: currentRequirements.custom_travel_distances_in_ft,
      custom_requested_delivery_date: currentRequirements.custom_requested_delivery_date,
      custom_door_opening_size: currentRequirements.custom_door_opening_size,
      custom_door_opening_style: currentRequirements.custom_door_opening_style,
      custom_ceiling_finish: currentRequirements.custom_ceiling_finish,
      custom_ceiling_type: currentRequirements.custom_ceiling_type,
      custom_handrail_type: currentRequirements.custom_handrail_type
    },
  });

  // Get current shaft dimensions
  const shaftWidth = form.watch('custom_shaft_width') || 0;
  const shaftDepth = form.watch('custom_shaft_depth') || 0;
  
  // Calculate SOPD and COPD values
  const sopdValues = shaftWidth > 0 && shaftDepth > 0 ? calculateSOPD(shaftWidth, shaftDepth) : null;
  const copdValues = shaftWidth > 0 && shaftDepth > 0 ? calculateCOPD(shaftWidth, shaftDepth) : null;

  // Add debugging for form state
  console.log('=== REQUIREMENTS FORM STATE ===');
  console.log('Current requirements:', currentRequirements);
  console.log('Form values:', form.getValues());
  console.log('Form errors:', form.formState.errors);
  console.log('SOPD Values:', sopdValues);
  console.log('COPD Values:', copdValues);

  const onSubmit = (data: z.infer<typeof requirementsSchema>) => {
    console.log('=== REQUIREMENTS FORM SUBMISSION ===');
    console.log('Requirements data being submitted:', data);
    console.log('Engineering details values:', {
      shaft_depth: data.custom_shaft_depth,
      shaft_width: data.custom_shaft_width,
      headroom_allowance: data.custom_headroom_allowance,
      pit_depth: data.custom_pit_depth
    });
    
    // Validate shaft dimensions are provided
    if (!data.custom_shaft_width) {
      form.setError('custom_shaft_width', {
        type: 'manual',
        message: 'Shaft width is required'
      });
      return;
    }
    
    if (!data.custom_shaft_depth) {
      form.setError('custom_shaft_depth', {
        type: 'manual',
        message: 'Shaft depth is required'
      });
      return;
    }
    
    // Validate door opening style is selected when shaft dimensions are provided
    if (data.custom_shaft_width && data.custom_shaft_depth && !data.custom_door_opening_style) {
      form.setError('custom_door_opening_style', {
        type: 'manual',
        message: 'Please select a door opening style'
      });
      return;
    }
    
    // Calculate door opening size, cabin width, and cabin depth based on selected style and shaft dimensions
    let doorOpeningSize = '';
    let cabinWidth: number | undefined = undefined;
    let cabinDepth: number | undefined = undefined;
    
    if (data.custom_shaft_width && data.custom_shaft_depth && data.custom_door_opening_style) {
      if (data.custom_door_opening_style === 'Side Opening') {
        const sopdValues = calculateSOPD(data.custom_shaft_width, data.custom_shaft_depth);
        doorOpeningSize = sopdValues.clrOpening ? sopdValues.clrOpening.toString() : '';
        cabinWidth = sopdValues.cabinWidth;
        cabinDepth = sopdValues.cabinDepth;
      } else if (data.custom_door_opening_style === 'Centre Opening') {
        const copdValues = calculateCOPD(data.custom_shaft_width, data.custom_shaft_depth);
        doorOpeningSize = copdValues.clrOpening ? copdValues.clrOpening.toString() : '';
        cabinWidth = copdValues.cabinWidth;
        cabinDepth = copdValues.cabinDepth;
      }
    }
    
    // Update data with calculated values
    const updatedData = {
      ...data,
      custom_door_opening_size: doorOpeningSize,
      custom_cabin_width: cabinWidth,
      custom_cabin_depth: cabinDepth
    };
    
    updateActiveProductConfig({ requirements: updatedData as Requirements });
    nextStep();
  };

  return (
    <div className="rounded-lg shadow-sm p-5">
      <h2 className="text-2xl font-medium mb-5">Enter your requirements</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Requirements Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Number of Stops Card */}
            <FormField
              control={form.control}
              name="stops"
              render={({ field }) => (
                <FormItem>
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                        <Layers className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <FormLabel className="text-base font-semibold text-gray-900 dark:text-white">
                          Number of Stops <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Floor levels served</p>
                      </div>
                    </div>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 px-4 text-base border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200">
                          <SelectValue placeholder="Select number of stops" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stops.map(stop => (
                          <SelectItem key={stop} value={stop}>{stop} stops</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Number of Passengers Card */}
            <FormField
              control={form.control}
              name="passengers"
              render={({ field }) => (
                <FormItem>
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <FormLabel className="text-base font-semibold text-gray-900 dark:text-white">
                          Number of Passengers <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Elevator capacity</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {passengerOptions.map(option => (
                        <Button
                          key={option}
                          type="button"
                          onClick={() => field.onChange(option)}
                          className={`h-12 border rounded-lg font-medium transition-all duration-200 ${
                            field.value === option
                              ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 shadow-md'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                          }`}
                        >
                          {option} persons
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Available options for Emperor Lifts products</p>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Requested Delivery Date */}
          <div className="grid grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="custom_requested_delivery_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Requested Delivery Date (MM/YYYY)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="MM/YYYY (e.g., 03/2026)"
                      className="h-10"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const nativeEvent: any = e.nativeEvent as any;
                        const isBackspace = nativeEvent?.inputType === 'deleteContentBackward';
                        let value = e.target.value;
                        // Allow only digits and '/'
                        value = value.replace(/[^\d/]/g, '');

                        if (!isBackspace) {
                          // Auto-insert slash when typing forward and it's missing
                          if (value.length >= 2 && !value.includes('/')) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 6);
                          }
                        }

                        // Always cap length to 7 (MM/YYYY)
                        if (value.length > 7) {
                          value = value.substring(0, 7);
                        }

                        field.onChange(value === '' ? undefined : value);
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value && value.length === 7) {
                          const [month, year] = value.split('/');
                          const monthNum = parseInt(month);
                          const yearNum = parseInt(year);
                          
                          // Validate month (01-12)
                          if (monthNum < 1 || monthNum > 12) {
                            form.setError('custom_requested_delivery_date', {
                              type: 'manual',
                              message: 'Month must be between 01 and 12'
                            });
                            return;
                          }
                          
                          // Validate year (current year onwards)
                          const currentYear = new Date().getFullYear();
                          if (yearNum < currentYear) {
                            form.setError('custom_requested_delivery_date', {
                              type: 'manual',
                              message: 'Year cannot be in the past'
                            });
                            return;
                          }
                          
                          // Clear any existing errors
                          form.clearErrors('custom_requested_delivery_date');
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>


          {/* Building Type */}
          <FormField
            control={form.control}
            name="buildingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Building Type <span className="text-red-500">*</span></FormLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {buildingOptions.map(option => (
                    <Button
                      key={option.type}
                      type="button"
                      onClick={() => field.onChange(option.type)}
                      className={`w-full border rounded-lg p-2 flex flex-col items-center justify-center min-h-[60px] ${field.value === option.type
                          ? 'bg-red-500 border-red-500 hover:bg-red-500 text-white'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      <div className="mb-1">
                      {option.icon}
                      </div>
                      <span className="text-xs font-medium">{option.type}</span>
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

                    {/* Engineering & Design Details */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-200">Engineering & Design Details</h3>
            
            {/* Shaft Dimensions Section */}
            <div className="mb-8 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Shaft Dimensions (Required)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shaft Width */}
                <FormField
                  control={form.control}
                  name="custom_shaft_width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Shaft Width (mm) <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1200"
                          max="4000"
                          step="1"
                          placeholder="e.g. 2000"
                          className="h-12 px-4 text-base border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              field.onChange(undefined);
                            } else {
                              const numValue = parseInt(value);
                              if (!isNaN(numValue)) {
                                field.onChange(numValue);
                              }
                            }
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value && parseInt(value) < 1200) {
                              field.onChange(1200);
                            } else if (value && parseInt(value) > 4000) {
                              field.onChange(4000);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Shaft Depth */}
                <FormField
                  control={form.control}
                  name="custom_shaft_depth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Shaft Depth (mm) <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1500"
                          max="5000"
                          step="1"
                          placeholder="e.g. 2500"
                          className="h-12 px-4 text-base border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              field.onChange(undefined);
                            } else {
                              const numValue = parseInt(value);
                              if (!isNaN(numValue)) {
                                field.onChange(numValue);
                              }
                            }
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value && parseInt(value) < 1500) {
                              field.onChange(1500);
                            } else if (value && parseInt(value) > 5000) {
                              field.onChange(5000);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Calculated Values Section */}
            {(sopdValues || copdValues) && (
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Calculated Values</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* SOPD Values */}
                  {sopdValues && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h5 className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-300">SOPD (Side Opening)</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Cabin Width:</span>
                          <span className="font-medium">{sopdValues.cabinWidth} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Cabin Depth:</span>
                          <span className="font-medium">{sopdValues.cabinDepth} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Door Opening:</span>
                          <span className="font-medium">{sopdValues.clrOpening ? `${sopdValues.clrOpening} mm` : 'Not available'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COPD Values */}
                  {copdValues && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h5 className="text-sm font-medium mb-2 text-green-700 dark:text-green-300">COPD (Centre Opening)</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Cabin Width:</span>
                          <span className="font-medium">{copdValues.cabinWidth} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Cabin Depth:</span>
                          <span className="font-medium">{copdValues.cabinDepth} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Door Opening:</span>
                          <span className="font-medium">{copdValues.clrOpening ? `${copdValues.clrOpening} mm` : 'Not available'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

                        {/* Door Opening Style Selection */}
            {(sopdValues || copdValues) && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="text-sm font-medium mb-3 text-yellow-700 dark:text-yellow-300">Door Opening Style Selection <span className="text-red-500">*</span></h4>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="custom_door_opening_style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Select Door Style</FormLabel>
                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Choose door opening style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sopdValues && (
                              <SelectItem value="Side Opening">
                                Side Opening (SOPD) - {sopdValues.clrOpening ? `${sopdValues.clrOpening}mm` : 'Not available'}
                              </SelectItem>
                            )}
                            {copdValues && (
                              <SelectItem value="Centre Opening">
                                Centre Opening (COPD) - {copdValues.clrOpening ? `${copdValues.clrOpening}mm` : 'Not available'}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Other Engineering Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Overhead */}
              <FormField
                control={form.control}
                name="custom_overhead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Overhead (mm)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="6000"
                        step="1"
                        placeholder="e.g. 4200"
                        className="h-12 px-4 text-base border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            field.onChange(undefined);
                          } else {
                            const numValue = parseInt(value);
                            if (!isNaN(numValue)) {
                              field.onChange(numValue);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value && parseInt(value) < 0) {
                            field.onChange(0);
                          } else if (value && parseInt(value) > 6000) {
                            field.onChange(6000);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pit Depth */}
              <FormField
                control={form.control}
                name="custom_pit_depth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Pit Depth (mm)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1000"
                        max="3000"
                        step="1"
                        placeholder="e.g. 1400"
                        className="h-12 px-4 text-base border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            field.onChange(undefined);
                          } else {
                            const numValue = parseInt(value);
                            if (!isNaN(numValue)) {
                              field.onChange(numValue);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value && parseInt(value) < 1000) {
                            field.onChange(1000);
                          } else if (value && parseInt(value) > 3000) {
                            field.onChange(3000);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Floor Height */}
              <FormField
                control={form.control}
                name="custom_floor_height_in_ft"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Floor Height (ft)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="8"
                        max="20"
                        step="1"
                        placeholder="e.g. 12"
                        className="h-12 px-4 text-base border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            field.onChange(undefined);
                          } else {
                            const numValue = parseInt(value);
                            if (!isNaN(numValue)) {
                              field.onChange(numValue);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value && parseInt(value) < 8) {
                            field.onChange(8);
                          } else if (value && parseInt(value) > 20) {
                            field.onChange(20);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Travel Distance (meters) */}
              <FormField
                control={form.control}
                name="custom_travel_distances_in_ft"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Travel Distance (m)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="3"
                        max="100"
                        step="1"
                        placeholder="e.g. 11"
                        className="h-12 px-4 text-base border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            field.onChange(undefined);
                          } else {
                            const numValue = parseInt(value);
                            if (!isNaN(numValue)) {
                              field.onChange(numValue);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value && parseInt(value) < 3) {
                            field.onChange(3);
                          } else if (value && parseInt(value) > 100) {
                            field.onChange(100);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Cabin Details Section */}
          <div className="mt-8 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Cabin Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ceiling Finish */}
              <FormField
                control={form.control}
                name="custom_ceiling_finish"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Ceiling Finish
                    </FormLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-12 px-4 text-base border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                          <SelectValue placeholder="Select ceiling finish" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Brushed SS">Brushed SS</SelectItem>
                        <SelectItem value="Mirror SS">Mirror SS</SelectItem>
                        <SelectItem value="Hairline SS">Hairline SS</SelectItem>
                        <SelectItem value="Powder Coated">Powder Coated</SelectItem>
                        <SelectItem value="Painted">Painted</SelectItem>
                        <SelectItem value="Wooden Laminate">Wooden Laminate</SelectItem>
                        <SelectItem value="Acrylic Panel">Acrylic Panel</SelectItem>
                        <SelectItem value="Glass Backlit">Glass Backlit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ceiling Type */}
              <FormField
                control={form.control}
                name="custom_ceiling_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Ceiling Type
                    </FormLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-12 px-4 text-base border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                          <SelectValue placeholder="Select ceiling type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Plain">Plain</SelectItem>
                        <SelectItem value="Modular">Modular</SelectItem>
                        <SelectItem value="False Ceiling">False Ceiling</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                        <SelectItem value="Stretch">Stretch</SelectItem>
                        <SelectItem value="Mirror">Mirror</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Handrail Type */}
              <FormField
                control={form.control}
                name="custom_handrail_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Handrail Type
                    </FormLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-12 px-4 text-base border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                          <SelectValue placeholder="Select handrail type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Round SS">Round SS</SelectItem>
                        <SelectItem value="Flat SS">Flat SS</SelectItem>
                        <SelectItem value="Wooden">Wooden</SelectItem>
                        <SelectItem value="Powder Coated">Powder Coated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="mt-6 text-xs">
            <p><span className='text-red-500'>*Required</span></p>
            <p className="mt-1 text-gray-600">
              The completion of online forms does not imply a binding contract between Emperor Lifts and consumer
              or that the order is confirmed by Emperor Lifts. A sales rep is required to review and finalize all
              orders and the contract.
            </p>
          </div>

          {/* Navigation Buttons - Mobile Responsive */}
          <div className="mt-6">
            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="w-full sm:w-auto px-6 py-3 rounded-md border border-gray-300 dark:border-gray-600 flex items-center justify-center"
              >
                <ArrowLeft size={20} className="mr-2" />
                Previous
              </Button>

              <Button
                variant="outline"
                type="submit"
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-6 py-3 rounded-md flex items-center justify-center transition-colors"
              >
                Next / Products
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RequirementsForm;