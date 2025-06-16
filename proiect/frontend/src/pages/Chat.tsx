import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import ChatWindow from '../components/chat/ChatWindow';
import { Search } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChats } from '../hooks/useChats';
import { Chat as ChatType }  from '@/api/chatsApi';

const defaultAvatar = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

const Chat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<ChatType | null>(null);
  const isMobile = useIsMobile();
  const baseURL = "https://localhost:3000";

  const { data, error, isLoading, isError } = useChats();

  // Update selectedFriend based on the URL param `id`
  useEffect(() => {
    if (id && data) {
      const friend = data.chats.find((chat: ChatType) => chat.chat_id === parseInt(id));
      setSelectedFriend(friend || data.chats[0]);
    }
  }, [id, data]);

  const filteredChats = searchQuery
    ? data?.chats.filter((chat: any) =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data?.chats;

  // On mobile, if no friend is selected, show the contacts list full width
  const showContactsOnly = isMobile && !selectedFriend;
  const showChatOnly = isMobile && selectedFriend;

  if (isLoading) return <div>Loading chats...</div>;
  if (isError) return <div>Error loading chats: {error?.message}</div>;

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow flex flex-col md:flex-row h-[calc(100vh-150px)] max-w-6xl mx-auto overflow-hidden">
        {/* Contacts sidebar - hidden on mobile when chat is open */}
        {(!showChatOnly || !isMobile) && (
          <div className={`${showContactsOnly ? 'w-full' : 'w-80'} border-r border-gray-200 flex flex-col`}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold mb-4">Messages</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {filteredChats?.map((chat: any) => (
                <button
                  key={chat.chat_id}
                  className={`w-full text-left px-4 py-3 flex items-start hover:bg-gray-50 ${selectedFriend?.chat_id === chat.chat_id ? 'bg-gray-100' : ''}`}
                  onClick={() => setSelectedFriend(chat)}
                >
                  <div className="relative">
                    <img
                      src={`${baseURL}${chat.profile_picture}` || defaultAvatar} 
                      alt={chat.name} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{chat.name}</h3>
                      <span className="text-xs text-gray-500">{chat.created_at}</span>
                    </div>
                    {/* <p className="text-sm text-gray-600 truncate">{chat.lastMessage || 'No messages yet'}</p> */}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Mobile-only back button to return to contacts */}
            {isMobile && selectedFriend && (
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={() => setSelectedFriend(null)}
                  className="w-full py-2 bg-gray-100 rounded-lg font-medium text-gray-600 hover:bg-gray-200"
                >
                  Back to Contacts
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Chat area - full width on mobile when a chat is selected */}
        {(!showContactsOnly || !isMobile) && (
          <div className={`${showChatOnly ? 'w-full' : 'flex-1'}`}>
            {selectedFriend ? (
              <ChatWindow 
                chat={selectedFriend} 
                onBack={isMobile ? () => setSelectedFriend(null) : undefined} 
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-xl font-medium text-gray-700">Select a conversation</h3>
                  <p className="text-gray-500 mt-1">Choose a friend to chat with</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Chat;
