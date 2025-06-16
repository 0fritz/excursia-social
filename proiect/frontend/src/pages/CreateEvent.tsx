import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { MapPin, Calendar, Users, Clock, Image } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCreateEvent } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { useToken, useUser } from '@/hooks/useUser';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    maxAttendees: '',
    privacy: 'public',
    image: null as File | null,
  });
  const user = useUser()
  const token = useToken()
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePrivacyChange = (value: string) => {
    setFormData({
      ...formData,
      privacy: value,
    });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        image: file,
      });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const { mutateAsync } = useCreateEvent();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      let uploadedImageUrl = "";
  
      if (formData.image) {
        const uploadForm = new FormData();
        uploadForm.append("image", formData.image);
      
        const res = await fetch(`http://localhost:3000/upload-picture`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadForm,
        });
      
        if (!res.ok) throw new Error("Image upload failed");
        const data = await res.json();
        uploadedImageUrl = data.url;
      }
      
      await mutateAsync({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        audience: formData.privacy as 'public' | 'friends',
        maxAttendees: formData.maxAttendees,
        image: uploadedImageUrl,
      });
  
      toast({
        title: "Event created successfully!",
        description: "Your event has been created and is now live.",
      });
  
      navigate('/');
    } catch (err: any) {
      console.error('Error creating event:', err.message);
      toast({
        title: "Error creating event",
        description: err.message,
        variant: "destructive",
      });
    }
  };
  const handleCancel = () => {
    navigate('/');
  };
  
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create a New Event</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            {/* Event Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Event Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Give your event a catchy title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Event Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Event Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your event, what should attendees expect?"
                value={formData.description}
                onChange={handleInputChange}
              ></textarea>
            </div>

            {/* Privacy Setting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Event Privacy
              </label>
              <RadioGroup value={formData.privacy} onValueChange={handlePrivacyChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="text-sm">
                    Public - Anyone can see and join this event
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="friends" id="friends" />
                  <Label htmlFor="friends" className="text-sm">
                    Friends Only - Only your friends can see and join this event
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Where will the event take place?"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              {/* Event Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              {/* Event Time */}
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    required
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              {/* Max Attendees */}
              <div>
                <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Attendees
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="maxAttendees"
                    name="maxAttendees"
                    min="1"
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave blank for unlimited"
                    value={formData.maxAttendees}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Event Image */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Event Cover Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {previewImage ? (
                  <div className="text-center">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="mx-auto h-48 w-full object-cover rounded-md" 
                    />
                    <button 
                      type="button" 
                      className="mt-2 text-sm text-excursia-blue hover:underline"
                      onClick={() => {
                        setPreviewImage(null);
                        setFormData({
                          ...formData,
                          image: null,
                        });
                      }}
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-excursia-blue hover:text-blue-500 focus-within:outline-none">
                        <span>Upload an image</span>
                        <input 
                          id="image-upload" 
                          name="image" 
                          type="file" 
                          accept="image/*" 
                          className="sr-only" 
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    <div className="flex justify-center">
                      <Image className="h-12 w-12 text-gray-300" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                type="button"
                className="btn-outline"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn-primary"
              >
                Create Event
              </button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateEvent;
