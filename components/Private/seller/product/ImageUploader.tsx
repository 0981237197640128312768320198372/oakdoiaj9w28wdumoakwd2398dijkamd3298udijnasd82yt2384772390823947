/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useState, useRef, useCallback } from 'react';
import { X, Upload } from 'lucide-react';
import Image from 'next/image';
import Button from '@/components/ui/ButtonWithLoader';
interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  error?: string;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  error,
  maxImages = 3,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUrlInputRef = useRef<HTMLInputElement>(null);

  async function uploadImages(files: File[]): Promise<string[]> {
    const filesToUpload = files.slice(0, maxImages - images.length);

    if (filesToUpload.length === 0) return [];

    setIsUploading(true);

    const formData = new FormData();
    filesToUpload.forEach((file) => formData.append('images', file));

    try {
      const response = await fetch('/api/v3/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const data = await response.json();
      setIsUploading(false);
      return data.urls;
    } catch (error) {
      console.error('Error uploading images:', error);
      setIsUploading(false);
      return [];
    }
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

      if (images.length >= maxImages) {
        alert(`Maximum ${maxImages} images allowed`);
        return;
      }

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        try {
          const urls = await uploadImages(Array.from(files));
          onImagesChange([...images, ...urls].slice(0, maxImages));
        } catch (err) {
          console.error('Error uploading images:', err);
        }
      }
    },
    [images, onImagesChange, maxImages]
  );

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (images.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    if (files && files.length > 0) {
      try {
        const urls = await uploadImages(Array.from(files));
        onImagesChange([...images, ...urls].slice(0, maxImages));
        e.target.value = '';
      } catch (err) {
        console.error('Error uploading images:', err);
      }
    }
  };

  const handleImageUrlAdd = () => {
    if (images.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    if (imageUrlInputRef.current?.value) {
      onImagesChange([...images, imageUrlInputRef.current.value].slice(0, maxImages));
      imageUrlInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-light-700">
        Product Images ({images.length}/{maxImages})
      </label>

      {images.length < maxImages && (
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`
              relative flex flex-col justify-center items-center px-4 py-6 border-2 border-dashed 
              rounded-lg transition-all cursor-pointer duration-300
              ${
                isDragging
                  ? 'border-primary bg-primary/10 scale-[1.01]'
                  : error
                  ? 'border-red-500/50 bg-red-500/5 hover:bg-red-500/10'
                  : 'border-primary/20 hover:border-primary/50 bg-dark-800/50 hover:bg-primary/5'
              }
            `}>
            <div className="space-y-2 text-center">
              <Upload
                className={`
                  mx-auto h-8 w-8 ${isDragging ? 'text-primary animate-bounce' : 'text-primary/70'}
                  transition-all duration-300
                `}
              />
              <div className="flex flex-col text-xs text-light-400">
                <span className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Upload images
                </span>
                <p className="text-light-500">or drag and drop</p>
              </div>
              <p className="text-[10px] text-light-600">PNG, JPG, GIF up to 10MB</p>
            </div>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <input
              ref={imageUrlInputRef}
              id="imageUrl"
              type="text"
              placeholder="Or paste image URL here"
              className="flex-1 px-3 py-1.5 rounded-lg border border-dark-500 bg-dark-700/50 text-light-300 
                         focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200
                         text-xs"
            />
            <Button variant="primary" size="sm" onClick={handleImageUrlAdd}>
              Add URL
            </Button>
          </div>
        </>
      )}

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-lg border border-dark-600 bg-dark-700/70
                        transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-dark-900/50">
              <div className="aspect-square w-full overflow-hidden relative">
                <Image
                  fill
                  src={url}
                  alt={`Product ${index + 1}`}
                  className="object-contain p-1.5"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-dark-900/70 to-transparent opacity-0 
                              group-hover:opacity-100 transition-opacity duration-200"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute bottom-1.5 right-1.5 bg-red-500 text-white rounded-full p-1
                         opacity-0 group-hover:opacity-100 transition-all duration-200 
                         hover:bg-red-600 hover:scale-110 transform-gpu"
                aria-label="Remove image">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {isUploading && (
        <div className="mt-2 text-xs text-primary animate-pulse">Uploading images...</div>
      )}

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default ImageUploader;
