'use client';

import { useState } from 'react';
import { FaImage, FaTimes } from 'react-icons/fa';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  onRemove: () => void;
  currentImage?: string;
}

export default function ImageUpload({ onImageUpload, onRemove, currentImage }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    
    if (data.url) {
      setPreview(data.url);
      onImageUpload(data.url);
    }
    setUploading(false);
  };

  const handleRemove = () => {
    setPreview(undefined);
    onRemove();
  };

  return (
    <div className="mt-2">
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="rounded-lg max-h-48 object-cover" />
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <FaImage className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {uploading ? 'Upload...' : 'Ajouter une image'}
          </span>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      )}
    </div>
  );
}