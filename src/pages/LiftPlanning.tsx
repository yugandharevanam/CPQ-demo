import { useState, memo, useEffect } from 'react';
import { FormData, ProductConfig, Product } from '../types';
import CustomerInfoForm from '../components/features/lift-plan/customer/CustomerInfoForm';
import RequirementsForm from '../components/features/lift-plan/requirements/RequirementsForm';
import ProductsForm from '../components/features/lift-plan/products/ProductsForm';
import PackageSelectionForm from '../components/features/lift-plan/packages/PackageSelectionForm';
import CabInteriorForm from '../components/features/lift-plan/interior/CabInteriorForm';
import AddOnsForm from '../components/features/lift-plan/addons/AddOnsForm';
import ConfirmationForm from '../components/features/lift-plan/confirmation/ConfirmationForm';
import StepNavigation from '../components/features/lift-plan/navigation/StepNavigation';
import useProducts from '../hooks/product/useProducts';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formStateManager } from '../utils/formStateManager';

const LiftPlanning = memo(function LiftPlanning() {
    const { isLoading } = useProducts(); // Use the shared products hook
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [formData, setFormData] = useState<FormData>({
        // Customer info is now the first step
        customerInfo: {
            customerType: '',
            customerId: '',
            email: '',
            firstName: '',
            lastName: '',
            title: '',
            address: '',
            address2: '',
            country: 'India',
            state: '',
            city: '',
            zipCode: '',
            phoneNumber: '',
            gstin: '',
            customerName: '',
            siteAddressSameAsCustomer: true,
            siteAddress: '',
            siteAddress2: '',
            siteCity: '',
            siteState: '',
            siteZipCode: '',
            siteCountry: 'India'
        },

        // Product configurations with requirements
        productConfigs: [],

        // Current active product being configured
        activeProductIndex: 0,
        
        // Discount and GST information
        additional_discount_percentage: 0,
        taxes_and_charges: 'Output GST In-state - SE',
        tax_category: 'In-State'
    });

    const updateFormData = (newData: Partial<FormData>): void => {
        const updatedFormData = { ...formData, ...newData };
        setFormData(updatedFormData);
        
        // Force immediate save if customer info is updated (especially when customerId is cleared)
        if (newData.customerInfo) {
            formStateManager.saveFormData(updatedFormData);
        }
    };

    const updateActiveProductConfig = (configUpdates: Partial<ProductConfig>): void => {
        const updatedConfigs = [...formData.productConfigs];

        // If this is a new product, add it to the configs array
        if (!updatedConfigs[formData.activeProductIndex]) {
            updatedConfigs[formData.activeProductIndex] = {
                product: {} as Product,
                package: { id: '', name: '', image: '', price: 0, features: { wallMaterial: '', handrailPosition: '', handrailBarFinish: '' } },
                interiorOptions: {
                    cabInteriorFinish: { id: '', name: '', primaryImage: '', cabViewImage: '', lobbyViewImage: '', price: 0 },
                    elevatorDoorFinish: { id: '', name: '', primaryImage: '', cabViewImage: '', lobbyViewImage: '', price: 0 }
                },
                addons: [],
                requirements: {
                    location: 'Chennai',
                    stops: '2',
                    lifts: '1',
                    passengers: '6',
                buildingType: 'Residential',
                custom_shaft_depth: undefined,
                custom_shaft_width: undefined,
                custom_headroom_allowance: undefined,
                custom_pit_depth: undefined,
                custom_cabin_width: undefined,
                custom_cabin_depth: undefined
                },
                ...configUpdates
            };
        } else {
            // Update existing product configuration
            updatedConfigs[formData.activeProductIndex] = {
                ...updatedConfigs[formData.activeProductIndex],
                ...configUpdates
            };
        }

        setFormData({
            ...formData,
            productConfigs: updatedConfigs
        });
    };

    const addNewProduct = (): void => {
        const newIndex = formData.productConfigs.length;
        setFormData({
            ...formData,
            activeProductIndex: newIndex
        });
        setCurrentStep(2); // Go to requirements selection step
    };

    // const _editProduct = (_index: number): void => {
    //     setFormData({
    //         ...formData,
    //         activeProductIndex: _index
    //     });
    //     setCurrentStep(2); // Go to requirements selection step
    // };

    const nextStep = (): void => {
        // Save form data when moving to next step
        formStateManager.saveFormData(formData);
        setCurrentStep(currentStep + 1);
    };

    const prevStep = (): void => {
        // Save form data when moving to previous step
        formStateManager.saveFormData(formData);
        setCurrentStep(currentStep - 1);
    };

    const goToCustomerStep = (): void => {
        // Save form data when going back to customer step
        formStateManager.saveFormData(formData);
        setCurrentStep(1);
    };

    const goToStep = (stepNumber: number): void => {
        // Save form data when jumping to specific step
        formStateManager.saveFormData(formData);
        setCurrentStep(stepNumber);
    };

    const startFresh = (): void => {
        formStateManager.clearFormData();
        setCurrentStep(1);
        setFormData({
            customerInfo: {
                customerType: '',
                customerId: '',
                email: '',
                firstName: '',
                lastName: '',
                title: '',
                address: '',
                address2: '',
                country: 'India',
                state: '',
                city: '',
                zipCode: '',
                phoneNumber: '',
                gstin: '',
                customerName: '',
                siteAddressSameAsCustomer: true,
                siteAddress: '',
                siteAddress2: '',
                siteCity: '',
                siteState: '',
                siteZipCode: '',
                siteCountry: 'India'
            },
            productConfigs: [],
            activeProductIndex: 0,
            additional_discount_percentage: 0,
            taxes_and_charges: 'Output GST In-state - SE',
            tax_category: 'In-State'
        });
        // Form data cleared
    };

    const renderStep = () => {
        if (isLoading) {
            return <LoadingSpinner />;
        }

        switch (currentStep) {
            case 1:
                return (
                    <CustomerInfoForm
                        formData={formData}
                        updateFormData={updateFormData}
                        nextStep={nextStep}
                    />
                );
            case 2:
                return (
                    <RequirementsForm
                        formData={formData}
                        updateActiveProductConfig={updateActiveProductConfig}
                        nextStep={nextStep}
                        prevStep={prevStep}
                    />
                );
            case 3:
                return (
                    <ProductsForm
                        formData={formData}
                        updateActiveProductConfig={updateActiveProductConfig}
                        nextStep={nextStep}
                        prevStep={prevStep}
                    />
                );
            case 4:
                return (
                    <PackageSelectionForm
                        formData={formData}
                        updateActiveProductConfig={updateActiveProductConfig}
                        nextStep={nextStep}
                        prevStep={prevStep}
                    />
                );
            case 5:
                return (
                    <CabInteriorForm
                        formData={formData}
                        updateActiveProductConfig={updateActiveProductConfig}
                        nextStep={nextStep}
                        prevStep={prevStep}
                    />
                );
            case 6:
                return (
                    <AddOnsForm
                        formData={formData}
                        updateActiveProductConfig={updateActiveProductConfig}
                        nextStep={nextStep}
                        prevStep={prevStep}
                    />
                );
            case 7:
                return (
                    <ConfirmationForm
                        formData={formData}
                        updateFormData={updateFormData}
                        prevStep={prevStep}
                        goToCustomerStep={goToCustomerStep}
                        addNewProduct={addNewProduct}
                        onSubmitSuccess={() => {
                            // Clear saved data after successful submission
                            formStateManager.clearFormData();
                            // Form data cleared after successful submission
                        }}
                    />
                );
            default:
                return <CustomerInfoForm formData={formData} updateFormData={updateFormData} nextStep={nextStep} />;
        }
    };

    // Load saved form data and step on component mount (only once)
    useEffect(() => {
        const savedFormData = formStateManager.loadFormData();
        const savedStep = formStateManager.loadCurrentStep();
        
        // Always load from localStorage if available - this ensures latest saved data is used
        if (savedFormData) {
            setFormData(savedFormData);
        }
        
        if (savedStep > 1) {
            setCurrentStep(savedStep);
        }
    }, []); // Empty dependency array to run only once

    // Save form data only when moving between steps (removed auto-save during typing)

    // Save current step whenever it changes
    useEffect(() => {
        formStateManager.saveCurrentStep(currentStep);
    }, [currentStep]);

    return (
        <div className="flex-grow container mx-auto px-4 py-6">
            {/* Data Persistence Indicator */}
            {formStateManager.hasSavedData() && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                Your progress is automatically saved
                            </span>
                        </div>
                        <button
                            onClick={startFresh}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
                        >
                            Start Fresh
                        </button>
                    </div>
                </div>
            )}
            
            <StepNavigation currentStep={currentStep} onStepClick={goToStep} />
            {renderStep()}
        </div>
    );
});

export default LiftPlanning;