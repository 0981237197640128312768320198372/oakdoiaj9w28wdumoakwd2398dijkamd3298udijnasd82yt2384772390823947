import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ProductFormData, Category, FormErrors } from '@/types';
import ProductFormStep1 from './ProductFormStep1';
import ProductFormStep2 from './ProductFormStep2';
import StepIndicator from '@/components/ui/StepIndicator';

interface ProductFormProps {
  formData: ProductFormData;
  formErrors: FormErrors;
  categories: Category[];
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onInputChange: (field: keyof ProductFormData, value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  formData,
  formErrors,
  categories,
  isLoading,
  onInputChange,
  onSubmit,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [keys, setKeys] = useState<string[]>([]);
  const [details, setDetails] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    // Automatically update stock and details in formData when details change
    onInputChange('stock', details.length);
    onInputChange('details', details);
  }, [details, onInputChange]);

  const handleNextStep = () => {
    setStep(2);
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleStepClick = (stepNumber: number) => {
    setStep(stepNumber);
  };

  return (
    <div className="relative bg-gradient-to-b from-dark-800 to-dark-850 rounded-xl p-6 shadow-xl border border-dark-600 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-light-100 flex items-center gap-2">
          <span className="inline-block w-2 h-8 bg-primary rounded-sm" />
          <span>{step === 1 ? 'Create New Product' : 'Product Details & Inventory'}</span>
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-light-500 bg-dark-700/50 hover:bg-red-500/15 hover:text-red-400 
                   rounded-full transition-all duration-200"
          aria-label="Cancel">
          <X size={20} />
        </button>
      </div>

      <StepIndicator currentStep={step} totalSteps={2} onStepClick={handleStepClick} />

      {step === 1 && (
        <ProductFormStep1
          formData={formData}
          formErrors={formErrors}
          categories={categories}
          onInputChange={onInputChange}
          onNextStep={handleNextStep}
        />
      )}

      {step === 2 && (
        <ProductFormStep2
          formData={formData}
          keys={keys}
          details={details}
          isLoading={isLoading}
          onKeysChange={setKeys}
          onDetailsChange={setDetails}
          onPreviousStep={handlePreviousStep}
          onSubmit={onSubmit}
        />
      )}

      {/* Glowing background effect */}
      <div className="absolute -z-10 top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-primary/5 to-transparent rounded-xl blur-xl opacity-30" />
    </div>
  );
};

export default ProductForm;
