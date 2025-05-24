'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import { Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Button2 } from '@/components/ui/button2';
import { cn } from '@/lib/utils';

interface AdsBannerUploaderProps {
  images: string[];
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
}

export function AdsBannerUploader({
  images = [],
  onImagesChange,
  maxImages = 5,
}: AdsBannerUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
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
        if (urls.length > 0) {
          onImagesChange([...images, ...urls].slice(0, maxImages));
        }
      } catch (err) {
        console.error('Error uploading images:', err);
      }
    }
  };

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
        if (urls.length > 0) {
          onImagesChange([...images, ...urls].slice(0, maxImages));
        }
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

    // Adjust current index if needed
    if (currentImageIndex >= updatedImages.length && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-light-400">
          Banner Images ({images.length}/{maxImages})
        </span>
      </div>

      {images.length < maxImages && (
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={cn(
              'relative flex flex-col justify-center items-center px-4 py-6 border-2 border-dashed',
              'rounded-lg transition-all cursor-pointer duration-300 h-32',
              isDragging
                ? 'border-primary bg-primary/10 scale-[1.01]'
                : 'border-primary/20 hover:border-primary/50 bg-dark-800/50 hover:bg-primary/5'
            )}>
            <div className="space-y-2 text-center">
              <Upload
                className={cn(
                  'mx-auto h-6 w-6 transition-all duration-300',
                  isDragging ? 'text-primary animate-bounce' : 'text-primary/70'
                )}
              />
              <div className="flex flex-col text-xs text-light-400">
                <span className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Upload banner images
                </span>
                <p className="text-light-500">or drag and drop</p>
              </div>
              <p className="text-[10px] text-light-600">PNG, JPG, GIF up to 10MB</p>
            </div>
            <input
              ref={fileInputRef}
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
              type="text"
              placeholder="Or paste image URL here"
              className="flex-1 px-3 py-1.5 rounded-lg border border-dark-500 bg-dark-700/50 text-light-300 
                       focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200
                       text-xs"
            />
            <Button2
              variant="outline"
              size="sm"
              onClick={handleImageUrlAdd}
              className="text-xs border-primary/50 text-primary hover:bg-primary/10">
              Add URL
            </Button2>
          </div>
        </>
      )}

      {images.length > 0 && (
        <div className="space-y-3">
          <div
            className="relative group overflow-hidden rounded-lg border border-dark-600 bg-dark-700/70
                        transition-all duration-200 hover:shadow-lg hover:shadow-dark-900/50 h-40">
            <div className="w-full h-full overflow-hidden relative">
              <Image
                fill
                src={images[currentImageIndex] || '/placeholder.svg'}
                alt={`Ads Banner ${currentImageIndex + 1}`}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-dark-900/70 to-transparent opacity-0 
                              group-hover:opacity-100 transition-opacity duration-200"
              />
            </div>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-dark-800/80 text-white rounded-full p-1
                           opacity-0 group-hover:opacity-100 transition-all duration-200 
                           hover:bg-dark-700 hover:scale-110 transform-gpu"
                  aria-label="Previous image">
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-dark-800/80 text-white rounded-full p-1
                           opacity-0 group-hover:opacity-100 transition-all duration-200 
                           hover:bg-dark-700 hover:scale-110 transform-gpu"
                  aria-label="Next image">
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div
                className="absolute bottom-2 left-2 bg-dark-800/80 text-white rounded-md px-2 py-1
                           opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Remove button */}
            <button
              type="button"
              onClick={() => handleRemoveImage(currentImageIndex)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1
                         opacity-0 group-hover:opacity-100 transition-all duration-200 
                         hover:bg-red-600 hover:scale-110 transform-gpu"
              aria-label="Remove image">
              <X size={16} />
            </button>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    'relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all',
                    currentImageIndex === index
                      ? 'border-primary'
                      : 'border-dark-600 hover:border-primary/50'
                  )}>
                  <Image
                    fill
                    src={url || '/placeholder.svg'}
                    alt={`Thumbnail ${index + 1}`}
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isUploading && (
        <div className="mt-2 text-xs text-primary animate-pulse">Uploading images...</div>
      )}
    </div>
  );
}
