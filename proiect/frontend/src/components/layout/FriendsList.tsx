import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useFriends, useToken, useUser } from '@/hooks/useUser';
import { User } from '@/api/friendsApi';

const FriendsList: React.FC = () => {
  const token = useToken();
  const user = useUser();
  const { friends, loading, error } = useFriends(token, user?.id ?? null);

  return (
    <div className="hidden lg:block w-80 bg-white border-l border-gray-200 p-4 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">FRIENDS</h3>

        {loading && <p className="text-sm text-gray-400">Loading friends...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="space-y-3">
            {friends.length === 0 ? (
              <p className="text-sm text-gray-400">No friends yet.</p>
            ) : (
              friends.map((friend: User) => (
                <div key={friend.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative">
                    <img
                      src={friend.profile_picture ? `http://localhost:3000${friend.profile_picture}` : '/default-avatar.png'}
                      alt={friend.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                      <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                    </div>
                    <span className="ml-3 text-sm font-medium">{friend.name}</span>
                  </div>
                  <Link to={`/chat/${friend.id}`} className="text-gray-400 hover:text-excursia-blue">
                    <MessageCircle className="h-5 w-5" />
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex flex-wrap gap-2">
          <a href="#" className="hover:underline">About</a>
          <span>·</span>
          <a href="#" className="hover:underline">Privacy</a>
          <span>·</span>
          <a href="#" className="hover:underline">Terms</a>
          <span>·</span>
          <a href="#" className="hover:underline">Help</a>
        </div>
        <p className="mt-2">© 2025 Excursia</p>
      </div>
    </div>
  );
};

export default FriendsList;
