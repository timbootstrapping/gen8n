'use client';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  canJumpToStep?: (step: number) => boolean;
}

const stepLabels = [
  'Account',
  'Company',
  'Provider',
  'API Keys',
  'Marketing',
  'Confirm'
];

export default function ProgressStepper({ currentStep, totalSteps, onStepClick, canJumpToStep }: ProgressStepperProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-center gap-4 mb-4">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isClickable = onStepClick && canJumpToStep ? canJumpToStep(stepNumber) : false;
          
          const baseClasses = 'w-8 h-8 flex items-center justify-center rounded-full border text-sm font-medium transition-all duration-200';
          const classes = isActive
            ? `${baseClasses} bg-highlight text-white border-highlight shadow-[0_0_6px_#8b5cf6]`
            : isCompleted
            ? `${baseClasses} bg-[#38383d] text-white border-highlight/50`
            : `${baseClasses} bg-[#2a2a2d] text-gray-400 border-border`;

          return (
            <div key={stepNumber} className="flex items-center gap-2">
              {i !== 0 && <div className="w-8 h-px bg-border" />}
              <button
                type="button"
                className={classes + (isClickable ? ' cursor-pointer hover:scale-105' : ' cursor-default')}
                onClick={() => isClickable && onStepClick && onStepClick(stepNumber)}
                disabled={!isClickable}
                aria-label={`Go to step ${stepNumber}`}
              >
                {stepNumber}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-center text-sm text-gray-400">
        Step {currentStep} of {totalSteps}: {stepLabels[currentStep - 1]}
      </p>
    </div>
  );
} 