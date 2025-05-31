/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { ProductFormData, Category, FormErrors } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

export default function ProductForm({
  formData,
  formErrors,
  categories,
  isLoading,
  isEditMode = false,
  onInputChange,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [step, setStep] = useState(1);
  const [keys, setKeys] = useState<string[]>([]);
  const [details, setDetails] = useState<Record<string, string>[]>([]);

  // Initialize details from form data only once on component mount
  useEffect(() => {
    if (formData.details?.length > 0) {
      const firstDetail = formData.details[0];
      setKeys(Object.keys(firstDetail));
      setDetails(formData.details);
    } else {
      setKeys(['Email', 'Password']);

      const emptyDetail: Record<string, string> = {
        Email: '',
        Password: '',
      };
      setDetails([emptyDetail]);
    }
  }, []);

  const handleDetailsChange = (newDetails: Record<string, string>[]) => {
    setDetails(newDetails);
    onInputChange('details', newDetails);
  };

  const handleKeysChange = (newKeys: string[]) => {
    setKeys(newKeys);
  };

  useEffect(() => {
    if (details.length > 0) {
      onInputChange('stock', details.length);
    }
  }, [details.length, onInputChange]);

  return (
    <Card className="relative bg-gradient-to-b from-dark-800 to-dark-850 border-dark-600 shadow-xl animate-fadeIn overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
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
      </CardHeader>

      <StepIndicator currentStep={step} totalSteps={2} onStepClick={setStep} />

      <CardContent className="p-4">
        {step === 1 ? (
          <ProductFormStep1
            formData={formData}
            formErrors={formErrors}
            categories={categories}
            onInputChange={onInputChange}
            onNextStep={() => setStep(2)}
          />
        ) : (
          <ProductFormStep2
            formData={formData}
            keys={keys}
            details={details}
            isLoading={isLoading}
            onKeysChange={handleKeysChange}
            onDetailsChange={handleDetailsChange}
            onPreviousStep={() => setStep(1)}
            onSubmit={onSubmit}
          />
        )}
      </CardContent>

      {/* Glowing background effect */}
      <div className="absolute -z-10 inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-lg blur-xl opacity-30" />
    </Card>
  );
}
