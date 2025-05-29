/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import type { ProductFormData } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';
import DetailEditor from './DetailEditor';
import { Button2 } from '@/components/ui/button2';
import { useRef, useEffect } from 'react';
import ButtonWithLoader from '@/components/ui/ButtonWithLoader';

interface ProductFormStep2Props {
  formData: ProductFormData;
  keys: string[];
  details: Record<string, string>[];
  isLoading: boolean;
  onKeysChange: (keys: string[]) => void;
  onDetailsChange: (details: Record<string, string>[]) => void;
  onPreviousStep: () => void;
  onSubmit: () => void;
}

export default function ProductFormStep2({
  formData,
  keys,
  details,
  isLoading,
  onKeysChange,
  onDetailsChange,
  onPreviousStep,
  onSubmit,
}: ProductFormStep2Props) {
  const isInitialRender = useRef(true);

  // Initialize empty details if none exist
  useEffect(() => {
    // Only run this effect on the initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;

      // If details array is empty, initialize with one empty detail
      if (details.length === 0) {
        const emptyDetail: Record<string, string> = {};

        // Initialize with default keys if available, otherwise use default keys
        const keysToUse = keys.length > 0 ? keys : ['Email', 'Password'];

        keysToUse.forEach((key) => {
          emptyDetail[key] = '';
        });

        onDetailsChange([emptyDetail]);

        // Only update keys if they're empty
        if (keys.length === 0) {
          onKeysChange(keysToUse);
        }
      }
    }
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-dark-700/30 rounded-lg border border-dark-600 p-4">
        <h3 className="text-sm font-medium text-light-200 mb-3 flex items-center gap-2">
          <span className="inline-block w-1 h-4 bg-primary/70 rounded-sm"></span>
          Product Specifications
        </h3>

        <DetailEditor
          keys={keys}
          details={details}
          onKeysChange={onKeysChange}
          onDetailsChange={onDetailsChange}
        />
      </div>

      <div className="flex justify-between pt-5 border-t border-dark-600">
        <Button2
          variant="outline"
          onClick={onPreviousStep}
          className="group relative overflow-hidden">
          <span className="flex items-center gap-2">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back
          </span>
          <span className="absolute inset-0 bg-dark-600/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
        </Button2>

        <ButtonWithLoader
          disabled={isLoading}
          onClick={onSubmit}
          className="group relative overflow-hidden shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/20">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving Product...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save size={16} />
              Save Product
            </span>
          )}
          <span className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
        </ButtonWithLoader>
      </div>
    </div>
  );
}
