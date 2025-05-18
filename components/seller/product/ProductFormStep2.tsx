/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { ProductFormData } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';
import DetailEditor from './DetailEditor';
import Button from '@/components/ui/Button';

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

const ProductFormStep2: React.FC<ProductFormStep2Props> = ({
  formData,
  keys,
  details,
  isLoading,
  onKeysChange,
  onDetailsChange,
  onPreviousStep,
  onSubmit,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <DetailEditor
        keys={keys}
        details={details}
        onKeysChange={onKeysChange}
        onDetailsChange={onDetailsChange}
      />

      <div className="flex justify-between pt-5 border-t border-dark-600">
        <Button
          variant="secondary"
          size="lg"
          onClick={onPreviousStep}
          icon={<ArrowLeft size={16} />}>
          Back
        </Button>

        <Button
          variant="primary"
          size="lg"
          isLoading={isLoading}
          onClick={onSubmit}
          icon={!isLoading && <Save size={16} />}
          className="shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/20">
          {isLoading ? 'Saving Product...' : 'Save Product'}
        </Button>
      </div>
    </div>
  );
};

export default ProductFormStep2;
