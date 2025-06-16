import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface EditInterestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interests: string[];
  userId: number;
  onSave: (interests: string[]) => void;
}

const EditInterestsDialog: React.FC<EditInterestsDialogProps> = ({
  open,
  onOpenChange,
  interests,
  userId,
  onSave,
}) => {
  const [currentInterests, setCurrentInterests] = useState<string[]>(interests);
  const [newInterest, setNewInterest] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentInterests(interests);
    }
  }, [open, interests]);

  const addInterest = () => {
    if (newInterest.trim() && !currentInterests.includes(newInterest.trim())) {
      setCurrentInterests([...currentInterests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setCurrentInterests(currentInterests.filter((i) => i !== interestToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest();
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);

    const original = new Set(interests);
    const updated = new Set(currentInterests);

    const toAdd = currentInterests.filter((tag) => !original.has(tag));
    const toRemove = interests.filter((tag) => !updated.has(tag));

    try {
      for (const tag of toAdd) {
        await fetch(`http://localhost:3000/users/${userId}/tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tag }),
        });
      }

      for (const tag of toRemove) {
        await fetch(`http://localhost:3000/users/${userId}/tags/${encodeURIComponent(tag)}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      onSave(currentInterests);
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving interests:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Interests</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-interest">Add Interest</Label>
            <div className="flex space-x-2">
              <Input
                id="new-interest"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter an interest"
              />
              <Button type="button" onClick={addInterest}>
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current Interests</Label>
            <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border rounded-md">
              {currentInterests.length === 0 ? (
                <span className="text-gray-500 text-sm">No interests added yet</span>
              ) : (
                currentInterests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-excursia-blue px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="hover:bg-blue-100 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditInterestsDialog;
