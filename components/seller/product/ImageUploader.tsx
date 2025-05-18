import React, { useState, useRef, useCallback } from 'react';
import { X, Upload } from 'lucide-react';
import Image from 'next/image';
import Button from '@/components/ui/button';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  error?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange, error }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUrlInputRef = useRef<HTMLInputElement>(null);

  // Image upload logic
  async function uploadImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v3/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const data = await response.json();
      return data.urls;
    } catch (error) {
      console.error('Error uploading images:', error);
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

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        try {
          const urls = await uploadImages(Array.from(files));
          onImagesChange([...images, ...urls]);
        } catch (err) {
          console.error('Error uploading images:', err);
        }
      }
    },
    [images, onImagesChange]
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
        onImagesChange([...images, ...urls]);
        e.target.value = '';
      } catch (err) {
        console.error('Error uploading images:', err);
      }
    }
  };

  const handleImageUrlAdd = () => {
    if (imageUrlInputRef.current?.value) {
      onImagesChange([...images, imageUrlInputRef.current.value]);
      imageUrlInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-light-700 mb-1">Product Images</label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={`
          relative flex flex-col justify-center items-center px-6 py-8 border-2 border-dashed 
          rounded-xl transition-all cursor-pointer duration-300
          ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : error
              ? 'border-red-500/50 bg-red-500/5 hover:bg-red-500/10'
              : 'border-primary/20 hover:border-primary/50 bg-dark-800/50 hover:bg-primary/5'
          }
        `}>
        <div className="space-y-3 text-center">
          <Upload
            className={`
              mx-auto h-12 w-12 ${isDragging ? 'text-primary animate-bounce' : 'text-primary/70'}
              transition-all duration-300
            `}
          />
          <div className="flex flex-col text-sm text-light-400">
            <span className="font-medium text-primary hover:text-primary/80 transition-colors">
              Upload images
            </span>
            <p className="text-light-500">or drag and drop</p>
          </div>
          <p className="text-xs text-light-600">PNG, JPG, GIF up to 10MB</p>
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

      <div className="flex items-center space-x-2">
        <input
          ref={imageUrlInputRef}
          id="imageUrl"
          type="text"
          placeholder="Or paste image URL here"
          className="flex-1 px-4 py-2 rounded-lg border border-dark-500 bg-dark-700/50 text-light-300 
                     focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200"
        />
        <Button variant="primary" size="md" onClick={handleImageUrlAdd}>
          Add URL
        </Button>
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                  className="object-contain p-2"
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
                className="absolute bottom-2 right-2 bg-red-500 text-white rounded-full p-1.5
                         opacity-0 group-hover:opacity-100 transition-all duration-200 
                         hover:bg-red-600 hover:scale-110 transform-gpu"
                aria-label="Remove image">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
