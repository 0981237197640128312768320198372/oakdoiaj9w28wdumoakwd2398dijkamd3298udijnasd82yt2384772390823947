import React from 'react';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { PaymentStep } from '@/types';

interface DepositStepsProps {
  steps: PaymentStep[];
  currentStep: number;
}

const DepositSteps: React.FC<DepositStepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-[1px] transition-all duration-300 ${
                  index < currentStep
                    ? 'border-primary bg-primary text-dark-800'
                    : index === currentStep
                    ? 'border-primary text-primary'
                    : 'border-gray-300 text-gray-300'
                }`}>
                {index < currentStep ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  index <= currentStep ? 'text-primary' : 'text-gray-400'
                }`}>
                {step.title}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${
                  index < currentStep ? 'bg-primary' : 'bg-gray-300'
                }`}>
                <ArrowRight
                  className={`w-4 h-4 mx-auto -mt-2 transition-all duration-300 ${
                    index < currentStep ? 'text-primary opacity-100' : 'text-gray-300 opacity-0'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-2 text-center">
        <p className="text-sm text-gray-500">{steps[currentStep]?.description}</p>
      </div>
    </div>
  );
};

export default DepositSteps;
