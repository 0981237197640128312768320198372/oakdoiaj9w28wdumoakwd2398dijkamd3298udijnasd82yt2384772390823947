/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Upload, AlertTriangle, Check, Plus, Trash2 } from 'lucide-react';
import { ProductFormData, Category, FormErrors } from '@/types';
import Image from 'next/image';

interface ProductFormProps {
  formData: ProductFormData;
  formErrors: FormErrors;
  categories: Category[];
  isLoading: boolean;
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
  const [newKey, setNewKey] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Automatically update stock and details in formData
    onInputChange('stock', details.length);
    onInputChange('details', details);
  }, [details]);

  // Image upload logic (unchanged from original)
  async function uploadImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v3/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload images');
    }

    const data = await response.json();
    return data.urls;
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        try {
          const urls = await uploadImages(Array.from(files));
          onInputChange('images', [...formData.images, ...urls]);
        } catch (err) {
          console.error('Error uploading images:', err);
        }
      }
    },
    [formData.images, onInputChange]
  );

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const urls = await uploadImages(Array.from(files));
        onInputChange('images', [...formData.images, ...urls]);
        e.target.value = '';
      } catch (err) {
        console.error('Error uploading images:', err);
      }
    }
  };

  const handleImageUrlAdd = () => {
    const urlInput = document.getElementById('imageUrl') as HTMLInputElement;
    if (urlInput.value) {
      onInputChange('images', [...formData.images, urlInput.value]);
      urlInput.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    onInputChange('images', updatedImages);
  };

  // Key management for details
  const addKey = () => {
    if (newKey.trim() && !keys.includes(newKey.trim())) {
      setKeys([...keys, newKey.trim()]);
      setNewKey('');
    }
  };

  const removeKey = (keyToRemove: string) => {
    setKeys(keys.filter((key) => key !== keyToRemove));
    setDetails(
      details.map((detail) => {
        const { [keyToRemove]: _, ...rest } = detail;
        return rest;
      })
    );
  };

  // Detail management
  const addDetail = () => {
    const newDetail: Record<string, string> = {};
    keys.forEach((key) => {
      newDetail[key] = '';
    });
    setDetails([...details, newDetail]);
  };

  const updateDetail = (index: number, key: string, value: string) => {
    const updatedDetails = [...details];
    updatedDetails[index][key] = value;
    setDetails(updatedDetails);
  };

  const removeDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
  };

  // Step navigation
  const handleNextStep = () => {
    setStep(2);
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  return (
    <div className="bg-dark-800 rounded-xl p-5 shadow-sm border border-dark-500 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-light-100">
          {step === 1 ? 'Step 1: Basic Information' : 'Step 2: Product Details'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:text-rose-700 text-red-500 bg-red-500/15 rounded-lg hover:bg-red-500/25 transition-colors duration-200">
          <X size={20} />
        </button>
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-xs font-medium text-light-800 mb-1">
              Product Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => onInputChange('title', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                formErrors.title ? 'border-red-500 bg-red-500/30' : 'border-dark-500 bg-dark-700'
              } text-dark-200 focus:outline-none focus:ring-[0.4px] focus:ring-primary transition-all duration-200`}
              placeholder="Canva Premium"
            />
            {formErrors.title && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                {formErrors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-medium text-light-800 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                formErrors.description
                  ? 'border-red-500 bg-red-900/20'
                  : 'border-dark-500 bg-dark-700'
              } text-dark-200 focus:outline-none focus:ring-[0.4px] focus:ring-primary transition-all duration-200`}
              placeholder="Describe your product"
            />
            {formErrors.description && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                {formErrors.description}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-xs font-medium text-light-800 mb-1">
              Price
            </label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={(e) => onInputChange('price', parseFloat(e.target.value))}
              min="0"
              step="0.01"
              className={`w-full px-4 py-2.5 rounded-lg border ${
                formErrors.price ? 'border-red-500 bg-red-900/20' : 'border-dark-500 bg-dark-700'
              } text-dark-200 focus:outline-none focus:ring-[0.4px] focus:ring-primary transition-all duration-200`}
              placeholder="0.00"
            />
            {formErrors.price && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                {formErrors.price}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="type" className="block text-xs font-medium text-light-800 mb-1">
              Product Type
            </label>
            <input
              id="type"
              type="text"
              name="type"
              value={formData.type}
              onChange={(e) => onInputChange('type', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                formErrors.type ? 'border-red-500 bg-red-900/20' : 'border-dark-500 bg-dark-700'
              } text-dark-200 focus:outline-none focus:ring-[0.4px] focus:ring-primary transition-all duration-200`}
              placeholder="e.g. Physical, Digital"
            />
            {formErrors.type && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                {formErrors.type}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-xs font-medium text-light-800 mb-1">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={(e) => onInputChange('categoryId', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                formErrors.categoryId
                  ? 'border-red-500 bg-red-900/20'
                  : 'border-dark-500 bg-dark-700'
              } text-dark-200 focus:outline-none focus:ring-[0.4px] focus:ring-primary transition-all duration-200`}>
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            {formErrors.categoryId && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                {formErrors.categoryId}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-light-800 mb-1">Product Images</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
              className={`relative mt-1 flex justify-center px-6 pt-5 pb-6 border-[1px] border-dashed rounded-lg transition-all cursor-pointer duration-200 ${
                isDragging
                  ? `border-primary bg-primary`
                  : formErrors.images
                  ? 'border-red-500 bg-red-500/20'
                  : 'border-primary/30 hover:border-primary/50 bg-dark-700 hover:bg-primary/5'
              }`}>
              <div className="space-y-1 text-center">
                <Upload className={`mx-auto h-12 w-12 text-primary`} />
                <div className="flex text-sm text-dark-300">
                  <span className="font-medium text-primary hover:text-blue-300">
                    Upload images
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-dark-400">PNG, JPG, GIF up to 10MB</p>
              </div>
              <input
                ref={fileInputRef}
                id="file-upload"
                name="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            {formErrors.images && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                {formErrors.images}
              </p>
            )}
            <div className="mt-3 flex">
              <input
                id="imageUrl"
                type="text"
                placeholder="Or paste image URL here"
                className="flex-1 px-4 py-2 rounded-l-lg border border-dark-500 bg-dark-700 text-dark-200 focus:outline-none focus:ring-[0.4px] focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleImageUrlAdd}
                className="px-4 py-2 bg-primary text-dark-800 rounded-r-lg hover:bg-primary/80 transition-colors duration-200">
                Add
              </button>
            </div>
            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="h-24 w-full overflow-hidden rounded-lg border border-dark-700 bg-dark-700">
                      <Image
                        width={100}
                        height={100}
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-contain"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-light-800 mb-1">Product Status</label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => onInputChange('status', 'draft')}
                className={`cursor-pointer p-3 rounded-lg border ${
                  formData.status === 'draft'
                    ? 'border-amber-600 bg-amber-900/20'
                    : 'border-dark-500 bg-dark-700'
                } flex items-center gap-2 transition-all duration-200`}>
                <div
                  className={`p-1 rounded-full ${
                    formData.status === 'draft'
                      ? 'bg-amber-500 text-dark-800'
                      : 'bg-dark-700 text-dark-400'
                  }`}>
                  <AlertTriangle size={14} />
                </div>
                <span
                  className={`font-medium ${
                    formData.status === 'draft' ? 'text-amber-500' : 'text-dark-300'
                  }`}>
                  Draft
                </span>
              </div>
              <div
                onClick={() => onInputChange('status', 'active')}
                className={`cursor-pointer p-3 rounded-lg border ${
                  formData.status === 'active'
                    ? 'border-green-600 bg-green-900/20'
                    : 'border-dark-500 bg-dark-700'
                } flex items-center gap-2 transition-all duration-200`}>
                <div
                  className={`p-1 rounded-full ${
                    formData.status === 'active'
                      ? 'bg-green-500 text-dark-800'
                      : 'bg-dark-700 text-dark-400'
                  }`}>
                  <Check size={14} />
                </div>
                <span
                  className={`font-medium ${
                    formData.status === 'active' ? 'text-green-500' : 'text-dark-300'
                  }`}>
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-5 border-t border-dark-700">
            <button
              type="button"
              onClick={handleNextStep}
              className="px-5 py-2.5 bg-primary text-dark-800 rounded-lg hover:bg-primary/80 transition-colors duration-200 shadow-sm hover:shadow flex items-center gap-2">
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-light-100">Define Product Details Keys</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Add a new key (e.g., email, password)"
              className="flex-1 px-4 py-2 rounded-lg border border-dark-500 bg-dark-700 text-dark-200 focus:outline-none focus:ring-[0.4px] focus:ring-primary"
            />
            <button
              type="button"
              onClick={addKey}
              className="px-4 py-2 bg-primary text-dark-800 rounded-lg hover:bg-primary/80 transition-colors duration-200">
              Add Key
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {keys.map((key) => (
              <div key={key} className="flex items-center gap-1 bg-dark-600 px-3 py-1 rounded-full">
                <span className="text-dark-200">{key}</span>
                <button
                  type="button"
                  onClick={() => removeKey(key)}
                  className="text-red-500 hover:text-red-700">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-light-100 mt-6">Add Product Details</h3>
          <button
            type="button"
            onClick={addDetail}
            className="mb-4 px-4 py-2 bg-primary text-dark-800 rounded-lg hover:bg-primary/80 transition-colors duration-200">
            <Plus size={16} className="inline mr-1" /> Add Detail
          </button>
          <div className="flex flex-col gap-4 max-h-96 overflow-y-auto __dokmai_scrollbar p-4 text-xs">
            {details.map((detail, index) => (
              <div key={index} className="mb-4 p-4 bg-dark-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-light-800">Detail {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeDetail(index)}
                    className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </div>
                {keys.map((key) => (
                  <div key={key} className="mb-2">
                    <label className="block text-xs font-medium text-light-800 mb-1">{key}</label>
                    <input
                      type="text"
                      value={detail[key] || ''}
                      onChange={(e) => updateDetail(index, key, e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-dark-500 bg-dark-700 text-dark-200 focus:outline-none focus:ring-[0.4px] focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-5 border-t border-dark-700">
            <button
              type="button"
              onClick={handlePreviousStep}
              className="px-5 py-2.5 bg-dark-600 text-light-800 rounded-lg border-[1px] border-dark-400 hover:bg-dark-500 transition-colors duration-200 shadow-sm hover:shadow flex items-center gap-2">
              Previous
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isLoading}
              className="px-5 py-2.5 bg-primary text-dark-800 rounded-lg hover:bg-primary/80 transition-colors duration-200 shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Product</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
