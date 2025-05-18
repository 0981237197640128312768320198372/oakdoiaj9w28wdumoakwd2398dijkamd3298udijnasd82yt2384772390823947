/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  isEditMode?: boolean;
  onInputChange: (field: keyof ProductFormData, value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  formData,
  formErrors,
  categories,
  isLoading,
  isEditMode = false,
  onInputChange,
  onSubmit,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [keys, setKeys] = useState<string[]>([]);
  const [details, setDetails] = useState<Record<string, string>[]>([]);

  // Initialize keys and details from formData when in edit mode
  useEffect(() => {
    if (formData.details && formData.details.length > 0) {
      // Extract keys from the first detail object
      const firstDetail = formData.details[0];
      const extractedKeys = Object.keys(firstDetail);

      setKeys(extractedKeys);
      setDetails(formData.details);
    }
  }, [formData.details]);

  useEffect(() => {
    if (details.length > 0) {
      onInputChange('stock', details.length);
      onInputChange('details', details);
    }
  }, [details]);

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
    <div className="relative bg-gradient-to-b from-dark-800 to-dark-850 rounded-lg p-4 shadow-xl border border-dark-600 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-light-100 flex items-center gap-2">
          <span className="inline-block w-1 h-6 bg-primary rounded-sm" />
          <span>{isEditMode ? 'Edit Product' : 'Create New Product'}</span>
        </h2>
        <button
          onClick={onCancel}
          className="p-1.5 text-light-500 bg-dark-700/50 hover:bg-red-500/15 hover:text-red-400 rounded-full transition-all duration-200"
          aria-label="Cancel">
          <X size={16} />
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
      <div className="absolute -z-10 top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-primary/5 to-transparent rounded-lg blur-xl opacity-30" />
    </div>
  );
};

export default ProductForm;
