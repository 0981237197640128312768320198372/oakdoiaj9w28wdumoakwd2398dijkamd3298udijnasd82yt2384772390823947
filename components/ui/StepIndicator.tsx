import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, onStepClick }) => {
  return (
    <div className="flex items-center justify-center w-full mb-4">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={stepNumber}>
            {/* Step circle */}
            <div
              onClick={() => onStepClick && onStepClick(stepNumber)}
              className={`
                flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 
                ${onStepClick ? 'cursor-pointer' : ''}
                ${
                  isActive
                    ? 'bg-primary text-dark-800 scale-110 shadow-md shadow-primary/20'
                    : isCompleted
                    ? 'bg-primary/80 text-dark-800'
                    : 'bg-dark-600 text-light-400'
                }
              `}>
              {isCompleted ? (
                <Check size={14} className="stroke-[2.5]" />
              ) : (
                <span className="text-xs font-medium">{stepNumber}</span>
              )}
            </div>

            {/* Connector line */}
            {stepNumber < totalSteps && (
              <div className="w-8 h-0.5 mx-1 rounded-full bg-dark-600">
                <div
                  className={`h-full rounded-full bg-primary transition-all duration-500 ease-in-out ${
                    isCompleted ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
