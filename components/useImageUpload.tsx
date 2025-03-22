import { useState } from 'react';

const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [pictureId, setPictureId] = useState<string | null>(null);

  const handlePictureUpload = async (file: File): Promise<void> => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload_image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload picture');
      }

      const data: { id: string } = await response.json();
      setPictureId(data.id);
    } catch (error) {
      console.error('Error uploading picture:', error);
      alert('Failed to upload picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return { handlePictureUpload, isUploading, pictureId };
};
