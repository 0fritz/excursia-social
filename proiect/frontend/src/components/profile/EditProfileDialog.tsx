import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: number;
    name: string;
    bio: string;
    website: string;
    location: string;
  };
  onSave: (data: {
    name: string;
    bio: string;
    website: string;
    location: string;
  }) => void;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    website: user.website,
    location: user.location,
  });

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: user.name,
      bio: user.bio,
      website: user.website,
      location: user.location,
    });
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Authentication token missing.");
      setIsLoading(false);
      return;
    }

    try {
      // Upload profile picture
      if (profileFile) {
        const formData = new FormData();
        formData.append("image", profileFile);
        await fetch(`http://localhost:3000/users/${user.id}/profile-picture`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      // Upload cover image
      if (coverFile) {
        const formData = new FormData();
        formData.append("image", coverFile);
        await fetch(`http://localhost:3000/users/${user.id}/cover-image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      // Update profile text fields
      const response = await fetch(`http://localhost:3000/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Profile updated successfully.");
        onSave(formData);
        onOpenChange(false);
        // Refresh the page to show updated images
        window.location.reload();
      } else {
        setMessage(result.error || "Failed to update profile.");
      }
    } catch (err) {
      setMessage("An error occurred while updating the profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name"
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Name" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio"
              name="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              placeholder="Bio" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input 
              id="website"
              name="website" 
              value={formData.website} 
              onChange={handleChange} 
              placeholder="Website" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location"
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              placeholder="Location" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-picture">Profile Picture</Label>
            <Input 
              id="profile-picture"
              type="file" 
              accept="image/*" 
              onChange={(e) => setProfileFile(e.target.files?.[0] || null)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover-image">Cover Image</Label>
            <Input 
              id="cover-image"
              type="file" 
              accept="image/*" 
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)} 
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
          
          {message && (
            <p className={`text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
