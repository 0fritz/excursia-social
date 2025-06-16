import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useMessages } from '@/hooks/useChats';
import { Chat, Message } from '@/api/chatsApi';
import { useUser } from '@/hooks/useUser';
import socket, { connect, disconnect, joinChat, leaveChat, sendMessage as sendMessageSocket, onNewMessage } from '@/api/socket';

interface ChatWindowProps {
  chat: Chat;
  onBack?: () => void;
}

const defaultAvatar = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, onBack }) => {
  const { data, error, isLoading, isError } = useMessages(chat.chat_id);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const user = useUser();

  useEffect(() => {
    if (data?.messages) {
      setMessages(data.messages);
    }
  }, [data]);

  useEffect(() => {
    connect();
    joinChat(chat.chat_id);

    onNewMessage((message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      leaveChat(chat.chat_id);
      socket.off('newMessage');
      disconnect();
    };
  }, [chat.chat_id]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content) return;

    sendMessageSocket(chat.chat_id, content);
    setNewMessage('');
  };

  if (isLoading) return <div>Loading messages...</div>;
  if (isError) return <div>Error loading messages: {error?.message}</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-[calc(100vh-150px)]">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center">
        {onBack && (
          <button onClick={onBack} className="mr-3 p-1 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        <div className="relative">
          <img
            src={chat.profile_picture || defaultAvatar}
            alt={chat.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
        </div>
        <div className="ml-3">
          <h3 className="font-medium">{chat.name}</h3>
          <p className="text-xs text-gray-500">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender_id === user.id
                  ? 'bg-excursia-blue text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="break-words">{message.content}</p>
              <p className={`text-xs mt-1 ${message.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'}`}>
                {message.created_at}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSend} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="ml-2 bg-excursia-blue text-white rounded-full p-2 hover:bg-blue-600"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
