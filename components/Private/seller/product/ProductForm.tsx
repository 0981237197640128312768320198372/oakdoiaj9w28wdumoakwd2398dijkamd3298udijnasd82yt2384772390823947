/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import FormField from '@/components/ui/FormField';
import type { ProductFormData, Category, FormErrors } from '@/types';
import { ArrowRight, Check, ChevronDown, DollarSign, Percent, Info } from 'lucide-react';
import Image from 'next/image';
import StatusSelector from './StatusSelector';
import ImageUploader from './ImageUploader';
import { Button2 } from '@/components/ui/button2';
import dokmaicoin3d from '@/assets/images/dokmaicoin3d.png';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  formData: ProductFormData;
  formErrors: FormErrors;
  categories: Category[];
  isLoading?: boolean;
  onInputChange: (field: keyof ProductFormData, value: string | number | string[]) => void;
  onSubmit: () => Promise<boolean>;
  onCancel: () => void;
  isEditMode?: boolean;
}

export default function ProductForm({
  formData,
  formErrors,
  categories,
  isLoading,
  onInputChange,
  onSubmit,
  onCancel,
  isEditMode,
}: ProductFormProps) {
  // State for custom dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryButtonRef = useRef<HTMLButtonElement>(null);

  // Calculate discounted price
  const discountedPrice =
    formData.price && formData.discountPercentage
      ? (formData.price * (1 - formData.discountPercentage / 100)).toFixed(2)
      : null;

  // Find selected category
  const selectedCategory = formData.categoryId
    ? categories.find((cat) => cat._id === formData.categoryId)
    : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    onInputChange('categoryId', categoryId);
    setIsDropdownOpen(false);
    categoryButtonRef.current?.focus();
  };

  // Handle keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCategorySelect(categoryId);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      categoryButtonRef.current?.focus();
    }
  };

  // Handle dropdown button keyboard navigation
  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setIsDropdownOpen(true);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn p-5 border-[1px] border-dark-500 rounded-lg">
      <div className="grid gap-5  p-5">
        {/* Title field */}
        <FormField id="title" label="Product Title" error={formErrors.title}>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            className={cn(
              'w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm',
              'text-light-200 focus:outline-none focus:ring-1',
              formErrors.title
                ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20'
                : 'border-dark-500 bg-dark-700/50 focus:border-primary/50 focus:ring-primary/20'
            )}
            placeholder="Enter product title..."
            aria-invalid={!!formErrors.title}
            aria-describedby={formErrors.title ? 'title-error' : undefined}
            maxLength={100}
            required
          />
        </FormField>

        {/* Description field */}
        <FormField id="description" label="Description" error={formErrors.description}>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            rows={4}
            className={cn(
              'w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm',
              'text-light-200 focus:outline-none focus:ring-1 resize-none',
              formErrors.description
                ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20'
                : 'border-dark-500 bg-dark-700/50 focus:border-primary/50 focus:ring-primary/20'
            )}
            placeholder="Describe your product in detail..."
            aria-invalid={!!formErrors.description}
            aria-describedby={formErrors.description ? 'description-error' : undefined}
            maxLength={1000}
            required
          />
          <div className="mt-1 text-xs text-light-500 flex justify-end">
            {formData.description.length}/1000 characters
          </div>
        </FormField>

        {/* Price and discount section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField id="price" label="Price" error={formErrors.price}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Image
                  src={dokmaicoin3d}
                  width={50}
                  height={50}
                  alt="Dokmai Coin"
                  className="text-light-500 w-4 h-4"
                />
              </div>
              <input
                id="price"
                type="number"
                value={formData.price || ''}
                onChange={(e) => {
                  const value = e.target.value ? Number.parseFloat(e.target.value) : 0;
                  onInputChange('price', value);
                }}
                min="0"
                step="0.01"
                className={cn(
                  'w-full pl-10 pr-3 py-2 rounded-lg border transition-colors duration-200 text-sm',
                  'text-light-200 focus:outline-none focus:ring-1',
                  formErrors.price
                    ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-dark-500 bg-dark-700/50 focus:border-primary/50 focus:ring-primary/20'
                )}
                placeholder="0.00"
                aria-invalid={!!formErrors.price}
                aria-describedby={formErrors.price ? 'price-error' : undefined}
                required
              />
            </div>
          </FormField>

          <FormField id="discountPercentage" label="Discount" error={formErrors.discountPercentage}>
            <div className="relative">
              <input
                id="discountPercentage"
                type="number"
                value={formData.discountPercentage || ''}
                onChange={(e) => {
                  const value = e.target.value ? Number.parseFloat(e.target.value) : 0;
                  // Ensure discount is between 0 and 100
                  const clampedValue = Math.min(Math.max(value, 0), 100);
                  onInputChange('discountPercentage', clampedValue);
                }}
                min="0"
                max="100"
                step="1"
                className={cn(
                  'w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm',
                  'text-light-200 focus:outline-none focus:ring-1',
                  formErrors.discountPercentage
                    ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-dark-500 bg-dark-700/50 focus:border-primary/50 focus:ring-primary/20'
                )}
                placeholder="0"
                aria-invalid={!!formErrors.discountPercentage}
                aria-describedby={formErrors.discountPercentage ? 'discount-error' : undefined}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Percent size={14} className="text-light-500" />
              </div>
            </div>
            {discountedPrice && formData.price > 0 && (
              <div className="mt-2 text-xs flex items-center gap-2 p-2 bg-primary/10 rounded-md border border-primary/20">
                <Info size={14} className="text-primary" />
                <div>
                  <span className="font-medium text-primary">Discounted price:</span>{' '}
                  <span className="text-light-200">${discountedPrice}</span>{' '}
                  <span className="text-light-500">
                    (Save ${(formData.price - parseFloat(discountedPrice)).toFixed(2)})
                  </span>
                </div>
              </div>
            )}
          </FormField>
        </div>

        {/* Category and status section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Custom Category Dropdown */}
          <FormField id="categoryId" label="Category" error={formErrors.categoryId}>
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown trigger button */}
              <button
                type="button"
                ref={categoryButtonRef}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onKeyDown={handleDropdownKeyDown}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left text-sm',
                  'transition-colors duration-200',
                  formErrors.categoryId
                    ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                    : 'border-dark-500 bg-dark-700/50 hover:border-primary/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20'
                )}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-labelledby="category-label">
                {selectedCategory ? (
                  <div className="flex items-center gap-2">
                    {selectedCategory.logoUrl ? (
                      <div className="relative flex items-center overflow-hidden flex-shrink-0">
                        <Image
                          src={selectedCategory.logoUrl || '/placeholder.svg'}
                          alt=""
                          width={24}
                          height={24}
                          className="w-7 h-auto"
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-dark-500 rounded-md flex items-center justify-center text-light-500 text-xs flex-shrink-0">
                        <span>C</span>
                      </div>
                    )}
                    <span className="truncate">{selectedCategory.name}</span>
                  </div>
                ) : (
                  <span className="text-light-500">Select a category</span>
                )}
                <ChevronDown
                  size={16}
                  className={cn(
                    'text-light-500 transition-transform duration-200',
                    isDropdownOpen ? 'rotate-180' : ''
                  )}
                  aria-hidden="true"
                />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute z-10 w-full mt-2 bg-dark-700 border border-dark-600 rounded-lg shadow-lg overflow-hidden"
                  role="listbox"
                  aria-labelledby="category-label">
                  <ul
                    className="max-h-60 overflow-y-auto py-1 __dokmai_scrollbar"
                    role="presentation">
                    {categories.map((category, index) => (
                      <li
                        key={category._id}
                        role="option"
                        aria-selected={category._id === formData.categoryId}
                        tabIndex={0}
                        onClick={() => handleCategorySelect(category._id)}
                        onKeyDown={(e) => handleKeyDown(e, category._id)}
                        className={cn(
                          'flex items-center gap-3 px-5 py-2 cursor-pointer transition-colors duration-150',
                          category._id === formData.categoryId
                            ? 'bg-dark-600'
                            : 'text-light-200 hover:bg-dark-600'
                        )}>
                        {category.logoUrl ? (
                          <div className="relative w-auto h-12 flex items-center overflow-hidden flex-shrink-0">
                            <Image
                              src={category.logoUrl || '/placeholder.svg'}
                              alt=""
                              width={50}
                              height={50}
                              className="w-16"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-dark-600 rounded-md flex items-center justify-center text-light-500 text-xs flex-shrink-0">
                            <span>C</span>
                          </div>
                        )}

                        {/* Category name */}
                        <span className="flex-grow text-xs">{category.name}</span>

                        {/* Selected indicator */}
                        {category._id === formData.categoryId && (
                          <Check
                            size={16}
                            className="text-primary flex-shrink-0"
                            aria-hidden="true"
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </FormField>

          <StatusSelector
            status={formData.status}
            onChange={(status) => onInputChange('status', status)}
          />
        </div>
      </div>

      {/* Image uploader section */}
      <div className="pt-2">
        <ImageUploader
          images={formData.images}
          onImagesChange={(images) => onInputChange('images', images)}
          error={formErrors.images}
          maxImages={3}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-5 border-t border-dark-600">
        <div className="text-xs text-light-500">
          <span className="text-primary">*</span> All fields are required except discount
        </div>
        <div className="flex gap-3">
          <Button2
            onClick={onCancel}
            className="bg-dark-600 hover:bg-dark-700 text-light-300"
            aria-label="Cancel">
            Cancel
          </Button2>
          <Button2
            onClick={onSubmit}
            className="group relative overflow-hidden shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/20"
            disabled={Object.keys(formErrors).length > 0 || isLoading}
            aria-label={isEditMode ? 'Update Product' : 'Add Product'}>
            <span className="flex items-center gap-2">
              {isLoading ? 'Processing...' : isEditMode ? 'Update Product' : 'Add Product'}
              {!isLoading && (
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              )}
            </span>
            <span className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
          </Button2>
        </div>
      </div>
    </div>
  );
}
