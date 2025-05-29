'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import { Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Button2 } from '@/components/ui/button2';
import { Input } from '@/components/ui/input';
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
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      if (!response.ok) throw new Error('Failed to upload images');
      const data = await response.json();
      return data.urls;
    } catch (error) {
      console.error('Error uploading images:', error);
      return [];
    } finally {
      setIsUploading(false);
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (images.length >= maxImages) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const urls = await uploadImages(files);
      if (urls.length > 0) {
        onImagesChange([...images, ...urls].slice(0, maxImages));
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (images.length >= maxImages) return;

    const files = e.target.files;
    if (files && files.length > 0) {
      const urls = await uploadImages(Array.from(files));
      if (urls.length > 0) {
        onImagesChange([...images, ...urls].slice(0, maxImages));
      }
      e.target.value = '';
    }
  };

  const handleAddUrl = () => {
    if (imageUrl.trim() && images.length < maxImages) {
      onImagesChange([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
    if (currentImageIndex >= updatedImages.length && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-light-500">
          Banner Images ({images.length}/{maxImages})
        </span>
      </div>

      {/* Upload Area - Only show if can add more */}
      {canAddMore && (
        <div className="space-y-2">
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative flex flex-col bg-primary/5 items-center justify-center h-24 border border-dashed rounded-lg cursor-pointer transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-primary/60 hover:border-primary/80'
            )}>
            <div className="flex flex-col items-center gap-1">
              <Upload className={cn('h-4 w-4', isDragging ? 'text-primary' : 'text-light-100')} />
              <div className="text-center">
                <p className="text-xs text-light-200">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-light-200">PNG, JPG up to 10MB</p>
              </div>
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

          <div className="flex gap-2">
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste image URL"
              className="h-8 text-xs bg-dark-700 border-primary/40 focus:border-primary/80"
              onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
            />
            <Button2
              onClick={handleAddUrl}
              disabled={!imageUrl.trim()}
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs border-[1px] border-primary hover:bg-primary">
              Add
            </Button2>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="space-y-2">
          {/* Main Preview */}
          <div className="relative group">
            <div className="relative h-40 lg:h-96 w-full rounded-lg overflow-hidden bg-dark-700 border border-dark-600">
              <Image
                src={images[currentImageIndex] || '/placeholder.svg'}
                alt={`Banner ${currentImageIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80">
                    <ChevronLeft className="h-3 w-3 text-white" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80">
                    <ChevronRight className="h-3 w-3 text-white" />
                  </button>
                </>
              )}

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveImage(currentImageIndex)}
                className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                <X className="h-3 w-3 text-white" />
              </button>

              {/* Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-1 overflow-x-auto pb-1">
              {images.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    'relative flex-shrink-0 h-12 w-16 rounded border-[1px] overflow-hidden transition-colors',
                    currentImageIndex === index
                      ? 'border-primary/40'
                      : 'border-dark-600 hover:border-dark-500'
                  )}>
                  <Image
                    src={url || '/placeholder.svg'}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="flex items-center gap-2 text-xs text-blue-400">
          <div className="h-1 w-1 rounded-full bg-blue-400 animate-pulse" />
          Uploading images...
        </div>
      )}
    </div>
  );
}
