/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import FormField from '@/components/ui/FormField';
import type { ProductFormData, Category, FormErrors } from '@/types';
import { ArrowRight, Check, ChevronDown, DollarSign, Percent } from 'lucide-react';
import Image from 'next/image';
import StatusSelector from './StatusSelector';
import ImageUploader from './ImageUploader';
import { Button2 } from '@/components/ui/button2';
import dokmaicoin3d from '@/assets/images/dokmaicoin3d.png';
import { useState, useRef, useEffect } from 'react';

interface ProductFormStep1Props {
  formData: ProductFormData;
  formErrors: FormErrors;
  categories: Category[];
  onInputChange: (field: keyof ProductFormData, value: any) => void;
  onNextStep: () => void;
}

export default function ProductFormStep1({
  formData,
  formErrors,
  categories,
  onInputChange,
  onNextStep,
}: ProductFormStep1Props) {
  // State for custom dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  };

  // Handle keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCategorySelect(categoryId);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid gap-5">
        {/* Title field */}
        <FormField id="title" label="Product Title" error={formErrors.title}>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm
              ${
                formErrors.title
                  ? 'border-red-500/50 bg-red-500/5 focus:border-red-500'
                  : 'border-dark-500 bg-dark-700/50 focus:border-primary/50'
              } text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/20`}
            placeholder="Enter product title..."
          />
        </FormField>

        {/* Description field */}
        <FormField id="description" label="Description" error={formErrors.description}>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm
              ${
                formErrors.description
                  ? 'border-red-500/50 bg-red-500/5 focus:border-red-500'
                  : 'border-dark-500 bg-dark-700/50 focus:border-primary/50'
              } text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none`}
            placeholder="Describe your product in detail..."
          />
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
                onChange={(e) => onInputChange('price', Number.parseFloat(e.target.value))}
                min="0"
                step="0.01"
                className={`w-full pl-10 pr-3 py-2 rounded-lg border transition-colors duration-200 text-sm
                  ${
                    formErrors.price
                      ? 'border-red-500/50 bg-red-500/5 focus:border-red-500'
                      : 'border-dark-500 bg-dark-700/50 focus:border-primary/50'
                  } text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/20`}
                placeholder="0.00"
              />
            </div>
          </FormField>

          <FormField id="discountPercentage" label="Discount" error={formErrors.discountPercentage}>
            <div className="relative">
              <input
                id="discountPercentage"
                type="number"
                value={formData.discountPercentage || ''}
                onChange={(e) =>
                  onInputChange('discountPercentage', Number.parseFloat(e.target.value))
                }
                min="0"
                max="100"
                step="1"
                className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm
                  ${
                    formErrors.discountPercentage
                      ? 'border-red-500/50 bg-red-500/5 focus:border-red-500'
                      : 'border-dark-500 bg-dark-700/50 focus:border-primary/50'
                  } text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/20`}
                placeholder="0"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Percent size={14} className="text-light-500" />
              </div>
            </div>
            {discountedPrice && (
              <div className="mt-2 text-xs text-primary flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                Discounted price: ${discountedPrice}
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
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left text-sm
                  ${
                    formErrors.categoryId
                      ? 'border-red-500/50 bg-red-500/5 focus:border-red-500'
                      : 'border-dark-500 bg-dark-700/50 focus:border-primary/50 hover:border-primary/30'
                  } text-light-200 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors duration-200`}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}>
                {selectedCategory ? (
                  <div className="flex items-center gap-2">
                    {selectedCategory.logoUrl ? (
                      <div className="relative w-6 h-6 overflow-hidden rounded-md flex-shrink-0">
                        <Image
                          src={selectedCategory.logoUrl || '/placeholder.svg'}
                          alt={selectedCategory.name}
                          width={24}
                          height={24}
                          className="object-cover"
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
                  className={`text-light-500 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-dark-700 border border-dark-600 shadow-lg overflow-hidden">
                  <ul
                    className="max-h-60 overflow-y-auto __dokmai_scrollbar"
                    role="listbox"
                    aria-labelledby="categoryId">
                    {categories.map((category) => (
                      <li
                        key={category._id}
                        role="option"
                        aria-selected={category._id === formData.categoryId}
                        tabIndex={0}
                        onClick={() => handleCategorySelect(category._id)}
                        onKeyDown={(e) => handleKeyDown(e, category._id)}
                        className={`flex items-center gap-3 px-5 py-2 cursor-pointer transition-colors duration-150 hover:bg-dark-600
                          ${
                            category._id === formData.categoryId
                              ? 'bg-dark-600 '
                              : 'text-light-200 hover:bg-dark-700'
                          }`}>
                        {category.logoUrl ? (
                          <div className="relative w-auto h-12  flex items-center overflow-hidden flex-shrink-0">
                            <Image
                              src={category.logoUrl || '/placeholder.svg'}
                              alt={category.name}
                              width={50}
                              height={50}
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
                          <Check size={16} className="text-primary flex-shrink-0" />
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
            onChange={(status: any) => onInputChange('status', status)}
          />
        </div>
      </div>

      {/* Image uploader section */}
      <div className="pt-2">
        <ImageUploader
          images={formData.images}
          onImagesChange={(images: any) => onInputChange('images', images)}
          error={formErrors.images}
          maxImages={3}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-end pt-5 border-t border-dark-600">
        <Button2
          onClick={onNextStep}
          className="group relative overflow-hidden shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/20">
          <span className="flex items-center gap-2">
            Continue to Product Details
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </span>
          <span className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
        </Button2>
      </div>
    </div>
  );
}
