// ExistingCustomerForm.tsx - Standardized component for existing customer with consistent layout
import React from 'react';
import { CustomerInfo } from '../../../../types';
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

interface ExistingCustomerFormProps {
    control: any;  
    customer: CustomerInfo;
    watchedCustomerType?: string; // Add this to watch form changes
}

const ExistingCustomerForm = ({ control, customer, watchedCustomerType }: ExistingCustomerFormProps) => {
    // Force re-render when customer changes to ensure proper value display
    const customerKey = customer?.customerId || 'new-customer';
    // Use watched customer type from form, fallback to customer's original type
    const customerType = watchedCustomerType || customer?.customerType || 'Commercial';
    


    return (
        <div className="space-y-4">
            {/* 1. Customer Type Selection - Always first, editable */}
            <FormField
                key={`customerType-${customerKey}`}
                control={control}
                name="customerType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Customer Type <span className="text-red-500">*</span></FormLabel>
                        <Select 
                            onValueChange={field.onChange} 
                            value={field.value || customer?.customerType || ""}
                            defaultValue={customer?.customerType || ""}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue 
                                        placeholder="Select Customer Type"
                                    />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Individual">Individual</SelectItem>
                                <SelectItem value="Commercial">Commercial</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>
                            You can change the customer type if needed.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* 2. Customer-type specific fields */}
            {customerType === 'Commercial' ? (
                <>
                    {/* Company Name and GST for Commercial - Read-only with better visibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="customerName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">Company Name</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            type="text" 
                                            disabled 
                                        value={field.value || customer?.customerName || ""}
                                            className="bg-muted/50 border-muted-foreground/20 text-muted-foreground cursor-not-allowed focus:ring-0 focus:border-muted-foreground/20" 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    <FormField
                        control={control}
                        name="gstin"
                        render={({ field }) => (
                            <FormItem>
                                    <FormLabel className="text-foreground">GST Number</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            type="text" 
                                            disabled 
                                        value={field.value || customer?.gstin || ""}
                                            className="bg-muted/50 border-muted-foreground/20 text-muted-foreground cursor-not-allowed focus:ring-0 focus:border-muted-foreground/20" 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Primary Contact Details for Commercial - Responsive layout */}
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                        <div className="col-span-1">
                            <FormField
                                control={control}
                                name="salutation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Salutation <span className="text-red-500">*</span></FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            value={field.value || customer?.salutation || ""}
                                            defaultValue={customer?.salutation || ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Mr">Mr</SelectItem>
                                                <SelectItem value="Miss">Miss</SelectItem>
                                                <SelectItem value="Mrs">Mrs</SelectItem>
                                                <SelectItem value="Dr">Dr</SelectItem>
                                                <SelectItem value="Prof">Prof</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="col-span-3">
                            <FormField
                                control={control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Primary Contact First Name <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder="First name"
                                                value={field.value || customer.firstName || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="col-span-4 md:col-span-3">
                            <FormField
                                control={control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Primary Contact Last Name <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder="Last name"
                                                value={field.value || customer.lastName || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Personal Details for Individual - Responsive layout */}
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                        <div className="col-span-1">
                            <FormField
                                control={control}
                                name="salutation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Salutation <span className="text-red-500">*</span></FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            value={field.value || customer.salutation || ""}
                                            defaultValue={customer.salutation || ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Mr">Mr</SelectItem>
                                                <SelectItem value="Miss">Miss</SelectItem>
                                                <SelectItem value="Mrs">Mrs</SelectItem>
                                                <SelectItem value="Dr">Dr</SelectItem>
                                                <SelectItem value="Prof">Prof</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="col-span-3">
                            <FormField
                                control={control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder="First name"
                                                value={field.value || customer.firstName || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="col-span-4 md:col-span-3">
                            <FormField
                                control={control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder="Last name"
                                                value={field.value || customer.lastName || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* GST Number for Individual - Read-only if existing, editable if empty */}
                    <FormField
                        control={control}
                        name="gstin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>GST Number (optional)</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        placeholder="e.g. 29ABCDE1234P1Z5"
                                        disabled={!!field.value}
                                        className={field.value ? "bg-muted/50 border-muted-foreground/20 text-muted-foreground cursor-not-allowed focus:ring-0 focus:border-muted-foreground/20" : ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </>
            )}

            {/* 3. Contact Information - Same for both types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input {...field} type="email" placeholder="example@email.com" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input {...field} type="tel" placeholder="+91 98765 43210" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* 4. Title/Role field - Same for both types */}
                <FormField
                    control={control}
                name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Title/Role</FormLabel>
                        <Select 
                            onValueChange={field.onChange} 
                            value={field.value || customer?.title || ""}
                            defaultValue={customer?.title || ""}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Building Owner">Building Owner</SelectItem>
                                <SelectItem value="Architect">Architect</SelectItem>
                                <SelectItem value="Contractor">Contractor</SelectItem>
                                <SelectItem value="Facility Manager">Facility Manager</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
        </div>
    );
};

export default React.memo(ExistingCustomerForm);