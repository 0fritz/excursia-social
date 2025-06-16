import React from 'react';
import { MapPin, Calendar, Link as LinkIcon, MessageCircle, UserPlus } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  user: {
    id: number;
    name: string;
    profile_picture: string;
    cover_image: string;
    location: string;
    joined_date: string;
    website: string;
    bio: string;
    tags: string[];
  };
  isCurrentUser: boolean;
  onEditProfile?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, isCurrentUser, onEditProfile }) => {

  const fallbackURL = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop&crop=face";
  const baseURL =  "http://localhost:3000";
  const coverSrc = user.cover_image ? `${baseURL}${user.cover_image}` : fallbackURL;
  const profileSrc = user.profile_picture ? `${baseURL}${user.profile_picture}` : fallbackURL;
  const navigate = useNavigate();

  const handleMessageUser = async () => {
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        alert("You must be logged in to start a chat.");
        return;
      }

      console.log("USER ID: ", user.id);
  
      const response = await axios.post(
        `${baseURL}/chats/start`,
        { userId: user.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const { chatId } = response.data;
  
      // Navigate to the chat
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Failed to start chat", error);
      alert("Could not start chat");
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      const token = localStorage.getItem("token"); // or however you store it
  
      if (!token) {
        console.error("No token found");
        return;
      }
  
      await axios.post(
        `${baseURL}/friendships/request`,
        { user_id2: user.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      alert("Friend request sent!"); // or use a toast/message system
    } catch (error: any) {
      console.error("Failed to send friend request", error);
      alert("Failed to send friend request");
    }
  };


  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      {/* Cover Image */}
      <div className="h-48 w-full relative">
        <img 
          src={coverSrc}
          alt="Cover" 
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log('Cover image failed to load:', user.cover_image);
            e.currentTarget.src = fallbackURL;
          }}
        />
      </div>
      
      {/* Profile Info */}
      <div className="px-6 pt-0 pb-6">
        <div className="flex flex-col md:flex-row md:items-end">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4 md:mb-0">
            <img 
                src={profileSrc} 
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white object-cover"
                onError={(e) => {
                  console.log('Profile image failed to load:', user.profile_picture);
                  e.currentTarget.src = fallbackURL;
                }}
              />
          </div>
          
          {/* User Details & Actions */}
          <div className="flex-1 md:ml-6 flex flex-col md:flex-row justify-between items-start md:items-end">
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Joined {user.joined_date}</span>
                </div>
                {user.website && (
                  <div className="flex items-center">
                    <LinkIcon className="w-4 h-4 mr-1" />
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-excursia-blue hover:underline">
                      {user.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {!isCurrentUser ? (
              <div className="mt-4 md:mt-0 flex space-x-2">
                <button className="btn-primary" onClick={handleSendFriendRequest}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Friend
                </button>
                <button className="btn-outline" onClick={handleMessageUser}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </button>
              </div>
            ) : (
              <div className="mt-4 md:mt-0">
                <button 
                  className="btn-outline"
                  onClick={onEditProfile}
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6 text-gray-700">
          <p>{user.bio}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
