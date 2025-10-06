import { CheckCircleIcon } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
}

interface Step {
  number: number;
  label: string;
}

const StepNavigation = ({ currentStep, onStepClick }: StepNavigationProps) => {
  const steps: Step[] = [
    { number: 1, label: 'CUSTOMER INFO' },
    { number: 2, label: 'REQUIREMENTS' },
    { number: 3, label: 'PRODUCTS' },
    { number: 4, label: 'PACKAGES' },
    { number: 5, label: 'INTERIOR' },
    { number: 6, label: 'ADD-ONS' },
    { number: 7, label: 'CONFIRMATION' },
  ];

  const getStepStatus = (stepNumber: number) => {
    if (currentStep > stepNumber) return 'completed';
    if (currentStep === stepNumber) return 'active';
    return 'pending';
  };

  const isStepClickable = (stepNumber: number): boolean => {
    const status = getStepStatus(stepNumber);
    return status === 'completed' && !!onStepClick;
  };

  const handleStepClick = (stepNumber: number) => {
    if (isStepClickable(stepNumber)) {
      onStepClick?.(stepNumber);
    }
  };

  const getStepStyles = (status: string, isClickable: boolean) => {
    let baseStyles = '';
    switch (status) {
      case 'completed':
        baseStyles = 'text-gray-700 dark:text-gray-300';
        break;
      case 'active':
        baseStyles = 'text-red-500 font-semibold';
        break;
      default:
        baseStyles = 'text-gray-400 dark:text-gray-500';
    }
    
    if (isClickable) {
      baseStyles += ' cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors';
    }
    
    return baseStyles;
  };

  const getCircleStyles = (status: string, isClickable: boolean) => {
    let baseStyles = '';
    switch (status) {
      case 'active':
        baseStyles = 'bg-red-500 text-white shadow-md';
        break;
      case 'completed':
        baseStyles = 'bg-green-100 dark:bg-green-900/30';
        break;
      default:
        baseStyles = 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
    
    if (isClickable) {
      baseStyles += ' cursor-pointer hover:bg-green-200 dark:hover:bg-green-800/50 hover:scale-105 transition-all';
    }
    
    return baseStyles;
  };

  const getConnectorStyles = (status: string) => {
    return status === 'completed' ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700';
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* Desktop & Tablet View */}
      <div className="flex items-center justify-center px-4 py-6">
        <div className="flex items-center justify-between w-full max-w-4xl">
          {steps.map((step, index) => {
            const status = getStepStatus(step.number);
            const isLastStep = index === steps.length - 1;
            const isClickable = isStepClickable(step.number);
            
            return (
              <div key={step.number} className="flex items-center flex-1 min-w-0">
                {/* Step Content */}
                <div 
                  className={`flex items-center transition-all duration-200 ${getStepStyles(status, isClickable)}`}
                  onClick={() => handleStepClick(step.number)}
                  title={isClickable ? `Go to ${step.label}` : undefined}
                >
                  {/* Step Icon/Number */}
                  <div className="flex flex-col items-center">
                    {status === 'completed' ? (
                      <CheckCircleIcon className={`w-8 h-8 text-green-500 flex-shrink-0 mb-2 ${isClickable ? 'hover:text-green-600 transition-colors' : ''}`} />
                    ) : (
                      <div className={`
                        w-8 h-8
                        rounded-full 
                        flex items-center justify-center 
                        text-sm
                        font-semibold
                        flex-shrink-0
                        mb-2
                        transition-all duration-200
                        ${getCircleStyles(status, isClickable)}
                        ${status === 'active' ? 'ring-2 ring-red-200 dark:ring-red-800' : ''}
                      `}>
                        {step.number}
                      </div>
                    )}
                    
                    {/* Step Label */}
                    <span className="
                      text-xs
                      font-medium
                      text-center
                      whitespace-nowrap
                      hidden sm:block
                      transition-all duration-200
                      max-w-20
                    ">
                      {step.label}
                    </span>
                  </div>
                </div>

                {/* Connector Line */}
                {!isLastStep && (
                  <div className="flex-1 mx-3 sm:mx-6">
                    <div className={`
                      h-0.5
                      w-full 
                      transition-all duration-300 ease-in-out
                      rounded-full
                      ${getConnectorStyles(status)}
                    `} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Mobile Only - Current Step Indicator */}
      <div className="sm:hidden px-4 pb-3">
        <div className="text-center border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-4">
          <div className="text-xs text-gray-500 dark:text-gray-300 font-medium mb-1">
            Step {currentStep} of {steps.length}
          </div>
          <div className="text-sm text-black dark:text-white font-semibold">
            {steps[currentStep - 1]?.label}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Helper Text */}
      {onStepClick && (
        <div className="text-center pb-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click on completed steps (✓) to go back and edit
          </p>
        </div>
      )}
    </div>
  );
};

export default StepNavigation;