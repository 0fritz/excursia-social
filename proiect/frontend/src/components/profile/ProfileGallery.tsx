import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface ProfileGalleryProps {
  userId: number;
  isCurrentUser: boolean;
  token?: string;
}

const ProfileGallery: React.FC<ProfileGalleryProps> = ({ userId, isCurrentUser, token }) => {
  type GalleryImage = { id: number; url: string };
  const [images, setImages] = useState<GalleryImage[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/users/${userId}/images`)
      .then((res) => {
        const imageData = res.data.map((img: { id: number; image_url: string }) => ({
          id: img.id,
          url: `http://localhost:3000${img.image_url}`,
        }));
        setImages(imageData);
      })
      .catch((err) => console.error('Failed to load images', err));

  }, [userId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`http://localhost:3000/users/${userId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      setImages((prev) => [
        { id: res.data.id, url: `http://localhost:3000${res.data.imageUrl}` },
        ...prev,
      ]);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      e.target.value = '';
    }
  };

  const handleDelete = async (imageId: number) => {
    try {
      await axios.delete(`http://localhost:3000/images/${imageId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
  
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error("Failed to delete image", err);
    }
  };
  

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Photos</h2>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((image, index) => (
        <div key={image.id} className="aspect-square overflow-hidden rounded-lg relative group">
          <img
            src={image.url}
            alt={`Gallery image ${index + 1}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {isCurrentUser && (
            <button
              onClick={() => handleDelete(image.id)}
              className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          )}
        </div>
      ))}


        {isCurrentUser && images.length < 5 && (
          <div
            className="aspect-square flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-50 cursor-pointer"
            onClick={triggerFileUpload}
          >
            <div className="text-center">
              <svg
                className="mx-auto h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="mt-2 block text-sm font-medium text-gray-500">Add photo</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileGallery;
