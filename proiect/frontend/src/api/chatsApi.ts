import { api } from './index';
import { setAuthToken } from './index';

export interface Chat {
  chat_id: number;
  partner_id: number;
  name: string;
  profile_picture: string | null;
  created_at: string;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  content: string;
  created_at: string;
}

export const getChats = async (token: string): Promise<{ chats: Chat[] }> => {
  setAuthToken(token);
  const response = await api.get<{ chats: Chat[] }>('/chats');
  return response.data;
};

export const getMessages = async (token: string, chatId: number): Promise<{ chatId: number, messages: Message[] }> => {
  setAuthToken(token);
  const response = await api.get<{ chatId: number, messages: Message[] }>(`/chats/${chatId}/messages`);
  return response.data;
};

export const sendMessage = async (token: string, chatId: number, content: string): Promise<Message> => {
  setAuthToken(token);
  const response = await api.post<Message>('/chats/messages', {
    chat_id: chatId,
    content: content,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  return response.data;
};
