/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ProductFormData, Category, FormErrors } from '@/types';
import ImageUploader from './ImageUploader';
import StatusSelector from './StatusSelector';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/button';

interface ProductFormStep1Props {
  formData: ProductFormData;
  formErrors: FormErrors;
  categories: Category[];
  onInputChange: (field: keyof ProductFormData, value: any) => void;
  onNextStep: () => void;
}

const ProductFormStep1: React.FC<ProductFormStep1Props> = ({
  formData,
  formErrors,
  categories,
  onInputChange,
  onNextStep,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormField id="title" label="Product Title" error={formErrors.title}>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => onInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200
                ${
                  formErrors.title
                    ? 'border-red-500/50 bg-red-500/5 focus:border-red-500'
                    : 'border-dark-500 bg-dark-700/50 focus:border-primary/50'
                } text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/20`}
              placeholder="Enter product title..."
            />
          </FormField>
        </div>

        <div className="md:col-span-2">
          <FormField id="description" label="Description" error={formErrors.description}>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200
                ${
                  formErrors.description
                    ? 'border-red-500/50 bg-red-500/5 focus:border-red-500'
                    : 'border-dark-500 bg-dark-700/50 focus:border-primary/50'
                } text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none`}
              placeholder="Describe your product in detail..."
            />
          </FormField>
        </div>

        <FormField id="price" label="Price" error={formErrors.price}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-light-500">$</span>
            </div>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price || ''}
              onChange={(e) => onInputChange('price', parseFloat(e.target.value))}
              min="0"
              step="0.01"
              className={`w-full pl-7 pr-4 py-3 rounded-lg border transition-all duration-200
                ${
                  formErrors.price
                    ? 'border-red-500/50 bg-red-500/5 focus:border-red-500'
                    : 'border-dark-500 bg-dark-700/50 focus:border-primary/50'
                } text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/20`}
              placeholder="0.00"
            />
          </div>
        </FormField>

        <FormField id="type" label="Product Type" error={formErrors.type}>
          <input
            id="type"
            type="text"
            name="type"
            value={formData.type}
            onChange={(e) => onInputChange('type', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200
              ${
                formErrors.type
                  ? 'border-red-500/50 bg-red-500/5 focus:border-red-500'
                  : 'border-dark-500 bg-dark-700/50 focus:border-primary/50'
              } text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/20`}
            placeholder="e.g. Physical, Digital, Subscription"
          />
        </FormField>

        <FormField id="categoryId" label="Category" error={formErrors.categoryId}>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={(e) => onInputChange('categoryId', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 appearance-none bg-no-repeat
              ${
                formErrors.categoryId
                  ? 'border-red-500/50 bg-red-500/5 focus:border-red-500'
                  : 'border-dark-500 bg-dark-700/50 focus:border-primary/50'
              } text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/20
              bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"%3E%3Cpath stroke="%236b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m6 8 4 4 4-4"/%3E%3C/svg%3E')]
              bg-[right_0.75rem_center] bg-[length:1.25em_1.25em]`}>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="pt-4">
        <ImageUploader
          images={formData.images}
          onImagesChange={(images) => onInputChange('images', images)}
          error={formErrors.images}
        />
      </div>

      <div className="pt-4">
        <StatusSelector
          status={formData.status}
          onChange={(status) => onInputChange('status', status)}
        />
      </div>

      <div className="flex justify-end pt-5 border-t border-dark-600">
        <Button
          variant="primary"
          size="lg"
          onClick={onNextStep}
          className="shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/20">
          Continue to Product Details
        </Button>
      </div>
    </div>
  );
};

export default ProductFormStep1;
