import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileGallery from '../components/profile/ProfileGallery';
import EditProfileDialog from '../components/profile/EditProfileDialog';
import EditInterestsDialog from '../components/profile/EditInterestsDialog';
import EventCard from '../components/feed/EventCard';
import { useEvents } from '../hooks/useEvents';
import { useUserEvents } from '@/hooks/useUser';
import { useParams } from 'react-router-dom';


const Profile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [user, setUser] = useState<any>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editInterestsOpen, setEditInterestsOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const userIdToFetch = id ? parseInt(id) : currentUserId;

  const { data: userEvents, isLoading: loadingEvents } = useUserEvents(userIdToFetch, {
    enabled: !!userIdToFetch,
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return;

    setToken(storedToken);
    const payload = JSON.parse(atob(storedToken.split('.')[1]));
    setCurrentUserId(payload.id);

    const targetId = id ? parseInt(id) : payload.id;

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:3000/users/${targetId}`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        const data = await res.json();
        if (res.ok) setUser(data);
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };

    fetchUser();
  }, [id]);


  const handleProfileSave = (data: { name: string; location: string; bio: string; website: string }) => {
    if (!user) return;
    setUser(prev => ({
      ...prev,
      ...data
    }));
  };

  const handleInterestsSave = (interests: string[]) => {
    setUser(prev => ({
      ...prev,
      tags: interests
    }));
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto text-center py-20">Loading profile...</div>
      </MainLayout>
    );
  }

  let isCurrentUser = false;

  if (token && user && currentUserId !== null) {
    isCurrentUser = currentUserId === user.id;
  }

     

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <ProfileHeader
          user={user}
          isCurrentUser={isCurrentUser}
          onEditProfile={() => setEditProfileOpen(true)}
        />

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Interests</h2>
            {isCurrentUser && (
              <button
                className="text-sm text-excursia-blue hover:underline"
                onClick={() => setEditInterestsOpen(true)}
              >
                Edit Interests
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {user.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="bg-blue-50 text-excursia-blue px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <ProfileGallery
          userId={user.id}
          isCurrentUser={isCurrentUser}
          token={token || undefined}
        />

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Events by {user.name}</h2>
          <div className="space-y-6">
            {loadingEvents ? (
              <p className="text-sm text-gray-500">Loading events...</p>
            ) : !userEvents || userEvents.length === 0 ? (
              <p className="text-sm text-gray-500">No events yet.</p>
            ) : (
                userEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))
            )}
          </div>
        </div>
      </div>

      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        user={user}
        onSave={handleProfileSave}
      />

      <EditInterestsDialog
        open={editInterestsOpen}
        onOpenChange={setEditInterestsOpen}
        interests={user.tags}
        userId={user.id}
        onSave={handleInterestsSave}
      />

    </MainLayout>
  );
};

export default Profile;
