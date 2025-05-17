import React, { useState, useCallback, useRef } from 'react';
import { X, Upload, AlertTriangle, Check } from 'lucide-react';
import { ProductFormData, Category, FormErrors } from '@/types';
import Image from 'next/image';

// Utility function to upload images (assumes an API endpoint)
async function uploadImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const response = await fetch('/api/v3/upload-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload images');
  }

  const data = await response.json();
  return data.urls; // Expecting { urls: string[] } from the API
}

interface ProductFormProps {
  formData: ProductFormData;
  formErrors: FormErrors;
  categories: Category[];
  isLoading: boolean;
  onInputChange: (field: keyof ProductFormData, value: string | number | string[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const PRIMARY_COLOR = {
  light: 'blue-500',
  dark: 'blue-400',
  hover: 'blue-600',
  hoverDark: 'blue-300',
  bg: 'blue-50',
  bgDark: 'blue-900/20',
  border: 'blue-200',
  borderDark: 'blue-500',
};

const ProductForm: React.FC<ProductFormProps> = ({
  formData,
  formErrors,
  categories,
  isLoading,
  onInputChange,
  onSubmit,
  onCancel,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image drag events
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
          // Optionally, set an error state to display to the user
        }
      }
    },
    [formData.images, onInputChange]
  );

  // Handle file selection via click
  const handleBrowseClick = () => {
    // Programmatically trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file input changes
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const urls = await uploadImages(Array.from(files));
        onInputChange('images', [...formData.images, ...urls]);
        // Clear the input value to allow selecting the same file again if needed
        e.target.value = '';
      } catch (err) {
        console.error('Error uploading images:', err);
        // Optionally, set an error state to display to the user
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

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-700 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-100">Add New Product</h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-200 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-800 transition-colors duration-200">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
            Product Title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            className={`w-full px-4 py-2.5 rounded-lg border ${
              formErrors.title ? 'border-red-500 bg-red-900/20' : 'border-gray-700 bg-gray-800'
            } text-gray-200 focus:outline-none focus:ring-2 focus:ring-${
              PRIMARY_COLOR.dark
            } transition-all duration-200`}
            placeholder="Enter product title"
          />
          {formErrors.title && (
            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertTriangle size={12} />
              {formErrors.title}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
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
                : 'border-gray-700 bg-gray-800'
            } text-gray-200 focus:outline-none focus:ring-2 focus:ring-${
              PRIMARY_COLOR.dark
            } transition-all duration-200`}
            placeholder="Describe your product"
          />
          {formErrors.description && (
            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertTriangle size={12} />
              {formErrors.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
              Price ($)
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
                formErrors.price ? 'border-red-500 bg-red-900/20' : 'border-gray-700 bg-gray-800'
              } text-gray-200 focus:outline-none focus:ring-2 focus:ring-${
                PRIMARY_COLOR.dark
              } transition-all duration-200`}
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
            <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-1">
              Stock
            </label>
            <input
              id="stock"
              type="number"
              name="stock"
              value={formData.stock}
              onChange={(e) => onInputChange('stock', parseInt(e.target.value, 10))}
              min="0"
              className={`w-full px-4 py-2.5 rounded-lg border ${
                formErrors.stock ? 'border-red-500 bg-red-900/20' : 'border-gray-700 bg-gray-800'
              } text-gray-200 focus:outline-none focus:ring-2 focus:ring-${
                PRIMARY_COLOR.dark
              } transition-all duration-200`}
              placeholder="0"
            />
            {formErrors.stock && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                {formErrors.stock}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
              Product Type
            </label>
            <input
              id="type"
              type="text"
              name="type"
              value={formData.type}
              onChange={(e) => onInputChange('type', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                formErrors.type ? 'border-red-500 bg-red-900/20' : 'border-gray-700 bg-gray-800'
              } text-gray-200 focus:outline-none focus:ring-2 focus:ring-${
                PRIMARY_COLOR.dark
              } transition-all duration-200`}
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
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300 mb-1">
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
                  : 'border-gray-700 bg-gray-800'
              } text-gray-200 focus:outline-none focus:ring-2 focus:ring-${
                PRIMARY_COLOR.dark
              } transition-all duration-200`}>
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Product Images</label>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`relative mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all cursor-pointer duration-200 ${
              isDragging
                ? `border-${PRIMARY_COLOR.dark} bg-${PRIMARY_COLOR.bgDark}`
                : formErrors.images
                ? 'border-red-500 bg-red-900/20'
                : 'border-gray-600 hover:border-gray-500 bg-gray-800'
            }`}>
            <div className="space-y-1 text-center">
              <Upload className={`mx-auto h-12 w-12 text-${PRIMARY_COLOR.dark}`} />
              <div className="flex text-sm text-gray-300">
                <span className="font-medium text-blue-400 hover:text-blue-300">Upload images</span>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
            </div>
            {/* Hidden file input - properly referenced with ref */}
            <input
              ref={fileInputRef}
              id="file-upload"
              name="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden" // Changed from sr-only to hidden for clarity
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
              className="flex-1 px-4 py-2 rounded-l-lg border border-gray-700 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleImageUrlAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors duration-200">
              Add
            </button>
          </div>

          {formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {formData.images.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="h-24 w-full overflow-hidden rounded-lg border border-gray-700 bg-gray-700">
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
          <label className="block text-sm font-medium text-gray-300 mb-1">Product Status</label>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => onInputChange('status', 'draft')}
              className={`cursor-pointer p-3 rounded-lg border ${
                formData.status === 'draft'
                  ? 'border-amber-600 bg-amber-900/20'
                  : 'border-gray-700 bg-gray-800'
              } flex items-center gap-2 transition-all duration-200`}>
              <div
                className={`p-1 rounded-full ${
                  formData.status === 'draft'
                    ? 'bg-amber-500 text-gray-900'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                <AlertTriangle size={14} />
              </div>
              <span
                className={`font-medium ${
                  formData.status === 'draft' ? 'text-amber-300' : 'text-gray-300'
                }`}>
                Draft
              </span>
            </div>

            <div
              onClick={() => onInputChange('status', 'active')}
              className={`cursor-pointer p-3 rounded-lg border ${
                formData.status === 'active'
                  ? 'border-green-600 bg-green-900/20'
                  : 'border-gray-700 bg-gray-800'
              } flex items-center gap-2 transition-all duration-200`}>
              <div
                className={`p-1 rounded-full ${
                  formData.status === 'active'
                    ? 'bg-green-500 text-gray-900'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                <Check size={14} />
              </div>
              <span
                className={`font-medium ${
                  formData.status === 'active' ? 'text-green-300' : 'text-gray-300'
                }`}>
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200 border border-gray-700">
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Product</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
